// Import necessary modules
import express from "express";
import connectDB from "./Config/database.config.js";
import blogRoutes from "./Routes/blog.routes.js";
import userRoutes from "./Routes/user.routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Routes
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/users", userRoutes);

// Home Route
app.get("/", (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Portfolio API</title>
      <style>
        body {
          margin: 0;
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          background: white;
          padding: 50px 60px;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          text-align: center;
        }
        h1 {
          color: #667eea;
          margin: 0 0 10px 0;
          font-size: 2.5em;
        }
        p {
          color: #666;
          margin: 10px 0;
          font-size: 1.1em;
        }
        .status {
          color: #4ade80;
          font-weight: bold;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Portfolio API</h1>
        <p>RESTful Backend Service</p>
        <p class="status">✓ Server Running on Port ${port}</p>
      </div>
    </body>
    </html>
  `);
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
