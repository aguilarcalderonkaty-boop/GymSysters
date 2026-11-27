// Inicializa Firebase una sola vez (solo si hay configuración).
import { firebaseConfig } from './firebase-config.js';

let promise = null;

/** Devuelve { auth, db, authMod, fs } o null si no hay configuración. */
export function getFirebase() {
  if (!firebaseConfig) return Promise.resolve(null);
  if (!promise) {
    promise = Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]).then(([appMod, authMod, fs]) => {
      const app = appMod.initializeApp(firebaseConfig);
      const auth = authMod.getAuth(app);
      // Guardado local + sincronización: funciona sin internet en el gym y sube después
      const db = fs.initializeFirestore(app, {
        localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }),
      });
      return { auth, db, authMod, fs };
    }).catch(err => {
      console.error('No se pudo iniciar Firebase:', err);
      promise = null;
      return null;
    });
  }
  return promise;
}
