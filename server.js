require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Order = require("./models/order");

const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
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

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err.message));

/**
 * =========================
 *        API Routes
 * =========================
 */

// Health check route for Vercel root path
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// CREATE order
app.post("/orders", async (req, res) => {
  try {
    const { customerName, orderNumber, product, email, amount, paymentMethod, status } = req.body;
    if (!customerName || !orderNumber || !product || !email || !amount || !paymentMethod || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newOrder = new Order({ customerName, orderNumber, product, email, amount, paymentMethod, status });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

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

// GET single order
app.get("/orders/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// UPDATE order info (user info only, status excluded)
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

// UPDATE order status only
app.patch("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['paid', 'pending', 'cancelled', 'refunded'].includes(status?.toLowerCase())) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: status.toLowerCase() },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Status updated", data: updatedOrder });
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

module.exports = app; // Required for Vercel