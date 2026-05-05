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
const ALLOWED_ORIGINS = new Set([
    // Production domains — always allowed
    "https://food-hub-frontend-website.vercel.app",
    "https://food-hub-backend-server.vercel.app",
    // Local development
    "http://localhost:3000",
    "http://localhost:5000",
    // Also include env vars in case of custom domains
    process.env.APP_URL,
    process.env.BETTER_AUTH_URL,
    process.env.CLIENT_URL,
].filter(Boolean) as string[]);

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server requests (no origin) and known origins
        if (!origin || ALLOWED_ORIGINS.has(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
}))
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
