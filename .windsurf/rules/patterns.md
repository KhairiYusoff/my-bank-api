# Engineering Bible (MyBank API Backend)

Purpose: Single source of truth for coding patterns in this repo.

## Non-Negotiables
- Read existing implementation pattern before coding.
- Keep modules self-contained and maintainable.
- Prefer existing utilities/services over creating new ones.
- Avoid broad rewrites for small feature/fix requests.

## Architecture Rules
- Controllers: Handle HTTP requests/responses only, use service layer for business logic.
- Models: Use Mongoose schemas with proper references and validation.
- Routes: Define API endpoints with proper middleware chain.
- Services: Centralize business logic and external integrations.
- Middleware: Use existing auth, validation, and error-handling middleware.

## Response Format Standards

**Always use standardized response helpers:**
```javascript
const { success, error } = require("../../shared/utils/response");

// Success response
return success(res, {
  message: "Operation successful",
  data: result,
  statusCode: 201  // Optional, defaults to 200
});

// Error response
return error(res, {
  message: "Error description",
  statusCode: 400,
  errors: validationErrors  // Optional
});
```

**Response Structure:**
```javascript
// Success
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "meta": {...}  // For pagination, optional
}

// Error
{
  "success": false,
  "message": "Error message",
  "errors": [...],  // Validation errors, optional
  "statusCode": 400
}
```

## Controller Patterns

**Standard Controller Structure:**
```javascript
const Model = require("../../shared/models/Model");
const { success, error } = require("../../shared/utils/response");
const { validationResult } = require("express-validator");

exports.actionName = async (req, res) => {
  try {
    // 1. Extract and validate input
    const { field1, field2 } = req.body;
    
    // 2. Business logic
    const result = await Model.create({...});
    
    // 3. Return standardized response
    return success(res, {
      message: "Operation successful",
      data: result
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
```

**Transaction Pattern (for financial operations):**
```javascript
// Use MongoDB sessions for atomic operations
const session = await mongoose.startSession();
session.startTransaction();

try {
  await transaction.save({ session });
  await account.save({ session });
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

## Validation Patterns

**Use express-validator for input validation:**
```javascript
const { check } = require("express-validator");

const validateAction = [
  check("email", "Valid email is required")
    .isEmail()
    .normalizeEmail()
    .escape(),
  check("password", "Password is required")
    .not()
    .isEmpty()
    .isLength({ min: 1, max: 128 }),
];

// In controller
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return error(res, {
    message: "Validation failed",
    errors: errors.array(),
    statusCode: 400
  });
}
```

## Security Patterns

**Authentication & Authorization:**
- JWT with Bearer tokens for API authentication
- HttpOnly cookies for web authentication
- Role-based access control: `admin`, `banker`, `customer`
- Middleware: `authMiddleware.js`, `userMiddleware.js`

**Data Access Rules:**
- Customers can only access their own data
- Bankers can access customer data for operations
- Admins have full access
- Always check `req.user.role` and `req.user.id`

**Security Best Practices:**
- bcryptjs for password hashing
- Input validation and sanitization
- Rate limiting on sensitive endpoints
- HTTPS in production

## Database Patterns

**Model Structure:**
```javascript
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  field: { type: String, required: true },
  // Use references for relationships
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ModelName", schema);
```

**Query Patterns:**
- Use `populate()` for referenced data
- Implement pagination with `skip()` and `limit()`
- Use filters for search functionality
- Handle empty results gracefully

## Notification Pattern

**Send notifications after key events:**
```javascript
// Non-blocking notification (don't fail main operation)
try {
  await sendNotification({
    type: "deposit",
    title: "Deposit Received",
    message: `Your account ${accountNumber} received RM${amount}`,
    recipient: { role: "customer", userId: account.user },
    source: { service: "my-bank-api", id: transaction._id },
    data: { amount, accountNumber, transactionId }
  });
} catch (notifyErr) {
  console.error("Failed to send notification:", notifyErr.message);
}
```

## Error Handling

**Standard Error Response:**
```javascript
try {
  // Main logic
} catch (err) {
  console.error(err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
}
```

**Validation Errors:**
```javascript
return error(res, {
  message: "Validation failed",
  errors: errors.array(),
  statusCode: 400
});
```

## API Endpoint Patterns

**RESTful Conventions:**
- GET `/api/resource` - List resources
- GET `/api/resource/:id` - Get single resource
- POST `/api/resource` - Create resource
- PUT `/api/resource/:id` - Update resource
- DELETE `/api/resource/:id` - Delete resource

**Query Parameters:**
- Pagination: `page`, `limit`
- Sorting: `sort` (asc/desc)
- Filtering: field-specific filters
- Search: `search` for text search

## Tech Stack

**Core Technologies:**
- Node.js, Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing

**Key Libraries:**
- express-validator for input validation
- nodemailer for email
- socket.io for real-time features
- swagger-ui-express for API documentation

## Development Workflow

1. **Analyze requirements** and identify affected modules
2. **Create/update validation** rules first
3. **Implement controller logic** with proper error handling
4. **Add routes** with middleware
5. **Test with different user roles**
6. **Add notifications** for relevant events
7. **Update API documentation** if needed

## Common Gotchas

- Always check user role for data access permissions
- Use MongoDB sessions for financial transactions
- Handle async errors properly in try/catch blocks
- Validate input before processing
- Send notifications asynchronously (don't block main flow)
- Use proper HTTP status codes
- Log errors for debugging

## Validation Rules
- Run relevant lint/tests for touched code before completion.
- Mention any unrun checks explicitly in final notes.

## PR/Change Quality
- Keep diffs focused.
- Add brief comments only where logic is not obvious.
- Include risks/assumptions when uncertainty exists.

## Living Document
Update this file when a new pattern becomes team standard.
