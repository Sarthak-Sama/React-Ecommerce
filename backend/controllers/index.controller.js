const productModel = require("../models/product.model");
const paymentModel = require("../models/payment.model");
const orderModel = require("../models/order.model");
const shopModel = require("../models/shop.model.js");

const Razorpay = require("razorpay");
const { messaging } = require("firebase-admin");
const nodemailer = require("nodemailer");

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports.index = async (req, res, next) => {
  res.send("hello word");
};

module.exports.createOrder = async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id);

    const option = {
      amount: product.amount * 100,
      currency: product.currency,
      receipt: `order_rcpt_${product._id}`,
    };

    const order = await instance.orders.create(option);

    res.status(200).json({
      order,
    });
    const payment = await paymentModel.create({
      orderID: order.id,
      amount: product.amount,
      currency: product.currency,
      status: "pending",
    });
  } catch (error) {
    next(error);
  }
};

module.exports.verifyPayment = async (req, res, next) => {
  try {
    const { paymentID, orderID, signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    const {
      validatePaymentVerification,
    } = require("../node_modules/razorpay/dist/utils/razorpay-utils.js");
    const isValid = validatePaymentVerification(
      {
        order_id: orderID,
        payment_id: paymentID,
      },
      signature,
      secret
    );

    if (isValid) {
      const payment = await paymentModel.findOne({ orderID: orderID });

      payment.paymentID = paymentID;
      payment.signature = signature;
      payment.status = "success";

      await payment.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const orderDetails = await orderModel.findById(orderID);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: payment.userEmail,
        subject: "Payment Confirmation",
        text: `Your payment has been verified successfully!\n\nOrder Details:\nOrder ID: ${orderID}\nAmount: ${orderDetails.amount}\nCurrency: ${orderDetails.currency}`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: "Payment verified successfully",
      });
    } else {
      const payment = await paymentModel.findOne({ orderID: orderID });

      payment.status = "failed";

      res.status(400).json({
        message: "Payment failed",
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports.shopDashboard = async (req, res, next) => {
  try {
    const shop = await shopModel.findone({ onwer: req.user._id });
    const products = await productModel.find({ shop: shop._id });
    const orders = await orderModel.find({ shop: shop._id });
    const payments = await paymentModel.find({ shop: shop_id });

    res.status(200).json({
      shop,
      products,
      orders,
      payments,
    });
  } catch (error) {
    next(error);
  }
};
