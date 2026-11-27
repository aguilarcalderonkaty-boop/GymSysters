# Gym Systers

Diario de gym compartido para dos amigas: rutinas de la semana, registro de series y pesos,
progreso, medidas, calendario, bienestar y un horario privado.

## Funciones

- **Inicio:** la rutina de hoy para llenar series y pesos (con peso sugerido y temporizador de descanso). Al registrar todos los ejercicios, el día queda completo.
- **Rutinas:** plan de lunes a domingo editable (series, reps, descanso, notas) y galería de técnica con fotos.
- **Progreso:** gráficas de pesos y medidas con filtros, constancia y récords personales.
- **Medidas:** peso, busto, cintura, abdomen, cadera, muslo y brazo; recordatorio cada 2 semanas.
- **Calendario:** días que fue cada una, días juntas y días de medición.
- **Bienestar:** horas y calidad de sueño, y comidas sanas del día.
- **Horario (privado):** pendientes de la semana, actividades por día y fechas importantes.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

## Datos y acceso (Firebase)

- La configuración está en `src/firebase-config.js` (las claves web de Firebase no son secretas).
- Solo existen dos cuentas, creadas a mano en Firebase Authentication. El registro está desactivado.
- En la app se entra con el nombre y un PIN; la contraseña real en Firebase es `gymsysters-<PIN>` (ver `src/auth.js`).
- Las reglas de seguridad están en `firestore.rules`. Si se cambian, hay que publicarlas en la consola de Firebase.
- Si `firebaseConfig` es `null`, la app funciona en modo local (datos solo en el navegador).

## Deploy

Cada push a `main` publica la app en GitHub Pages con el workflow de `.github/workflows/deploy.yml`.

## Créditos

Fotos de ejercicios: [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (dominio público).
