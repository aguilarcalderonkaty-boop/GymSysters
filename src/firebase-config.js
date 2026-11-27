// =========================================================
// CONFIGURACIÓN DE FIREBASE (proyecto "Gym Systers")
// =========================================================
// Estas claves web de Firebase NO son secretas: Google las diseñó para ir
// dentro de la app. Lo que protege los datos son las reglas de Firestore
// (archivo firestore.rules) y que solo existan las cuentas de Katia y Mariana.
//
// Si pones `firebaseConfig = null`, la app vuelve al "Modo local"
// (datos solo en el navegador de cada una).

export const firebaseConfig = {
  apiKey: 'AIzaSyCzSMFoAgtNEyVneF8zICrh0M5t8DxbWyA',
  authDomain: 'gym-systers.firebaseapp.com',
  projectId: 'gym-systers',
  storageBucket: 'gym-systers.firebasestorage.app',
  messagingSenderId: '246412578088',
  appId: '1:246412578088:web:d808137f0a34575b1e541d',
};

// Nombre del "espacio" compartido donde se guardan sus datos en Firestore.
export const SPACE_ID = 'gym-systers';
