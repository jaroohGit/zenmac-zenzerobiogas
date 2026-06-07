import { io } from 'socket.io-client';

const BACKEND_URL = process.env.VUE_APP_KD_BACKEND
  || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3323');

let socket = null;
const listeners = new Map();

export function getSocket() {
  if (!socket) {
    socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      emit('ws:connect', { id: socket.id });
    });
    socket.on('disconnect', () => {
      emit('ws:disconnect', {});
    });
    // kd:* domain events (legacy — backward compat)
    socket.on('kd:status',   (data) => emit('kd:status',   data));
    socket.on('kd:snapshot', (data) => emit('kd:snapshot', data));
    socket.on('kd:update',   (data) => emit('kd:update',   data));
    socket.on('kd:published',(data) => emit('kd:published',data));

    // template-pattern events
    socket.on('live',    (data) => emit('live',    data));
    socket.on('history', (data) => emit('history', data));
    socket.on('rawmqtt', (data) => emit('rawmqtt', data));
  }
  return socket;
}

function emit(event, data) {
  const fns = listeners.get(event) || [];
  fns.forEach(fn => fn(data));
}

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(fn);
  return () => off(event, fn);
}

export function off(event, fn) {
  const fns = listeners.get(event) || [];
  listeners.set(event, fns.filter(f => f !== fn));
}

// ส่งคำสั่ง publish ไปยัง backend (template pattern: param:publish)
export function publish(topic, data) {
  const s = getSocket();
  s.emit('param:publish', { topic, data });
}

export default { getSocket, on, off, publish };
