const { randomUUID } = require("crypto");
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
  socket.user = {id: token};
  connectedClients[`${token}`] = socket.id; // Store the user's token and socket ID
  if (true) {
    return next();
  }
  return next(new Error("invalid token"));
});

// Handle Socket.IO connection
io.on("connection", (socket) => {

      // Log all existing rooms
      const getRooms = () => {
        const rooms = Array.from(io.sockets.adapter.rooms.keys()); // Get all room names
        console.log("Existing rooms:", rooms);
    };

  
  socket.on("create_room", (payload, callback) => {
    const { title, members, type } = payload;
    const room_id = randomUUID();

    // Create a new room
    socket.join(room_id);

    const conversation_members = members.map(member => {
      const memberSocketId = connectedClients[member]; // Get socket ID

      if (memberSocketId) {
        const memberSocket = io.sockets.sockets.get(memberSocketId); // Get actual socket object
        if (memberSocket) {
            memberSocket.join(room_id); // Now join the room correctly
        }
    }
      return {
        user: member,
        conversation_id: room_id
      }
    })

    const conversation = {
      id: room_id,
      title,
      room_id: randomUUID(),
      user: socket.user,
      type: type,
      created_at: new Date()
    }

    // Save the conversation to the database



    // push user into conversation_members
    conversation_members.push({
      user: socket.user.id,
      conversation_id: conversation.id
    });

    // Save the conversation members to the database

    // logs rooms
    getRooms();

    callback?.({ conversation: conversation });
  });
  
  socket.on("message", (payload, callback) => {
      const { message, target } = payload;
      const receiverSocketId = connectedClients[target];
      io.to(receiverSocketId).emit("on_message", message);

      callback?.({ message: message });
  });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});
