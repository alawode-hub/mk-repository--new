const mongoose = require("mongoose");
const dns = require("node:dns");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/userModel");
const Order = require("./models/orderModel");
const connectDB = require("./config/db");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
connectDB();

const products = [
  { name: "MK Collectives Oversized Tee - Black", price: 15000, category: "TOPS", image: "/media/top1.jpg", description: "Premium oversized tee with MK Collectives branding", stock: 10, size: ["S", "M", "L", "XL"], color: ["Black"] },
  { name: "MK Collectives Graphic Tee - White", price: 16000, category: "TOPS", image: "/media/top2.jpg", description: "Bold graphic tee for everyday wear", stock: 10, size: ["S", "M", "L", "XL"], color: ["White"] },
  { name: "MK Collectives Vintage Top - Grey", price: 15000, category: "TOPS", image: "/media/top3.jpg", description: "Vintage wash tee with distressed details", stock: 10, size: ["S", "M", "L", "XL"], color: ["Grey"] },
  { name: "MK Collectives Statement Tee - Red", price: 17000, category: "TOPS", image: "/media/top4.jpg", description: "Make a statement with this bold red tee", stock: 10, size: ["S", "M", "L", "XL"], color: ["Red"] },
  { name: "MK Collectives Y2K Baggy Jeans - Blue Tribal", price: 28000, category: "JEANS", image: "/media/j1.jpg", description: "Y2K inspired baggy jeans with tribal print", stock: 10, size: ["30", "32", "34", "36"], color: ["Blue"] },
  { name: "MK Collectives Wide-leg Cargos - Black", price: 25000, category: "JEANS", image: "/media/j2.jpg", description: "Utility wide-leg cargo pants", stock: 10, size: ["30", "32", "34", "36"], color: ["Black"] },
  { name: "MK Collectives Splatter Denim", price: 30000, category: "JEANS", image: "/media/j3.jpg", description: "Hand-painted splatter effect denim", stock: 10, size: ["30", "32", "34", "36"], color: ["Blue"] },
  { name: "MK Collectives Utility Sweats - Grey", price: 22000, category: "JEANS", image: "/media/j4.jpg", description: "Heavyweight utility sweatpants", stock: 10, size: ["S", "M", "L", "XL"], color: ["Grey"] },
  { name: "MK Collectives Timberland 6\" Premium", price: 45000, category: "SNEAKERS", image: "/media/timberland.jpg", description: "Classic Timberland 6-inch premium boots", stock: 10, size: ["40", "41", "42", "43", "44"], color: ["Brown"] },
  { name: "MK Collectives Sneaker - White", price: 35000, category: "SNEAKERS", image: "/media/sneaker2.jpg", description: "Clean white sneakers for any outfit", stock: 10, size: ["40", "41", "42", "43", "44"], color: ["White"] },
  { name: "MK Collectives Sneaker - Black", price: 38000, category: "SNEAKERS", image: "/media/sneaker3.jpg", description: "Stealth black sneakers", stock: 10, size: ["40", "41", "42", "43", "44"], color: ["Black"] },
  { name: "MK Collectives Sneaker - Retro", price: 40000, category: "SNEAKERS", image: "/media/sneaker4.jpg", description: "Retro inspired chunky sneakers", stock: 10, size: ["40", "41", "42", "43", "44"], color: ["Multi"] },
  { name: "MK Collectives Fitted Cap - Black", price: 8000, category: "CAPS", image: "/media/cap1.jpg", description: "Classic fitted cap in black", stock: 10, size: ["One Size"], color: ["Black"] },
  { name: "MK Collectives Fitted Cap - Navy", price: 8000, category: "CAPS", image: "/media/cap2.jpg", description: "Navy fitted cap with embroidered logo", stock: 10, size: ["One Size"], color: ["Navy"] },
  { name: "MK Collectives Fitted Cap - Green", price: 8000, category: "CAPS", image: "/media/cap3.jpg", description: "Forest green fitted cap", stock: 10, size: ["One Size"], color: ["Green"] },
  { name: "MK Collectives Fitted Cap - Grey", price: 8000, category: "CAPS", image: "/media/cap4.jpg", description: "Heather grey fitted cap", stock: 10, size: ["One Size"], color: ["Grey"] },
  { name: "MK Collectives Essentials Hoodie - Black", price: 22000, category: "HOODIES", image: "/media/hoodie1.jpg", description: "Heavyweight essentials hoodie", stock: 10, size: ["S", "M", "L", "XL"], color: ["Black"] },
  { name: "MK Collectives Graphic Hoodie - Cream", price: 24000, category: "HOODIES", image: "/media/hoodie2.jpg", description: "Cream graphic print hoodie", stock: 10, size: ["S", "M", "L", "XL"], color: ["Cream"] },
  { name: "MK Collectives Zip Hoodie - Grey", price: 23000, category: "HOODIES", image: "/media/hoodie3.jpg", description: "Full zip hoodie in heather grey", stock: 10, size: ["S", "M", "L", "XL"], color: ["Grey"] },
  { name: "MK Collectives Oversized Hoodie - Brown", price: 25000, category: "HOODIES", image: "/media/hoodie4.jpg", description: "Oversized fit hoodie in chocolate brown", stock: 10, size: ["S", "M", "L", "XL"], color: ["Brown"] },
  { name: "MK Collectives Cargo Shorts - Black", price: 18000, category: "SHORT JEANS", image: "/media/short1.jpg", description: "Utility cargo shorts with multiple pockets", stock: 10, size: ["30", "32", "34", "36"], color: ["Black"] },
  { name: "MK Collectives Denim Shorts - Blue", price: 17000, category: "SHORT JEANS", image: "/media/short2.jpg", description: "Classic denim shorts", stock: 10, size: ["30", "32", "34", "36"], color: ["Blue"] },
  { name: "MK Collectives Utility Shorts - Khaki", price: 18000, category: "SHORT JEANS", image: "/media/short3.jpg", description: "Khaki utility shorts", stock: 10, size: ["30", "32", "34", "36"], color: ["Khaki"] },
  { name: "MK Collectives Baggy Shorts - Grey", price: 19000, category: "SHORT JEANS", image: "/media/short4.jpg", description: "Baggy fit shorts in grey", stock: 10, size: ["30", "32", "34", "36"], color: ["Grey"] },
];

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    
    console.log("Old data deleted");
    
    await Product.insertMany(products);
    console.log("24 Products Imported Successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();