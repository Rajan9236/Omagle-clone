// server.js
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

let queue = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add to queue or pair users
  if (queue.length > 0) {
    let partner = queue.pop();
    socket.partner = partner;
    partner.partner = socket;

    socket.emit("partnerFound");
    partner.emit("partnerFound");
  } else {
    queue.push(socket);
  }

  socket.on("message", (msg) => {
    if (socket.partner) socket.partner.emit("message", msg);
  });

  socket.on("disconnect", () => {
    if (socket.partner) socket.partner.emit("partnerLeft");
    if (queue.includes(socket)) {
      queue = queue.filter(s => s !== socket);
    }
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
