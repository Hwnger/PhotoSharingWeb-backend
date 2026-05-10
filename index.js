const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");  
const multer = require("multer");
const dbConnect = require("./db/dbConnect");

const userRouter = require("./routes/userRouter");
const photoRouter = require("./routes/photoRouter");
const adminRouter = require("./routes/adminRouter");    
const commentRouter = require("./routes/commentRouter"); 

dbConnect();

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true                 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "your_secret_key_here_change_this",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,     
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000  
  }
}));

app.use("/images", express.static("images"));

app.use("/user", userRouter);
app.use("/", photoRouter);           
app.use("/admin", adminRouter);      
app.use("/", commentRouter);         

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "FILE_TOO_LARGE") {
      return res.status(400).json({ error: "File too large (max 5MB)" });
    }
  }
  if (error.message === "Only image files are allowed") {
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});