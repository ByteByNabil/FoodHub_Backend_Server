// src/modules/payment/payment.webhook.ts

import { Request, Response } from "express";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import Stripe from "stripe";
import {
    handlePaymentSuccess,
    handlePaymentFailure,
} from "./payment.domain";

export const stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("✅ Stripe Event Received:", event.type);

    try {
        // =========================
        // PAYMENT SUCCESS
        // =========================
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            const orderId = session.metadata?.orderId;
            const idempotencyKey = session.metadata?.idempotencyKey;
            const paymentIntent = session.payment_intent as string;

            if (!orderId) {
                return res.status(400).send("Missing orderId");
            }

            // 🔐 Validate order exists
            const order = await prisma.order.findUnique({
                where: { id: orderId },
            });

            if (!order) {
                return res.status(400).send("Order not found");
            }

            await prisma.$transaction(async (tx) => {
                // 🔁 Idempotency check (by idempotencyKey if exists)
                if (idempotencyKey) {
                    const existingByKey = await tx.payment.findUnique({
                        where: { idempotencyKey },
                    });

                    if (existingByKey?.status === "PAID") {
                        console.log("⚠️ Duplicate webhook ignored (idempotencyKey)");
                        return;
                    }
                }

                // fallback check
                const existing = await tx.payment.findFirst({
                    where: {
                        orderId,
                        status: "PAID",
                    },
                });

                if (existing) {
                    console.log("⚠️ Duplicate webhook ignored (orderId)");
                    return;
                }

                // ✅ apply domain logic
                await handlePaymentSuccess(tx, orderId, paymentIntent);
            });
        }

        // =========================
        // PAYMENT FAILED
        // =========================
        if (event.type === "checkout.session.expired") {
            const session = event.data.object as Stripe.Checkout.Session;

            const orderId = session.metadata?.orderId;

            if (!orderId) {
                return res.status(400).send("Missing orderId");
            }

            await prisma.$transaction(async (tx) => {
                const existing = await tx.payment.findFirst({
                    where: {
                        orderId,
                        status: "FAILED",
                    },
                });

                if (existing) {
                    console.log("⚠️ Duplicate failure webhook ignored");
                    return;
                }

                await handlePaymentFailure(
                    tx,
                    orderId,
                    "Checkout session expired"
                );
            });
        }

        // OPTIONAL: handle more events later
        // payment_intent.payment_failed
        // charge.refunded

        res.json({ received: true });
    } catch (error) {
        console.error("🔥 Webhook processing error:", error);
        return res.status(500).send("Webhook handler failed");
    }
};