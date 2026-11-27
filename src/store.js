// Capa de datos: Firestore si hay configuración, si no localStorage.
// La app solo habla con estas funciones; así funciona igual en ambos modos.
import { SPACE_ID } from './firebase-config.js';
import { getFirebase } from './firebase.js';

const SHARED = ['attendance', 'workouts', 'wellness', 'measurements'];
const PRIVATE = ['agenda']; // solo se leen los documentos de quien inició sesión
const COLLECTIONS = [...SHARED, ...PRIVATE];
const LOCAL_KEY = 'gym-systers-data-v2';

let mode = 'local';
let fb = null;
let handlers = {};
let unsubscribers = [];
let storageListener = null;

// ---------------- Modo local ----------------
function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data.config = data.config || null;
    COLLECTIONS.forEach(c => { data[c] = data[c] || {}; });
    return data;
  } catch {
    const data = { config: null };
    COLLECTIONS.forEach(c => { data[c] = {}; });
    return data;
  }
}

function writeLocal(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch { /* sin espacio / privado */ }
}

function emitLocal(name, data = readLocal()) {
  if (name === 'config') {
    handlers.config?.(data.config);
  } else {
    const docs = Object.entries(data[name]).map(([id, v]) => ({ id, ...v }));
    handlers[name]?.(docs);
  }
}

function emitAllLocal() {
  const data = readLocal();
  emitLocal('config', data);
  COLLECTIONS.forEach(c => emitLocal(c, data));
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------------- API pública ----------------
export function getMode() { return mode; }

/**
 * Conecta la fuente de datos para la usuaria `uid` y llama a los handlers con
 * los datos completos cada vez que cambian.
 * handlers: { config(obj|null), attendance(docs), workouts(docs), wellness(docs), measurements(docs), agenda(docs) }
 */
export async function connect(h, uid, onStatus = () => {}) {
  disconnect();
  handlers = h;
  fb = await getFirebase();

  if (!fb) {
    mode = 'local';
    onStatus(false);
    emitAllLocal();
    storageListener = (e) => { if (e.key === LOCAL_KEY) emitAllLocal(); };
    window.addEventListener('storage', storageListener);
    return;
  }

  mode = 'firebase';
  const { db, fs } = fb;
  const onErr = (name) => (err) => { console.error(`Error leyendo ${name}:`, err); onStatus(false); };

  unsubscribers.push(fs.onSnapshot(fs.doc(db, 'spaces', SPACE_ID, 'meta', 'config'),
    (snap) => { onStatus(true); handlers.config?.(snap.exists() ? snap.data() : null); },
    onErr('config')));

  SHARED.forEach(name => {
    unsubscribers.push(fs.onSnapshot(fs.collection(db, 'spaces', SPACE_ID, name), (snap) => {
      handlers[name]?.(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, onErr(name)));
  });

  // Privado: la consulta pide solo lo propio (las reglas de Firestore lo exigen)
  PRIVATE.forEach(name => {
    const q = fs.query(fs.collection(db, 'spaces', SPACE_ID, name), fs.where('bestie', '==', uid));
    unsubscribers.push(fs.onSnapshot(q, (snap) => {
      handlers[name]?.(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, onErr(name)));
  });
}

/** Deja de escuchar cambios (al cerrar sesión). */
export function disconnect() {
  unsubscribers.forEach(u => { try { u(); } catch { /* ya cerrado */ } });
  unsubscribers = [];
  if (storageListener) window.removeEventListener('storage', storageListener);
  storageListener = null;
}

/** Guarda (merge) la configuración compartida: rutinas. */
export async function saveConfig(partial) {
  if (mode === 'firebase') {
    const { db, fs } = fb;
    return fs.setDoc(fs.doc(db, 'spaces', SPACE_ID, 'meta', 'config'), partial, { merge: true }).catch(console.error);
  }
  const data = readLocal();
  data.config = { ...(data.config || {}), ...partial };
  writeLocal(data);
  emitLocal('config', data);
}

/** Agrega un documento con id automático. */
export async function addItem(collectionName, obj) {
  if (mode === 'firebase') {
    const { db, fs } = fb;
    return fs.addDoc(fs.collection(db, 'spaces', SPACE_ID, collectionName), obj).catch(console.error);
  }
  const data = readLocal();
  data[collectionName][newId()] = obj;
  writeLocal(data);
  emitLocal(collectionName, data);
}

/**
 * Crea o reemplaza un documento con id conocido.
 * (Se reemplaza completo para que listas y mapas borrados no se queden pegados.)
 */
export async function setItem(collectionName, id, obj) {
  if (mode === 'firebase') {
    const { db, fs } = fb;
    return fs.setDoc(fs.doc(db, 'spaces', SPACE_ID, collectionName, id), obj).catch(console.error);
  }
  const data = readLocal();
  data[collectionName][id] = obj;
  writeLocal(data);
  emitLocal(collectionName, data);
}

/** Borra un documento. */
export async function removeItem(collectionName, id) {
  if (!id) return;
  if (mode === 'firebase') {
    const { db, fs } = fb;
    return fs.deleteDoc(fs.doc(db, 'spaces', SPACE_ID, collectionName, id)).catch(console.error);
  }
  const data = readLocal();
  delete data[collectionName][id];
  writeLocal(data);
  emitLocal(collectionName, data);
}
