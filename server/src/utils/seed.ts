import { connectDatabase } from "../config/db.js";
import { makeSlug } from "../helpers/slug.js";
import { execute, id, json, row, rows } from "../lib/sql.js";

async function seed() {
  await connectDatabase();

  console.log("[seed] Clearing existing products and categories...");
  await execute("DELETE FROM products");
  await execute("DELETE FROM categories");

  const categoriesToSeed = [
    { name: "Woman's Fashion", slug: "womens-fashion" },
    { name: "Men's Fashion", slug: "mens-fashion" },
    { name: "Electronics", slug: "electronics" },
    { name: "Home & Lifestyle", slug: "home-lifestyle" },
    { name: "Medicine", slug: "medicine" },
    { name: "Sports & Outdoor", slug: "sports-outdoor" },
    { name: "Baby's & Toys", slug: "babys-toys" },
    { name: "Groceries & Pets", slug: "groceries-pets" },
    { name: "Health & Beauty", slug: "health-beauty" },
    { name: "Phones", slug: "phones" },
    { name: "Computers", slug: "computers" },
    { name: "SmartWatch", slug: "smartwatch" },
    { name: "Camera", slug: "camera" },
    { name: "Headphones", slug: "headphones" },
    { name: "Gaming", slug: "gaming" }
  ];

  const categoryMap: Record<string, string> = {};

  console.log("[seed] Seeding categories...");
  for (const cat of categoriesToSeed) {
    const catId = id();
    const image = `https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80`;
    await execute(
      "INSERT INTO categories (id, name, slug, image, banner) VALUES (:id, :name, :slug, :image, :banner)",
      { id: catId, name: cat.name, slug: cat.slug, image, banner: image }
    );
    categoryMap[cat.slug] = catId;
  }

  const productsToSeed = [
    // Flash Sales Products
    {
      title: "HAVIT HV-G92 Gamepad",
      slug: "havit-hv-g92-gamepad",
      description: "Havit HV-G92 USB Gamepad featuring dual analog sticks, 12 action buttons, and ergonomic double vibration design for immersive PC gaming.",
      shortDescription: "USB Dual Analog Gamepad",
      brand: "Havit",
      categorySlug: "gaming",
      price: 160,
      salePrice: 120,
      discountPercentage: 25,
      stock: 50,
      sku: "HAV-G92-RED",
      colors: [{ name: "Red", hex: "#DB4444" }, { name: "Black", hex: "#000000" }],
      images: [{ url: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=900&q=80", alt: "Havit HV-G92 Gamepad" }],
      featured: true,
      trending: true,
      bestseller: false,
      rating: 4.5,
      reviewCount: 88
    },
    {
      title: "AK-900 Wired Keyboard",
      slug: "ak-900-wired-keyboard" ,
      description: "Full-sized RGB backlit gaming keyboard with tactile membrane keys, anti-ghosting keys, and spill-resistant design.",
      shortDescription: "RGB Backlit Wired Keyboard",
      brand: "Akey",
      categorySlug: "computers",
      price: 1160,
      salePrice: 960,
      discountPercentage: 17,
      stock: 40,
      sku: "AK900-KEYBOARD",
      colors: [{ name: "Black", hex: "#000000" }],
      images: [{ url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80", alt: "AK-900 Wired Keyboard" }],
      featured: true,
      trending: true,
      bestseller: false,
      rating: 4.0,
      reviewCount: 75
    },
    {
      title: "IPS LCD Gaming Monitor",
      slug: "ips-lcd-gaming-monitor",
      description: "27-inch Full HD IPS gaming monitor with 144Hz refresh rate, 1ms response time, AMD FreeSync, and ultra-thin bezel.",
      shortDescription: "27-inch 144Hz Gaming Monitor",
      brand: "Vision",
      categorySlug: "electronics",
      price: 400,
      salePrice: 370,
      discountPercentage: 8,
      stock: 25,
      sku: "IPS-MON-27",
      colors: [{ name: "Black", hex: "#000000" }],
      images: [{ url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80", alt: "IPS LCD Gaming Monitor" }],
      featured: true,
      trending: true,
      bestseller: false,
      rating: 4.8,
      reviewCount: 99
    },
    {
      title: "S-Series Comfort Chair",
      slug: "s-series-comfort-chair",
      description: "Ergonomic office and gaming chair with adjustable lumbar support, 3D armrests, reclining backrest, and high-density foam cushion.",
      shortDescription: "Ergonomic Comfort Chair",
      brand: "Sitwell",
      categorySlug: "home-lifestyle",
      price: 400,
      salePrice: 375,
      discountPercentage: 6,
      stock: 15,
      sku: "S-CHAIR-COMF",
      colors: [{ name: "Gray", hex: "#8F8F8F" }],
      images: [{ url: "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=900&q=80", alt: "S-Series Comfort Chair" }],
      featured: true,
      trending: true,
      bestseller: false,
      rating: 4.5,
      reviewCount: 99
    },

    // Explore Products
    {
      title: "Breed Dry Dog Food",
      slug: "breed-dry-dog-food",
      description: "Nutritious dry food for adult dogs, formulated with real chicken, whole grains, vitamins, and minerals for healthy joints and immune system.",
      shortDescription: "Nutritious Pet Dry Food",
      brand: "Breed",
      categorySlug: "groceries-pets",
      price: 100,
      salePrice: 100,
      discountPercentage: 0,
      stock: 120,
      sku: "BREED-DOG-FOOD",
      colors: [],
      images: [{ url: "https://images.unsplash.com/photo-1589724504196-a686210d19ade?auto=format&fit=crop&w=900&q=80", alt: "Breed Dry Dog Food" }],
      featured: true,
      trending: false,
      bestseller: false,
      rating: 3.2,
      reviewCount: 35
    },
    {
      title: "CANON EOS M50 Camera",
      slug: "canon-eos-m50-camera",
      description: "Compact mirrorless camera featuring a 24.1 Megapixel CMOS sensor, 4K video recording capability, and built-in Wi-Fi and Bluetooth.",
      shortDescription: "Mirrorless Digital Camera",
      brand: "Canon",
      categorySlug: "camera",
      price: 360,
      salePrice: 360,
      discountPercentage: 0,
      stock: 18,
      sku: "CANON-M50",
      colors: [{ name: "Black", hex: "#000000" }],
      images: [{ url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80", alt: "Canon EOS M50" }],
      featured: true,
      trending: false,
      bestseller: false,
      rating: 4.2,
      reviewCount: 95
    },
    {
      title: "ASUS ROG Gaming Laptop",
      slug: "asus-rog-gaming-laptop",
      description: "ASUS ROG Strix Gaming Laptop features a fast Intel Core i7 processor, Nvidia RTX 4060 graphics card, 16GB DDR5 memory, and high refresh screen.",
      shortDescription: "ASUS ROG Gaming Laptop",
      brand: "Asus",
      categorySlug: "computers",
      price: 700,
      salePrice: 700,
      discountPercentage: 0,
      stock: 10,
      sku: "ASUS-ROG-LAP",
      colors: [{ name: "Dark Blue", hex: "#0F172A" }],
      images: [{ url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80", alt: "ASUS ROG Laptop" }],
      featured: true,
      trending: false,
      bestseller: false,
      rating: 5.0,
      reviewCount: 325
    },
    {
      title: "Curology Product Set",
      slug: "curology-product-set",
      description: "Curology complete skin care set containing cleanser, moisturizer, and target treatment cream for clear and glowing skin.",
      shortDescription: "Complete Skin Care Set",
      brand: "Curology",
      categorySlug: "health-beauty",
      price: 500,
      salePrice: 500,
      discountPercentage: 0,
      stock: 80,
      sku: "CUR-SET-SKIN",
      colors: [],
      images: [{ url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80", alt: "Curology Product Set" }],
      featured: true,
      trending: false,
      bestseller: false,
      rating: 4.0,
      reviewCount: 145
    },
    {
      title: "Kids Electric Car",
      slug: "kids-electric-car",
      description: "12V kids ride-on electric vehicle with parental remote control, LED lights, built-in music player, and premium suspension.",
      shortDescription: "Kids Ride-On Electric Car",
      brand: "ToyMotors",
      categorySlug: "babys-toys",
      price: 960,
      salePrice: 960,
      discountPercentage: 0,
      stock: 22,
      sku: "KIDS-E-CAR-RED",
      colors: [{ name: "Red", hex: "#DB4444" }],
      images: [{ url: "https://images.unsplash.com/photo-1596567130024-8149e917d590?auto=format&fit=crop&w=900&q=80", alt: "Kids Electric Car" }],
      featured: true,
      trending: false,
      bestseller: true, // will show "New" badge on frontend
      rating: 5.0,
      reviewCount: 65
    },
    {
      title: "Jr. Zoom Soccer Cleats",
      slug: "jr-zoom-soccer-cleats",
      description: "Nike Jr. Zoom soccer cleats with lightweight plate, traction patterns, and comfortable fabric lining for kids' outdoor activities.",
      shortDescription: "Nike Soccer Cleats for Kids",
      brand: "Nike",
      categorySlug: "sports-outdoor",
      price: 1160,
      salePrice: 1160,
      discountPercentage: 0,
      stock: 35,
      sku: "NIKE-JR-CLEAT",
      colors: [{ name: "Yellow", hex: "#EAB308" }, { name: "Orange", hex: "#F97316" }],
      images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", alt: "Jr. Zoom Soccer Cleats" }],
      featured: true,
      trending: false,
      bestseller: false,
      rating: 5.0,
      reviewCount: 35
    },
    {
      title: "GP11 Shooter USB Gamepad",
      slug: "gp11-shooter-usb-gamepad",
      description: "Ergonomic wired USB gaming controller, featuring dual vibration triggers and comfortable textured grips for ultimate PC gaming.",
      shortDescription: "Wired USB Gaming Controller",
      brand: "Shooter",
      categorySlug: "gaming",
      price: 660,
      salePrice: 660,
      discountPercentage: 0,
      stock: 55,
      sku: "GP11-SHOOTER",
      colors: [{ name: "Black", hex: "#000000" }],
      images: [{ url: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=900&q=80", alt: "GP11 Shooter Gamepad" }],
      featured: true,
      trending: false,
      bestseller: true, // will show "New" badge on frontend
      rating: 4.5,
      reviewCount: 55
    },
    {
      title: "Quilted Satin Jacket",
      slug: "quilted-satin-jacket",
      description: "Premium quilted satin bomber jacket featuring a smooth, luxury lining, rib-knit collar, and clean snap closure.",
      shortDescription: "Quilted Satin Bomber Jacket",
      brand: "Grim Originals",
      categorySlug: "womens-fashion",
      price: 660,
      salePrice: 660,
      discountPercentage: 0,
      stock: 20,
      sku: "QS-JACKET-GREEN",
      colors: [{ name: "Green", hex: "#15803D" }, { name: "Red", hex: "#BE123C" }],
      images: [{ url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80", alt: "Quilted Satin Jacket" }],
      featured: true,
      trending: false,
      bestseller: false,
      rating: 4.5,
      reviewCount: 80
    },

    // New Arrivals Bento Grid
    {
      title: "PlayStation 5",
      slug: "playstation-5",
      description: "PlayStation 5 Console. Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers and 3D Audio.",
      shortDescription: "PS5 Gaming Console Digital/Disc",
      brand: "Sony",
      categorySlug: "gaming",
      price: 500,
      salePrice: 500,
      discountPercentage: 0,
      stock: 8,
      sku: "SONY-PS5-CON",
      colors: [{ name: "White", hex: "#FFFFFF" }],
      images: [{ url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80", alt: "PlayStation 5" }],
      featured: true,
      trending: false,
      bestseller: false,
      rating: 4.9,
      reviewCount: 580
    },
    {
      title: "Women's Collections",
      slug: "womens-collections",
      description: "Exclusive designer women's wear, handbags, and premium accessories tailored for modern luxury street styling.",
      shortDescription: "Designer Luxury Handbag & Apparel",
      brand: "Grim Atelier",
      categorySlug: "womens-fashion",
      price: 250,
      salePrice: 250,
      discountPercentage: 0,
      stock: 15,
      sku: "WOMENS-COLL-BAG",
      colors: [],
      images: [{ url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80", alt: "Women's Collections Bag" }],
      featured: true,
      trending: false,
      bestseller: false,
      rating: 4.7,
      reviewCount: 140
    },
    {
      title: "Speakers",
      slug: "speakers",
      description: "High-fidelity wireless smart home speaker with room-filling 360-degree sound, bass control, and voice assistant integration.",
      shortDescription: "Wireless Smart Home Speaker",
      brand: "EchoSound",
      categorySlug: "electronics",
      price: 120,
      salePrice: 120,
      discountPercentage: 0,
      stock: 30,
      sku: "SPEAK-SMART-360",
      colors: [{ name: "Black", hex: "#000000" }],
      images: [{ url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80", alt: "Speakers" }],
      featured: true,
      trending: false,
      bestseller: false,
      rating: 4.6,
      reviewCount: 90
    },
    {
      title: "Perfume",
      slug: "perfume",
      description: "Gucci Intense Oud Eau de Parfum. A premium, long-lasting unisex oriental fragrance with rich notes of incense, woody accord, and leather.",
      shortDescription: "Gucci Intense Oud EDP 90ml",
      brand: "Gucci",
      categorySlug: "health-beauty",
      price: 80,
      salePrice: 80,
      discountPercentage: 0,
      stock: 12,
      sku: "GUCCI-OUD-90",
      colors: [],
      images: [{ url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80", alt: "Gucci Perfume" }],
      featured: true,
      trending: false,
      bestseller: false,
      rating: 4.8,
      reviewCount: 110
    }
  ];

  console.log("[seed] Seeding products...");
  for (const prod of productsToSeed) {
    const categoryId = categoryMap[prod.categorySlug];
    if (!categoryId) {
      console.error(`[seed] Category not found: ${prod.categorySlug}`);
      continue;
    }
    await execute(
      `INSERT INTO products (
        id, title, slug, description, short_description, brand, category_id, gender, tags,
        price, sale_price, discount_percentage, stock, sku, colors, sizes, images,
        featured, trending, bestseller, seo_title, seo_description, meta_keywords, rating_distribution,
        rating_average, rating_count
      ) VALUES (
        :id, :title, :slug, :description, :shortDescription, :brand, :categoryId, :gender, :tags,
        :price, :salePrice, :discountPercentage, :stock, :sku, :colors, :sizes, :images,
        :featured, :trending, :bestseller, :seoTitle, :seoDescription, :metaKeywords, :ratingDistribution,
        :ratingAverage, :ratingCount
      )`,
      {
        id: id(),
        title: prod.title,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription,
        brand: prod.brand,
        categoryId,
        gender: "unisex",
        tags: json([prod.categorySlug, "streetwear"]),
        price: prod.price,
        salePrice: prod.salePrice,
        discountPercentage: prod.discountPercentage,
        stock: prod.stock,
        sku: prod.sku,
        colors: json(prod.colors),
        sizes: json([{ label: "One Size", stock: prod.stock }]),
        images: json(prod.images),
        featured: prod.featured ? 1 : 0,
        trending: prod.trending ? 1 : 0,
        bestseller: prod.bestseller ? 1 : 0,
        seoTitle: prod.title,
        seoDescription: prod.shortDescription,
        metaKeywords: json([prod.title.toLowerCase(), prod.brand.toLowerCase()]),
        ratingDistribution: json({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }),
        ratingAverage: prod.rating,
        ratingCount: prod.reviewCount
      }
    );
  }

  // Seed reviews with Indian names
  console.log("[seed] Seeding reviews with Indian names...");
  
  const reviews = [
    // 90% Excellent & Good ratings (5 & 4 stars)
    {
      userName: "Rajesh Kumar",
      rating: 5,
      title: "Absolutely fantastic product!",
      comment: "Excellent quality and fast delivery. The product exceeded my expectations. Highly recommended for everyone!"
    },
    {
      userName: "Priya Singh",
      rating: 5,
      title: "Perfect purchase",
      comment: "Amazing quality! The product arrived in perfect condition. Customer service was also very helpful and responsive."
    },
    {
      userName: "Amit Patel",
      rating: 4,
      title: "Great value for money",
      comment: "Very good product at a great price. Delivery was quick and packaging was excellent. Will buy again!"
    },
    {
      userName: "Deepika Sharma",
      rating: 5,
      title: "Outstanding experience",
      comment: "Superb quality and fantastic customer service. This is my second purchase and I'm equally impressed. 5 stars deserved!"
    },
    {
      userName: "Vikram Verma",
      rating: 4,
      title: "Highly satisfied",
      comment: "Good product quality and reasonable pricing. The delivery was prompt and packaging was secure. Very satisfied!"
    },
    {
      userName: "Neha Gupta",
      rating: 5,
      title: "Worth every penny",
      comment: "Brilliant product! Better than expected. The quality is premium and it's definitely worth every penny spent."
    },
    {
      userName: "Arjun Reddy",
      rating: 5,
      title: "Perfect! No complaints",
      comment: "Received the product in perfect condition. Quality is outstanding. Completely satisfied with my purchase. Recommended!"
    },
    {
      userName: "Sneha Iyer",
      rating: 4,
      title: "Very good quality",
      comment: "Product quality is very good. Delivery was fast and the packaging was excellent. Minor issue with shipping, but overall great!"
    },
    {
      userName: "Rohan Kapoor",
      rating: 5,
      title: "Exceptional quality",
      comment: "This product is exceptional! Best purchase I've made. Quality is top-notch and customer service is outstanding."
    },
    {
      userName: "Ananya Das",
      rating: 5,
      title: "Best in class",
      comment: "Fantastic product! Quality is best in class. Arrived on time and in perfect condition. Very happy with my purchase!"
    },
    {
      userName: "Sanjay Malhotra",
      rating: 4,
      title: "Good quality product",
      comment: "Good quality and decent pricing. Quick delivery and professional packaging. Satisfied with the overall experience."
    },
    {
      userName: "Divya Nair",
      rating: 5,
      title: "Impressed with quality",
      comment: "Very impressed with the product quality and service. Everything arrived safely and on time. Highly satisfied!"
    },
    {
      userName: "Aditya Saxena",
      rating: 5,
      title: "Perfect purchase",
      comment: "Excellent product quality and very reasonable price. Delivery was fast and secure. Will definitely order again!"
    },
    {
      userName: "Pooja Desai",
      rating: 4,
      title: "Reliable and good",
      comment: "Reliable product with good quality. The packaging was careful and delivery was prompt. Very satisfied overall!"
    },
    {
      userName: "Manish Chopra",
      rating: 5,
      title: "Outstanding service",
      comment: "Outstanding product and exceptional service. Delivery was incredibly fast. This is my third purchase. Highly recommended!"
    },
    {
      userName: "Ravi Shankar",
      rating: 4,
      title: "Good purchase",
      comment: "Good quality product at competitive price. Fast shipping and well packaged. Very happy with my purchase."
    },
    {
      userName: "Kavya Menon",
      rating: 5,
      title: "Exceptional value",
      comment: "Exceptional value for money! Product quality is excellent and delivery was super fast. Best shopping experience!"
    },
    {
      userName: "Ashok Kumar",
      rating: 4,
      title: "Satisfied customer",
      comment: "Very satisfied with the product quality and service. Delivery was timely and packaging was professional."
    },
    // 10% Average rating (3 stars)
    {
      userName: "Rajni Verma",
      rating: 3,
      title: "Okay product",
      comment: "The product is okay but not exactly as described. Quality could be better, but it's acceptable for the price."
    },
    {
      userName: "Vikrant Singh",
      rating: 3,
      title: "Average experience",
      comment: "Average product with average quality. Delivery took longer than expected. Met my basic expectations."
    }
  ];

  // Get first 10 products
  const productsForReviews = await rows("SELECT id FROM products LIMIT 10");

  // Create test users for reviews
  const testUserIds: string[] = [];
  for (const review of reviews) {
    const testUserId = id();
    testUserIds.push(testUserId);
    const userEmail = `${review.userName.toLowerCase().replace(/\s+/g, "_")}_${testUserId.slice(0, 8)}@example.com`;
    await execute(
      `INSERT INTO users (id, email, name, role, email_verified, wishlist, cart, addresses)
       VALUES (:id, :email, :name, 'customer', TRUE, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY())`,
      { id: testUserId, email: userEmail, name: review.userName }
    );
  }

  // Insert reviews
  for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i];
    const productId = productsForReviews[i % productsForReviews.length]?.id;
    const userId = testUserIds[i];
    const orderId = id();

    if (!productId) continue;

    // Create a dummy order for the review
    await execute(
      `INSERT INTO orders (id, order_id, user_id, products, shipping_address, total_amount, payment_status, order_status)
       VALUES (:id, :orderId, :userId, :products, :shippingAddress, 999, 'paid', 'delivered')`,
      {
        id: orderId,
        orderId: `DUMMY-${id().slice(0, 8)}`,
        userId,
        products: json([{ id: productId, title: "Product", quantity: 1 }]),
        shippingAddress: json({ fullName: review.userName, city: "Delhi", state: "Delhi", pincode: "110001", house: "Test Address", road: "Test Road" })
      }
    );

    // Insert the review
    await execute(
      `INSERT INTO reviews (
        id, user_id, product_id, order_db_id, user_name, rating, title, comment,
        images, verified_purchase, helpful_count, helpful_users, reported
      ) VALUES (
        :id, :userId, :productId, :orderId, :userName, :rating, :title, :comment,
        :images, TRUE, 0, JSON_ARRAY(), FALSE
      )`,
      {
        id: id(),
        userId,
        productId,
        orderId,
        userName: review.userName,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: json([])
      }
    );
  }

  console.log("[seed] Reviews with Indian names seeded successfully.");

  // Ensure admin user exists
  const adminEmail = "thegrimstoreindia@gmail.com";
  const admin = await row("SELECT * FROM users WHERE email = :adminEmail", { adminEmail });
  if (!admin) {
    await execute(
      `INSERT INTO users (id, email, name, role, email_verified, wishlist, cart, addresses)
       VALUES (:id, :adminEmail, 'Admin', 'admin', TRUE, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY())`,
      { id: id(), adminEmail }
    );
  } else if (admin.role !== "admin") {
    await execute("UPDATE users SET role = 'admin', email_verified = TRUE WHERE email = :adminEmail", { adminEmail });
  }

  console.log("[seed] SQL Figma categories, products, reviews, and admin seeded successfully.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
