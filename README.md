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
