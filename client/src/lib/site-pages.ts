export type SitePage = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  lastUpdated: string;
  sections: Array<{
    title: string;
    body: string[];
    bullets?: string[];
  }>;
};

export const sitePages: SitePage[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    eyebrow: "Legal",
    description: "How The Grim Store collects, uses, stores, and protects customer data across shopping, checkout, reviews, and account features.",
    lastUpdated: "11 May 2026",
    sections: [
      {
        title: "Information we collect",
        body: [
          "We collect the details needed to run an ecommerce order: name, email, phone number, delivery address, cart items, order history, review activity, and payment status.",
          "Payment card or UPI credentials are handled by the payment provider. We store payment references and status, not sensitive payment credentials."
        ]
      },
      {
        title: "How we use data",
        body: ["Your data is used to process orders, deliver parcels, manage returns, prevent fraud, improve the store, and send important account or order updates."],
        bullets: ["Order confirmation and parcel updates", "Saved addresses and faster checkout", "Verified buyer reviews", "Customer support and refund handling"]
      },
      {
        title: "Security and retention",
        body: [
          "Account sessions use secure HTTP-only cookies where available. Access to admin data is role protected.",
          "We keep order and tax records for business and legal requirements. You can request correction or deletion of eligible profile information."
        ]
      }
    ]
  },
  {
    slug: "refund-and-cancellation-policy",
    title: "Refund and Cancellation Policy",
    eyebrow: "Orders",
    description: "Clear rules for cancelling orders, refund timelines, failed payments, COD orders, and coupon-adjusted refunds.",
    lastUpdated: "11 May 2026",
    sections: [
      {
        title: "Order cancellation",
        body: [
          "You can request cancellation before the parcel is packed or shipped. Once the parcel is shipped, the return and exchange policy applies.",
          "If a prepaid order is cancelled successfully, the refund is initiated to the original payment method."
        ]
      },
      {
        title: "Refund timelines",
        body: ["Refund timelines depend on the payment method and bank processing cycle."],
        bullets: ["Wallet refunds: usually instant after approval", "UPI or card refunds: usually 5 to 7 business days", "COD refunds: processed after bank details are verified", "Shipping fees may be non-refundable unless the order issue is from our side"]
      },
      {
        title: "Coupons and discounts",
        body: [
          "Refunds are calculated on the amount actually paid after coupon discount, wallet credit, or promotional price adjustment.",
          "Expired or deactivated coupons cannot be restored after cancellation."
        ]
      }
    ]
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    eyebrow: "Delivery",
    description: "Delivery coverage, dispatch timelines, shipping fees, tracking, failed delivery attempts, and address responsibilities.",
    lastUpdated: "11 May 2026",
    sections: [
      {
        title: "Dispatch and delivery",
        body: [
          "Most ready-stock orders are processed within 24 to 48 business hours. Limited drops may need extra handling time during high demand.",
          "Estimated delivery dates shown at checkout are based on the address, carrier availability, and current order load."
        ]
      },
      {
        title: "Shipping charges",
        body: ["Shipping charges are shown before payment. Free shipping offers may depend on order value, coupon terms, or campaign rules."],
        bullets: ["Standard delivery is available on most serviceable pincodes", "Free delivery threshold can change during promotions", "Remote locations can take longer than metro routes"]
      },
      {
        title: "Address accuracy",
        body: ["Customers are responsible for entering a complete and reachable address. Incorrect phone, pincode, or house details may delay or fail delivery."]
      }
    ]
  },
  {
    slug: "returns-and-exchange-policy",
    title: "Returns and Exchange Policy",
    eyebrow: "Support",
    description: "Return eligibility, size exchange rules, product condition requirements, inspection, and non-returnable items.",
    lastUpdated: "11 May 2026",
    sections: [
      {
        title: "Eligibility",
        body: ["Products are eligible for return or exchange when they are unused, unwashed, undamaged, and returned with original tags and packaging."],
        bullets: ["Size exchanges are subject to stock availability", "Damaged or incorrect products should be reported quickly after delivery", "Innerwear, final-sale products, and customized products may not be returnable"]
      },
      {
        title: "Inspection",
        body: [
          "Returned products are inspected before refund or exchange approval.",
          "If the product fails quality checks because it was used, washed, or damaged after delivery, the request may be rejected."
        ]
      },
      {
        title: "Exchange flow",
        body: ["If the requested size or color is unavailable, we may offer store credit, refund, or another available option."]
      }
    ]
  },
  {
    slug: "terms-and-conditions",
    title: "Terms and Conditions",
    eyebrow: "Legal",
    description: "The rules for using The Grim Store, placing orders, account conduct, pricing, promotions, and content ownership.",
    lastUpdated: "11 May 2026",
    sections: [
      {
        title: "Use of the store",
        body: ["By using The Grim Store, you agree to provide accurate information, respect account security, and avoid misuse of checkout, coupon, review, or support systems."]
      },
      {
        title: "Pricing and availability",
        body: [
          "Product prices, discounts, stock, campaigns, and delivery availability can change without prior notice.",
          "If a listing has an obvious pricing or inventory error, we may cancel or correct the order and notify the customer."
        ]
      },
      {
        title: "Reviews and content",
        body: ["Reviews should be honest, relevant, and based on actual product experience. We may moderate spam, abusive content, or unrelated submissions."]
      }
    ]
  },
  {
    slug: "payment-and-security",
    title: "Payment and Security",
    eyebrow: "Checkout",
    description: "Payment methods, COD, Razorpay, wallet payments, failed transactions, and secure checkout practices.",
    lastUpdated: "11 May 2026",
    sections: [
      {
        title: "Accepted payments",
        body: ["The store can support cash on delivery, wallet payments, and payment gateway checkout depending on current availability."],
        bullets: ["COD may be unavailable for selected pincodes or high-value orders", "Prepaid payment status is verified before fulfillment", "Failed payment orders are not shipped until payment is confirmed"]
      },
      {
        title: "Secure checkout",
        body: ["Sensitive payment credentials are processed by the payment gateway. We store only order references, payment status, and transaction identifiers required for support."]
      }
    ]
  },
  {
    slug: "about-us",
    title: "About The Grim Store",
    eyebrow: "Brand",
    description: "A premium black and red streetwear label built around limited drops, durable essentials, and fast ecommerce experiences.",
    lastUpdated: "11 May 2026",
    sections: [
      {
        title: "What we make",
        body: ["The Grim Store is built for premium streetwear essentials: oversized tees, hoodies, statement graphics, and limited seasonal drops."]
      },
      {
        title: "What we care about",
        body: ["We focus on strong silhouettes, reliable checkout, transparent policies, and a shopping experience that feels sharp on mobile and desktop."]
      }
    ]
  },
  {
    slug: "contact-us",
    title: "Contact Us",
    eyebrow: "Support",
    description: "Customer support details for orders, returns, exchanges, payment issues, bulk inquiries, and brand communication.",
    lastUpdated: "11 May 2026",
    sections: [
      {
        title: "Customer support",
        body: ["For order, refund, delivery, or account support, keep your order ID ready so the team can respond faster."],
        bullets: ["Email: support@thegrimstore.example", "Hours: Monday to Saturday, 10:00 AM to 6:00 PM IST", "Orders: use My Orders for parcel status and delivery updates"]
      },
      {
        title: "Business queries",
        body: ["For collaborations, bulk orders, or brand partnerships, send a clear subject line and include your contact details."]
      }
    ]
  },
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    eyebrow: "Help",
    description: "Answers to common questions about orders, coupons, delivery, sizing, returns, exchanges, refunds, and account management.",
    lastUpdated: "11 May 2026",
    sections: [
      {
        title: "Orders and tracking",
        body: ["After a successful order, open My Orders to see parcel status, expected delivery, and the latest admin-updated tracking message."]
      },
      {
        title: "Coupons",
        body: ["Coupons must be active, unexpired, within usage limit, and valid for your cart value. If a coupon is deactivated, checkout will show that the coupon code expired."]
      },
      {
        title: "Sizing",
        body: ["Check the size chart on the product page before buying. Oversized products are intentionally relaxed and may fit larger than regular tees."]
      }
    ]
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    eyebrow: "Privacy",
    description: "How cookies and similar storage are used for login sessions, cart continuity, analytics, and ecommerce security.",
    lastUpdated: "11 May 2026",
    sections: [
      {
        title: "Why cookies are used",
        body: ["Cookies help keep you logged in, protect checkout sessions, remember cart state, and improve storefront performance."]
      },
      {
        title: "Managing cookies",
        body: ["You can manage cookies in your browser settings. Blocking essential cookies may prevent login, cart, or checkout features from working correctly."]
      }
    ]
  }
];

export const pageMap = new Map(sitePages.map((page) => [page.slug, page]));

