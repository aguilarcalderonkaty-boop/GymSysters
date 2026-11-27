// Login de cuentas fijas: no hay registro, solo Katia y Mariana pueden entrar.
//
// Con Firebase configurado, el login es real (Firebase Authentication):
//   - cada cuenta es un usuario de "Correo/contraseña" creado a mano en la consola,
//   - los correos son katy@gymsisters.com y mariana@gymsisters.com,
//   - como Firebase exige 6+ caracteres, la contraseña real es "gymsysters-<PIN>".
//     Ej.: si el PIN es 1234, en la consola se crea con "gymsysters-1234".
//
// Sin Firebase (modo local), se compara contra un hash SHA-256 de "gym-systers:<PIN>".
import { getFirebase } from './firebase.js';

export const USERS = {
  katia: {
    id: 'katia',
    name: 'Katia',
    email: 'katy@gymsisters.com',
    hash: '808ce0a92fce5454bfdab29c07b84e4a56725723c94ea8c2920759ee1fa11d40',
  },
  mariana: {
    id: 'mariana',
    name: 'Mariana',
    email: 'mariana@gymsisters.com',
    hash: '808ce0a92fce5454bfdab29c07b84e4a56725723c94ea8c2920759ee1fa11d40',
  },
};

const SESSION_KEY = 'gym-systers-session';

export function firebasePassword(pin) { return `gymsysters-${pin}`; }

function userByEmail(email) {
  return Object.values(USERS).find(u => u.email === (email || '').toLowerCase()) || null;
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalize(s) {
  return s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Devuelve la usuaria si el login es correcto, o null. */
export async function login(username, pin) {
  const user = Object.values(USERS).find(u => normalize(u.name) === normalize(username));
  if (!user) return null;

  const fb = await getFirebase();
  if (fb) {
    try {
      await fb.authMod.signInWithEmailAndPassword(fb.auth, user.email, firebasePassword(pin));
      return user;
    } catch (err) {
      console.warn('Login rechazado:', err.code);
      return null;
    }
  }

  if (await sha256('gym-systers:' + pin) !== user.hash) return null;
  try { localStorage.setItem(SESSION_KEY, user.id); } catch { /* privado */ }
  return user;
}

/** Recupera la sesión guardada (espera a Firebase si está configurado). */
export async function restoreSession() {
  const fb = await getFirebase();
  if (fb) {
    return new Promise(resolve => {
      const stop = fb.authMod.onAuthStateChanged(fb.auth, (u) => {
        stop();
        resolve(u ? userByEmail(u.email) : null);
      });
    });
  }
  try { return USERS[localStorage.getItem(SESSION_KEY)] || null; } catch { return null; }
}

export async function logout() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* privado */ }
  const fb = await getFirebase();
  if (fb) await fb.authMod.signOut(fb.auth).catch(console.error);
}
