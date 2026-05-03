import express, { Application } from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { getAuth } from "./lib/auth";
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
import { aiRouter } from "./modules/ai/ai.router";

type BetterAuthNodeModule = typeof import("better-auth/node");
type BetterAuthHandler = ReturnType<BetterAuthNodeModule["toNodeHandler"]>;

let cachedBetterAuthHandler: BetterAuthHandler | null = null;

// Hack to make Vercel's bundler trace and include the ESM package
if (false) {
    import("better-auth/node");
}

const loadBetterAuthNode = (): Promise<BetterAuthNodeModule> =>
    new Function('return import("better-auth/node")')() as Promise<BetterAuthNodeModule>;

const getBetterAuthHandler = async (): Promise<BetterAuthHandler> => {
    if (!cachedBetterAuthHandler) {
        const { toNodeHandler } = await loadBetterAuthNode();
        const auth = await getAuth();
        cachedBetterAuthHandler = toNodeHandler(auth);
    }
    return cachedBetterAuthHandler;
};

const app: Application = express();

app.post(
    "/api/payments/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhook
);
app.use(cors({ origin: process.env.APP_URL, credentials: true }))
app.use(express.json())

app.all("/api/auth/*splat", async (req: Request, res: Response) => {
    const handler = await getBetterAuthHandler();
    return handler(req, res);
});

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
app.use("/api/ai", aiRouter);

app.use(notFound)
app.use(errorHandler)

export default app;
