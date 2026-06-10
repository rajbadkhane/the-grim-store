import { nanoid } from "nanoid";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { createRazorpayOrder, verifyRazorpaySignature } from "../services/payment.service.js";
import { emailService } from "../services/email.service.js";
import { publishEvent } from "../services/supabaseEvents.service.js";
import { execute, getUserById, id, json, mapOrder, mapProduct, row, rows, saveUserState } from "../lib/sql.js";
import { env } from "../config/env.js";
import { nimbuspostService } from "../services/nimbuspost.service.js";

type CouponRow = {
  id: string;
  code: string;
  discount_type: "percentage" | "flat";
  value: number;
  expiry_date: string | Date;
  minimum_purchase: number;
  usage_limit: number;
  used_count: number;
  active: boolean | number | string;
};

export const checkout = asyncHandler(async (req, res) => {
  const { addressId, shippingAddress, couponCode, paymentMethod } = req.body;
  const paymentChannel = paymentMethod === "cod" ? "cod" : req.body.paymentChannel ?? "upi";
  const paymentLabel = paymentMethod === "cod" ? "Cash on Delivery" : req.body.paymentLabel ?? "Online payment";
  const checkoutProducts = await resolveCheckoutProducts(req.body.products?.length ? req.body.products : req.user!.cart);
  if (!checkoutProducts.length) throw new ApiError(400, "Cart is empty");
  const address = shippingAddress || req.user!.addresses.find((item: any) => item.id === addressId) || req.user!.addresses.find((item: any) => item.isDefault);
  if (!address) throw new ApiError(400, "Shipping address required");

  // Save entered shippingAddress as a saved address (first time / when creating a new address)
  // Rule: if user provided `shippingAddress` and did not select an `addressId`, persist it.
  if (shippingAddress && !addressId) {
    if (!req.user!.addresses) req.user!.addresses = [];

    // Basic guard against incomplete address writes
    const hasCoreFields =
      typeof shippingAddress.fullName === "string" &&
      shippingAddress.fullName.trim().length > 1 &&
      typeof shippingAddress.phone === "string" &&
      shippingAddress.phone.trim().length > 7 &&
      typeof shippingAddress.pincode === "string" &&
      shippingAddress.pincode.trim().length > 3 &&
      typeof shippingAddress.state === "string" &&
      shippingAddress.state.trim().length > 1 &&
      typeof shippingAddress.city === "string" &&
      shippingAddress.city.trim().length > 1 &&
      typeof shippingAddress.house === "string" &&
      shippingAddress.house.trim().length > 1 &&
      typeof shippingAddress.road === "string" &&
      shippingAddress.road.trim().length > 1;

    if (!hasCoreFields) {
      // Let checkout validation handle user-facing errors; just avoid saving garbage
    } else {
      const newAddress = {
        id: String(shippingAddress.id ?? nanoid(10).toUpperCase()),
        ...shippingAddress,
        addressType: shippingAddress.addressType ?? "home",
        isDefault: shippingAddress.isDefault ?? false
      };

      // If it's the first saved address, force it to be default
      if (!req.user!.addresses.length) newAddress.isDefault = true;

      if (newAddress.isDefault) {
        req.user!.addresses.forEach((item: any) => (item.isDefault = false));
      }

      req.user!.addresses.push(newAddress);
      await saveUserState(req.user!);
    }
  }

  const subtotal = checkoutProducts.reduce((sum: number, item: any) => sum + item.salePrice * item.quantity, 0);
  const shippingFee = subtotal > 1499 ? 0 : 79;
  const quote = couponCode ? await quoteCoupon(couponCode, subtotal, shippingFee) : null;
  const discountAmount = quote?.discountAmount ?? 0;
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);
  const orderId = `GRIM-${nanoid(10).toUpperCase()}`;
  const orderDbId = id();
  const paymentInfo: any = { method: paymentMethod, channel: paymentChannel, label: paymentLabel, couponCode: quote?.coupon.code ?? null };
  if (paymentMethod === "razorpay") {
    const amountPaise = Math.round(totalAmount * 100);
    if (amountPaise < 100) throw new ApiError(400, "Razorpay minimum amount is 100 paise");

    try {
      const razorpayOrder = await createRazorpayOrder(amountPaise, orderId);
      paymentInfo.razorpayOrderId = razorpayOrder.id;
      paymentInfo.razorpayAmount = razorpayOrder.amount;
      paymentInfo.razorpayCurrency = razorpayOrder.currency;
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status;
      throw new ApiError(status === 401 ? 401 : 500, status === 401 ? "Razorpay authentication failed" : "Unable to create Razorpay order");
    }
  }
  await execute(`INSERT INTO orders (
      id, order_id, user_id, products, payment_info, shipping_address, total_amount,
      shipping_fee, discount_amount, payment_status, delivery_date
    ) VALUES (
      :id, :orderId, :userId, :products, :paymentInfo, :shippingAddress, :totalAmount,
      :shippingFee, :discountAmount, 'pending', :deliveryDate
    )`, {
    id: orderDbId,
    orderId,
    userId: req.user!.id,
    products: json(checkoutProducts),
    paymentInfo: json(paymentInfo),
    shippingAddress: json(address),
    totalAmount,
    shippingFee,
    discountAmount,
    deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  });
  if (quote) {
    await execute("UPDATE coupons SET used_count = used_count + 1 WHERE id = :id AND used_count < usage_limit", { id: quote.coupon.id });
  }
  if (paymentMethod !== "razorpay" && !req.body.isDirectBuyNow) {
    req.user!.cart = [];
    await saveUserState(req.user!);
  }
  const order = mapOrder(await row("SELECT * FROM orders WHERE id = :id", { id: orderDbId }))!;

  if (paymentMethod !== "razorpay") {
    try {
      const shipmentResult = await nimbuspostService.createShipment({
        ...order,
        paymentMethod,
        user_email: req.user!.email
      });
      if (shipmentResult.success) {
        order.paymentInfo = {
          ...order.paymentInfo,
          nimbuspostShipmentId: shipmentResult.shipmentId,
          nimbuspostAwbNumber: shipmentResult.awbNumber,
          nimbuspostCourierId: shipmentResult.courierId,
          nimbuspostCourierName: shipmentResult.courierName,
          nimbuspostLabel: shipmentResult.label,
          nimbuspostManifest: shipmentResult.manifest
        };
        await execute(
          "UPDATE orders SET payment_info = :paymentInfo, tracking_status = :trackingStatus WHERE id = :id",
          {
            id: order.id,
            paymentInfo: json(order.paymentInfo),
            trackingStatus: "Packed & Registered with delivery partner"
          }
        );
        order.trackingStatus = "Packed & Registered with delivery partner";
      }
    } catch (err) {
      console.error("[nimbuspost:checkout] Error registering shipment:", err);
    }
  }

  await emailService.sendOrderConfirmation(req.user!.email, order.orderId);
  await publishEvent("order.created", { orderId: order.orderId, totalAmount });
  res.status(201).json({ success: true, order, razorpayKeyId: env.razorpayKeyId || null });
});

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const currency = String(req.body.currency ?? "INR").trim().toUpperCase() || "INR";
  const receipt = String(req.body.receipt ?? `GRIM-${nanoid(10).toUpperCase()}`).trim();

  if (!Number.isInteger(amount) || amount < 100) throw new ApiError(400, "Amount must be at least 100 paise");
  if (!receipt) throw new ApiError(400, "Receipt is required");

  try {
    const razorpayOrder = await createRazorpayOrder(amount, receipt, currency);
    res.status(201).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error: any) {
    const status = error?.statusCode ?? error?.status;
    throw new ApiError(status === 401 ? 401 : 500, status === 401 ? "Razorpay authentication failed" : "Unable to create Razorpay order");
  }
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const checkoutProducts = await resolveCheckoutProducts(req.body.products?.length ? req.body.products : req.user!.cart);
  if (!checkoutProducts.length) throw new ApiError(400, "Cart is empty");

  const subtotal = checkoutProducts.reduce((sum: number, item: any) => sum + item.salePrice * item.quantity, 0);
  const shippingFee = subtotal > 1499 ? 0 : 79;
  const quote = await quoteCoupon(req.body.couponCode, subtotal, shippingFee);

  res.json({
    success: true,
    message: "Coupon applied",
    coupon: {
      code: quote.coupon.code,
      discountType: quote.coupon.discount_type,
      value: Number(quote.coupon.value),
      minimumPurchase: Number(quote.coupon.minimum_purchase)
    },
    subtotal,
    shippingFee,
    discountAmount: quote.discountAmount,
    totalAmount: quote.totalAmount
  });
});

async function resolveCheckoutProducts(items: any[] = []) {
  const resolved: any[] = [];

  for (const item of items) {
    const productId = String(item.product ?? item.productId ?? item.id ?? "").split(":")[0];
    const slug = item.slug ? String(item.slug) : "";
    const product = mapProduct(
      await row(`SELECT * FROM products WHERE ${slug ? "slug = :slug" : "id = :productId"}`, { slug, productId })
    );

    if (!product) throw new ApiError(404, `Product not found: ${item.title ?? slug ?? productId}`);

    const sku = item.sku ?? item.variantKey;
    const variant = Array.isArray(product.variants) && sku ? product.variants.find((entry: any) => entry.sku === sku) : null;
    const quantity = Number(item.quantity ?? 1);

    if (variant) {
      if (variant.available === false || Number(variant.stock ?? 0) < quantity) {
        throw new ApiError(400, `${product.title} is out of stock for the selected variant`);
      }
      resolved.push({
        id: `${product.id}:${variant.sku}`,
        product: product.id,
        slug: product.slug,
        title: product.title,
        image: variant.images?.[0]?.url ?? variant.images?.[0] ?? product.images?.[0]?.url ?? product.images?.[0] ?? "",
        price: Number(variant.price),
        salePrice: Number(variant.salePrice),
        quantity,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        material: variant.material,
        pattern: variant.pattern
      });
      continue;
    }

    if (Number(product.stock ?? 0) < quantity) throw new ApiError(400, `${product.title} is out of stock`);
    resolved.push({
      id: product.id,
      product: product.id,
      slug: product.slug,
      title: product.title,
      image: product.images?.[0]?.url ?? product.images?.[0] ?? item.image ?? "",
      price: Number(product.price),
      salePrice: Number(product.salePrice),
      quantity,
      size: item.size,
      color: item.color,
      material: item.material,
      pattern: item.pattern
    });
  }

  return resolved;
}

function normalizeCouponCode(code: string) {
  return String(code ?? "").trim().toUpperCase();
}

async function quoteCoupon(couponCode: string, subtotal: number, shippingFee: number) {
  const code = normalizeCouponCode(couponCode);
  if (!code) throw new ApiError(400, "Coupon code required");

  const coupon = (await row("SELECT * FROM coupons WHERE code = :code", { code })) as CouponRow | undefined;
  if (!coupon) throw new ApiError(400, "Coupon code is invalid");
  if (!isActiveFlag(coupon.active)) throw new ApiError(400, "Coupon code expired");

  const expiryTime = new Date(coupon.expiry_date).getTime();
  if (!Number.isFinite(expiryTime) || expiryTime <= Date.now()) throw new ApiError(400, "Coupon code expired");

  if (Number(coupon.used_count) >= Number(coupon.usage_limit)) throw new ApiError(400, "Coupon usage limit reached");

  const minimumPurchase = Number(coupon.minimum_purchase);
  if (subtotal < minimumPurchase) {
    const remaining = Math.ceil(minimumPurchase - subtotal);
    throw new ApiError(400, `Add ₹${remaining} more to use this coupon`);
  }

  const rawDiscount =
    coupon.discount_type === "percentage"
      ? Math.round((subtotal * Number(coupon.value)) / 100)
      : Number(coupon.value);
  const discountAmount = Math.max(0, Math.min(rawDiscount, subtotal));

  return {
    coupon,
    discountAmount,
    totalAmount: Math.max(0, subtotal + shippingFee - discountAmount)
  };
}

function isActiveFlag(value: boolean | number | string) {
  return value === true || value === 1 || value === "1";
}

export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = (await rows("SELECT * FROM orders WHERE user_id = :userId ORDER BY created_at DESC", { userId: req.user!.id })).map(mapOrder);
  res.json({ success: true, orders });
});

export const listOrders = asyncHandler(async (_req, res) => {
  const orders = await rows(`SELECT orders.*, users.name AS user_name, users.email AS user_email, users.phone AS user_phone
    FROM orders LEFT JOIN users ON users.id = orders.user_id ORDER BY orders.created_at DESC`);
  const mapped = orders.map((item: any) => ({ ...mapOrder(item), user: { id: item.user_id, name: item.user_name, email: item.user_email, phone: item.user_phone } }));
  res.json({ success: true, orders: mapped });
});

export const trackOrder = asyncHandler(async (req, res) => {
  const orderRow = await row("SELECT * FROM orders WHERE id = :id", { id: req.params.id });
  if (!orderRow) throw new ApiError(404, "Order not found");
  if (req.user?.role !== "admin" && orderRow.user_id !== req.user?.id) throw new ApiError(403, "Order access denied");

  const order = mapOrder(orderRow)!;
  const paymentInfo = order.paymentInfo ?? {};
  const awbNumber = paymentInfo.nimbuspostAwbNumber ?? paymentInfo.shiprocketAwbCode ?? "";

  if (!awbNumber) {
    return res.json({
      success: true,
      tracking: {
        provider: "Nimbuspost",
        booked: false,
        status: order.trackingStatus || "Order placed",
        awbNumber: null,
        courierName: paymentInfo.nimbuspostCourierName ?? null,
        label: paymentInfo.nimbuspostLabel ?? null,
        manifest: paymentInfo.nimbuspostManifest ?? null,
        history: []
      }
    });
  }

  const tracking = await nimbuspostService.trackShipment(String(awbNumber));
  if (!tracking.success) {
    return res.json({
      success: true,
      tracking: {
        provider: "Nimbuspost",
        booked: true,
        awbNumber,
        courierName: paymentInfo.nimbuspostCourierName ?? null,
        label: paymentInfo.nimbuspostLabel ?? null,
        manifest: paymentInfo.nimbuspostManifest ?? null,
        status: order.trackingStatus || "Shipment booked",
        history: [],
        error: tracking.error
      }
    });
  }

  const latestStatus = tracking.status ?? order.trackingStatus;
  if (latestStatus && latestStatus !== order.trackingStatus) {
    await execute("UPDATE orders SET tracking_status = :trackingStatus WHERE id = :id", {
      id: order.id,
      trackingStatus: latestStatus
    });
  }

  res.json({
    success: true,
    tracking: {
      provider: "Nimbuspost",
      booked: true,
      awbNumber,
      courierName: paymentInfo.nimbuspostCourierName ?? null,
      label: paymentInfo.nimbuspostLabel ?? null,
      manifest: paymentInfo.nimbuspostManifest ?? null,
      status: latestStatus,
      history: tracking.activity ?? []
    }
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  await execute("UPDATE orders SET order_status = :orderStatus, tracking_status = :trackingStatus WHERE id = :id", {
    id: req.params.id,
    orderStatus: req.body.orderStatus,
    trackingStatus: req.body.trackingStatus ?? req.body.orderStatus
  });
  const order = mapOrder(await row("SELECT * FROM orders WHERE id = :id", { id: req.params.id }));
  if (!order) throw new ApiError(404, "Order not found");
  res.json({ success: true, order });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const razorpayOrderId = String(req.body.razorpayOrderId ?? req.body.razorpay_order_id ?? "").trim();
  const razorpayPaymentId = String(req.body.razorpayPaymentId ?? req.body.razorpay_payment_id ?? "").trim();
  const razorpaySignature = String(req.body.razorpaySignature ?? req.body.razorpay_signature ?? "").trim();

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "Razorpay order id, payment id, and signature are required");
  }
  if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) throw new ApiError(400, "Payment verification failed");
  const orderRow = await row("SELECT * FROM orders WHERE payment_info ->> 'razorpayOrderId' = :razorpayOrderId", { razorpayOrderId });
  if (!orderRow) throw new ApiError(404, "Order not found");
  const existingPaymentInfo = typeof orderRow.payment_info === "string" ? JSON.parse(orderRow.payment_info || "{}") : orderRow.payment_info ?? {};
  const paymentInfo = { ...existingPaymentInfo, razorpayPaymentId, razorpaySignature };
  await execute("UPDATE orders SET payment_status = 'paid', payment_info = :paymentInfo WHERE id = :id", { id: orderRow.id, paymentInfo: json(paymentInfo) });
  const order = mapOrder(await row("SELECT * FROM orders WHERE id = :id", { id: orderRow.id }))!;

  const userRow = await row("SELECT email FROM users WHERE id = :userId", { userId: order.user });
  const userEmail = userRow?.email || "customer@grimstore.com";
  const paidUser = await getUserById(order.user);
  if (paidUser) {
    paidUser.cart = [];
    await saveUserState(paidUser);
  }

  try {
    const shipmentResult = await nimbuspostService.createShipment({
      ...order,
      paymentMethod: "razorpay",
      user_email: userEmail
    });
    if (shipmentResult.success) {
      const updatedPaymentInfo = {
        ...paymentInfo,
        nimbuspostShipmentId: shipmentResult.shipmentId,
        nimbuspostAwbNumber: shipmentResult.awbNumber,
        nimbuspostCourierId: shipmentResult.courierId,
        nimbuspostCourierName: shipmentResult.courierName,
        nimbuspostLabel: shipmentResult.label,
        nimbuspostManifest: shipmentResult.manifest
      };
      await execute(
        "UPDATE orders SET payment_info = :paymentInfo, tracking_status = :trackingStatus WHERE id = :id",
        {
          id: order.id,
          paymentInfo: json(updatedPaymentInfo),
          trackingStatus: "Packed & Registered with delivery partner"
        }
      );
      order.paymentInfo = updatedPaymentInfo;
      order.trackingStatus = "Packed & Registered with delivery partner";
    }
  } catch (err) {
    console.error("[nimbuspost:verifyPayment] Error registering shipment:", err);
  }

  res.json({ success: true, order });
});
