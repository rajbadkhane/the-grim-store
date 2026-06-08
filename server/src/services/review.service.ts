import { execute, json, rows } from "../lib/sql.js";

export async function recalculateProductRating(productId: string) {
  const ratingRows = await rows<{ rating: number; count: number }>(
    "SELECT rating, COUNT(*) AS count FROM reviews WHERE product_id = :productId AND reported = FALSE GROUP BY rating",
    { productId }
  );
  const distribution: Record<string, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let weighted = 0;
  for (const row of ratingRows) {
    distribution[String(row.rating)] = row.count;
    total += row.count;
    weighted += row.rating * row.count;
  }
  const average = total ? Number((weighted / total).toFixed(1)) : 0;
  await execute("UPDATE products SET rating_average = :average, rating_count = :total, rating_distribution = :distribution WHERE id = :productId", {
    productId,
    average,
    total,
    distribution: json(distribution)
  });
}
