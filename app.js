const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const db = require("./database/models");
const { users, products, pages, sessions } = require("./database/models");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const http = require("http");
const path = require("path");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (data) => {
    socket.join(data.room);
  });

  socket.on("sendMessage", (data) => {
    socket.broadcast.emit("receiveMessage", data);
  });

  socket.on("connectUser", (data) => {
    socket.to(data.room).emit("receiveConnectUser", data);
  });

  socket.on("logoutUser", (data) => {
    socket.to(data.room).emit("receiveLogoutUser", data);
  });

  socket.on("UserInterested", (data) => {
    socket.to(data.room).emit("receiveInterested", data);
  });
});

products.belongsTo(pages, { onDelete: "CASCADE", foreignKey: "pageId" });
users.hasOne(sessions, { foreignKey: "userId" });
sessions.belongsTo(users, { foreignKey: "userId" });

db.sequelize.options.logging = false
db.sequelize.sync().then(() => {
  server.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`http://127.0.0.1:${process.env.PORT}`);
  });
});

app.use(express.static("./public/dist/"));

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.get("Origin") || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Expose-Headers", "Content-Length");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization, Content-Type, X-Requested-With, Range"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  } else {
    return next();
  }
});
app.use(
  cors({
    credentials: true,
  })
);

const refreshRoutes = require("./routes/Refresh.js");
app.use("/refresh", refreshRoutes);

const userRoutes = require("./routes/Users.js");
app.use("/auth", userRoutes);

const trakerRoutes = require("./routes/Trakers.js");
app.use("/traker", trakerRoutes);

const pageRoutes = require("./routes/Pages.js");
app.use("/page", pageRoutes);

const productRoutes = require("./routes/Products.js");
app.use("/product", productRoutes);

const logRoutes = require("./routes/Logs.js");
app.use("/log", logRoutes);

const messageRoutes = require("./routes/Messages.js");
app.use("/message", messageRoutes);

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "dist", "index.html"));
});
