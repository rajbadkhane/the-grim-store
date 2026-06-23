import { hasProfanity } from "../helpers/profanity.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { recalculateProductRating } from "../services/review.service.js";
import { execute, id, json, mapProduct, mapReview, row, rows } from "../lib/sql.js";
import { apiCache } from "../utils/cache.js";

export const createReview = asyncHandler(async (req, res) => {
  await apiCache.clear();
  const { productId, orderId, rating, title, comment, images } = req.body;
  if (hasProfanity(`${title} ${comment}`)) throw new ApiError(400, "Review content failed moderation");
  const order = await row("SELECT * FROM orders WHERE id = :orderId AND user_id = :userId AND order_status = 'delivered'", { orderId, userId: req.user!.id });
  const hasProduct = order ? JSON.stringify(order.products).includes(productId) : false;
  if (!order || !hasProduct) throw new ApiError(403, "Only verified delivered buyers can review");
  const product = mapProduct(await row("SELECT * FROM products WHERE id = :productId", { productId }));
  if (!product) throw new ApiError(404, "Product not found");
  const reviewId = id();
  await execute(
    `INSERT INTO reviews (
      id, user_id, product_id, order_db_id, user_name, user_avatar, rating, title, comment,
      images, verified_purchase, helpful_users
    ) VALUES (
      :id, :userId, :productId, :orderId, :userName, :userAvatar, :rating, :title, :comment,
      :images, TRUE, JSON_ARRAY()
    )`,
    {
      id: reviewId,
      userId: req.user!.id,
      productId,
      orderId,
      userName: req.user!.name || "Verified buyer",
      userAvatar: req.user!.avatar || null,
      rating,
      title,
      comment,
      images: json(images)
    }
  );
  const review = mapReview(await row("SELECT * FROM reviews WHERE id = :id", { id: reviewId }));
  await recalculateProductRating(productId);
  res.status(201).json({ success: true, review });
});

export const createManualReview = asyncHandler(async (req, res) => {
  await apiCache.clear();
  const { productId, userName, userAvatar, rating, title, comment, images, verifiedPurchase } = req.body;
  if (hasProfanity(`${userName} ${title} ${comment}`)) throw new ApiError(400, "Review content failed moderation");
  const product = mapProduct(await row("SELECT * FROM products WHERE id = :productId", { productId }));
  if (!product) throw new ApiError(404, "Product not found");

  const reviewId = id();
  await execute(
    `INSERT INTO reviews (
      id, user_id, product_id, order_db_id, user_name, user_avatar, rating, title, comment,
      images, verified_purchase, helpful_users
    ) VALUES (
      :id, :userId, :productId, NULL, :userName, :userAvatar, :rating, :title, :comment,
      :images, :verifiedPurchase, :helpfulUsers
    )`,
    {
      id: reviewId,
      userId: req.user!.id,
      productId,
      userName,
      userAvatar: userAvatar || null,
      rating,
      title,
      comment,
      images: json(images),
      verifiedPurchase: Boolean(verifiedPurchase),
      helpfulUsers: json([])
    }
  );

  const review = mapReview(await row("SELECT * FROM reviews WHERE id = :id", { id: reviewId }));
  await recalculateProductRating(productId);
  res.status(201).json({ success: true, review });
});

export const listReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { sort = "latest", withImages } = req.query as any;
  const cacheKey = `reviews:${productId}:${sort}:${withImages ?? "false"}`;
  
  const cachedData = await apiCache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const sortMap: Record<string, string> = {
    latest: "created_at DESC",
    highest: "rating DESC",
    lowest: "rating ASC",
    helpful: "helpful_count DESC"
  };
  const imageFilter = withImages === "true" ? "AND jsonb_array_length(images) > 0" : "";
  const reviews = await rows(`SELECT * FROM reviews WHERE product_id = :productId AND reported = FALSE ${imageFilter} ORDER BY ${sortMap[sort] || sortMap.latest}`, { productId });
  
  const responseData = { success: true, reviews: reviews.map(mapReview) };
  await apiCache.set(cacheKey, responseData, 60); // Cache for 60 seconds
  res.json(responseData);
});

export const listAllReviews = asyncHandler(async (_req, res) => {
  const reviews = await rows(`
    SELECT reviews.*, products.title AS product_title, products.slug AS product_slug
    FROM reviews
    LEFT JOIN products ON products.id = reviews.product_id
    ORDER BY reviews.created_at DESC
  `);
  res.json({
    success: true,
    reviews: reviews.map((item: any) => ({
      ...mapReview(item),
      product: {
        id: item.product_id,
        title: item.product_title,
        slug: item.product_slug
      }
    }))
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  await apiCache.clear();
  const existing = await row("SELECT * FROM reviews WHERE id = :id AND user_id = :userId", { id: req.params.id, userId: req.user!.id });
  if (!existing) throw new ApiError(404, "Review not found");
  await execute("UPDATE reviews SET rating = :rating, title = :title, comment = :comment, images = :images WHERE id = :id", {
    id: req.params.id,
    rating: req.body.rating ?? existing.rating,
    title: req.body.title ?? existing.title,
    comment: req.body.comment ?? existing.comment,
    images: json(req.body.images ?? JSON.parse(existing.images || "[]"))
  });
  const review = mapReview(await row("SELECT * FROM reviews WHERE id = :id", { id: req.params.id }))!;
  if (!review) throw new ApiError(404, "Review not found");
  await recalculateProductRating(review.productId as string);
  res.json({ success: true, review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  await apiCache.clear();
  const review = mapReview(await row("SELECT * FROM reviews WHERE id = :id AND user_id = :userId", { id: req.params.id, userId: req.user!.id }));
  if (!review) throw new ApiError(404, "Review not found");
  await execute("DELETE FROM reviews WHERE id = :id", { id: req.params.id });
  await recalculateProductRating(review.productId as string);
  res.json({ success: true });
});

export const helpfulReview = asyncHandler(async (req, res) => {
  await apiCache.clear();
  const review = mapReview(await row("SELECT * FROM reviews WHERE id = :id", { id: req.params.id }));
  if (!review) throw new ApiError(404, "Review not found");
  const exists = review.helpfulUsers.some((userId: string) => userId === req.user!.id);
  if (!exists) {
    review.helpfulUsers.push(req.user!.id);
    review.helpfulCount += 1;
  }
  await execute("UPDATE reviews SET helpful_count = :helpfulCount, helpful_users = :helpfulUsers WHERE id = :id", {
    id: req.params.id,
    helpfulCount: review.helpfulCount,
    helpfulUsers: json(review.helpfulUsers)
  });
  res.json({ success: true, review });
});

export const reportReview = asyncHandler(async (req, res) => {
  await apiCache.clear();
  await execute("UPDATE reviews SET reported = TRUE WHERE id = :id", { id: req.params.id });
  res.json({ success: true });
});
