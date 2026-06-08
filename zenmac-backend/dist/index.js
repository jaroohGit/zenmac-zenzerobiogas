#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const mqtt_1 = __importDefault(require("mqtt"));
const PORT = Number.parseInt(process.env.PORT || "3323", 10);
const HOST = process.env.HOST || "0.0.0.0";
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || "mqtt://host.docker.internal:1884";
const MQTT_TOPICS = [
    "zenzero/hmi/kd",
    "zenzero/hmi/kd1",
    "zenzero/hmi/kd2",
    "zenzero/hmi/kd4",
    "zenzero/hmi/kd5",
];
const ZENMAC_TOPIC = "Demo/zenmac/QQ";
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const LINE_DEFAULT_TO = process.env.LINE_DEFAULT_TO || "";
const LINE_WEBHOOK_TOKEN = process.env.LINE_WEBHOOK_TOKEN || "";
const LINE_PUSH_ENDPOINT = "https://api.line.me/v2/bot/message/push";
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json());
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ["websocket", "polling"],
});
const topicMap = {
    "zenzero/hmi/kd": "kd",
    "zenzero/hmi/kd1": "kd1",
    "zenzero/hmi/kd2": "kd2",
    "zenzero/hmi/kd4": "kd4",
    "zenzero/hmi/kd5": "kd5",
};
const historyPoints = new Map();
const MAX_HISTORY_POINTS = 500;
const devices = [];
const mqttStatus = {
    connected: false,
    broker: MQTT_BROKER_URL,
    reconnecting: false,
};
let lastZenmac = {};
let mqttData = {
    kd: {},
    kd1: {},
    kd2: {},
    kd4: {},
    kd5: {},
};
const blowerAccum = {
    tb1: { kwhToday: 0, runSeconds: 0, lastStatus: 'STOP', runStartTs: 0, lastKw: 0, lastSampleTs: Date.now() },
    tb2: { kwhToday: 0, runSeconds: 0, lastStatus: 'STOP', runStartTs: 0, lastKw: 0, lastSampleTs: Date.now() },
};
let todayDate = new Date().toDateString();
function val(v, fallback = 0) {
    if (Array.isArray(v))
        return v[0] != null ? Number(v[0]) : fallback;
    return v != null ? Number(v) : fallback;
}
function zeroHistory() {
    const labels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0") + ":00");
    const zeros = Array(24).fill(0);
    return {
        labels,
        processFlow: zeros,
        serumFlow: zeros,
        processSensorORP: zeros,
        processSensorPH: zeros,
        processSensorTemp: zeros,
        serumSensorORP: zeros,
        serumSensorPH: zeros,
        serumSensorTemp: zeros,
        blower1Flow: zeros,
        blower1Power: zeros,
        blower1DTemp: zeros,
        blower1SPress: zeros,
        blower2Flow: zeros,
        blower2Power: zeros,
    };
}
function checkMidnightReset() {
    const now = new Date().toDateString();
    if (now !== todayDate) {
        todayDate = now;
        const ts = Date.now();
        for (const b of [blowerAccum.tb1, blowerAccum.tb2]) {
            b.kwhToday = 0;
            b.runSeconds = 0;
            if (b.lastStatus === 'RUN')
                b.runStartTs = ts;
        }
    }
}
function updateBlowerAccum(key, status, kw) {
    checkMidnightReset();
    const now = Date.now();
    const b = blowerAccum[key];
    // kWh integration — cap sample gap at 5 min to avoid first-boot spike
    const dtHours = Math.min((now - b.lastSampleTs) / 3_600_000, 5 / 60);
    if (b.lastStatus === 'RUN')
        b.kwhToday += b.lastKw * dtHours;
    // run-time tracking
    if (b.lastStatus !== 'RUN' && status === 'RUN')
        b.runStartTs = now;
    if (b.lastStatus === 'RUN' && status !== 'RUN') {
        if (b.runStartTs > 0)
            b.runSeconds += (now - b.runStartTs) / 1000;
        b.runStartTs = 0;
    }
    b.lastStatus = status;
    b.lastKw = kw;
    b.lastSampleTs = now;
}
function getRunHours(key) {
    const b = blowerAccum[key];
    let secs = b.runSeconds;
    if (b.lastStatus === 'RUN' && b.runStartTs > 0)
        secs += (Date.now() - b.runStartTs) / 1000;
    return +(secs / 3600).toFixed(2);
}
function mapMqttToLive() {
    const d0 = mqttData.kd || {};
    const d1 = mqttData.kd1 || {};
    const d2 = mqttData.kd2 || {};
    const d4 = mqttData.kd4 || {};
    const d5 = mqttData.kd5 || {};
    const processTotal = val(d2.Process_Flow_M3_Total, val(d5.Process_Flow_M3_Total, 0));
    const serumTotal = val(d2.Serum_Flow_M3_Total, val(d5.Serum_Flow_M3_Total, 0));
    const energyTotalKwh = val(d2.Total_kWh, val(d5.Total_kWh, 0));
    return {
        ts: new Date().toISOString(),
        processFlow: +val(d0["Process Flow m3_hr (Real)"]).toFixed(2),
        serumFlow: +val(d0["Serum Flow m3_hr (real)"]).toFixed(2),
        processSensor: {
            orp: Math.round(val(d4.Process_ORP_Lock_hr)),
            ph: +val(d4.Process_pH_Lock_hr, 0).toFixed(2),
            temp: +val(d4.Process_Temp_Lock_hr, 0).toFixed(1),
        },
        serumSensor: {
            orp: Math.round(val(d4.Serum_ORP_Lock_hr)),
            ph: +val(d4.Serum_PH_Lock_hr, 0).toFixed(2),
            temp: +val(d4.Serum_Temp_Lock_hr, 0).toFixed(1),
        },
        blower1: {
            status: d5["TB-01_Status"] === 1 || d5["TB-01_Status"] === "ON" ? "RUN" : "STOP",
            kw: +val(d1["TB_1_BLOWER POWER_kW"]).toFixed(2),
            flow: +val(d1["TB_1_SUCTION FLOW RATE_CMM"]).toFixed(2),
            current: +val(d1["TB_1_MOTOR CURRENT_A"]).toFixed(2),
            dischargePres: Math.round(val(d1["TB_1_DISCHARGE PRESSURE_mmAq"])),
            suctionPres: Math.round(val(d1.TB_1_Suction_pressure_mmAq, val(d1["TB_1_SUCTION PRRESSURE_mmAq"], 0))),
            dischargeTemp: +val(d1["TB_1_DISCHARGE TEMPERATURE_C"]).toFixed(1),
            motorTemp: +val(d1["TB_1_MOTOR TEMPERATURE_C"]).toFixed(1),
            driveTemp: +val(d1["TB_1_DRIVE TEMPERATURE_C"]).toFixed(1),
            outsideTemp: +val(d1["TB_1_OUTSIDE TEMPERATURE_C"]).toFixed(1),
            onOffCount: Math.round(val(d1["TB_1_Number of ON OFF"], val(d1["TB_1_NUMBER OF ON/OFF"], 0))),
            runHoursToday: getRunHours('tb1'),
            kwhToday: +blowerAccum.tb1.kwhToday.toFixed(2),
        },
        blower2: {
            status: d5["TB-02_Status"] === 1 || d5["TB-02_Status"] === "ON" ? "RUN" : "STOP",
            kw: +val(d1["TB_2_BLOWER POWER_kW"]).toFixed(2),
            flow: +val(d1["TB_2_SUCTION FLOW RATE_CMM"]).toFixed(2),
            current: +val(d1["TB_2_MOTOR CURRENT_A"]).toFixed(2),
            dischargePres: Math.round(val(d1["TB_2_DISCHARGE PRESSURE_mmAq"])),
            suctionPres: Math.round(val(d1.TB_2_Suction_pressure_mmAq)),
            dischargeTemp: +val(d1["TB_2_DISCHARGE TEMPERATURE_C"]).toFixed(1),
            motorTemp: +val(d1["TB_2_MOTOR TEMPERATURE_C"]).toFixed(1),
            driveTemp: +val(d1["TB_2_DRIVE TEMPERATURE_C"]).toFixed(1),
            outsideTemp: +val(d1["TB_2_OUTSIDE TEMPERATURE_C"]).toFixed(1),
            onOffCount: Math.round(val(d1["TB_2_Number of ON OFF"])),
            runHoursToday: getRunHours('tb2'),
            kwhToday: +blowerAccum.tb2.kwhToday.toFixed(2),
        },
        processPump: { status: d5["Process pump_Status"] === 1 || d5["Process pump_Status"] === "ON" ? "RUN" : "STOP" },
        serumPump: { status: d5["Serum pump_Status"] === 1 || d5["Serum pump_Status"] === "ON" ? "RUN" : "STOP" },
        processFlowDay: Math.round(val(d5["Process Flow M3_Day_real"])),
        serumFlowDay: Math.round(val(d5["Serum Flow M3_Day_real"])),
        totalFlowDay: Math.round(val(d5["Process+Serum Flow M3_Day_real"])),
        processFlowYest: Math.round(val(d2["Process Flow M3_Day_Lock_yesterday"])),
        serumFlowYest: Math.round(val(d2["Serum Flow M3_Day_Lock_yesterday"])),
        processTotal: +processTotal.toFixed(1),
        serumTotal: +serumTotal.toFixed(1),
        energy: {
            kw: +val(d1.Total_Power_kW).toFixed(2),
            current: +val(d1.Total_Current_A).toFixed(1),
            voltLL: +val(d1.Volt_LL_V).toFixed(1),
            voltLN: +val(d1.Volt_LN_V).toFixed(1),
            pf: +val(d1.Power_Factor).toFixed(3),
            hz: +val(d1.Frequency_Hz).toFixed(2),
            totalKwh: +energyTotalKwh.toFixed(1),
        },
    };
}
function pushHistory(topicKey, data) {
    for (const [field, raw] of Object.entries(data)) {
        const num = Number(raw);
        if (Number.isNaN(num))
            continue;
        const key = `${topicKey}.${field}`;
        const arr = historyPoints.get(key) || [];
        arr.push(num);
        if (arr.length > MAX_HISTORY_POINTS)
            arr.shift();
        historyPoints.set(key, arr);
    }
}
function isAuthorizedWebhook(req) {
    if (!LINE_WEBHOOK_TOKEN)
        return true;
    const provided = req.header("x-webhook-token") || "";
    return provided === LINE_WEBHOOK_TOKEN;
}
async function sendLineTextMessage({ to, text }) {
    if (!LINE_CHANNEL_ACCESS_TOKEN) {
        throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
    }
    if (!to) {
        throw new Error("Missing LINE recipient id (to)");
    }
    if (!text || typeof text !== "string") {
        throw new Error("Missing message text");
    }
    const resp = await fetch(LINE_PUSH_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            to,
            messages: [{ type: "text", text: text.slice(0, 5000) }],
        }),
    });
    if (!resp.ok) {
        const lineError = await resp.text();
        throw new Error(`LINE API error ${resp.status}: ${lineError}`);
    }
}
// REST endpoints
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", ts: new Date().toISOString(), mqttStatus });
});
app.get("/api/state", (_req, res) => {
    res.json(mqttData);
});
app.get("/api/history", (_req, res) => {
    res.json(zeroHistory());
});
app.get("/api/history/:topicKey/:field", (req, res) => {
    const key = `${req.params.topicKey}.${req.params.field}`;
    res.json(historyPoints.get(key) || []);
});
app.get("/api/blower-stats", (_req, res) => {
    res.json({
        date: todayDate,
        tb1: {
            status: blowerAccum.tb1.lastStatus,
            kwhToday: +blowerAccum.tb1.kwhToday.toFixed(2),
            runHoursToday: getRunHours('tb1'),
        },
        tb2: {
            status: blowerAccum.tb2.lastStatus,
            kwhToday: +blowerAccum.tb2.kwhToday.toFixed(2),
            runHoursToday: getRunHours('tb2'),
        },
    });
});
app.get("/api/report", (_req, res) => {
    const h = zeroHistory();
    res.json({ period: "day", labels: h.labels, rows: [] });
});
app.get("/api/devices", (_req, res) => {
    res.json(devices);
});
app.post("/api/devices", (req, res) => {
    const list = Array.isArray(req.body) ? req.body : [];
    devices.length = 0;
    devices.push(...list);
    res.json(devices);
});
app.put("/api/devices/:id", (req, res) => {
    const { id } = req.params;
    const next = req.body || {};
    const idx = devices.findIndex((d) => String(d.id) === id);
    if (idx >= 0)
        devices[idx] = { ...devices[idx], ...next, id };
    else
        devices.push({ ...next, id });
    res.json({ ok: true });
});
app.delete("/api/devices/:id", (req, res) => {
    const { id } = req.params;
    const idx = devices.findIndex((d) => String(d.id) === id);
    if (idx >= 0)
        devices.splice(idx, 1);
    res.json({ ok: true });
});
app.post("/api/cmd/blower/:n", (req, res) => {
    const payload = {
        type: "blower",
        blower: req.params.n,
        cmd: req.body?.cmd,
        speed_pct: req.body?.speed_pct,
        ts: Date.now(),
    };
    publishToZenmac(payload);
    res.json({ ok: true, payload });
});
app.post("/api/cmd/pump/:side", (req, res) => {
    const payload = {
        type: "pump",
        side: req.params.side,
        cmd: req.body?.cmd,
        ts: Date.now(),
    };
    publishToZenmac(payload);
    res.json({ ok: true, payload });
});
app.get("/api/line/health", (_req, res) => {
    res.json({
        status: "ok",
        lineConfigured: Boolean(LINE_CHANNEL_ACCESS_TOKEN),
        defaultRecipientConfigured: Boolean(LINE_DEFAULT_TO),
        webhookTokenRequired: Boolean(LINE_WEBHOOK_TOKEN),
        ts: new Date().toISOString(),
    });
});
app.post("/webhook/line/send", async (req, res) => {
    if (!isAuthorizedWebhook(req)) {
        return res.status(401).json({ ok: false, error: "unauthorized" });
    }
    const body = req.body || {};
    const text = typeof body.text === "string" ? body.text : body.message;
    const to = body.to || LINE_DEFAULT_TO;
    try {
        await sendLineTextMessage({ to, text });
        return res.json({ ok: true, sentTo: to });
    }
    catch (err) {
        return res.status(400).json({ ok: false, error: err.message });
    }
});
let mqttClient;
function publishToZenmac(payload) {
    if (!mqttClient || !mqttStatus.connected)
        return;
    const msg = JSON.stringify({ d: payload });
    mqttClient.publish(ZENMAC_TOPIC, msg, { qos: 0 }, (err) => {
        if (err)
            console.error("[mqtt] publish error:", err.message);
    });
}
mqttClient = mqtt_1.default.connect(MQTT_BROKER_URL, {
    clientId: `zenmac-backend-${Math.random().toString(16).slice(2, 8)}`,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
});
mqttClient.on("connect", () => {
    mqttStatus.connected = true;
    mqttStatus.reconnecting = false;
    io.emit("kd:status", mqttStatus);
    for (const topic of MQTT_TOPICS) {
        mqttClient.subscribe(topic, { qos: 1 }, (err) => {
            if (err)
                console.error(`[mqtt] subscribe error on ${topic}:`, err.message);
        });
    }
    mqttClient.subscribe(ZENMAC_TOPIC, { qos: 0 }, (err) => {
        if (err)
            console.error(`[mqtt] subscribe error on ${ZENMAC_TOPIC}:`, err.message);
    });
});
mqttClient.on("message", (topic, message) => {
    if (topic === ZENMAC_TOPIC) {
        try {
            const parsed = JSON.parse(message.toString());
            lastZenmac = parsed && typeof parsed.d === "object" ? parsed.d : parsed;
            io.emit("zenmac", lastZenmac);
        }
        catch (err) {
            console.error(`[mqtt] invalid JSON on ${ZENMAC_TOPIC}:`, err.message);
        }
        return;
    }
    if (!MQTT_TOPICS.includes(topic))
        return;
    try {
        const parsed = JSON.parse(message.toString());
        const data = parsed && typeof parsed.d === "object" ? parsed.d : parsed;
        const key = topicMap[topic];
        if (!key)
            return;
        mqttData[key] = data;
        pushHistory(key, data);
        // update blower energy/runtime accumulators on kd1 or kd5 change
        if (key === 'kd1' || key === 'kd5') {
            const d1 = mqttData.kd1 || {};
            const d5 = mqttData.kd5 || {};
            const st1 = (d5['TB-01_Status'] === 1 || d5['TB-01_Status'] === 'ON') ? 'RUN' : 'STOP';
            const st2 = (d5['TB-02_Status'] === 1 || d5['TB-02_Status'] === 'ON') ? 'RUN' : 'STOP';
            updateBlowerAccum('tb1', st1, val(d1['TB_1_BLOWER POWER_kW']) / 10);
            updateBlowerAccum('tb2', st2, val(d1['TB_2_BLOWER POWER_kW']) / 10);
        }
        io.emit("kd:update", { key, data });
        io.emit("kd:snapshot", mqttData);
        const live = mapMqttToLive();
        io.emit("live", live);
        io.emit("rawmqtt", mqttData);
    }
    catch (err) {
        console.error(`[mqtt] invalid JSON on ${topic}:`, err.message);
    }
});
mqttClient.on("reconnect", () => {
    mqttStatus.reconnecting = true;
    io.emit("kd:status", mqttStatus);
});
mqttClient.on("offline", () => {
    mqttStatus.connected = false;
    io.emit("kd:status", mqttStatus);
});
mqttClient.on("error", (err) => {
    console.error("[mqtt] error:", err.message);
});
io.on("connection", (socket) => {
    socket.emit("kd:status", mqttStatus);
    socket.emit("kd:snapshot", mqttData);
    socket.emit("history", zeroHistory());
    socket.emit("live", mapMqttToLive());
    socket.emit("rawmqtt", mqttData);
    socket.emit("zenmac", lastZenmac);
    socket.on("param:publish", (payload) => {
        if (!payload || typeof payload !== "object")
            return;
        publishToZenmac(payload);
    });
});
httpServer.listen(PORT, HOST, () => {
    console.log(`ZENMAC Backend listening on ${HOST}:${PORT}`);
});
