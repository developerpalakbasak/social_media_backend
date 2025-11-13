import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import indexRouter from "./routes/indexRoutes.js";
import error from "./middleware/error.js";

const app = express();

app.use(morgan("dev"));

app.use(cors({
  origin: process.env.FRONTEND_URL,
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
