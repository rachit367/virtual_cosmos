import { useState, useEffect } from "react";
import socket from "../socket";

function Navbar({ username }) {
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    socket.on("currentPlayers", (players) => {
      setPlayerCount(Object.keys(players).length);
    });

    socket.on("playerJoined", () => {
      setPlayerCount((prev) => prev + 1);
    });

    socket.on("playerLeft", () => {
      setPlayerCount((prev) => Math.max(0, prev - 1));
    });

    return () => {
      socket.off("currentPlayers");
      socket.off("playerJoined");
      socket.off("playerLeft");
    };
  }, []);

  return (
    <div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between shadow-lg z-10">
      <h1 className="text-xl font-bold tracking-wide">
        Virtual Cosmos
      </h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">
            Online: {playerCount}
          </span>
        </div>

        <div className="bg-gray-700 px-3 py-1 rounded-full text-sm">
          {username}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
