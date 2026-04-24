Key Rules Roles: Each project has 3 fixed roles.
Users select during registration. Admin = seeded.

Flexibility: Routes/endpoints are examples. Modify as needed.

My backend code of this project foodHub:

prisma\schema\auth.prisma:
model Session {
id String @id
expiresAt DateTime
token String @unique
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

    ipAddress String?
    userAgent String?

    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@index([userId])
    @@map("session")

}

model Account {
id String @id
accountId String
providerId String
userId String

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    accessToken  String?
    refreshToken String?
    idToken      String?

    accessTokenExpiresAt  DateTime?
    refreshTokenExpiresAt DateTime?

    scope    String?
    password String?

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@index([userId])
    @@map("account")

}

model Verification {
id String @id
identifier String
value String
expiresAt DateTime

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@index([identifier])
    @@map("verification")

}

prisma\schema\category.prisma:
model Category {
id String @id @default(uuid())
name String @unique

    meals Meal[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

}

prisma\schema\meal.prisma:
model Meal {
id String @id @default(uuid())

    title       String
    price       Float
    description String?
    image       String?

    categoryId String
    category   Category @relation(fields: [categoryId], references: [id], onDelete: Restrict) // 🔥 added onDelete

    providerId String
    provider   ProviderProfile @relation(fields: [providerId], references: [id], onDelete: Cascade) // 🔥 added onDelete

    isAvailable Boolean @default(true)
    isDeleted   Boolean @default(false) // 🔥 added isDeleted for soft delete

    reviews    Review[]
    orderItems OrderItem[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt // 🔥 added updatedAt for tracking changes

    @@index([categoryId])
    @@index([providerId])
    @@index([price]) // 🔥 added index on price for better query performance

}

prisma\schema\order.prisma:
model Order {
id String @id @default(uuid())

    customerId String
    customer   User   @relation(fields: [customerId], references: [id], onDelete: Restrict) // 🔥 added onDelete for better data integrity

    providerId String
    provider   ProviderProfile @relation(fields: [providerId], references: [id], onDelete: Restrict) // 🔥 added onDelete for better data integrity

    totalPrice Float
    status     OrderStatus @default(PLACED)
    address    String

    paymentStatus PaymentStatus @default(PENDING) // 🔥 added paymentStatus for better tracking of payment state
    isLocked      Boolean       @default(false) // 🔥 added isLocked to prevent changes to orders that are being processed

    items   OrderItem[]
    payment Payment? // 🔥 added relation to Payment for easier access to payment details

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt // 🔥 added updatedAt for tracking changes to orders

    @@index([customerId])
    @@index([providerId])
    @@index([status]) // 🔥 added index on status for better query performance when filtering by order status

}

model OrderItem {
id String @id @default(uuid())

    orderId String
    order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade) // 🔥 added onDelete: Cascade to automatically delete order items when an order is deleted

    mealId String
    meal   Meal   @relation(fields: [mealId], references: [id], onDelete: Restrict) // 🔥 added onDelete: Restrict to prevent deletion of meals that are part of existing orders

    quantity Int
    price    Float

    @@index([orderId]) // 🔥 added index on orderId for better query performance when fetching items for an order
    @@index([mealId]) // 🔥 added index on mealId for better query performance when fetching orders that include a specific meal

}

enum OrderStatus {
PLACED
PREPARING
READY
DELIVERED
CANCELLED
}

prisma\schema\payment.prisma:
model Payment {
id String @id @default(uuid())

    orderId String @unique
    order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade) // 🔥 added onDelete: Cascade to automatically delete payment when an order is deleted

    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Restrict) // 🔥 added onDelete: Restrict to prevent deletion of users that have made payments

    provider String // stripe

    amount   Float
    currency String @default("usd")

    status PaymentStatus @default(PENDING)

    stripeSessionId       String? @unique
    stripePaymentIntentId String? @unique

    idempotencyKey String? @unique

    failureReason String?

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@index([userId])
    @@index([status])

}

enum PaymentStatus {
PENDING
PAID
FAILED
REFUNDED
}
prisma\schema\provider.prisma:
model ProviderProfile {
id String @id @default(uuid())
userId String @unique

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    restaurantName String
    description    String?
    address        String

    isApproved Boolean @default(false)
    isDeleted  Boolean @default(false) // 🔥 added

    meals  Meal[]
    orders Order[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt // 🔥 added

}
prisma\schema\review.prisma:
model Review {
id String @id @default(uuid())

    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade) // 🔥 added onDelete: Cascade to automatically delete reviews when a user is deleted

    mealId String
    meal   Meal   @relation(fields: [mealId], references: [id], onDelete: Cascade) // 🔥 added onDelete: Cascade to automatically delete reviews when a meal is deleted

    rating  Int
    comment String?

    createdAt DateTime @default(now())

    @@index([mealId])
    @@index([userId])

}

prisma\schema\schema.prisma:
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
provider = "prisma-client"
output = "../../generated/prisma"
}

datasource db {
provider = "postgresql"
}
prisma\schema\user.prisma:
model User {
id String @id @default(uuid())

    // auth connection
    email         String  @unique
    emailVerified Boolean @default(false)
    image         String?

    // business fields
    name   String
    role   Role       @default(CUSTOMER)
    status UserStatus @default(ACTIVE)
    phone  String?

    // relations
    providerProfile ProviderProfile?
    orders          Order[]
    reviews         Review[]
    payments        Payment[] // 🔥 added

    // auth relations
    sessions Session[]
    accounts Account[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

}

enum Role {
CUSTOMER
PROVIDER
ADMIN
}

enum UserStatus {
ACTIVE
SUSPENDED
}

src\helpers\responseHandler.ts:  
export const sendResponse = (
res: any,
{
statusCode = 200,
success = true,
message = "",
data = null,
}
) => {
res.status(statusCode).json({
success,
message,
data,
});
};

src\lib\auth.ts:
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
host: "smtp.gmail.com",
port: 587,
secure: false, // Use true for port 465, false for port 587
auth: {
user: process.env.APP_USER,
pass: process.env.APP_PASS,
},
});

export const auth = betterAuth({
database: prismaAdapter(prisma, {
provider: "postgresql", // or "mysql", "postgresql", ...etc
}),
trustedOrigins: [process.env.APP_URL!],
user: {
additionalFields: {
role: {
type: "string",
defaultValue: "CUSTOMER",
required: false
},
phone: {
type: "string",
required: false
},
status: {
type: "string",
defaultValue: "ACTIVE",
required: false
}
}
},
emailAndPassword: {
enabled: true,
autoSignIn: false,
requireEmailVerification: true
},
emailVerification: {
sendOnSignUp: true,
autoSignInAfterVerification: true,
sendVerificationEmail: async ({ user, url, token }, request) => {
try {
const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
const info = await transporter.sendMail({
from: '"FoodHub" <FoodHub@ph.com>',
to: user.email,
subject: "Please verify your email!",
html: `<!DOCTYPE html>

<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .header {
      background-color: #0f172a;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }

    .header h1 {
      margin: 0;
      font-size: 22px;
    }

    .content {
      padding: 30px;
      color: #334155;
      line-height: 1.6;
    }

    .content h2 {
      margin-top: 0;
      font-size: 20px;
      color: #0f172a;
    }

    .button-wrapper {
      text-align: center;
      margin: 30px 0;
    }

    .verify-button {
      background-color: #2563eb;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      font-weight: bold;
      border-radius: 6px;
      display: inline-block;
    }

    .verify-button:hover {
      background-color: #1d4ed8;
    }

    .footer {
      background-color: #f1f5f9;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #64748b;
    }

    .link {
      word-break: break-all;
      font-size: 13px;
      color: #2563eb;
    }

  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>FoodHub</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Verify Your Email Address</h2>
      <p>
        Hello ${user.name} <br /><br />
        Thank you for registering on <strong>FoodHub</strong>.
        Please confirm your email address to activate your account.
      </p>

      <div class="button-wrapper">
        <a href="${verificationUrl}" class="verify-button">
          Verify Email
        </a>
      </div>

      <p>
        If the button doesn’t work, copy and paste the link below into your browser:
      </p>

      <p class="link">
        ${url}
      </p>

      <p>
        This verification link will expire soon for security reasons.
        If you did not create an account, you can safely ignore this email.
      </p>

      <p>
        Regards, <br />
        <strong>FoodHub Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      © 2025 FoodHub. All rights reserved.
    </div>

  </div>
</body>
</html>
`
        });

        console.log("Message sent:", info.messageId);
      } catch (err) {
        console.error(err)
        throw err;
      }
    },

},

});

//
// GOOGLE_CLIENT_ID
// GOOGLE_CLIENT_SECRET

src\lib\prisma.ts:
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }
src\lib\stripe.ts:
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

src\middlewares\auth.ts:
// src/middlewares/auth.ts
import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from '../lib/auth'

export enum UserRole {
CUSTOMER = "CUSTOMER",
PROVIDER = "PROVIDER",
ADMIN = "ADMIN",
}

declare global {
namespace Express {
interface Request {
user?: {
id: string;
email: string;
name: string;
role: string;
emailVerified: boolean;
}
}
}
}

const auth = (...roles: UserRole[]) => {
return async (req: Request, res: Response, next: NextFunction) => {
try {
// get user session
const session = await betterAuth.api.getSession({
headers: req.headers as any
})

            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized!"
                })
            }

            if (session.user.status === "SUSPENDED") {
                return res.status(403).json({
                    success: false,
                    message: "Account suspended"
                })
            }

            if (!session.user.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Email verification required. Please verfiy your email!"
                })
            }


            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as string,
                emailVerified: session.user.emailVerified
            }

            if (roles.length && !roles.includes(req.user.role as UserRole)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden! You don't have permission to access this resources!"
                })
            }

            next()
        } catch (err) {
            next(err);
        }

    }

};

export default auth;

src\middlewares\errorHandler.ts:  
import { NextFunction, Request, Response } from "express"
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
err: any,
req: Request,
res: Response,
next: NextFunction
) {
let statusCode = 500;
let errorMessage = "Internal Server Error";
let errorDetails = err;

    // PrismaClientValidationError
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        errorMessage = "You provide incorrect field type or missing fields!"
    }
    // PrismaClientKnownRequestError
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
            statusCode = 400;
            errorMessage = "An operation failed because it depends on one or more records that were required but not found."
        }
        else if (err.code === "P2002") {
            statusCode = 400;
            errorMessage = "Duplicate key error"
        }
        else if (err.code === "P2003") {
            statusCode = 400;
            errorMessage = "Foreign key constraint failed"
        }
    }
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = 500;
        errorMessage = "Error occurred during query execution"
    }
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        if (err.errorCode === "P1000") {
            statusCode = 401;
            errorMessage = "Authentication failed. Please check your creditials!"
        }
        else if (err.errorCode === "P1001") {
            statusCode = 400;
            errorMessage = "Can't reach database server"
        }
    }

    res.status(statusCode)
    res.json({
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && { error: errorDetails })
    })

}

export default errorHandler;

src\middlewares\notFound.ts:
import { Request, Response } from "express";

export function notFound(req: Request, res: Response) {
res.status(404).json({
message: "Route not found!",
path: req.originalUrl,
date: Date()
})
}

src\middlewares\validateRequest.ts:
import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

const validateRequest = (schema: ZodSchema) => {
return (req: Request, res: Response, next: NextFunction) => {
try {
schema.parse(req.body);
next();
} catch (error: any) {
return res.status(400).json({
success: false,
message: "Validation failed",
errors: error.errors,
});
}
};
};

export default validateRequest;

src\modules\admin\admin.router.ts:
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

src\modules\admin\admin.controller.ts:
import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service";

const getAllUsers = async (req: Request, res: Response) => {
const result = await AdminService.getAllUsers();
res.json({ success: true, data: result });
};

const updateUserStatus = async (req: Request, res: Response) => {
const { id } = req.params;
const result = await AdminService.updateUserStatus(
id as string,
req.body.status as string
);

    res.json({ success: true, data: result });

};

const getAllOrders = async (req: Request, res: Response) => {
const result = await AdminService.getAllOrders();
res.json({ success: true, data: result });
};

export const AdminController = {
getAllUsers,
updateUserStatus,
getAllOrders,
};

src\modules\admin\admin.service.ts:  
import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../generated/prisma/client";

const getAllUsers = async () => {
return await prisma.user.findMany({
orderBy: { createdAt: "desc" },
});
};

const updateUserStatus = async (userId: string, status: string) => {
if (!Object.values(UserStatus).includes(status as UserStatus)) {
throw new Error("Invalid status");
}

    return await prisma.user.update({
        where: { id: userId },
        data: { status: status as UserStatus },
    });

};

const getAllOrders = async () => {
return await prisma.order.findMany({
include: {
items: true,
customer: { select: { name: true } },
},
});
};

export const AdminService = {
getAllUsers,
updateUserStatus,
getAllOrders,
};

src\modules\admin\admin.validation.ts:
import { z } from "zod";

export const updateUserStatusSchema = z.object({
status: z.enum(["ACTIVE", "SUSPENDED"]),
});

src\modules\category\category.validation.ts:
import { z } from "zod";

export const createCategorySchema = z.object({
name: z
.string()
.min(1, "Category name is required")
.min(2, "Category name must be at least 2 characters")
.max(50, "Category name is too long"),
});

export const updateCategorySchema = z.object({
name: z
.string()
.min(2)
.max(50)
.optional(),
});

src\modules\category\category.router.ts:
import { Router } from "express";
import { CategoryController } from "./category.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createCategorySchema, updateCategorySchema } from "./category.validation";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// PUBLIC
router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);

// ADMIN ONLY
router.post(
"/",
auth(UserRole.ADMIN),
validateRequest(createCategorySchema),
CategoryController.createCategory
);

router.patch(
"/:id",
auth(UserRole.ADMIN),
validateRequest(updateCategorySchema),
CategoryController.updateCategory
);

router.delete(
"/:id",
auth(UserRole.ADMIN),
CategoryController.deleteCategory
);

export const categoryRouter: Router = router;

src\modules\category\category.controller.ts:
import { Request, Response, NextFunction } from "express";
import { CategoryService } from "./category.service";

const createCategory = async (req: Request, res: Response, next: NextFunction) => {
try {
const result = await CategoryService.createCategory(req.body);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
try {
const result = await CategoryService.getAllCategories();

        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
try {
const { id } = req.params;
const result = await CategoryService.getCategoryById(id as string);

        res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
try {
const { id } = req.params;
const result = await CategoryService.updateCategory(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
try {
const { id } = req.params;
const result = await CategoryService.deleteCategory(id as string);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

export const CategoryController = {
createCategory,
getAllCategories,
getCategoryById,
updateCategory,
deleteCategory,
};

src\modules\category\category.service.ts:
import { prisma } from "../../lib/prisma";

const createCategory = async (payload: { name: string }) => {
return await prisma.category.create({
data: payload,
});
};

const getAllCategories = async () => {
return await prisma.category.findMany({
orderBy: { createdAt: "desc" },
});
};

const getCategoryById = async (id: string) => {
return await prisma.category.findUniqueOrThrow({
where: { id },
});
};

const updateCategory = async (id: string, payload: { name?: string }) => {
return await prisma.category.update({
where: { id },
data: payload,
});
};

const deleteCategory = async (id: string) => {
return await prisma.category.delete({
where: { id },
});
};

export const CategoryService = {
createCategory,
getAllCategories,
getCategoryById,
updateCategory,
deleteCategory,
};

src\modules\meal\meal.validation.ts:
import { z } from "zod";

export const createMealSchema = z.object({
title: z.string().min(2),
price: z.number().positive(),
description: z.string().optional(),
image: z.string().optional(),
categoryId: z.string(),
});

export const updateMealSchema = z.object({
title: z.string().optional(),
price: z.number().positive().optional(),
description: z.string().optional(),
image: z.string().optional(),
categoryId: z.string().optional(),
isAvailable: z.boolean().optional(),
});

src\modules\meal\meal.router.ts:
import { Router } from "express";
import { MealController } from "./meal.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createMealSchema, updateMealSchema } from "./meal.validation";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// PUBLIC
router.get("/", MealController.getAllMeals);
router.get("/:id", MealController.getMealById);

// PROVIDER
router.post(
"/",
auth(UserRole.PROVIDER),
validateRequest(createMealSchema),
MealController.createMeal
);

router.get(
"/my/meals",
auth(UserRole.PROVIDER),
MealController.getMyMeals
);

router.get(
"/my/meals/:id",
auth(UserRole.PROVIDER),
MealController.getMyMealById
);

router.patch(
"/:id",
auth(UserRole.PROVIDER),
validateRequest(updateMealSchema),
MealController.updateMeal
);

router.delete(
"/:id",
auth(UserRole.PROVIDER),
MealController.deleteMeal
);

export const mealRouter: Router = router;

src\modules\meal\meal.controller.ts:  
import { Request, Response, NextFunction } from "express";
import { MealService } from "./meal.service";

const createMeal = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user!;
const result = await MealService.createMeal(user.id, req.body);

        res.status(201).json({
            success: true,
            message: "Meal created",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const getAllMeals = async (req: Request, res: Response, next: NextFunction) => {
try {
const result = await MealService.getAllMeals(req.query);

        res.status(200).json({
            success: true,
            message: "Meals fetched",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const getMealById = async (req: Request, res: Response, next: NextFunction) => {
try {
const { id } = req.params;
const result = await MealService.getMealById(id as string);

        res.status(200).json({
            success: true,
            message: "Meal fetched",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const getMyMealById = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user!;
const { id } = req.params;

        const result = await MealService.getMyMealById(user.id, id as string);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const getMyMeals = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user!;
const result = await MealService.getMyMeals(user.id);

        res.status(200).json({
            success: true,
            message: "My meals",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const updateMeal = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user!;
const { id } = req.params;
const result = await MealService.updateMeal(
id as string,
user.id,
req.body
);

        res.status(200).json({
            success: true,
            message: "Meal updated",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user!;
const { id } = req.params;
const result = await MealService.deleteMeal(id as string, user.id);

        res.status(200).json({
            success: true,
            message: "Meal deleted",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

export const MealController = {
createMeal,
getAllMeals,
getMealById,
getMyMeals,
updateMeal,
deleteMeal,
getMyMealById,
};
src\modules\meal\meal.service.ts:  
import { prisma } from "../../lib/prisma";

const createMeal = async (
userId: string,
payload: any
) => {
// find provider profile
const provider = await prisma.providerProfile.findUniqueOrThrow({
where: { userId },
});

    if (!provider.isApproved) {
        throw new Error("Provider not approved yet");
    }

    return await prisma.meal.create({
        data: {
            ...payload,
            providerId: provider.id,
        },
    });

};

const getAllMeals = async (query: any) => {
const {
search,
categoryId,
minPrice,
maxPrice,
page = 1,
limit = 10,
} = query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const conditions: any[] = [];

    //  search
    if (search) {
        conditions.push({
            OR: [
                {
                    title: { contains: search, mode: "insensitive" },
                },
                {
                    description: { contains: search, mode: "insensitive" },
                },
            ],
        });
    }

    //  category filter
    if (categoryId) {
        conditions.push({ categoryId });
    }

    //  price range
    if (minPrice || maxPrice) {
        conditions.push({
            price: {
                gte: minPrice ? Number(minPrice) : undefined,
                lte: maxPrice ? Number(maxPrice) : undefined,
            },
        });
    }

    //  only available meals
    conditions.push({ isAvailable: true });

    const data = await prisma.meal.findMany({
        where: { AND: conditions },
        include: {
            category: true,
            provider: {
                include: {
                    user: { select: { name: true } },
                },
            },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
    });

    const total = await prisma.meal.count({
        where: { AND: conditions },
    });

    return {
        data,
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPage: Math.ceil(total / limitNumber),
        },
    };

};

const getMealById = async (id: string) => {
return await prisma.meal.findUniqueOrThrow({
where: { id },
include: {
category: true,
provider: {
include: {
user: { select: { name: true } },
},
},
reviews: true,
},
});
};

const getMyMealById = async (userId: string, mealId: string) => {
// 1. get provider
const provider = await prisma.providerProfile.findUniqueOrThrow({
where: { userId },
});

    // 2. get meal
    const meal = await prisma.meal.findUniqueOrThrow({
        where: { id: mealId },
    });

    // 3. ownership check
    if (meal.providerId !== provider.id) {
        throw new Error("You are not authorized to access this meal");
    }

    return meal;

};

const getMyMeals = async (userId: string) => {
const provider = await prisma.providerProfile.findUniqueOrThrow({
where: { userId },
});

    return await prisma.meal.findMany({
        where: { providerId: provider.id },
        orderBy: { createdAt: "desc" },
    });

};

const updateMeal = async (
id: string,
userId: string,
payload: any
) => {
const provider = await prisma.providerProfile.findUniqueOrThrow({
where: { userId },
});

    const meal = await prisma.meal.findUniqueOrThrow({
        where: { id },
    });

    if (meal.providerId !== provider.id) {
        throw new Error("You are not owner of this meal");
    }

    return await prisma.meal.update({
        where: { id },
        data: payload,
    });

};

const deleteMeal = async (id: string, userId: string) => {
const provider = await prisma.providerProfile.findUniqueOrThrow({
where: { userId },
});

    const meal = await prisma.meal.findUniqueOrThrow({
        where: { id },
    });

    if (meal.providerId !== provider.id) {
        throw new Error("You are not owner of this meal");
    }

    return await prisma.meal.delete({
        where: { id },
    });

};

export const MealService = {
createMeal,
getAllMeals,
getMealById,
getMyMeals,
updateMeal,
deleteMeal,
getMyMealById,
};

src\modules\order\order.validation.ts:
import { z } from "zod";

export const createOrderSchema = z.object({
items: z.array(
z.object({
mealId: z.string(),
quantity: z.number().min(1),
})
),
address: z.string().min(5),
});

export const updateOrderStatusSchema = z.object({
status: z.enum([
"PLACED",
"PREPARING",
"READY",
"DELIVERED",
"CANCELLED",
]),
});
src\modules\order\order.router.ts:  
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

src\modules\order\order.controller.ts:
import { Request, Response, NextFunction } from "express";
import { OrderService } from "./order.service";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user!;
const result = await OrderService.createOrder(user.id, req.body);

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user!;
const result = await OrderService.getMyOrders(user.id);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const getProviderOrders = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user!;
const result = await OrderService.getProviderOrders(user.id);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user!;
const { id } = req.params;
const result = await OrderService.updateOrderStatus(
id as string,
user.id,
user.role,
req.body.status
);

        res.status(200).json({
            success: true,
            message: "Order updated",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

export const OrderController = {
createOrder,
getMyOrders,
getProviderOrders,
updateOrderStatus,
};
src\modules\order\order.service.ts:
import { prisma } from "../../lib/prisma";

const createOrder = async (
userId: string,
payload: {
items: { mealId: string; quantity: number }[];
address: string;
}
) => {
return await prisma.$transaction(async (tx) => {
// 0. basic validation (never trust client)
if (!payload.items.length) {
throw new Error("Order must contain at least one item");
}

        if (payload.items.some((i) => i.quantity <= 0)) {
            throw new Error("Invalid quantity");
        }

        // 1. get meals with provider info
        const mealIds = payload.items.map((i) => i.mealId);

        const meals = await tx.meal.findMany({
            where: { id: { in: mealIds } },
            include: {
                provider: {
                    select: { id: true, isApproved: true },
                },
            },
        });

        // 2. validate meals exist
        if (meals.length !== payload.items.length) {
            throw new Error("Invalid meal detected");
        }

        if (meals.length === 0) {
            throw new Error("No meals found");
        }

        // 3. check availability
        const hasUnavailableMeal = meals.some((m) => !m.isAvailable);
        if (hasUnavailableMeal) {
            throw new Error("One or more meals are not available");
        }

        // 4. ensure same provider
        const providerId = meals[0]!.providerId;

        const allSameProvider = meals.every(
            (m) => m.providerId === providerId
        );

        if (!allSameProvider) {
            throw new Error("All meals must be from same provider");
        }

        // 5. check provider approval (optimized: from included relation)
        const isApproved = meals[0]!.provider.isApproved;

        if (!isApproved) {
            throw new Error("Provider is not approved yet");
        }

        // 6. calculate total price
        let totalPrice = 0;

        const orderItemsData = payload.items.map((item) => {
            const meal = meals.find((m) => m.id === item.mealId)!;

            const itemTotal = meal.price * item.quantity;
            totalPrice += itemTotal;

            return {
                mealId: meal.id,
                quantity: item.quantity,
                price: meal.price,
            };
        });

        // 7. create order
        const order = await tx.order.create({
            data: {
                customerId: userId,
                providerId,
                totalPrice,
                address: payload.address,
            },
        });

        // 8. create order items
        await tx.orderItem.createMany({
            data: orderItemsData.map((item) => ({
                ...item,
                orderId: order.id,
            })),
        });

        return order;
    });

};

const getMyOrders = async (userId: string) => {
return await prisma.order.findMany({
where: { customerId: userId },
include: {
items: {
include: {
meal: true,
},
},
provider: {
include: {
user: {
select: { name: true },
},
},
},
},
orderBy: { createdAt: "desc" },
});
};

const getProviderOrders = async (userId: string) => {
const provider = await prisma.providerProfile.findUniqueOrThrow({
where: { userId },
});

    return await prisma.order.findMany({
        where: { providerId: provider.id },
        include: {
            items: {
                include: { meal: true },
            },
            customer: {
                select: { name: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

};

const updateOrderStatus = async (
orderId: string,
userId: string,
role: string,
status: string
) => {
const order = await prisma.order.findUniqueOrThrow({
where: { id: orderId },
});

    // CUSTOMER → can only cancel
    if (role === "CUSTOMER") {
        if (order.customerId !== userId) {
            throw new Error("Unauthorized");
        }

        if (status !== "CANCELLED") {
            throw new Error("Customer can only cancel order");
        }

        if (order.status !== "PLACED") {
            throw new Error("Order cannot be cancelled at this stage");
        }
    }

    // PROVIDER → controlled flow
    if (role === "PROVIDER") {
        const provider = await prisma.providerProfile.findUniqueOrThrow({
            where: { userId },
        });

        if (order.providerId !== provider.id) {
            throw new Error("Unauthorized");
        }

        const validTransitions: Record<string, string[]> = {
            PLACED: ["PREPARING"],
            PREPARING: ["READY"],
            READY: ["DELIVERED"],
        };

        const allowedNextStatuses = validTransitions[order.status] || [];

        if (!allowedNextStatuses.includes(status)) {
            throw new Error(
                `Invalid status transition from ${order.status} to ${status}`
            );
        }
    }

    // ADMIN (optional future support)
    if (role === "ADMIN") {
        // Admin can do anything (optional rule)
    }

    return await prisma.order.update({
        where: { id: orderId },
        data: { status: status as any },
    });

};

export const OrderService = {
createOrder,
getMyOrders,
getProviderOrders,
updateOrderStatus,
};

src\modules\payment\payment.router.ts:
import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { createPayment } from "./payment.controller";
import { stripeWebhook } from "./payment.webhook";

const router = express.Router();

// customer checkout
router.post("/", auth(UserRole.CUSTOMER), createPayment);

// webhook (IMPORTANT: raw body required)
router.post(
"/webhook",
express.raw({ type: "application/json" }),
stripeWebhook
);

export const paymentRouter: Router = router;

src\modules\payment\payment.controller.ts:
import { Request, Response } from "express";
import { createCheckoutSession } from "./payment.service";

export const createPayment = async (req: Request, res: Response) => {
const user = req.user!;
const { orderId } = req.body;

    const url = await createCheckoutSession(orderId, user.id);

    res.json({
        success: true,
        url,
    });

};

src\modules\payment\payment.service.ts:
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import crypto from "crypto";

export const createCheckoutSession = async (orderId: string, userId: string) => {

    const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    meal: true,
                },
            },
        },
    });

    // prevent duplicate checkout
    if (order.isLocked) {
        throw new Error("Order already processing payment");
    }

    // lock order
    await prisma.order.update({
        where: { id: orderId },
        data: { isLocked: true },
    });

    const idempotencyKey = crypto.randomUUID();

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],

        line_items: order.items.map((item) => {
            if (!item.meal) throw new Error("Meal missing");

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.meal.title,
                    },
                    unit_amount: Math.round(item.meal.price * 100),
                },
                quantity: item.quantity,
            };
        }),

        metadata: {
            orderId,
            userId,
            idempotencyKey,
        },

        success_url: `${process.env.CLIENT_URL}/payment/success`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    await prisma.payment.create({
        data: {
            orderId,
            userId,
            amount: order.totalPrice,
            provider: "stripe",
            stripeSessionId: session.id,
            idempotencyKey,
        },
    });

    return session.url;

};

src\modules\payment\payment.domain.ts:
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

src\modules\payment\payment.webhook.ts:

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

src\modules\provider\provider.router.ts:
import { Router } from "express";
import { ProviderController } from "./provider.controller";
import validateRequest from "../../middlewares/validateRequest";
import {
createProviderSchema,
updateProviderSchema,
} from "./provider.validation";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// PUBLIC
router.get("/", ProviderController.getAllProviders);
router.get("/:id", ProviderController.getProviderById);

// PROVIDER
router.post(
"/",
auth(UserRole.PROVIDER),
validateRequest(createProviderSchema),
ProviderController.createProvider
);

router.get(
"/me",
auth(UserRole.PROVIDER),
ProviderController.getMyProvider
);

router.patch(
"/me",
auth(UserRole.PROVIDER),
validateRequest(updateProviderSchema),
ProviderController.updateProvider
);

// ADMIN
router.patch(
"/:id/approve",
auth(UserRole.ADMIN),
ProviderController.approveProvider
);

export const providerRouter: Router = router;

src\modules\provider\provider.controller.ts:
import { Request, Response, NextFunction } from "express";
import { ProviderService } from "./provider.service";

const createProvider = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user;

        if (!user) throw new Error("Unauthorized");

        const result = await ProviderService.createProviderProfile(
            user.id,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Provider profile created",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const getAllProviders = async (req: Request, res: Response, next: NextFunction) => {
try {
const result = await ProviderService.getAllProviders();

        res.status(200).json({
            success: true,
            message: "Providers fetched",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const getProviderById = async (req: Request, res: Response, next: NextFunction) => {
try {
const { id } = req.params
const result = await ProviderService.getProviderById(id as string);

        res.status(200).json({
            success: true,
            message: "Provider fetched",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const getMyProvider = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user!;
const result = await ProviderService.getMyProviderProfile(user.id);

        res.status(200).json({
            success: true,
            message: "My provider profile",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const updateProvider = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user!;
const result = await ProviderService.updateProviderProfile(user.id, req.body);

        res.status(200).json({
            success: true,
            message: "Provider updated",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

const approveProvider = async (req: Request, res: Response, next: NextFunction) => {
try {
const { id } = req.params
const result = await ProviderService.approveProvider(id as string);

        res.status(200).json({
            success: true,
            message: "Provider approved",
            data: result,
        });
    } catch (error) {
        next(error);
    }

};

export const ProviderController = {
createProvider,
getAllProviders,
getProviderById,
getMyProvider,
updateProvider,
approveProvider,
};

src\modules\provider\provider.service.ts:
import { prisma } from "../../lib/prisma";

const createProviderProfile = async (
userId: string,
payload: {
restaurantName: string;
description?: string;
address: string;
}
) => {
// prevent duplicate profile
const existing = await prisma.providerProfile.findUnique({
where: { userId },
});

    if (existing) {
        throw new Error("Provider profile already exists!");
    }

    return await prisma.providerProfile.create({
        data: {
            userId,
            ...payload,
        },
    });

};

const getAllProviders = async () => {
return await prisma.providerProfile.findMany({
where: { isApproved: true },
include: {
user: {
select: { id: true, name: true, email: true },
},
},
orderBy: { createdAt: "desc" },
});
};

const getProviderById = async (id: string) => {
return await prisma.providerProfile.findUniqueOrThrow({
where: { id },
include: {
user: {
select: { name: true },
},
meals: true,
},
});
};

const getMyProviderProfile = async (userId: string) => {
return await prisma.providerProfile.findUniqueOrThrow({
where: { userId },
});
};

const updateProviderProfile = async (
userId: string,
payload: any
) => {
const provider = await prisma.providerProfile.findUniqueOrThrow({
where: { userId },
});

    return await prisma.providerProfile.update({
        where: { id: provider.id },
        data: payload,
    });

};

const approveProvider = async (id: string) => {
return await prisma.providerProfile.update({
where: { id },
data: { isApproved: true },
});
};

export const ProviderService = {
createProviderProfile,
getAllProviders,
getProviderById,
getMyProviderProfile,
updateProviderProfile,
approveProvider,
};

src\modules\review\review.validation.ts:
import { z } from "zod";

export const createReviewSchema = z.object({
mealId: z.string(),
rating: z.number().min(1).max(5),
comment: z.string().optional(),
});

src\modules\review\review.router.ts:
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

src\modules\review\review.controller.ts:
import { Request, Response, NextFunction } from "express";
import { ReviewService } from "./review.service";

const createReview = async (req: Request, res: Response, next: NextFunction) => {
try {
const user = req.user!;
const result = await ReviewService.createReview(user.id, req.body);

        res.status(201).json({
            success: true,
            message: "Review added",
            data: result,
        });
    } catch (e) {
        next(e);
    }

};

const getMealReviews = async (req: Request, res: Response) => {
const { mealId } = req.params;
const result = await ReviewService.getMealReviews(mealId as string);

    res.status(200).json({
        success: true,
        data: result,
    });

};

const getMealRating = async (req: Request, res: Response) => {
const { mealId } = req.params;
const result = await ReviewService.getMealRating(mealId as string);

    res.status(200).json({
        success: true,
        data: result,
    });

};

export const ReviewController = {
createReview,
getMealReviews,
getMealRating,
};
src\modules\review\review.service.ts:
import { prisma } from "../../lib/prisma";

const createReview = async (
userId: string,
payload: {
mealId: string;
rating: number;
comment?: string;
}
) => {
// 1. check delivered order exists
const hasOrdered = await prisma.order.findFirst({
where: {
customerId: userId,
status: "DELIVERED",
items: {
some: {
mealId: payload.mealId,
},
},
},
});

    if (!hasOrdered) {
        throw new Error("You can only review meals you have ordered");
    }

    // 2. prevent duplicate review
    const alreadyReviewed = await prisma.review.findFirst({
        where: {
            userId: userId,
            mealId: payload.mealId,
        }
    });

    if (alreadyReviewed) {
        throw new Error("You already reviewed this meal");
    }

    return await prisma.review.create({
        data: {
            ...payload,
            userId: userId,
        },
    });

};

const getMealReviews = async (mealId: string) => {
return await prisma.review.findMany({
where: { mealId },
include: {
user: {
select: {
name: true,
},
},
},
orderBy: { createdAt: "desc" },
});
};

const getMealRating = async (mealId: string) => {
return await prisma.review.aggregate({
where: { mealId },
\_avg: { rating: true },
\_count: { rating: true },
});
};

export const ReviewService = {
createReview,
getMealReviews,
getMealRating,
};

src\scripts\seedAdmin.ts:
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

async function seedAdmin() {
try {
console.log("**\*** Admin Seeding Started....")
const adminData = {
name: "Admin Nabil",
email: "admin1@admin.com",
role: UserRole.ADMIN,
password: "admin1234"
}
console.log("**\*** Checking Admin Exist or not")
// check user exist on db or not
const existingUser = await prisma.user.findUnique({
where: {
email: adminData.email
}
});

        if (existingUser) {
            throw new Error("User already exists!!");
        }

        const signUpAdmin = await fetch("http://localhost:5000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "origin": "http://localhost:5000",
            },
            body: JSON.stringify(adminData)
        })



        if (signUpAdmin.ok) {
            console.log("**** Admin created")
            await prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }
            })

            console.log("**** Email verification status updated!")
        }
        console.log("******* SUCCESS ******")

    } catch (error) {
        console.error(error);
    }

}

seedAdmin()

src\app.ts:
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

const app: Application = express();

app.use("/webhook", express.raw({ type: "application/json" }));
app.use(cors({ origin: process.env.APP_URL, credentials: true }))
app.use(express.json())

app.all("/api/auth/\*splat", toNodeHandler(auth))

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

src\server.ts:
import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 5000;

async function main() {
try {
await prisma.$connect();
console.log("Connected to the database successfully.");

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("An error occurred:", error);
        await prisma.$disconnect();
        process.exit(1);
    }

}

main();

.env:

# Environment variables declared in this file are NOT automatically loaded by Prisma.

# Please add `import "dotenv/config";` to your `prisma.config.ts` file, or use the Prisma CLI with Bun

# to load environment variables from .env files: https://pris.ly/prisma-config-env-vars.

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.

# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

# Application running port

PORT=5000

# PostgreSQL connection string

# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

DATABASE_URL="postgresql://postgres:12345@localhost:5432/FoodHub_App?schema=public"

# Secret key for Better Auth

BETTER_AUTH_SECRET=rXb8uNU7wJKIUb6YHJKja9WEv9boVpua

# Backend auth service URL

BETTER_AUTH_URL="http://localhost:5000"

# Frontend application URL

APP_URL="http://localhost:3000"

# Email account used for sending emails (DEMO)

APP_USER="k.nabil.cse@gmail.com"

# App password generated from Gmail (DEMO – never commit real one)

APP_PASS="bpux emiy qlyb inf"

# Google OAuth Client ID (DEMO)

GOOGLE_CLIENT_ID=507807238421-j5hkg1hr1ue2ullr9kp0scqfhekiuhho.apps.googleusercontent.com

# Google OAuth Client Secret (DEMO)

GOOGLE_CLIENT_SECRET=GOCSPX-xgihuNC_C-\_a0gKbi_LgrLoconKG

Read my backend code.
