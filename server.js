const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connection = require("./src/config/db");
const app = express();
const port = process.env.PORT || 5000;
const userRoute = require("./src/routes/userRoutes");
const { createManager } = require("./src/config/admin.setup");

// Middleware
// Define allowed origins
const allowedOrigins = [
  "http://localhost:5173", // your frontend dev server
  "https://elimart.netlify.app",
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
app.use(morgan("dev"));

connection();
// createManager
app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use("/api/user", userRoute);

app.listen(port, () => {
  console.log(`Mart backend running on port ${port}`);
});
