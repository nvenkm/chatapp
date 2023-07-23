// const { log } = require("console");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
var io = require("socket.io")(server);
const formatMessage = require("./utils/messages"); //my own module
// const { join } = require("path");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getUserByName,
} = require("./utils/users");

// const port = 3000 || process.env.PORT;
const port = 3000;

app.use(express.static(__dirname));
//setting the static folder
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//client connected
io.on("connection", (socket) => {
  socket.on("join-room", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //welcome the user
    socket.emit("message", formatMessage("ChatApp", "Welcome !"));

    //when a new user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("ChatApp", `${user.username} has joined the chat`)
      );

    //update the user list
    io.to(user.room).emit("room-users", getRoomUsers(user.room));
    // io.to(user.room).emit("room-users", {
    //   room: user.room,
    //   user: getRoomUsers(user.room),
    // });
  });

  //
  socket.on("chat-message", (data) => {
    const user = getCurrentUser(socket.id);
    if (data.privateChat == user.room) {
      socket.broadcast
        .to(data.privateChat)
        .emit("message", formatMessage(user.username, data.message));
    } else {
      const sendUser = getUserByName(data.privateChat);
      // console.log(sendUser.id);
      socket
        .to(sendUser.id)
        .emit("message", formatMessage(user.username, data.message));
    }
  });

  // socket.on("chat-message", (message, privateChat) => {
  //   const user = getCurrentUser(socket.id);

  //   io.to(privateChat).emit("message", formatMessage(user.username, message));
  // });

  socket.on("user-typing", (data) => {
    socket.broadcast.emit("user-typing", data);
  });

  socket.on("user-stopped-typing", function () {
    socket.broadcast.emit("user-stopped-typing");
  });

  // when user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("ChatApp", `${user.username} has left the chat!`)
      );

      //remove the user from the user list
      io.to(user.room).emit("room-users", getRoomUsers(user.room));
    }
  });
});

server.listen(port, () => {
  console.log("Server running on " + port);
});
