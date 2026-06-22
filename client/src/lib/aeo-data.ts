export interface AeoFAQ {
  question: string;
  answer: string;
}

export interface AeoTopPick {
  title: string;
  badge: string;
  price: string;
  desc: string;
}

export interface AeoComparisonRow {
  product: string;
  feature: string;
  rating: string;
  price: string;
}

export interface AeoCategoryData {
  categorySlug: string;
  categoryName: string;
  guideTitle: string;
  guideIntro: string;
  topPicks: AeoTopPick[];
  comparison: AeoComparisonRow[];
  faqs: AeoFAQ[];
}

export const aeoCategories: Record<string, AeoCategoryData> = {
  toy: {
    categorySlug: "toy",
    categoryName: "Kids Toys",
    guideTitle: "Ultimate Guide to Selecting Educational Smart Toys & Robotics",
    guideIntro: "Selecting smart toys requires looking for interactive Lego-style blocks, early stem concepts, secure offline connectivity, and modular play paths. These elements foster cognitive development and keep kids engaged for longer stretches.",
    topPicks: [
      { title: "Smart Learning Robot", badge: "Best Overall", price: "₹2,499", desc: "Features advanced speech patterns, spelling programs, and touch sensors." },
      { title: "Coding Blocks Set", badge: "Best STEM", price: "₹1,899", desc: "Interactive blocks that teach kids loops and programming logic offline." }
    ],
    comparison: [
      { product: "Smart Learning Robot", feature: "Speech & Coding", rating: "4.9/5", price: "₹2,499" },
      { product: "Coding Blocks Set", feature: "Offline Logic", rating: "4.8/5", price: "₹1,899" },
      { product: "Interactive Lego Blocks", feature: "Creative Build", rating: "4.7/5", price: "₹1,299" }
    ],
    faqs: [
      { question: "What is the best age range for smart educational toys?", answer: "Most STEM toys are designed for children aged 3 to 12 years. Always check safety tags for small parts." },
      { question: "Do these smart toys require continuous internet access?", answer: "No, our curated educational toys operate 100% offline or through direct device connections to ensure kids' data privacy." },
      { question: "How do STEM toys help in early cognitive learning?", answer: "STEM toys introduce block coding, structural balance, logic loops, and sensory coordination, boosting logical thinking and spatial intelligence." }
    ]
  },
  gaming: {
    categorySlug: "gaming",
    categoryName: "Gaming Zone",
    guideTitle: "Pro Guide: Best Portable Consoles & Accessories",
    guideIntro: "Whether picking retro emulator boards or next-gen controllers, check for key parameters: battery capacity (mAh), button tactile feedback, screen refresh rate, and output capabilities (e.g. HDMI casting).",
    topPicks: [
      { title: "Retro Handheld Arcade", badge: "Best Retro", price: "₹4,200", desc: "Comes preloaded with 500+ classic arcade titles in a lightweight design." },
      { title: "Tactile Wireless Gamepad", badge: "Best Value", price: "₹2,100", desc: "Supports dual vibration, drift-free hall-effect triggers, and multi-system Bluetooth." }
    ],
    comparison: [
      { product: "Retro Handheld Arcade", feature: "500+ Preloaded Games", rating: "4.8/5", price: "₹4,200" },
      { product: "Tactile Wireless Gamepad", feature: "Drift-free Hall Triggers", rating: "4.9/5", price: "₹2,100" },
      { product: "VR Comfort Headset", feature: "Ergonomic Balance", rating: "4.6/5", price: "₹3,500" }
    ],
    faqs: [
      { question: "What is the best budget gaming console under ₹5000?", answer: "The Retro Handheld Arcade is our top pick under ₹5000, offering plug-and-play capability, direct HDMI output, and built-in screen." },
      { question: "Are these gamepads compatible with PC, mobile, and consoles?", answer: "Yes, our gaming controllers use multi-mode Bluetooth and USB receivers, enabling compatibility with Android, iOS, Windows, and popular consoles." },
      { question: "What are hall-effect analog sticks?", answer: "Hall-effect sticks use magnets to measure position, preventing physical wear and eliminating analog controller drift over time." }
    ]
  },
  audio: {
    categorySlug: "audio",
    categoryName: "Audio Gear",
    guideTitle: "Audio Selection Matrix: ANC Headsets vs Wireless Earbuds",
    guideIntro: "Prioritize active noise cancellation (ANC) depth measured in decibels (dB), driver size (mm) for deep bass response, and latency levels for gaming and calls before buying your audio gear.",
    topPicks: [
      { title: "Active Noise Cancelling Headset", badge: "Best ANC", price: "₹5,499", desc: "Industry leading 40dB active cancellation with hybrid multi-mic system." },
      { title: "Low Latency TWS Earbuds", badge: "Best for Gaming", price: "₹2,299", desc: "40ms ultra-low latency mode with dynamic 13mm bass drivers." }
    ],
    comparison: [
      { product: "Active Noise Cancelling Headset", feature: "40dB Hybrid ANC", rating: "4.9/5", price: "₹5,499" },
      { product: "Low Latency TWS Earbuds", feature: "40ms Low Latency", rating: "4.7/5", price: "₹2,299" },
      { product: "Studio Monitor Headphones", feature: "High-Fidelity Drivers", rating: "4.8/5", price: "₹7,990" }
    ],
    faqs: [
      { question: "What is the difference between active noise cancellation (ANC) and passive isolation?", answer: "ANC uses internal microphones to create anti-noise soundwaves that cancel outside noise. Passive isolation relies on physical padding to block sounds." },
      { question: "Which audio headset has the best battery life?", answer: "Our ANC Headset delivers up to 50 hours of non-stop playback with ANC turned off, and 35 hours with active noise cancellation enabled." },
      { question: "What latency is suitable for gaming?", answer: "Latency under 60ms is optimal for gaming. Our Low Latency TWS earbuds feature a 40ms gaming mode to prevent audio delay." }
    ]
  },
  watch: {
    categorySlug: "watch",
    categoryName: "Smart Wearables",
    guideTitle: "Fit & Style: Choosing The Best Health & Fitness Trackers",
    guideIntro: "Modern trackers should feature AMOLED screen clarity, continuous heart-rate tracking, SpO2 measurements, long standby times, and water resistance parameters (e.g. 5ATM).",
    topPicks: [
      { title: "AMOLED Active Smartwatch", badge: "Best Health Tracker", price: "₹3,999", desc: "Features bright outdoor AMOLED display, blood oxygen tracking, and 14-day battery." },
      { title: "Hybrid Sport Smart Band", badge: "Best Battery", price: "₹1,999", desc: "Rugged build, automatic activity tracking, and 21-day standby mode." }
    ],
    comparison: [
      { product: "AMOLED Active Smartwatch", feature: "AMOLED, SpO2, GPS", rating: "4.8/5", price: "₹3,999" },
      { product: "Hybrid Sport Smart Band", feature: "21-Day Battery", rating: "4.7/5", price: "₹1,999" }
    ],
    faqs: [
      { question: "Is SpO2 tracking accurate on wearables?", answer: "Our smartwatches use high-precision photodiode sensors that provide close estimates of blood oxygen levels for general fitness tracking." },
      { question: "What does a 5ATM water resistance rating mean?", answer: "5ATM means the wearable can withstand water pressure equivalent to a depth of 50 meters, making it safe for swimming, showers, and rain." }
    ]
  },
  electronics: {
    categorySlug: "electronics",
    categoryName: "Smart Electronics",
    guideTitle: "Smart Electronics Buying Matrix for Productive Families",
    guideIntro: "Look for high processing efficiency, battery optimization, USB-C fast charging ecosystems, and durable builds when selecting smart gadgets.",
    topPicks: [
      { title: "Portable Family Tablet", badge: "Best Family Buy", price: "₹12,499", desc: "Designed for educational apps, movie streams, and parent controls." },
      { title: "Fast-Charging Power Bank", badge: "Travel Essential", price: "₹1,899", desc: "20,000mAh capacity with 22.5W dual-output smart delivery." }
    ],
    comparison: [
      { product: "Portable Family Tablet", feature: "Parental App Control", rating: "4.8/5", price: "₹12,499" },
      { product: "Fast-Charging Power Bank", feature: "22.5W Power Delivery", rating: "4.9/5", price: "₹1,899" }
    ],
    faqs: [
      { question: "What charging standard does the power bank support?", answer: "It supports both USB-PD (Power Delivery 3.0) and Quick Charge 3.0, allowing compatible phones to charge to 50% in 30 minutes." },
      { question: "Does the family tablet support child lock controls?", answer: "Yes, it runs an optimized Android system with a dedicated Kids Zone app and robust parental remote limits." }
    ]
  }
};

export const defaultAeoData: AeoCategoryData = {
  categorySlug: "catalog",
  categoryName: "Premium Catalog",
  guideTitle: "The Grim Store Premium Tech Procurement Guide",
  guideIntro: "Quality, reliability, and security are our core focus. We ensure every smart toy, gaming gadget, and wearable undergoes testing before dispatch, backed by Razorpay security and tracking.",
  topPicks: [
    { title: "Active Noise Cancelling Headset", badge: "Audio Pick", price: "₹5,499", desc: "Superb active noise reduction with dynamic 40mm drivers." },
    { title: "Smart Learning Robot", badge: "STEM Pick", price: "₹2,499", desc: "STEM certified programming learning companion for kids." }
  ],
  comparison: [
    { product: "Active Noise Cancelling Headset", feature: "ANC & Audio", rating: "4.9/5", price: "₹5,499" },
    { product: "Smart Learning Robot", feature: "STEM Robotics", rating: "4.8/5", price: "₹2,499" },
    { product: "Retro Handheld Arcade", feature: "Classic Console", rating: "4.8/5", price: "₹4,200" }
  ],
  faqs: [
    { question: "How does dispatch and parcel tracking work?", answer: "Orders are shipped within 24 hours. A tracking code linked to Shiprocket logistics is automatically updated in your account panel." },
    { question: "What payment options are available?", answer: "We support Credit/Debit Cards, UPI, Netbanking, Wallets via secure Razorpay checkout, as well as Cash on Delivery." },
    { question: "What is your refund policy?", answer: "We offer a 7-day easy exchange or full store credit return on all unused items. Refunds are processed within 3 days of return verification." }
  ]
};
