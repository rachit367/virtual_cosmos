import { useState, useEffect, useRef } from "react";
import socket from "../socket";

function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chatMessage");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (inputText.trim() === "") return;

    socket.emit("chatMessage", { message: inputText.trim() });
    setInputText("");
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-bold text-lg">Nearby Chat</h2>
        <p className="text-gray-400 text-xs">
          You're close to someone! Say hi
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-4">
            No messages yet. Start chatting!
          </p>
        )}

        {messages.map((msg, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-3">
            <span className="text-blue-400 text-sm font-bold">
              {msg.sender}:
            </span>
            <span className="text-white text-sm ml-2">{msg.message}</span>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatPanel;
