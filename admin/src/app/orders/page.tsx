"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Loader2, RefreshCcw, Save } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";

type OrderStatus = "placed" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded";

type OrderProduct = {
  id?: string;
  product?: string;
  slug?: string;
  title: string;
  image?: string;
  price?: number;
  salePrice: number;
  quantity: number;
  sku?: string;
  size?: string;
  color?: string;
  material?: string;
  pattern?: string;
};

type ShippingAddress = {
  fullName?: string;
  phone?: string;
  pincode?: string;
  state?: string;
  city?: string;
  house?: string;
  road?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  addressType?: string;
};

type Order = {
  id: string;
  orderId: string;
  user?: { id?: string; name?: string; email?: string; phone?: string };
  products: OrderProduct[];
  paymentInfo?: Record<string, any>;
  shippingAddress?: ShippingAddress;
  orderStatus: OrderStatus;
  trackingStatus: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  paymentStatus: string;
  deliveryDate?: string;
  createdAt?: string;
};

const statuses: Array<{ value: OrderStatus; label: string }> = [
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" }
];

const trackingByStatus: Record<OrderStatus, string> = {
  placed: "Order placed",
  confirmed: "Order confirmed by The Grim Store",
  packed: "Packed and ready for shipment",
  shipped: "Parcel shipped and moving through carrier network",
  delivered: "Delivered successfully",
  cancelled: "Order cancelled",
  refunded: "Refund processed"
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { orderStatus: OrderStatus; trackingStatus: string }>>({});
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      const nextOrders = (res.data?.orders ?? []) as Order[];
      setOrders(nextOrders);
      setDrafts(
        Object.fromEntries(
          nextOrders.map((order) => [
            order.id,
            {
              orderStatus: order.orderStatus,
              trackingStatus: order.trackingStatus || trackingByStatus[order.orderStatus]
            }
          ])
        )
      );
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) router.push("/login");
      else toast.error(error.response?.data?.message ?? "Unable to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(
    () => ({
      orders: orders.length,
      placed: orders.filter((order) => order.orderStatus === "placed" || order.orderStatus === "confirmed").length,
      inTransit: orders.filter((order) => order.orderStatus === "packed" || order.orderStatus === "shipped").length,
      delivered: orders.filter((order) => order.orderStatus === "delivered").length
    }),
    [orders]
  );

  function updateDraft(orderId: string, patch: Partial<{ orderStatus: OrderStatus; trackingStatus: string }>) {
    setDrafts((current) => {
      const existing = current[orderId];
      if (!existing) return current;
      const nextStatus = patch.orderStatus ?? existing.orderStatus;
      return {
        ...current,
        [orderId]: {
          orderStatus: nextStatus,
          trackingStatus: patch.trackingStatus ?? (patch.orderStatus ? trackingByStatus[nextStatus] : existing.trackingStatus)
        }
      };
    });
  }

  async function save(order: Order) {
    const draft = drafts[order.id];
    if (!draft) return;
    setSavingId(order.id);
    try {
      const res = await api.patch(`/orders/${order.id}/status`, draft);
      const updated = res.data?.order as Order;
      setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, ...updated, user: item.user } : item)));
      toast.success("Order status updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to update status");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Fulfillment</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Orders & Parcel Status</h2>
          <p className="mt-1 text-sm text-slate-500">Full order table with customer, address, product variants, payment, and delivery data.</p>
        </div>
        <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
          <RefreshCcw size={18} /> Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Total orders" value={totals.orders} />
        <Stat label="New/confirmed" value={totals.placed} />
        <Stat label="In transit" value={totals.inTransit} />
        <Stat label="Delivered" value={totals.delivered} />
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading && (
          <div className="py-12 text-center text-slate-500">
            <Loader2 className="mx-auto mb-2 animate-spin" /> Loading orders
          </div>
        )}
        {!loading && orders.length === 0 && <p className="py-12 text-center text-sm font-bold text-slate-500">No orders yet.</p>}
        {!loading && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1540px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3">Details</th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Products & Variants</th>
                  <th>Shipping Address</th>
                  <th>Payment</th>
                  <th>Amounts</th>
                  <th>Status Control</th>
                  <th>Dates</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const draft = drafts[order.id] ?? { orderStatus: order.orderStatus, trackingStatus: order.trackingStatus };
                  const open = Boolean(openRows[order.id]);
                  return (
                    <OrderTableRows
                      key={order.id}
                      order={order}
                      draft={draft}
                      open={open}
                      saving={savingId === order.id}
                      onToggle={() => setOpenRows((current) => ({ ...current, [order.id]: !open }))}
                      onDraft={updateDraft}
                      onSave={save}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function OrderTableRows({
  order,
  draft,
  open,
  saving,
  onToggle,
  onDraft,
  onSave
}: {
  order: Order;
  draft: { orderStatus: OrderStatus; trackingStatus: string };
  open: boolean;
  saving: boolean;
  onToggle: () => void;
  onDraft: (orderId: string, patch: Partial<{ orderStatus: OrderStatus; trackingStatus: string }>) => void;
  onSave: (order: Order) => void;
}) {
  const address = order.shippingAddress ?? {};
  const productSummary = order.products.map((item) => `${item.title} x ${item.quantity}`).join(", ");
  const orderDate = order.createdAt ? formatDateTime(order.createdAt) : "Unknown";
  const delivery = order.deliveryDate ? formatDate(order.deliveryDate) : "Pending";
  const paymentMethod = String(order.paymentInfo?.method ?? "unknown").toUpperCase();
  const awbNumber = order.paymentInfo?.nimbuspostAwbNumber ?? order.paymentInfo?.shiprocketAwbCode;
  const courierName = order.paymentInfo?.nimbuspostCourierName ?? "Nimbuspost";
  const labelUrl = order.paymentInfo?.nimbuspostLabel;
  const manifestUrl = order.paymentInfo?.nimbuspostManifest;
  const nimbuspostError = order.paymentInfo?.nimbuspostError;

  return (
    <>
      <tr className="border-t border-slate-100 align-top">
        <td className="py-4">
          <button onClick={onToggle} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" aria-label="Toggle order details">
            {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </button>
        </td>
        <td className="py-4">
          <p className="font-black text-slate-950">{order.orderId}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge tone={statusTone(order.orderStatus)}>{statusLabel(order.orderStatus)}</Badge>
            <Badge tone="green">{order.paymentStatus}</Badge>
          </div>
        </td>
        <td className="py-4">
          <p className="font-black text-slate-950">{order.user?.name || "Customer"}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{order.user?.email || "No email"}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{order.user?.phone || address.phone || "No phone"}</p>
        </td>
        <td className="py-4 max-w-[280px]">
          <p className="font-bold text-slate-700">{productSummary || "No products"}</p>
          <p className="mt-1 text-xs text-slate-500">{order.products.length} line item{order.products.length === 1 ? "" : "s"}</p>
        </td>
        <td className="py-4 max-w-[280px]">
          <p className="font-black text-slate-950">{address.fullName || order.user?.name || "Recipient"}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{formatAddress(address)}</p>
        </td>
        <td className="py-4">
          <p className="font-black text-slate-950">{paymentMethod}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{order.paymentStatus}</p>
        </td>
        <td className="py-4">
          <p className="font-black text-slate-950">{money(order.totalAmount)}</p>
          <p className="mt-1 text-xs text-slate-500">Ship {money(order.shippingFee ?? 0)}</p>
          <p className="mt-1 text-xs text-slate-500">Discount {money(order.discountAmount ?? 0)}</p>
        </td>
        <td className="py-4 min-w-[320px]">
          <div className="grid gap-2">
            <select value={draft.orderStatus} onChange={(event) => onDraft(order.id, { orderStatus: event.target.value as OrderStatus })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900">
              {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
            <input value={draft.trackingStatus} onChange={(event) => onDraft(order.id, { trackingStatus: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900" />
            <button onClick={() => onSave(order)} disabled={saving} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-black text-white disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
            </button>
          </div>
        </td>
        <td className="py-4">
          <p className="font-bold text-slate-700">{orderDate}</p>
          <p className="mt-1 text-xs text-slate-500">Expected {delivery}</p>
        </td>
      </tr>
      {open && (
        <tr className="border-t border-slate-100 bg-slate-50/80">
          <td colSpan={9} className="p-4">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Product line items with variants</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-xs">
                    <thead className="uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-2">Product</th>
                        <th>SKU</th>
                        <th>Size</th>
                        <th>Color</th>
                        <th>Material</th>
                        <th>Pattern</th>
                        <th>Qty</th>
                        <th>MRP</th>
                        <th>Sale</th>
                        <th>Line total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.products.map((item, index) => (
                        <tr key={`${item.sku ?? item.title}-${index}`} className="border-t border-slate-100">
                          <td className="py-3 font-black text-slate-900">{item.title}</td>
                          <td>{item.sku || "-"}</td>
                          <td>{item.size || "-"}</td>
                          <td>{item.color || "-"}</td>
                          <td>{item.material || "-"}</td>
                          <td>{item.pattern || "-"}</td>
                          <td>{item.quantity}</td>
                          <td>{money(item.price ?? item.salePrice)}</td>
                          <td className="font-black text-slate-900">{money(item.salePrice)}</td>
                          <td className="font-black text-slate-900">{money(item.salePrice * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="grid gap-4">
                <DetailBox title="Customer filled shipping address">
                  <p className="font-black text-slate-950">{address.fullName || "Recipient"}</p>
                  <p>{address.phone || "No phone"}</p>
                  <p>{formatAddress(address)}</p>
                  {address.landmark && <p>Landmark: {address.landmark}</p>}
                  {(address.latitude || address.longitude) && <p>Coordinates: {address.latitude}, {address.longitude}</p>}
                </DetailBox>
                <DetailBox title="Payment & totals">
                  <p>Payment method: <strong>{paymentMethod}</strong></p>
                  <p>Payment status: <strong>{order.paymentStatus}</strong></p>
                  <p>Subtotal: <strong>{money(order.products.reduce((sum, item) => sum + item.salePrice * item.quantity, 0))}</strong></p>
                  <p>Shipping: <strong>{money(order.shippingFee ?? 0)}</strong></p>
                  <p>Discount: <strong>{money(order.discountAmount ?? 0)}</strong></p>
                  <p>Total: <strong>{money(order.totalAmount)}</strong></p>
                </DetailBox>
                <DetailBox title="Nimbuspost shipment">
                  <p>Courier: <strong>{courierName}</strong></p>
                  <p>AWB: <strong>{awbNumber || "Not booked yet"}</strong></p>
                  {nimbuspostError && <p className="text-red-600">Nimbuspost error: <strong>{nimbuspostError}</strong></p>}
                  {labelUrl && <p><a className="font-black text-indigo-600" href={labelUrl} target="_blank" rel="noreferrer">Open shipping label</a></p>}
                  {manifestUrl && <p><a className="font-black text-indigo-600" href={manifestUrl} target="_blank" rel="noreferrer">Open manifest</a></p>}
                </DetailBox>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
      <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">{title}</h3>
      {children}
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "blue" | "green" | "red" | "slate" }) {
  const styles = {
    blue: "bg-indigo-50 text-indigo-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700"
  };
  return <span className={`rounded-full px-2 py-1 text-xs font-black ${styles[tone]}`}>{children}</span>;
}

function statusTone(status: OrderStatus): "blue" | "green" | "red" | "slate" {
  if (status === "delivered") return "green";
  if (status === "cancelled" || status === "refunded") return "red";
  if (status === "shipped" || status === "packed") return "blue";
  return "slate";
}

function formatAddress(address: ShippingAddress) {
  const line = [address.house, address.road, address.landmark, address.city, address.state, address.pincode].filter(Boolean).join(", ");
  return line || "No address";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
