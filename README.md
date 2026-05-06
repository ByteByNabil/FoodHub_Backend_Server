# 🍔 FoodHub Backend Server

A robust, scalable, and fully-featured RESTful API for the FoodHub FullStack Application. Built with modern web technologies, this backend handles everything from secure authentication and role-based access control to payment processing and AI-powered chat assistance.

## 🚀 Tech Stack

- **Runtime Environment:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL
- **Authentication:** [Better Auth](https://better-auth.com/) (Email/Password, Google OAuth)
- **Payment Processing:** [Stripe](https://stripe.com/)
- **Validation:** [Zod](https://zod.dev/)
- **Email Service:** Nodemailer

## 📁 Project Structure

The project follows a modular architecture for better maintainability and scalability.

```text
src/
├── lib/               # Core configurations (Prisma, Auth, Stripe)
├── middlewares/       # Express middlewares (Error Handling, 404)
├── modules/           # Feature-based modular routes and controllers
│   ├── admin/         # Admin dashboard and management
│   ├── ai/            # Gemini AI chatbot integration
│   ├── category/      # Meal categories management
│   ├── meal/          # Provider meals CRUD
│   ├── order/         # Order processing and management
│   ├── payment/       # Stripe checkout and webhooks
│   ├── provider/      # Restaurant/Provider profiles
│   └── review/        # Ratings and reviews
├── scripts/           # Utility scripts (e.g., seeding admin)
├── app.ts             # Express app setup and route registration
└── server.ts          # Server entry point
```

## ✨ Key Features

- **Secure Authentication & Authorization:** Multi-provider authentication using Better Auth with Role-Based Access Control (Admin, Provider, Customer). Includes email verification.
- **Provider & Meal Management:** Restaurant owners can create profiles, manage their meal menus, and organize them into categories.
- **Order Processing & Payments:** Seamless checkout experience with Stripe integration, including secure webhook handling for payment status updates.
- **AI Chat Assistant ("Foodie"):** Integrated with Google Gemini API to provide intelligent, contextual support to users.
- **Reviews & Ratings:** Customers can leave feedback and rate providers/meals.
- **Admin Dashboard:** Endpoints to manage users, monitor platform statistics, and oversee operations.

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- pnpm (Package Manager)
- PostgreSQL database
- Stripe Account
- Google Cloud Console Project (for OAuth and Gemini AI)

### Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/foodhub"

# Application URLs
APP_URL="http://localhost:5000"
CLIENT_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:5000/api/auth"

# Authentication (Google OAuth)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Email Verification (Nodemailer)
APP_USER="your_email@gmail.com"
APP_PASS="your_app_password"
EMAIL_FROM="FoodHub@ph.com"

# Stripe Payments
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

# Gemini AI
GEMINI_API_KEY="your_gemini_api_key"
```

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd FoodHub_Backend_Server
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Generate Prisma Client & Push Schema:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server:**
   ```bash
   pnpm run dev
   ```

5. **Listen for Stripe Webhooks (Local testing):**
   ```bash
   pnpm run stripe:webhook
   ```

## 📜 Scripts

- `pnpm run dev`: Starts the server in development mode using `tsx watch`.
- `pnpm run build`: Generates the Prisma client and compiles TypeScript to JavaScript.
- `pnpm run start`: Starts the production server from the `dist` directory.
- `pnpm run seed:admin`: Seeds the database with an initial admin user.
- `pnpm run stripe:webhook`: Forwards Stripe webhooks to the local development environment.
