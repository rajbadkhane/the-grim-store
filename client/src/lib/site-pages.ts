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
    description: "Order processing, shipping timelines, tracking updates, delivery delays, incorrect address rules, and lost shipment support for orders across India.",
    lastUpdated: "23 June 2026",
    sections: [
      {
        title: "Order processing",
        body: [
          "The Grim Store processes most confirmed orders within 1 to 2 business days. Orders placed on Sundays, public holidays, or during high-volume sale periods may require additional handling time.",
          "Once your order is packed and handed over to the courier partner, you will receive tracking details through the available order update channel."
        ]
      },
      {
        title: "Shipping timelines",
        body: [
          "Standard delivery across India usually takes 3 to 7 business days after dispatch. Metro cities and major serviceable pincodes may receive orders sooner.",
          "Remote locations, restricted zones, weather disruptions, courier delays, or regional service limitations may extend delivery timelines to 7 to 10 business days."
        ],
        bullets: [
          "Order processing: usually 1 to 2 business days",
          "Standard delivery after dispatch: usually 3 to 7 business days",
          "Remote or difficult-service locations: usually 7 to 10 business days",
          "Delivery estimates are indicative and may vary by courier availability"
        ]
      },
      {
        title: "Tracking information",
        body: [
          "Tracking details are shared after dispatch. Courier scans may take up to 24 hours to reflect after the tracking number is generated.",
          "Customers can also check order status from their account order history where available."
        ]
      },
      {
        title: "Delivery delays",
        body: [
          "Delivery may be delayed due to courier capacity, incorrect address details, customer unavailability, weather events, local restrictions, payment verification, or other circumstances beyond our direct control.",
          "If your shipment is delayed beyond the expected delivery window, contact support with your order ID so our team can coordinate with the courier partner."
        ]
      },
      {
        title: "Incorrect address policy",
        body: [
          "Customers are responsible for entering a complete and accurate shipping address, including name, mobile number, house or flat details, area, city, state, and pincode.",
          "If an order is returned due to incorrect address, unreachable phone number, refused delivery, or repeated failed attempts, re-shipping may require additional charges."
        ]
      },
      {
        title: "Lost shipment procedure",
        body: [
          "If a shipment is marked lost by the courier partner, The Grim Store will review the courier confirmation and may offer a replacement, refund, or store credit depending on stock availability and order status.",
          "Lost shipment claims can be processed only after courier investigation is completed."
        ]
      },
      {
        title: "Shipping support",
        body: [
          "For shipping help, email support@thegrimstore.com or contact customer support at +91 83191 54647 or +91 84630 81361. WhatsApp support is available at +91 83058 42625.",
          "Please keep your order ID and registered mobile number ready for faster assistance."
        ]
      }
    ]
  },
  {
    slug: "returns-and-exchange-policy",
    title: "Return & Refund Policy",
    eyebrow: "Policy",
    description: "Return requests, mandatory unboxing video requirements, damaged or incorrect item claims, refund timelines, replacement process, and support details.",
    lastUpdated: "23 June 2026",
    sections: [
      {
        title: "Return window",
        body: [
          "Return requests must be raised within 7 days from the date of delivery. Requests received after 7 days may be rejected.",
          "To begin a return, contact The Grim Store support with your order ID, registered mobile number, reason for return, and required proof."
        ]
      },
      {
        title: "Mandatory unboxing video",
        body: [
          "A clear unboxing video is mandatory for all return, replacement, refund, damaged item, incorrect item, and missing item claims.",
          "The video must start before the package is opened and must clearly show the sealed parcel, shipping label, outer packaging, inner packaging, product, accessories, and the issue being reported.",
          "No return, refund, replacement, or claim will be approved without a valid unboxing video."
        ]
      },
      {
        title: "Return eligibility",
        body: [
          "Returned products must be unused, undamaged, unwashed where applicable, and in the same condition in which they were delivered.",
          "Original packaging, tags, manuals, accessories, freebies, invoice, and all included items must be returned together. Products that show signs of use, misuse, tampering, installation damage, liquid damage, missing parts, or customer-caused damage may be rejected."
        ],
        bullets: [
          "Return request must be raised within 7 days of delivery",
          "Product must be unused and in original condition",
          "Original packaging and all accessories must be included",
          "Unboxing video is mandatory for every claim",
          "Final approval is subject to quality inspection"
        ]
      },
      {
        title: "Damaged, incorrect, or missing items",
        body: [
          "If you receive a damaged product, incorrect product, missing accessory, or incomplete order, you must report the issue within the return window with a valid unboxing video.",
          "Claims without video proof, claims where the package was already opened before recording, or claims submitted after the eligible period may be rejected."
        ]
      },
      {
        title: "Refund timelines",
        body: [
          "Refunds are initiated only after the returned product is received, inspected, and approved by The Grim Store.",
          "Once approved, prepaid refunds are usually processed to the original payment method within 5 to 7 business days. COD or manual refunds may take 7 to 10 business days after bank or UPI details are verified.",
          "Bank, payment gateway, and UPI settlement timelines may vary and are outside our direct control."
        ]
      },
      {
        title: "Replacement process",
        body: [
          "For approved damaged, incorrect, or eligible replacement cases, The Grim Store may arrange a replacement based on stock availability.",
          "If the same item is unavailable, we may offer an alternative product, store credit, or refund as applicable. Replacement dispatch usually begins within 2 to 4 business days after approval and pickup or verification."
        ]
      },
      {
        title: "Non-returnable cases",
        body: [
          "Returns may be rejected if the product is used, damaged after delivery, missing parts, returned without original packaging, reported without a valid unboxing video, or submitted after the 7-day return window.",
          "Refunds for shipping charges, convenience fees, COD charges, or promotional benefits may not be available unless the issue is confirmed to be from our side."
        ]
      },
      {
        title: "Legal note",
        body: [
          "This policy is intended for ecommerce transactions within India and is subject to applicable Indian laws, courier verification, payment gateway rules, and internal quality checks.",
          "The Grim Store reserves the right to approve, reject, or request additional evidence for any return, refund, replacement, damaged item, incorrect item, or missing item claim."
        ]
      },
      {
        title: "Contact for returns and refunds",
        body: [
          "Email support@thegrimstore.com or contact customer support at +91 83191 54647 or +91 84630 81361. WhatsApp support is available at +91 83058 42625.",
          "Include your order ID, registered mobile number, issue details, photos if available, and the mandatory unboxing video."
        ]
      }
    ]
  },
  {
    slug: "terms-and-conditions",
    title: "Terms of Service",
    eyebrow: "Legal",
    description: "Website usage terms, product information disclaimers, pricing rules, order acceptance rights, intellectual property, liability limits, account responsibilities, and governing law.",
    lastUpdated: "23 June 2026",
    sections: [
      {
        title: "Acceptance of terms",
        body: [
          "By accessing, browsing, registering on, or purchasing from The Grim Store, you agree to these Terms of Service and all applicable policies displayed on the website.",
          "If you do not agree with these terms, you should not use the website or place an order."
        ]
      },
      {
        title: "Website usage",
        body: [
          "You agree to use the website only for lawful purposes and in a manner that does not damage, disable, misuse, overload, interfere with, or compromise the website, checkout, account, review, coupon, payment, or support systems.",
          "You must not attempt unauthorized access, submit false information, abuse promotions, misuse returns, upload harmful content, or use the website for fraudulent activity."
        ]
      },
      {
        title: "Product information disclaimer",
        body: [
          "We aim to provide accurate product names, images, prices, descriptions, availability, specifications, and delivery information. However, minor variations may occur due to lighting, display settings, manufacturing updates, packaging changes, or listing errors.",
          "Product images are for representation and may include props, packaging, or accessories only when specifically mentioned in the product description."
        ]
      },
      {
        title: "Pricing disclaimer",
        body: [
          "Prices, discounts, offers, shipping charges, COD availability, and promotional campaigns may change without prior notice.",
          "If a product is listed with an obvious pricing, stock, coupon, tax, or technical error, The Grim Store reserves the right to cancel, correct, or refuse the order and notify the customer."
        ]
      },
      {
        title: "Order acceptance rights",
        body: [
          "Placing an order does not guarantee acceptance. Orders are accepted only after successful verification of payment, stock, address, serviceability, fraud checks, and internal order review.",
          "The Grim Store may cancel or refuse any order due to unavailable stock, payment failure, suspicious activity, incorrect address, courier restrictions, pricing errors, or policy abuse."
        ]
      },
      {
        title: "Payments and order communication",
        body: [
          "Payments are processed through available payment methods and third-party payment partners. Payment confirmation, refund settlement, and failed transaction handling may depend on bank, UPI, card network, wallet, or payment gateway timelines.",
          "You agree to receive order-related communication through email, phone, SMS, WhatsApp, or other contact details provided during checkout."
        ]
      },
      {
        title: "Account responsibilities",
        body: [
          "You are responsible for maintaining accurate account, billing, shipping, and contact information. You are also responsible for keeping your login details secure.",
          "Any activity from your account may be treated as authorized unless reported promptly to support."
        ]
      },
      {
        title: "Returns, refunds, and shipping",
        body: [
          "Orders are subject to The Grim Store shipping, return, refund, and cancellation policies as updated from time to time.",
          "Return, refund, replacement, damaged item, incorrect item, and missing item claims require compliance with the applicable policy, including mandatory unboxing video proof where required."
        ]
      },
      {
        title: "Intellectual property",
        body: [
          "The website name, brand assets, logos, product presentation, images, text, graphics, user interface, page content, and other materials belong to The Grim Store or its licensors unless otherwise stated.",
          "You may not copy, reproduce, modify, distribute, scrape, sell, or exploit website content without prior written permission."
        ]
      },
      {
        title: "Limitation of liability",
        body: [
          "To the fullest extent permitted by applicable law, The Grim Store shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from website use, order delays, courier issues, payment gateway failures, product misuse, or third-party services.",
          "Our total liability for any order-related claim shall not exceed the amount paid by the customer for the specific product or order giving rise to the claim."
        ]
      },
      {
        title: "Governing law",
        body: [
          "These Terms of Service are governed by the laws of India. Any dispute shall be subject to the jurisdiction of competent courts in India, unless otherwise required by applicable law.",
          "Nothing in these terms limits any rights available to consumers under applicable Indian consumer protection laws."
        ]
      },
      {
        title: "Contact information",
        body: [
          "For questions about these Terms of Service, contact The Grim Store at support@thegrimstore.com.",
          "Customer support is available at +91 83191 54647 and +91 84630 81361. WhatsApp support is available at +91 83058 42625."
        ]
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
    description: "A premium black and red electronics store built around practical items, durable essentials, and fast ecommerce experiences.",
    lastUpdated: "23 June 2026",
    sections: [
      {
        title: "What we make",
        body: ["The Grim Store is built for practical electronic essentials: kids cameras, game sticks, wireless audio, grooming tools, accessories, and reliable everyday gadgets."]
      },
      {
        title: "What we care about",
        body: ["We focus on useful products, reliable checkout, transparent policies, and a shopping experience that feels sharp on mobile and desktop."]
      }
    ]
  },
  {
    slug: "contact-us",
    title: "Contact Us",
    eyebrow: "Support",
    description: "Reach The Grim Store for order help, tracking support, returns, refunds, damaged item claims, payments, and customer assistance.",
    lastUpdated: "23 June 2026",
    sections: [
      {
        title: "We are here to help",
        body: [
          "Need help with an order, delivery, payment, return, refund, or product issue? The Grim Store support team is ready to assist with clear, practical guidance.",
          "For faster support, keep your order ID, registered mobile number, and issue details ready before contacting us."
        ]
      },
      {
        title: "Email support",
        body: [
          "For detailed assistance, documents, refund requests, return claims, damaged item claims, or escalation records, email us at support@thegrimstore.com.",
          "Please include your order ID in the subject line when your message is related to an order."
        ]
      },
      {
        title: "Phone support",
        body: [
          "Customer support is available at +91 83191 54647 and +91 84630 81361.",
          "Phone support is best for urgent order queries, delivery coordination, payment confirmation concerns, and quick assistance."
        ]
      },
      {
        title: "WhatsApp support",
        body: [
          "WhatsApp support is available at +91 83058 42625.",
          "Use WhatsApp to share your order ID, tracking concern, product issue, photos, or mandatory unboxing video for return and damage claims."
        ]
      },
      {
        title: "Support hours",
        body: [
          "Our usual support hours are Monday to Saturday, 10:00 AM to 7:00 PM IST, excluding major public holidays.",
          "Messages received outside support hours are reviewed on the next working day."
        ]
      },
      {
        title: "Expected response time",
        body: [
          "We aim to respond to most support requests within 24 to 48 business hours.",
          "Complex issues involving courier investigation, payment gateway confirmation, product inspection, or refund approval may take longer, but our team will keep the request moving."
        ]
      },
      {
        title: "Friendly customer assistance",
        body: [
          "We keep support direct, respectful, and solution-focused. Whether your order is delayed, an item arrived damaged, or you simply need clarity before raising a request, our team will guide you through the next step.",
          "The more details you share upfront, the faster we can help."
        ]
      }
    ]
  },
  {
    slug: "help-center",
    title: "Help Center",
    eyebrow: "Help",
    description: "Answers to common questions about orders, tracking, shipping, returns, refunds, payments, and how to contact The Grim Store support.",
    lastUpdated: "23 June 2026",
    sections: [
      {
        title: "Welcome to The Grim Store Help Center",
        body: [
          "Find quick answers for order updates, delivery timelines, return rules, refund status, payment issues, and customer support.",
          "For any order-specific request, keep your order ID and registered mobile number ready so our team can assist you faster."
        ]
      },
      {
        title: "Frequently asked questions",
        body: [
          "These answers cover the most common customer questions. Policy-based requests are subject to verification, courier updates, product inspection, and the applicable store policy."
        ],
        bullets: [
          "How do I confirm my order? You will receive order confirmation after checkout is completed and the order is accepted for processing.",
          "Where can I see my order status? You can check your account order history where available or contact support with your order ID.",
          "When will my order be shipped? Most confirmed orders are processed within 1 to 2 business days.",
          "How long does delivery take? Standard delivery across India usually takes 3 to 7 business days after dispatch.",
          "Why is my tracking link not updating? Courier scans may take up to 24 hours to reflect after dispatch.",
          "Can I change my shipping address? Address changes can be requested before dispatch, but they are not guaranteed once the order is packed or shipped.",
          "What if I entered the wrong phone number or pincode? Contact support immediately. Incorrect details may delay delivery or cause the parcel to return.",
          "Do you support Cash on Delivery? COD availability may depend on pincode, order value, courier rules, and current store settings.",
          "What payment methods are accepted? Available payment options may include UPI, cards, net banking, wallets, COD, or other enabled checkout methods.",
          "What should I do if payment failed but money was deducted? Contact support with payment proof. Bank or gateway reversals usually depend on the payment provider timeline.",
          "Can I return a product? Eligible return requests must be raised within 7 days of delivery and must meet policy conditions.",
          "Is an unboxing video required? Yes. A clear unboxing video is mandatory for return, refund, replacement, damaged item, incorrect item, and missing item claims.",
          "Will my return be accepted without an unboxing video? No. No return, refund, replacement, or claim will be approved without a valid unboxing video.",
          "When will I receive my refund? Approved prepaid refunds usually take 5 to 7 business days. COD or manual refunds may take 7 to 10 business days after verification.",
          "What if I received a damaged or incorrect item? Report it within the eligible window with your order ID, photos if available, and a valid unboxing video.",
          "How do I contact customer support? Email support@thegrimstore.com, call +91 83191 54647 or +91 84630 81361, or WhatsApp +91 83058 42625."
        ]
      },
      {
        title: "Order tracking",
        body: [
          "Tracking details are shared after dispatch. If your tracking number is active but not showing movement, please allow up to 24 hours for courier scans to update.",
          "For delayed tracking, share your order ID with support so we can check the latest courier status."
        ]
      },
      {
        title: "Shipping questions",
        body: [
          "Most orders are processed within 1 to 2 business days and delivered within 3 to 7 business days after dispatch, depending on your pincode and courier availability.",
          "Remote locations, weather issues, local restrictions, or courier overload may extend delivery timelines."
        ]
      },
      {
        title: "Returns questions",
        body: [
          "Return requests are allowed within 7 days of delivery for eligible unused products in original condition.",
          "A valid unboxing video is mandatory. Products returned used, damaged after delivery, missing parts, or without original packaging may be rejected."
        ]
      },
      {
        title: "Refund questions",
        body: [
          "Refunds are initiated only after approval and, where applicable, after product inspection.",
          "Prepaid refunds usually take 5 to 7 business days after approval. COD or manual refunds may take 7 to 10 business days after bank or UPI details are verified."
        ]
      },
      {
        title: "Payment questions",
        body: [
          "If your payment fails but the amount is deducted, the bank or payment gateway may automatically reverse the amount as per its settlement timeline.",
          "For payment support, share your order ID, payment screenshot, transaction ID, date, time, and registered mobile number."
        ]
      },
      {
        title: "Contact support",
        body: [
          "Email: support@thegrimstore.com",
          "Customer support: +91 83191 54647 and +91 84630 81361",
          "WhatsApp: +91 83058 42625",
          "Support hours are usually Monday to Saturday, 10:00 AM to 7:00 PM IST."
        ]
      }
    ]
  },
  {
    slug: "support-center",
    title: "Support Center",
    eyebrow: "Support",
    description: "Dedicated assistance for orders, tracking, damaged items, returns, refunds, escalations, and customer support contact details.",
    lastUpdated: "23 June 2026",
    sections: [
      {
        title: "Order assistance",
        body: [
          "For order confirmation, product availability, payment status, order edits, or cancellation questions, contact support with your order ID and registered mobile number.",
          "Order changes are possible only before packing or dispatch and are subject to store review."
        ]
      },
      {
        title: "Tracking assistance",
        body: [
          "If your shipment is delayed, stuck, or not updating, share your order ID and tracking details with our team.",
          "Courier updates can take up to 24 hours to refresh after dispatch. If the shipment exceeds the expected delivery window, we will help coordinate with the courier partner."
        ]
      },
      {
        title: "Damaged item support",
        body: [
          "If your item arrives damaged, record and share a valid unboxing video that starts before the package is opened and clearly shows the issue.",
          "Damaged item claims without a valid unboxing video cannot be approved. Photos may help, but they do not replace the mandatory video proof."
        ]
      },
      {
        title: "Return assistance",
        body: [
          "Return requests must be raised within 7 days of delivery. The product must be unused, in original condition, and returned with packaging, accessories, tags, manuals, freebies, and invoice where applicable.",
          "Our support team will guide you through eligibility checks, proof submission, pickup instructions, and inspection timelines."
        ]
      },
      {
        title: "Refund assistance",
        body: [
          "Refunds are processed only after request approval and product inspection where required.",
          "Approved prepaid refunds usually take 5 to 7 business days. COD or manual refunds may take 7 to 10 business days after bank or UPI details are verified."
        ]
      },
      {
        title: "Escalation process",
        body: [
          "If your issue is not resolved within the expected support timeline, reply to the same email or WhatsApp conversation and request escalation with your order ID.",
          "Escalated cases may require additional review, courier investigation, payment gateway confirmation, quality inspection, or management approval."
        ],
        bullets: [
          "Step 1: Contact support with order ID and issue details",
          "Step 2: Submit required proof, including unboxing video where applicable",
          "Step 3: Allow the team to review, verify, and coordinate next steps",
          "Step 4: Request escalation if the case remains unresolved after the shared timeline"
        ]
      },
      {
        title: "Contact information",
        body: [
          "Email: support@thegrimstore.com",
          "Customer support: +91 83191 54647 and +91 84630 81361",
          "WhatsApp: +91 83058 42625",
          "Support hours are usually Monday to Saturday, 10:00 AM to 7:00 PM IST."
        ]
      }
    ]
  },
  {
    slug: "blog",
    title: "The Grim Journal",
    eyebrow: "Blog",
    description: "Stories, drops, guides, and culture notes from The Grim Store across anime, streetwear, gaming, fashion trends, and pop culture.",
    lastUpdated: "23 June 2026",
    sections: [
      {
        title: "Stories for the dark side of style",
        body: [
          "Step into The Grim Journal, the editorial home for sharper fits, cleaner setups, collector culture, gaming energy, anime influence, and modern streetwear.",
          "This is where product stories meet the culture around them: minimal, bold, and built for people who notice the details."
        ]
      },
      {
        title: "Featured stories",
        body: [
          "Explore curated stories, buying guides, trend notes, and style edits designed to help you choose better, wear better, and build a setup that feels like yours.",
          "From limited drops to everyday essentials, every story keeps the focus on quality, identity, and practical taste."
        ]
      },
      {
        title: "Categories",
        body: [
          "Browse the latest from the worlds that shape The Grim Store aesthetic."
        ],
        bullets: [
          "Anime: character-inspired style, collectibles, fandom essentials, and drop culture",
          "Streetwear: dark fits, statement layers, accessories, and everyday styling",
          "Gaming: setup ideas, gear notes, comfort picks, and player-focused guides",
          "Fashion Trends: clean silhouettes, seasonal edits, and practical styling cues",
          "Pop Culture: moments, icons, releases, and references shaping modern taste"
        ]
      },
      {
        title: "Newsletter",
        body: [
          "Join the list for new drops, editorial picks, category guides, and store updates.",
          "No noise. Just sharp updates when something worth knowing lands."
        ]
      },
      {
        title: "Community",
        body: [
          "The Grim Store is built for customers who care about style, utility, fandom, and the details that make a product feel personal.",
          "Share your fits, setups, collections, and product moments with the community as the brand grows."
        ]
      },
      {
        title: "Stay close to the drop",
        body: [
          "Read the stories. Watch the categories. Build your cart with intent.",
          "When the next drop lands, The Grim Journal will be the first place to frame the mood."
        ]
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
        body: ["Check product photos, variant details, stock status, and description before buying. For electronic items, confirm the exact model, included accessories, and usage notes."]
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
