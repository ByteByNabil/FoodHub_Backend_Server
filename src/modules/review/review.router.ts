import { Router } from "express";
import { ReviewController } from "./review.controller";
import auth, { UserRole } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { createReviewSchema } from "./review.validation";

const router = Router();

router.post(
    "/",
    auth(UserRole.CUSTOMER),
    validateRequest(createReviewSchema),
    ReviewController.createReview
);

router.get("/meal/:mealId", ReviewController.getMealReviews);
router.get("/meal/:mealId/rating", ReviewController.getMealRating);

export const reviewRouter: Router = router;