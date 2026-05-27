// TrucoPro AR - servidor básico online-ready
// Instalación:
// npm install
// npm start
//
// Este servidor sirve la web y deja preparada la base para salas online con Socket.IO.
// Para producción real hay que agregar auth, base de datos, validación server-side completa y anti-trampas.

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("Usuario conectado", socket.id);

  socket.on("create_room", ({ name }) => {
    const roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
    rooms.set(roomId, { id: roomId, name: name || "Mesa TrucoPro", players: [socket.id], spectators: [] });
    socket.join(roomId);
    socket.emit("room_created", rooms.get(roomId));
    io.emit("rooms_update", Array.from(rooms.values()));
  });

  socket.on("join_room", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return socket.emit("error_message", "La mesa no existe.");
    if (room.players.length < 2) room.players.push(socket.id);
    else room.spectators.push(socket.id);
    socket.join(roomId);
    io.to(roomId).emit("room_update", room);
    io.emit("rooms_update", Array.from(rooms.values()));
  });

  socket.on("game_action", ({ roomId, action }) => {
    // En producción, validar cada acción en el servidor.
    socket.to(roomId).emit("game_action", action);
  });

  socket.on("disconnect", () => {
    for (const [id, room] of rooms.entries()) {
      room.players = room.players.filter(p => p !== socket.id);
      room.spectators = room.spectators.filter(p => p !== socket.id);
      if (room.players.length === 0 && room.spectators.length === 0) rooms.delete(id);
    }
    io.emit("rooms_update", Array.from(rooms.values()));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`TrucoPro AR corriendo en http://localhost:${PORT}`));