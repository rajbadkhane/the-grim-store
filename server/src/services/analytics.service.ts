import { mapOrder, mapProduct, row, rows } from "../lib/sql.js";

export async function getDashboardAnalytics() {
  const [orders, users, revenueAgg, topProducts, recentOrders, pending, delivered, monthly] = await Promise.all([
    row<{ total: number }>("SELECT COUNT(*)::int AS total FROM orders"),
    row<{ total: number }>("SELECT COUNT(*)::int AS total FROM users"),
    row<{ total: number }>("SELECT COALESCE(SUM(total_amount), 0)::double precision AS total FROM orders WHERE payment_status IN ('paid','pending')"),
    rows("SELECT * FROM products ORDER BY rating_count DESC, bestseller DESC LIMIT 6"),
    rows("SELECT * FROM orders ORDER BY created_at DESC LIMIT 8"),
    row<{ total: number }>("SELECT COUNT(*)::int AS total FROM orders WHERE order_status IN ('placed','confirmed','packed')"),
    row<{ total: number }>("SELECT COUNT(*)::int AS total FROM orders WHERE order_status = 'delivered'"),
    rows(`SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
        COALESCE(SUM(total_amount), 0)::double precision AS revenue,
        COUNT(*)::int AS orders
      FROM orders
      WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at) ASC`)
  ]);

  return {
    totals: {
      orders: orders?.total ?? 0,
      users: users?.total ?? 0,
      revenue: revenueAgg?.total ?? 0,
      pending: pending?.total ?? 0,
      delivered: delivered?.total ?? 0
    },
    monthly,
    topProducts: topProducts.map(mapProduct),
    recentOrders: recentOrders.map(mapOrder)
  };
}
