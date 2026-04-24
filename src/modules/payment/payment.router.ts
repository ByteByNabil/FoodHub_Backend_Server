import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { createPayment } from "./payment.controller";

const router = express.Router();

// customer checkout
router.post("/", auth(UserRole.CUSTOMER), createPayment);

export const paymentRouter: Router = router;
