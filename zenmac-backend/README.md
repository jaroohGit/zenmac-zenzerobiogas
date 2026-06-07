# zenmac-backend

TypeScript backend for ZenMAC frontend.

## Features

- REST API for frontend state and control commands
- Socket.io realtime bridge
- MQTT subscribe and publish bridge
- LINE webhook sender endpoint

## Run locally

1. Install dependencies

```bash
npm install
```

2. Copy env template and edit values

```bash
cp .env.example .env
```

3. Start in dev mode

```bash
npm run dev
```

4. Build and run production

```bash
npm run build
npm start
```

Default port: `3323`
