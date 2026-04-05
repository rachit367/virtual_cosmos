# Virtual Cosmos

its basically a 2D multiplayer virtual space where you can walk around and if you get close to another player a chat opens up. move away and it disconnects. kinda like those virtual office apps

## tech stack

- React (Vite) + PixiJS + Tailwind for frontend
- Node.js + Express + Socket.IO for backend
- MongoDB for storing users

## how to run

you need Node.js (v18+) and MongoDB installed

```bash
git clone <your-repo-url>
cd virtual-cosmos
```

start the server

```bash
cd server
npm install
npm run dev
```

open another terminal and start the client

```bash
cd client
npm install
npm run dev
```

or if you have docker just run

```bash
docker-compose up --build
```

then go to http://localhost:5173

## how to test

open two tabs, enter different names, move around with WASD or arrow keys. when you get close to the other player the chat panel shows up on the right side. send a message and it only goes to nearby players. move away and the chat goes away

## project structure

```
virtual-cosmos/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Game.jsx
│   │   │   ├── Player.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   └── Navbar.jsx
│   │   ├── App.jsx
│   │   ├── socket.js
│   │   └── main.jsx
│   └── ...
│
├── server/
│   ├── models/User.js
│   ├── index.js
│   └── .env
│
└── docker-compose.yml
```

## features

- realtime multiplayer with socket.io
- proximity based chat that auto connects/disconnects
- smooth movement at 60fps
- camera follows your player
- shows a radius around you so you know your range
- online player count in navbar
- saves user data to mongodb
