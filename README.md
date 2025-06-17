# My Bank API

This repository contains the backend API for "My Bank" a learning project designed to explore and implement common banking application features using Node.js, Express, and MongoDB. The API handles core functionalities such as customer onboarding, authentication, account management, and transactions, with a focus on security and best practices.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcrypt.js
- **Validation**: express-validator
- **Email**: Nodemailer with Ethereal for development

---

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally or a connection string to a cloud instance.

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/your-username/my-bank-api.git
    cd my-bank-api
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables:

    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    PORT=5000
    ```

4.  **Start the development server:**
    ```sh
    npm run dev
    ```
    The API will be available at `http://localhost:5000`.

---

## Core Application Flows

This section documents the key business logic sequences implemented in the API.

### General API Request Flow

This describes the typical lifecycle of a request made to the MyBank API:

1.  **Server Initialization (`src/server.js`):**

    - The application starts with an Express.js server.
    - It connects to MongoDB and sets up essential middleware (CORS, JSON parsing).
    - WebSocket services are initialized for real-time features.
    - API routes (e.g., `/api/auth`, `/api/users`) are defined, mapping URLs to router files.
    - An API documentation endpoint (`/api-docs`) is available via Swagger.
    - The server listens for incoming HTTP requests.

2.  **Request Handling & Routing:**

    - A client request (e.g., `POST /api/auth/login`) first hits `src/server.js`.
    - Express.js routes the request to the appropriate **router module** (e.g., `src/routes/authRoutes.js`) based on the URL.

3.  **Router & Middleware (`src/routes/*`):**

    - The router module matches the request to a specific route.
    - Route-specific **middleware** (e.g., `activityLogger`, `authMiddleware` for JWT verification, `validationMiddleware`) executes.
    - If middleware checks pass, the request proceeds to a **controller function**.

4.  **Controller Logic (`src/controllers/*`):**

    - Controllers house the core **business logic**.
    - They interact with **Mongoose models** (e.g., `User`, `Account`) for database operations (CRUD).
    - They may call **service modules** (e.g., `websocketService`) for auxiliary tasks.
    - The controller sends an HTTP response (JSON data, success/error messages) back to the client.

5.  **Models (`src/models/*`):**

    - Define MongoDB data schemas and provide an interface for database interaction.
    - May include pre-save hooks (e.g., for password hashing).

6.  **Services (`src/services/*`):**
    - Encapsulate reusable functionalities like WebSocket communication or activity logging.

### V2 Customer Onboarding Flow

This is the modern, secure, multi-step process for registering a new customer.

**Flow Summary:**

1.  **Customer Applies**

    - A prospective customer submits basic contact info.
    - `-->` A `pending` user application is created.

2.  **Banker Approves**

    - A staff member reviews and approves the application.
    - `-->` An email with a secure link is sent to the customer.

3.  **Customer Completes Profile**

    - The customer uses the link to submit their full details and set a password.
    - `-->` The user's profile is marked as `complete`.

4.  **Banker Verifies**
    - A staff member performs the final verification.
    - `-->` The user's account is activated (`isVerified: true`). The customer can now log in.

### Basic Banking Features

#### V2 Customer Onboarding Flow

This flow details the multi-step process for a new prospective customer to apply, get approved, complete their profile, and become a verified customer of the bank. This flow involves both the customer and bank personnel (banker/admin).

1.  **Step 1: Prospective Customer Applies (Customer Action)**

    - **Endpoint:** `POST /api/auth/apply` (V1 endpoint, but initiates the V2-style onboarding process)
    - **Action:** The prospective customer submits basic application details (e.g., email, name). This creates a new user record with a "pending" application status, marked as not yet verified or profiled.

2.  **Step 2: Banker Approves Application (Banker Action)**

    - **Endpoint:** `POST /api/v2/admin/approve-application/:userId` (Requires "banker" or "admin" role)
    - **Action:** A banker reviews the pending application and approves it. The user's application status is updated to "approved", and an email is sent to the customer with a secure link to complete their profile.

3.  **Step 3: Customer Completes Profile (Customer Action)**

    - **Endpoint:** Assumed to be a `POST /api/v2/users/complete-profile` or similar (e.g., `POST /api/auth/complete-profile-v2`). The customer uses the secure link from the email.
    - **Action:** The customer clicks the link, is directed to a profile completion form, submits their full details (address, contact, etc.), and sets their password. Their profile is marked as complete, and their details are saved.

4.  **Step 4: Banker Verifies Customer (Banker Action)**
    - **Endpoint:** `POST /api/v2/admin/verify-customer/:userId` (Requires "banker" or "admin" role)
    - **Action:** After the customer completes their profile, a banker performs final verification (e.g., KYC checks, document verification offline or through an interface). The user is then marked as verified, and their application status is set to "completed". The customer can now typically log in and access banking services, and the banker can proceed to create bank accounts for them.

#### Account Creation Flow (Banker-Initiated)

This flow outlines how a new bank account (e.g., Savings, Checking) is created for a verified customer. This typically follows the "V2 Customer Onboarding Flow" where a user becomes verified.

1.  **Initiation (Banker Action):**

    - An authenticated user with the "banker" role initiates account creation via `POST /api/accounts/create`.
    - The request includes the `userId` of the verified customer and details like `accountType`, initial `balance` (optional, defaults to 0), `currency`, etc.

2.  **Customer Validation:**

    - The system verifies that the provided `userId` corresponds to an existing, verified customer.

3.  **Account Generation:**

    - A unique `accountNumber` is generated for the new account (e.g., `MYB` + timestamp).
    - A new `Account` document is prepared with the customer's `userId`, the generated `accountNumber`, specified `accountType`, initial `balance`, and other relevant details. The account `status` defaults to "Active".

4.  **Database Save:**

    - The new `Account` document is saved to the database.

5.  **Response:**
    - The details of the newly created bank account are returned to the banker.

#### Adding Funds to an Account

This describes how money is introduced into an account, either as an initial balance, through deposits, or via administrative airdrops.

1.  **Initial Balance during Account Creation:**

    - When a banker creates a new account (`POST /api/accounts/create`), an initial `balance` can be specified. If not, it defaults to 0.

2.  **Deposit (`POST /api/accounts/deposit` - Customer/Banker):**

    - **Authorization:** The user must be an authenticated "customer" or "banker".
    - **Input:** Requires `accountNumber` and a positive `amount`.
    - **Process:** The system finds the account, creates a "deposit" transaction record, and increases the account balance.
    - **Atomicity:** The transaction creation and balance update are performed within a database transaction to ensure consistency.
    - **Response:** Success message with updated account and transaction details.

3.  **Airdrop (`POST /api/accounts/airdrop` - Admin Only):**
    - **Authorization:** The user must be an authenticated "admin".
    - **Input:** Requires `accountNumber` and a positive `amount`.
    - **Process:** Similar to a deposit, but specifically for administrative purposes. Creates an "airdrop" transaction record and increases the account balance.
    - **Atomicity:** Operations are performed within a database transaction.
    - **Response:** Success message.

#### Fund Transfer Flow (`POST /api/transactions/transfer`)

This flow describes how funds are moved between two accounts within the bank.

1.  **Authorization & Input Validation:**

    - The requesting user must be authenticated (logged in) and have either a "customer" or "banker" role.
    - The system expects `fromAccountNumber`, `toAccountNumber`, and `amount` in the request.
    - The transfer `amount` must be a positive value.

2.  **Account & Balance Verification:**

    - The system verifies that the `fromAccountNumber` exists and belongs to the logged-in user.
    - The system verifies that the `toAccountNumber` exists.
    - It checks if the `fromAccount` has sufficient funds for the transfer.
    - If any check fails (account not found, insufficient funds), an appropriate error is returned.

3.  **Transaction Record Creation:**

    - Two transaction records are generated:
      - A **debit** transaction for the `fromAccount` (negative amount).
      - A **credit** transaction for the `toAccount` (positive amount).
    - Both records are marked with type "transfer" and include descriptions.

4.  **Balance Updates & Atomic Operation:**

    - The balance of the `fromAccount` is decreased, and the `toAccount` balance is increased.
    - All database changes (saving both transaction records and updating both account balances) are performed within a **MongoDB database transaction**.
      - This ensures atomicity: if any step fails, the entire operation is rolled back, preventing data inconsistencies (e.g., funds leaving one account but not arriving in the other).

5.  **Response:**

    - Upon successful completion, a "Transfer successful" message is returned, along with details of the created transactions and updated accounts.
    - If an error occurs, an appropriate error message is sent.

    ## Security Features

This application implements multiple layers of security:

### Authentication

- **JWT Authentication** with HttpOnly, Secure, SameSite cookies
- Password hashing using **bcryptjs**
- Refresh token rotation
- Session invalidation on logout

### Authorization

- Role-Based Access Control (RBAC)
- Middleware protection for all endpoints
- Granular permission checks

### Data Protection

- Request validation via **express-validator**
- Environment variable configuration
- Mongoose schema validation

### Transport Security

- CORS policy enforcement
- HTTPS enforcement (in production)
- Cookie security flags

### Testing & Monitoring

- Postman test suites for all roles
- Activity logging middleware
- Error handling with sanitized messages

1. Account Management

   - Account creation
   - Balance inquiry
   - Transaction history
   - Account details update

2. Core Transaction Features
   - Fund transfers between accounts
   - Transaction logging
   - Idempotency handling
   - Concurrency control
