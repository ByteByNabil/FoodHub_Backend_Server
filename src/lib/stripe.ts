import Stripe from "stripe";

type StripeClient = InstanceType<typeof Stripe>;

let stripeInstance: StripeClient | null = null;

export const getStripe = (): StripeClient => {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
        throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
    }

    if (!stripeInstance) {
        stripeInstance = new Stripe(secretKey);
    }

    return stripeInstance;
};
