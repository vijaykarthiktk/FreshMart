import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/products", "routes/products.tsx"),
    route("/feedback", "routes/feedback.tsx"),
    route("/orders", "routes/orders.tsx"),
    route("/admin", "routes/admin.tsx"),
] satisfies RouteConfig;
