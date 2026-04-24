import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { categoryRouter } from "./modules/category/category.router";
import { providerRouter } from "./modules/provider/provider.router";
import { mealRouter } from "./modules/meal/meal.router";
import { orderRouter } from "./modules/order/order.router";
import { reviewRouter } from "./modules/review/review.router";
import { notFound } from "./middlewares/notFound";
import errorHandler from "./middlewares/errorHandler";
import { adminRouter } from "./modules/admin/admin.router";
import { paymentRouter } from "./modules/payment/payment.router";
import { stripeWebhook } from "./modules/payment/payment.webhook";



const app: Application = express();

app.post(
    "/api/payments/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhook
);
app.use(cors({ origin: process.env.APP_URL, credentials: true }))
app.use(express.json())

app.all("/api/auth/*splat", toNodeHandler(auth))

app.get("/", (req, res) => {
    res.send("FoodHub API running...");
});

app.use("/api/categories", categoryRouter);
app.use("/api/providers", providerRouter);
app.use("/api/meals", mealRouter)
app.use("/api/orders", orderRouter)
app.use("/api/reviews", reviewRouter)
app.use("/api/admin", adminRouter)
app.use("/api/payments", paymentRouter);

app.use(notFound)
app.use(errorHandler)

export default app;
