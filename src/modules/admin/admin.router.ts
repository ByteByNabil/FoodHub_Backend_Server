import { Router } from "express";
import { AdminController } from "./admin.controller";
import auth, { UserRole } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { updateUserStatusSchema } from "./admin.validation";

const router = Router();

router.get("/users", auth(UserRole.ADMIN), AdminController.getAllUsers);

router.patch(
    "/users/:id",
    auth(UserRole.ADMIN),
    validateRequest(updateUserStatusSchema),
    AdminController.updateUserStatus
);

router.get("/orders", auth(UserRole.ADMIN), AdminController.getAllOrders);

export const adminRouter: Router = router;