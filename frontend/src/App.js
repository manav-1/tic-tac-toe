import { useState, useEffect } from "react";
import { socket } from "./socket";
import "./App.css";

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value ? (socket.id === value ? "X" : "O") : null}
    </button>
  );
}

function Board({ squares }) {
  function handleClick(i) {
    socket.emit("move", i);
  }

  return (
    <>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

export default function Game() {
  const [connected, setConnected] = useState(false);
  const [currentSquares, setCurrentSquares] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }

    function onDisconnect() {
      setConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("gameUpdate", (gameHistory) => {
      console.log("gameUpdate", gameHistory);
      setCurrentSquares(gameHistory);
    });

    socket.on("winner", (winner) => {
      setWinner(winner);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  if (!connected) {
    return <div>Disconnected, Please wait for your turn</div>;
  }

  return (
    <div className="game">
      <div className="game-board">
        {winner ? (
          winner === socket.id ? (
            <div>You have won the game</div>
          ) : (
            <div>You lost the game</div>
          )
        ) : null}
        <Board squares={currentSquares} />
      </div>
    </div>
  );
}
