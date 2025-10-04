import Order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createOrder(req, res) {
  if (req.user == null) {
    res.status(403).json({
      message: "Please login and try again",
    });
    return;
  }

  const orderInfo = req.body;

  if (orderInfo.name == null) {
    orderInfo.name = req.user.firstName + " " + req.user.lastName;
  }

  // Use orderId from frontend if provided, otherwise generate one
  let orderId = orderInfo.orderId;

  if (!orderId) {
    // Generate timestamp-based order ID to match frontend format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    orderId = `ORD${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // Check if orderId already exists
  const existingOrder = await Order.findOne({ orderId: orderId });
  if (existingOrder) {
    res.status(400).json({
      message: "Order ID already exists. Please try again.",
    });
    return;
  }
  try {
    let total = 0;
    let labelledTotal = 0;
    const products = [];

    for (let i = 0; i < orderInfo.products.length; i++) {
      const item = await Product.findOne({
        productId: orderInfo.products[i].productId,
      });
      if (item == null) {
        res.status(404).json({
          message:
            "Product with productId " +
            orderInfo.products[i].productId +
            " not found",
        });
        return;
      }
      if (item.isAvailable == false) {
        res.status(404).json({
          message:
            "Product with productId " +
            orderInfo.products[i].productId +
            " is not available right now!",
        });
        return;
      }
      products[i] = {
        productInfo: {
          productId: item.productId,
          name: item.name,
          altNames: item.altNames,
          description: item.description,
          images: item.images,
          labelledPrice: item.labelledPrice,
          price: item.price,
        },
        quantity: orderInfo.products[i].qty,
      };
      //total = total + (item.price * orderInfo.products[i].qty)
      total += item.price * orderInfo.products[i].qty;
      //labelledTotal = labelledTotal + (item.labelledPrice * orderInfo.products[i].qty)
      labelledTotal += item.labelledPrice * orderInfo.products[i].qty;
    }

    const order = new Order({
      orderId: orderId,
      email: req.user.email,
      name: orderInfo.name,
      address: orderInfo.address,
      total: 0,
      phone: orderInfo.phone,
      products: products,
      labelledTotal: labelledTotal,
      total: total,
    });
    const createdOrder = await order.save();
    res.json({
      message: "Order created successfully",
      order: createdOrder,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create order",
      error: err,
    });
  }
}

export async function getOrders(req, res) {
  if (req.user == null) {
    res.status(403).json({
      message: "Please login and try again",
    });
    return;
  }
  try {
    if (req.user.role == "admin") {
      const orders = await Order.find();
      res.json(orders);
    } else {
      const orders = await Order.find({ email: req.user.email });
      res.json(orders);
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: err,
    });
  }
}

export async function updateOrderStatus(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "You are not authorized to update order status",
    });
    return;
  }
  try {
    const orderId = req.params.orderId;
    const status = req.params.status;

    await Order.updateOne(
      {
        orderId: orderId,
      },
      {
        status: status,
      }
    );

    res.json({
      message: "Order status updated successfully",
    });
  } catch (e) {
    res.status(500).json({
      message: "Failed to update order status",
      error: e,
    });
    return;
  }
}
