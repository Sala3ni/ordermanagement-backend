const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: String,
  orderId: String,
  productName: String,
  status: String,
  date: String,
  method: String,
  price: Number
});

module.exports = mongoose.model("Order", orderSchema);