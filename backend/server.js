const express  = require('express');
const mongoose = require('mongoose'); // ✅ MUST be before usage
const cors     = require('cors');
const path     = require('path');
const dotenv   = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/properties',   require('./routes/properties'));
app.use('/api/inquiries',    require('./routes/inquiries'));
app.use('/api/favorites',    require('./routes/favorites'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/owner',        require('./routes/owner'));
app.use('/api/bookings',     require('./routes/bookings'));
app.use('/api/transactions', require('./routes/transactions'));

// Health route
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'GBRentals API running', timestamp: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥', err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Port
const PORT = process.env.PORT || 5000;

// Safety check
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env');
  process.exit(1);
}

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB:', err.message);
    process.exit(1);
  });