require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Order = require("./models/order");

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,             // deployed frontend URL
  "http://localhost:5173",              // Vite dev server
                
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
  
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: "Invalid JSON format" });
  }
  next();
});

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err.message));

// ===== Routes =====

// GET orders with filter & pagination
app.get("/orders", async (req, res) => {
  try {
    const { status, page = 1, limit = 8 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 8));
    
    const query = {};
    if (status && ['paid', 'pending', 'cancelled', 'refunded'].includes(status.toLowerCase())) {
      query.status = status.toLowerCase();
    }

    const [result] = await Order.aggregate([
      { $match: query },
      {
        $facet: {
          data: [
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum }
          ],
          count: [{ $count: "total" }]
        }
      }
    ]);

    const total = result.count[0]?.total || 0;
    const orders = result.data;

    res.json({ total, page: pageNum, limit: limitNum, data: orders });
  } catch (err) {
    console.error("Error fetching orders:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// UPDATE order info
app.put("/orders/:id", async (req, res) => {
  try {
    const { name, orderId, productName, price, method, date } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { name, orderId, productName, price, method, date },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated", data: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE order
app.delete("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
