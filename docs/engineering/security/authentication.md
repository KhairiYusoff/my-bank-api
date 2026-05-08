# MyBank — Authentication (JWT + httpOnly Cookies)

---

## Overview

MyBank uses **stateless JWT tokens** stored in **httpOnly cookies** for authentication.

**Why this approach:**

- ✅ No session database needed
- ✅ Secure by default (httpOnly prevents XSS access)
- ✅ Fast (verify signature, no DB lookup)
- ✅ Scalable (works across multiple servers)

---

## JWT Token Structure

**Header:**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "customer",
  "iat": 1715173200,
  "exp": 1715777200
}
```

**Secret:** Stored in `JWT_SECRET` environment variable (min 32 chars)

**Expiry:** 7 days from issuance

---

## Login Flow

```
1. Client: POST /auth/login
   Body: { email, password }

2. Server: Verify email + password
   ├─ Find user by email
   ├─ Compare bcrypted password
   └─ If valid, generate JWT

3. Server: Issue JWT
   ├─ Create payload: { id, email, role }
   ├─ Sign with JWT_SECRET
   └─ Set httpOnly cookie: token=jwt_token_here

4. Response:
   Status: 200
   Body: { user: { id, email, role }, token }
   Header: Set-Cookie: token=jwt_token; HttpOnly; Secure; SameSite=Strict;

5. Client: Browser auto-stores cookie (httpOnly, secure)
   ├─ XSS cannot access (httpOnly)
   ├─ CSRF protected (SameSite=Strict)
   └─ Sent on every request
```

---

## Token Verification (Middleware)

**Every protected endpoint runs this middleware:**

```javascript
// File: src/shared/middleware/auth.js

const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "NO_TOKEN",
      message: "No authentication token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "INVALID_TOKEN",
      message: err.message,
    });
  }
};

module.exports = { requireAuth };
```

**Usage on routes:**

```javascript
router.post("/transfer", requireAuth, controller.transfer);
// If token invalid or expired, middleware returns 401
// If valid, req.user is populated and controller runs
```

---

## Refresh Token Flow

**Current implementation:** No refresh token (simple 7-day expiry)

**Future upgrade:** Add refresh tokens if needed

- Short-lived access token (1 hour)
- Long-lived refresh token (7 days)
- Client refreshes silently before expiry

---

## Logout Flow

```
1. Client: POST /auth/logout

2. Server:
   ├─ Clear cookie: Set-Cookie: token=; Max-Age=0;
   └─ Response: { success: true }

3. Client: Browser deletes cookie
```

**Note:** JWT is stateless, so no server-side session cleanup needed.

---

## Token Expiry

**Expiry timestamp:** `exp: now + 7 days` (in seconds since epoch)

**On expired token:**

- Middleware: `jwt.verify()` throws "jwt expired"
- Response: 401 Unauthorized
- Client: Should redirect to login

---

## Password Security

**Hashing:**

```javascript
const bcrypt = require("bcryptjs");
const passwordHash = await bcrypt.hash(password, 10);
// salt rounds = 10 (takes ~100ms per hash)
```

**Verification:**

```javascript
const match = await bcrypt.compare(enteredPassword, storedHash);
```

**Constraints:**

- Min 8 characters
- No special requirements (keep simple for demo)
- Hashed with bcrypt (slow by design)

---

## Cookie Security Headers

**Set on login:**

```
Set-Cookie: token=eyJhbGc...;
  HttpOnly;           ← JavaScript cannot access (XSS protection)
  Secure;             ← Only sent over HTTPS
  SameSite=Strict;    ← Not sent on cross-origin requests (CSRF protection)
  Max-Age=604800      ← 7 days
```

**Vercel (HTTPS):** ✅ Secure flag enforced  
**Local dev (HTTP):** ⚠️ Secure flag disabled in development

---

## Check-Token Endpoint

**Purpose:** Verify token + keep session alive on app init

```javascript
// Route: GET /auth/check-token

exports.checkToken = async (req, res) => {
  // This endpoint requires auth middleware
  // If token valid, middleware populates req.user

  try {
    const user = await User.findById(req.user.id).select("-password");
    return success(res, { data: { user } });
  } catch (err) {
    return error(res, { message: "User not found", statusCode: 404 });
  }
};
```

**Usage (client):**

```javascript
// On app init
const response = await fetch("/api/v1/auth/check-token");
if (response.ok) {
  // User is logged in
  const { user } = response.data;
} else if (response.status === 401) {
  // Token expired or invalid, redirect to login
}
```

---

## Security Best Practices

| Practice                     | Implementation                       |
| ---------------------------- | ------------------------------------ |
| **HTTPS only**               | Vercel enforces, local dev uses HTTP |
| **HTTPOnly cookies**         | Prevents XSS token theft             |
| **SameSite=Strict**          | Prevents CSRF attacks                |
| **Bcrypt hashing**           | 10 salt rounds, slow by design       |
| **JWT expiry**               | 7 days, no refresh token (for now)   |
| **No token in localStorage** | Cookie-based only                    |
| **Signature verification**   | Every request checks `jwt.verify()`  |

---

## Common Issues & Fixes

### Issue: "Unauthorized" on every request

**Cause:** Token not in cookie or cookie not sent

**Fix:**

- ✅ Login sets `Set-Cookie` header
- ✅ Browser auto-includes cookie on same-origin requests
- ✅ Check `credentials: 'include'` in fetch/axios

**Code:**

```javascript
// Client
const response = await fetch("/api/v1/accounts", {
  credentials: "include", // Important: send cookies
});
```

---

### Issue: "Token expired" after 7 days

**Cause:** JWT `exp` timestamp passed

**Fix:**

- User logs out and logs in again (gets new token)
- Future: Implement refresh tokens

---

### Issue: Logged in locally, but fails on Vercel

**Cause:** `Secure` flag set to true on HTTPS-only Vercel, but not honored locally

**Fix:**

- `.env.local`: Set `NODE_ENV=development` to allow HTTP
- Vercel: Automatically sets `Secure: true` on HTTPS

---

**Last Updated:** May 8, 2026
