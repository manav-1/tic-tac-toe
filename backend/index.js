import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const gameHistory = Array(9).fill(null);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

const players = [];

let turn = null;
let winner = null;

io.on("connection", (socket) => {
  console.log("A user connected");
  console.log(gameHistory, calculateWinner(gameHistory));

  if (players.length === 2) {
    socket.disconnect();
    return;
  }

  if (players.length < 2) {
    players.push(socket.id);
  }
  if (players.length === 2) {
    turn = players[0];
  }

  socket.on("move", (squareNumber) => {
    // if only one player in the lobby, do nothing
    if (players.length < 2) {
      return;
    }
    // if it's not your turn, do nothing
    if (turn !== socket.id) {
      return;
    }
    // if the square is already filled, do nothing
    if (gameHistory[squareNumber] !== null) {
      return;
    }

    if (winner) {
      io.emit("winner", null);
    }

    gameHistory[squareNumber] = turn;
    turn = turn === players[0] ? players[1] : players[0];
    io.emit("gameUpdate", gameHistory);
    winner = calculateWinner(gameHistory);
    if (winner) {
      io.emit("winner", winner);
      gameHistory.fill(null);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    // remove the player from the game and restart the game with empty history
    players.splice(players.indexOf(socket.id), 1);
    gameHistory.fill(null);
  });
});

server.listen(3005, () => {
  console.log("Server is running on http://localhost:3005");
});
