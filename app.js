const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const db = require("./database/models");
const { users, products, pages, sessions } = require("./database/models");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const https = require("http");
const path = require("path");

const app = express();

const server = https.createServer(app);

const io = new Server(server, { cors: { origin: "http://localhost:5173" } });

io.on("connection", (socket) => {
  socket.on("joinRoom", (data) => {
    socket.join(data.room);
  });

  socket.on("sendMessage", (data) => {
    socket.to(data.sender).to(data.receiver).emit("receiveMessage", data);
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

db.sequelize.options.logging = false;
db.sequelize.sync({ alter: true }).then(() => {
  server.listen(process.env.PORT, async () => {
    // await db.prizes.bulkCreate(
    //   [
    //     { ID_prize: 1, prize: "goodies", rest: 50 },
    //     { ID_prize: 2, prize: "objet connecté", rest: 177 },
    //   ],
    //   { ignoreDuplicates: true }
    // );
    console.log(`http://127.0.0.1:${process.env.PORT}`);
  });
});

app.use(express.static("./public/dist/"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
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

const participationRoutes = require("./routes/Participations.js");
app.use("/participation", participationRoutes);

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "dist", "index.html"));
});
