// src/modules/payment/payment.domain.ts

export const handlePaymentSuccess = async (
    tx: any,
    orderId: string,
    paymentIntent: string
) => {
    // update payment
    await tx.payment.updateMany({
        where: { orderId },
        data: {
            status: "PAID",
            stripePaymentIntentId: paymentIntent,
        },
    });

    // update order
    await tx.order.update({
        where: { id: orderId },
        data: {
            paymentStatus: "PAID",
            isLocked: false,
            status: "PREPARING",
        },
    });
};

export const handlePaymentFailure = async (
    tx: any,
    orderId: string,
    reason: string
) => {
    await tx.order.update({
        where: { id: orderId },
        data: {
            paymentStatus: "FAILED",
            isLocked: false,
        },
    });

    await tx.payment.updateMany({
        where: { orderId },
        data: {
            status: "FAILED",
            failureReason: reason,
        },
    });
};