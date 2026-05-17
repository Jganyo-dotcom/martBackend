const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connection = require("./src/config/db");
const app = express();
const port = process.env.PORT || 5000;
const userRoute = require("./src/routes/userRoutes");
const productRoute = require("./src/routes/products");
const { createManager } = require("./src/config/admin.setup");
const loggerMiddleware = require("./src/middlewares/logger");

// Middleware
// Define allowed origins
const allowedOrigins = [
  "http://localhost:5173", // your frontend dev server
  "https://elimart.netlify.app",
  "http://127.0.0.1:5500",
  // example deployed frontend
];

// Configure CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  }),
);
app.use(express.json());
// app.use(loggerMiddleware)
app.use(morgan("dev"));

connection();
// createManager
app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use("/api/user", userRoute);
app.use("/api/product", productRoute);

app.listen(port, () => {
  console.log(`Mart backend running on port ${port}`);
});
