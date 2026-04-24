import { Router } from "express";
import { OrderController } from "./order.controller";
import validateRequest from "../../middlewares/validateRequest";
import {
    createOrderSchema,
    updateOrderStatusSchema,
} from "./order.validation";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// CUSTOMER
router.post(
    "/",
    auth(UserRole.CUSTOMER),
    validateRequest(createOrderSchema),
    OrderController.createOrder
);

router.get(
    "/",
    auth(UserRole.CUSTOMER),
    OrderController.getMyOrders
);

// PROVIDER
router.get(
    "/provider",
    auth(UserRole.PROVIDER),
    OrderController.getProviderOrders
);

// BOTH
router.patch(
    "/:id",
    auth(UserRole.CUSTOMER, UserRole.PROVIDER),
    validateRequest(updateOrderStatusSchema),
    OrderController.updateOrderStatus
);

export const orderRouter: Router = router;