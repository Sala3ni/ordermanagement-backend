require('dotenv').config();
const mongoose = require("mongoose");
const Order = require("./models/order");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log("MongoDB connected");
    
    await Order.deleteMany({});
    
    await Order.insertMany([
      {
        name: "Zachary Parker",
        orderId: "#27839-00",
        productName: "TV 1",
        status: "paid",
        date: "12 Feb '21",
        method: "card ****819",
        price: 15302
      },
      {
        name: "Mae Walker",
        orderId: "#27839-01",
        productName: "TV 1",
        status: "pending",
        date: "12 Feb '21",
        method: "paypal **@mail.com",
        price: 15302
      },
      {
        name: "Isabelle Vega",
        orderId: "#27839-02",
        productName: "TV 1",
        status: "cancelled",
        date: "12 Feb '21",
        method: "card ****819",
        price: 15302
      },
      {
        name: "Wayne Todd",
        orderId: "#27839-03",
        productName: "TV 1",
        status: "refunded",
        date: "12 Feb '21",
        method: "paypal **@mail.com",
        price: 15302
      },
      {
        name: "Sarah Johnson",
        orderId: "#27839-04",
        productName: "Laptop Pro",
        status: "paid",
        date: "15 Mar '21",
        method: "card ****234",
        price: 89999
      },
      {
        name: "Michael Chen",
        orderId: "#27839-05",
        productName: "Smartphone X",
        status: "pending",
        date: "18 Mar '21",
        method: "paypal **@gmail.com",
        price: 45000
      },
      {
        name: "Emma Davis",
        orderId: "#27839-06",
        productName: "Headphones",
        status: "paid",
        date: "20 Mar '21",
        method: "card ****567",
        price: 12500
      },
      {
        name: "James Wilson",
        orderId: "#27839-07",
        productName: "Gaming Chair",
        status: "cancelled",
        date: "22 Mar '21",
        method: "paypal **@yahoo.com",
        price: 25000
      },
      {
        name: "Lisa Anderson",
        orderId: "#27839-08",
        productName: "Monitor 4K",
        status: "paid",
        date: "25 Mar '21",
        method: "card ****890",
        price: 35000
      },
      {
        name: "David Brown",
        orderId: "#27839-09",
        productName: "Keyboard",
        status: "refunded",
        date: "28 Mar '21",
        method: "paypal **@outlook.com",
        price: 8500
      },
      {
        name: "Jennifer Taylor",
        orderId: "#27839-10",
        productName: "Tablet",
        status: "pending",
        date: "02 Apr '21",
        method: "card ****123",
        price: 28000
      },
      {
        name: "Robert Miller",
        orderId: "#27839-11",
        productName: "Webcam HD",
        status: "paid",
        date: "05 Apr '21",
        method: "paypal **@hotmail.com",
        price: 6500
      },
      {
        name: "Amanda White",
        orderId: "#27839-12",
        productName: "Smart Watch",
        status: "cancelled",
        date: "08 Apr '21",
        method: "card ****456",
        price: 18000
      },
      {
        name: "Kevin Garcia",
        orderId: "#27839-13",
        productName: "Speaker Set",
        status: "paid",
        date: "12 Apr '21",
        method: "paypal **@gmail.com",
        price: 15000
      },
      {
        name: "Rachel Martinez",
        orderId: "#27839-14",
        productName: "External HDD",
        status: "pending",
        date: "15 Apr '21",
        method: "card ****789",
        price: 9500
      }
    ]);
    
    console.log("Dummy data inserted successfully");
  } catch (error) {
    console.error("Error seeding data:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

seedData();