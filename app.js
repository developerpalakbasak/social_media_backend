import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import indexRouter from "./routes/indexRoutes.js";
import error from "./middleware/error.js";

const app = express();

app.use(morgan("dev"));

// app.use(cors({
//   origin: process.env.CLIENT_URI || "http://localhost:5173",
//   credentials: true
// }));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://192.168.0.101:5173"  // ← replace with your actual IP
  ],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(indexRouter);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use(error);

export default app;
