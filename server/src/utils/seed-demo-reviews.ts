import { connectDatabase } from "../config/db.js";
import { recalculateProductRating } from "../services/review.service.js";
import { execute, id, json, row } from "../lib/sql.js";

type DemoReview = {
  name: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
};

const DEFAULT_SLUG =
  "rechargeable-phone-toy-for-2-12-years-kids-28-modes-talking-baby-smart-mobile-learning-toy-for-boys-and-girls";

const demoReviews: DemoReview[] = [
  {
    name: "Aarav Sharma",
    rating: 5,
    title: "Excellent learning toy",
    comment: "My son liked the sounds and modes a lot. Buttons are easy to press and the build feels good for daily play.",
    helpful: 18
  },
  {
    name: "Priya Nair",
    rating: 5,
    title: "Very useful for kids",
    comment: "Good product for keeping small kids engaged. Voice clarity is nice and delivery was also quick.",
    helpful: 14
  },
  {
    name: "Rohan Verma",
    rating: 4,
    title: "Good value purchase",
    comment: "The toy works well and has many modes. Packaging was neat, and my daughter started playing with it immediately.",
    helpful: 11
  },
  {
    name: "Neha Gupta",
    rating: 5,
    title: "Loved by my niece",
    comment: "Bought it as a birthday gift. The music and talking features are entertaining, especially for preschool kids.",
    helpful: 16
  },
  {
    name: "Vikram Singh",
    rating: 5,
    title: "Quality is impressive",
    comment: "Plastic quality feels better than expected. The rechargeable feature is convenient and saves battery cost.",
    helpful: 13
  },
  {
    name: "Ananya Iyer",
    rating: 4,
    title: "Nice educational toy",
    comment: "The child can learn numbers and sounds while playing. Volume is decent and not too harsh.",
    helpful: 9
  },
  {
    name: "Karan Patel",
    rating: 5,
    title: "Excellent for gifting",
    comment: "Looks cute, works properly, and kids enjoy copying phone calls. A very good toy in this price range.",
    helpful: 12
  },
  {
    name: "Sneha Kulkarni",
    rating: 5,
    title: "Superb product",
    comment: "My 4 year old keeps using the talking mode. It is light in hand and easy for kids to carry.",
    helpful: 10
  },
  {
    name: "Aditya Rao",
    rating: 4,
    title: "Good but sound can improve",
    comment: "Overall a good toy. Sound and lights are attractive, though the speaker could be slightly louder.",
    helpful: 7
  },
  {
    name: "Pooja Mehta",
    rating: 5,
    title: "Excellent experience",
    comment: "Received on time and product is working well. My nephew enjoys every mode, especially music and animal sounds.",
    helpful: 15
  },
  {
    name: "Rahul Choudhary",
    rating: 5,
    title: "Worth buying",
    comment: "The toy phone keeps children busy and has enough modes to avoid boredom. Charging also works fine.",
    helpful: 12
  },
  {
    name: "Meera Joshi",
    rating: 4,
    title: "Good for small kids",
    comment: "Nice colors and simple controls. My kid understood the buttons quickly and enjoys the pretend phone calls.",
    helpful: 8
  },
  {
    name: "Siddharth Menon",
    rating: 5,
    title: "Excellent toy phone",
    comment: "The product feels sturdy and the functions are fun. It is a good learning toy for toddlers.",
    helpful: 11
  },
  {
    name: "Ishita Banerjee",
    rating: 5,
    title: "Very happy with it",
    comment: "My daughter liked it from day one. The lights, music, and talking feature are all working properly.",
    helpful: 9
  },
  {
    name: "Nitin Agarwal",
    rating: 4,
    title: "Good quality",
    comment: "Product is as described. It has many modes and feels safe for kids to use under supervision.",
    helpful: 6
  },
  {
    name: "Kavya Reddy",
    rating: 5,
    title: "Perfect for toddlers",
    comment: "Excellent toy for learning and fun. It is lightweight, colorful, and easy for children to operate.",
    helpful: 13
  },
  {
    name: "Manish Tiwari",
    rating: 5,
    title: "Great purchase",
    comment: "The rechargeable battery is the best part. No need to change cells again and again.",
    helpful: 10
  },
  {
    name: "Simran Kaur",
    rating: 4,
    title: "Nice and engaging",
    comment: "Good product for pretend play. My child likes the phone shape and the different sound options.",
    helpful: 7
  },
  {
    name: "Deepak Yadav",
    rating: 3,
    title: "Average but usable",
    comment: "The toy is fine for normal use. Modes are good, but finishing could be a little cleaner.",
    helpful: 4
  },
  {
    name: "Farah Khan",
    rating: 3,
    title: "Decent product",
    comment: "It works as expected and kids enjoy it. Quality is average, but acceptable for the price.",
    helpful: 5
  }
];

async function seedDemoReviews() {
  await connectDatabase();

  const slugs = process.argv.slice(2);
  const targetSlugs = slugs.length ? slugs : [DEFAULT_SLUG];

  for (const slug of targetSlugs) {
    const product = await row<{ id: string; title: string; slug: string }>(
      "SELECT id, title, slug FROM products WHERE slug = :slug",
      { slug }
    );

    if (!product) {
      console.warn(`[demo-reviews] Product not found: ${slug}`);
      continue;
    }

    await execute("DELETE FROM reviews WHERE product_id = :productId AND user_id LIKE 'demo-review-%'", {
      productId: product.id
    });

    for (const [index, review] of demoReviews.entries()) {
      const createdAt = new Date(Date.now() - (demoReviews.length - index) * 36 * 60 * 60 * 1000);
      await execute(
        `INSERT INTO reviews (
          id, user_id, product_id, order_db_id, user_name, user_avatar, rating, title, comment,
          images, verified_purchase, helpful_count, helpful_users, reported, created_at, updated_at
        ) VALUES (
          :id, :userId, :productId, :orderId, :userName, NULL, :rating, :title, :comment,
          :images, FALSE, :helpfulCount, JSON_ARRAY(), FALSE, :createdAt, :createdAt
        )`,
        {
          id: id(),
          userId: `demo-review-${String(index + 1).padStart(2, "0")}`,
          productId: product.id,
          orderId: `demo-order-${product.slug}-${index + 1}`,
          userName: review.name,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          images: json([]),
          helpfulCount: review.helpful,
          createdAt
        }
      );
    }

    await recalculateProductRating(product.id);
    console.log(`[demo-reviews] Added ${demoReviews.length} demo reviews for ${product.title} (${product.slug})`);
  }

  process.exit(0);
}

seedDemoReviews().catch((error) => {
  console.error(error);
  process.exit(1);
});
