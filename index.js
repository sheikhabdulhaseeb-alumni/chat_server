const http = require("http");
const socketIo = require("socket.io");

// Create a basic HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<h1>Socket.IO Server is Running!</h1>`);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);
});

// clients map to track connected clients
const connectedClients = {};  // Store users and their socket IDs

// Create Socket.IO server
const io = socketIo(server);

io.use((socket, next) => {
  const token = socket.handshake.headers.authorization;
  connectedClients[`${token}`] = socket.id; // Store the user's token and socket ID
  if (true) {
    return next();
  }
  return next(new Error("invalid token"));
});

// Handle Socket.IO connection
io.on("connection", (socket) => {

    socket.on("message", (payload) => {
        const { message, target } = payload;
        const receiverSocketId = connectedClients[target];
        io.to(receiverSocketId).emit("on_message", message);
    }
    );
});
