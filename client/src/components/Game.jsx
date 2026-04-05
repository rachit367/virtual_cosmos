import { useState, useEffect, useRef, useCallback } from "react";
import { Application, extend, useApplication, useTick } from "@pixi/react";
import { Container, Graphics, Text } from "pixi.js";
import socket from "../socket";
import Player from "./Player";
import ChatPanel from "./ChatPanel";

extend({ Container, Graphics, Text });

const SPEED = 3;
const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;
const PROXIMITY_RADIUS = 150;

function GameWorld({
  allPlayers,
  myPosition,
  setMyPosition,
  keysPressed,
  lastEmitTime,
  setNearbyPlayers,
}) {
  const { app } = useApplication();

  const posRef = useRef(myPosition);
  const playersRef = useRef(allPlayers);

  posRef.current = myPosition;
  playersRef.current = allPlayers;

  useTick(() => {
    const keys = keysPressed.current;
    let { x, y } = posRef.current;
    let moved = false;

    if (keys.has("arrowup")) {
      y -= SPEED;
      moved = true;
    }
    if (keys.has("arrowdown")) {
      y += SPEED;
      moved = true;
    }
    if (keys.has("arrowleft")) {
      x -= SPEED;
      moved = true;
    }
    if (keys.has("arrowright")) {
      x += SPEED;
      moved = true;
    }

    x = Math.max(20, Math.min(WORLD_WIDTH - 20, x));
    y = Math.max(20, Math.min(WORLD_HEIGHT - 20, y));

    if (moved) {
      setMyPosition({ x, y });

      const now = Date.now();
      if (now - lastEmitTime.current > 50) {
        socket.emit("playerMove", { x, y });
        lastEmitTime.current = now;
      }
    }

    const nearby = [];
    const currentPlayers = playersRef.current;

    for (const [id, player] of Object.entries(currentPlayers)) {
      if (id === socket.id) continue;

      const dx = player.x - x;
      const dy = player.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < PROXIMITY_RADIUS) {
        nearby.push(id);
      }
    }

    setNearbyPlayers(nearby);
  });

  const screenW = app?.screen?.width || 800;
  const screenH = app?.screen?.height || 600;
  const camX = -(myPosition.x - screenW / 2);
  const camY = -(myPosition.y - screenH / 2);

  const drawBackground = useCallback((g) => {
    g.clear();

    g.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    g.fill({ color: 0x111827 });

    const gridSize = 100;
    for (let i = 0; i <= WORLD_WIDTH; i += gridSize) {
      g.moveTo(i, 0);
      g.lineTo(i, WORLD_HEIGHT);
    }
    for (let j = 0; j <= WORLD_HEIGHT; j += gridSize) {
      g.moveTo(0, j);
      g.lineTo(WORLD_WIDTH, j);
    }
    g.stroke({ color: 0x1f2937, alpha: 0.5, width: 1 });

    g.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    g.stroke({ color: 0x374151, width: 2 });
  }, []);

  return (
    <pixiContainer x={camX} y={camY}>
      <pixiGraphics draw={drawBackground} />

      {Object.entries(allPlayers).map(([id, player]) => (
        <Player
          key={id}
          x={id === socket.id ? myPosition.x : player.x}
          y={id === socket.id ? myPosition.y : player.y}
          color={player.color}
          username={player.username}
          isMe={id === socket.id}
        />
      ))}
    </pixiContainer>
  );
}

function Game() {
  const [allPlayers, setAllPlayers] = useState({});
  const [myPosition, setMyPosition] = useState({ x: 400, y: 400 });
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight - 56,
  });

  const keysPressed = useRef(new Set());
  const lastEmitTime = useRef(0);

  useEffect(() => {
    function handleKeyDown(e) {
      keysPressed.current.add(e.key.toLowerCase());
    }
    function handleKeyUp(e) {
      keysPressed.current.delete(e.key.toLowerCase());
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight - 56,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    socket.on("currentPlayers", (players) => {
      setAllPlayers(players);
      if (players[socket.id]) {
        setMyPosition({
          x: players[socket.id].x,
          y: players[socket.id].y,
        });
      }
    });

    socket.on("playerJoined", ({ socketId, username, x, y, color }) => {
      setAllPlayers((prev) => ({
        ...prev,
        [socketId]: { username, x, y, color },
      }));
    });

    socket.on("playerMoved", ({ socketId, x, y }) => {
      setAllPlayers((prev) => ({
        ...prev,
        [socketId]: { ...prev[socketId], x, y },
      }));
    });

    socket.on("playerLeft", ({ socketId }) => {
      setAllPlayers((prev) => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
    });

    return () => {
      socket.off("currentPlayers");
      socket.off("playerJoined");
      socket.off("playerMoved");
      socket.off("playerLeft");
    };
  }, []);

  return (
    <div className="flex-1 flex relative overflow-hidden">
      <div className="flex-1">
        <Application
          width={nearbyPlayers.length > 0 ? windowSize.width - 320 : windowSize.width}
          height={windowSize.height}
          background="#111827"
        >
          <GameWorld
            allPlayers={allPlayers}
            myPosition={myPosition}
            setMyPosition={setMyPosition}
            keysPressed={keysPressed}
            lastEmitTime={lastEmitTime}
            setNearbyPlayers={setNearbyPlayers}
          />
        </Application>
      </div>

      {nearbyPlayers.length > 0 && <ChatPanel />}
    </div>
  );
}

export default Game;
