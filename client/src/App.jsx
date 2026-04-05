import { useState } from "react";
import socket from "./socket";
import Navbar from "./components/Navbar";
import Game from "./components/Game";

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  function handleJoin(e) {
    e.preventDefault();
    if (username.trim() === "") return;

    socket.emit("join", { username: username.trim() });
    setJoined(true);
  }

  if (!joined) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-96">
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Virtual Cosmos
          </h1>
          <p className="text-gray-400 text-center mb-6">
            Enter the cosmos and meet people nearby
          </p>

          <form onSubmit={handleJoin}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name..."
              maxLength={15}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg cursor-pointer transition-colors"
            >
              Enter Cosmos
            </button>
          </form>

          <p className="text-gray-500 text-xs text-center mt-4">
            Move with Arrow keys. Get close to others to chat!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <Navbar username={username} />
      <Game username={username} />
    </div>
  );
}

export default App;
