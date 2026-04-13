# My Bank API

Secure banking API with customer onboarding, account management, expenses, and real-time transactions. Built with Node.js, Express, and MongoDB.

## 🚀 Production Deployment

**Live API**: https://my-bank-api-p57h.onrender.com

### Quick Test
```bash
# Health check
curl https://my-bank-api-p57h.onrender.com/health

# Authentication
curl -X POST https://my-bank-api-p57h.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}'
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT with refresh tokens
- **Security**: bcryptjs, rate limiting, CORS
- **Real-time**: Socket.io for notifications
- **Validation**: express-validator

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 14+
- MongoDB (local or Atlas)

### Setup
```bash
git clone https://github.com/KhairiYusoff/my-bank-api.git
cd my-bank-api
npm install
```

### Environment Variables
Create `.env` file:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5001
NODE_ENV=development
```

### Run
```bash
npm run dev  # Development
npm start    # Production
```

## 📋 API Features

### Core Banking
- ✅ Customer onboarding workflow
- ✅ Account creation & management
- ✅ Secure fund transfers
- ✅ Transaction history
- ✅ Balance management

### Security
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (admin/banker/customer)
- ✅ Request validation & rate limiting
- ✅ CORS configuration
- ✅ Password hashing with bcrypt

### Real-time Features
- ✅ WebSocket notifications
- ✅ Live application updates
- ✅ Staff activity monitoring

## 🔐 Security

- **Authentication**: JWT with HttpOnly cookies
- **Authorization**: Role-based middleware
- **Data Protection**: Input validation, sanitization
- **Transport**: HTTPS enforced, CORS secured
- **Rate Limiting**: DDoS protection

## 📊 Production Status

- ✅ **Deployed**: Render
- ✅ **Database**: MongoDB Atlas
- ✅ **Monitoring**: Health checks, activity logging
- ✅ **24/7 Available**: Always online for demos
- ✅ **Security**: Production-hardened configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is for learning and demonstration purposes.

