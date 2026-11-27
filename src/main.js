import './style.css';
import Chart from 'chart.js/auto';
import {
  createIcons, House, Dumbbell, ChartLine, Ruler, CalendarDays, Moon, LogOut, Pencil,
  Plus, Trash2, X, ChevronLeft, ChevronRight, Check, Heart, Minus, NotebookPen, Lock,
  BookOpen, Timer, Search, Cake, PartyPopper, Star, Stethoscope, ExternalLink,
} from 'lucide';
import * as store from './store.js';
import { USERS, login, logout, restoreSession } from './auth.js';
import { EXERCISES, GROUPS, findExercise, exerciseImages } from './exercises.js';

// =========================================================
// CONSTANTES
// =========================================================

const DAYS = [
  { key: 'lunes', label: 'Lunes', short: 'L' },
  { key: 'martes', label: 'Martes', short: 'M' },
  { key: 'miercoles', label: 'Miércoles', short: 'M' },
  { key: 'jueves', label: 'Jueves', short: 'J' },
  { key: 'viernes', label: 'Viernes', short: 'V' },
  { key: 'sabado', label: 'Sábado', short: 'S' },
  { key: 'domingo', label: 'Domingo', short: 'D' },
];

const ex = (name, sets, reps, rest = 90) => ({ name, sets, reps, rest, notes: '' });
const REST_OPTIONS = [30, 45, 60, 90, 120, 180];
const DEFAULT_ROUTINES = {
  lunes: { title: 'Glúteo y femoral', exercises: [ex('Hip Thrust', 4, '12'), ex('Peso muerto rumano', 4, '10'), ex('Sentadilla búlgara', 3, '12'), ex('Patada de glúteo en polea', 3, '15')] },
  martes: { title: 'Espalda y brazos', exercises: [ex('Jalón al pecho', 4, '12'), ex('Remo con mancuerna', 4, '10'), ex('Curl de bíceps', 3, '12'), ex('Extensión de tríceps', 3, '12')] },
  miercoles: { title: 'Cuádriceps y pantorrilla', exercises: [ex('Sentadilla', 4, '10'), ex('Prensa de pierna', 4, '12'), ex('Extensión de cuádriceps', 3, '15'), ex('Elevación de talones', 4, '15')] },
  jueves: { title: 'Hombro y core', exercises: [ex('Press militar', 4, '10'), ex('Elevaciones laterales', 3, '15'), ex('Face pull', 3, '12'), ex('Crunch en polea', 3, '15')] },
  viernes: { title: 'Glúteo y cardio', exercises: [ex('Hip Thrust', 4, '10'), ex('Abducción en máquina', 4, '15'), ex('Step-ups', 3, '12'), ex('Peso muerto con mancuerna', 3, '12')] },
  sabado: { title: 'Full body', exercises: [ex('Kettlebell swing', 4, '15'), ex('Zancadas', 3, '12'), ex('Remo en polea baja', 3, '12')] },
  domingo: { title: 'Descanso', exercises: [] },
};

const MEAS_FIELDS = [
  { key: 'weight', label: 'Peso', unit: 'lb' },
  { key: 'bust', label: 'Busto', unit: 'cm' },
  { key: 'waist', label: 'Cintura', unit: 'cm' },
  { key: 'abdomen', label: 'Abdomen', unit: 'cm' },
  { key: 'hip', label: 'Cadera', unit: 'cm' },
  { key: 'thigh', label: 'Muslo', unit: 'cm' },
  { key: 'arm', label: 'Brazo', unit: 'cm' },
];

const MEALS = [
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'colacion', label: 'Colación' },
  { key: 'comida', label: 'Comida' },
  { key: 'cena', label: 'Cena' },
];

const SLEEP_RATINGS = {
  bien: { label: 'Bien', on: 'bg-sage-400 text-white border-sage-400', soft: 'bg-sage-100 text-sage-500' },
  regular: { label: 'Regular', on: 'bg-peach-400 text-white border-peach-400', soft: 'bg-peach-100 text-peach-400' },
  mal: { label: 'Mal', on: 'bg-blush-400 text-white border-blush-400', soft: 'bg-blush-100 text-blush-500' },
};

// Colores por persona (clases completas para que Tailwind las detecte)
const PCOLOR = {
  katia: {
    dot: 'bg-blush-400', soft: 'bg-blush-50', border: 'border-blush-200', text: 'text-blush-500',
    solid: 'bg-blush-400 text-white', ring: 'border-blush-400', hex: '#CC6B7A', fill: 'rgba(204,107,122,0.12)',
  },
  mariana: {
    dot: 'bg-lavender-400', soft: 'bg-lavender-50', border: 'border-lavender-200', text: 'text-lavender-500',
    solid: 'bg-lavender-400 text-white', ring: 'border-lavender-400', hex: '#8D77B8', fill: 'rgba(141,119,184,0.12)',
  },
};

const TABS = [
  { key: 'inicio', label: 'Inicio', icon: 'house' },
  { key: 'rutinas', label: 'Rutinas', icon: 'dumbbell' },
  { key: 'progreso', label: 'Progreso', icon: 'chart-line' },
  { key: 'medidas', label: 'Medidas', icon: 'ruler' },
  { key: 'calendario', label: 'Calendario', icon: 'calendar-days' },
  { key: 'bienestar', label: 'Bienestar', icon: 'moon' },
  { key: 'horario', label: 'Horario', icon: 'notebook-pen' },
];

const USER_IDS = ['katia', 'mariana'];

// =========================================================
// ESTADO
// =========================================================

const state = {
  user: null,
  tab: 'inicio',
  routines: structuredClone(DEFAULT_ROUTINES),
  workouts: [],
  attendance: {},
  wellness: {},
  measurements: [],
  drafts: {},            // series a medio llenar en Inicio: { "fecha|ejercicio": [{weight, reps}] }
  calMonth: firstOfMonth(new Date()),
  progress: { type: 'ejercicio', exercise: '', measure: 'weight', who: 'ambas', range: '3m' },
  measWho: null,
  wellDate: todayStr(),
  wellDraft: null,
  agenda: {},            // { "<usuaria>_<lunes de la semana>": { weekly: [], days: { lunes: [] ... } } }
  agendaWeek: mondayOf(todayStr()),
  horarioView: 'semana',
  tiempoPeriod: 'semana',
  tiempoMonth: firstOfMonth(new Date()),
  plans: {},             // rutina cambiada por día: { "<fecha>_<usuaria>": { day: 'lunes' } }
  horarioMonth: firstOfMonth(new Date()),
  rutinasView: 'plan',
  galleryGroup: 'Todos',
  gallerySearch: '',
};

const EVENT_TYPES = {
  cumple: { label: 'Cumpleaños', icon: 'cake', dot: 'bg-blush-400', chip: 'bg-blush-100 text-blush-500 border-blush-200', picked: 'peer-checked:bg-blush-100 peer-checked:text-blush-500 peer-checked:border-blush-300' },
  salida: { label: 'Salida', icon: 'party-popper', dot: 'bg-lavender-400', chip: 'bg-lavender-100 text-lavender-500 border-lavender-200', picked: 'peer-checked:bg-lavender-100 peer-checked:text-lavender-500 peer-checked:border-lavender-300' },
  cita: { label: 'Cita', icon: 'stethoscope', dot: 'bg-sage-400', chip: 'bg-sage-100 text-sage-500 border-sage-200', picked: 'peer-checked:bg-sage-100 peer-checked:text-sage-500 peer-checked:border-sage-300' },
  otro: { label: 'Importante', icon: 'star', dot: 'bg-peach-400', chip: 'bg-peach-100 text-peach-400 border-peach-200', picked: 'peer-checked:bg-peach-100 peer-checked:text-peach-400 peer-checked:border-peach-200' },
};

let chart = null;
let connected = null; // id de la usuaria conectada a los datos

// =========================================================
// UTILIDADES
// =========================================================

function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function parseDate(s) { return new Date(s + 'T00:00:00'); }
function addDays(s, n) { const d = parseDate(s); d.setDate(d.getDate() + n); return todayStr(d); }
function firstOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function mondayOf(s) { const d = parseDate(s); return addDays(s, -((d.getDay() + 6) % 7)); }
function weekdayKey(d = new Date()) {
  return ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][d.getDay()];
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function fmtDate(s, opts = { day: 'numeric', month: 'short' }) {
  return parseDate(s).toLocaleDateString('es-MX', opts);
}
function daysBetween(a, b) { return Math.round((parseDate(b) - parseDate(a)) / 86400000); }
function norm(s) { return (s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function icon(name, cls = 'w-4 h-4') { return `<i data-lucide="${name}" class="${cls}"></i>`; }
function num(v) { const n = parseFloat(v); return isNaN(n) ? null : n; }
function round1(n) { return Math.round(n * 10) / 10; }
function signed(n, unit) {
  const r = round1(n);
  if (r === 0) return `0 ${unit}`;
  return `${r > 0 ? '+' : ''}${r} ${unit}`;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.remove('opacity-0', '-translate-y-4');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.add('opacity-0', '-translate-y-4'), 2400);
}

function openModal(html) {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-box').innerHTML = html;
  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
  drawIcons();
  const first = overlay.querySelector('input');
  if (first) first.focus();
}
function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  overlay.classList.remove('flex');
}

function drawIcons() {
  createIcons({
    icons: {
      House, Dumbbell, ChartLine, Ruler, CalendarDays, Moon, LogOut, Pencil, Plus, Trash2, X, ChevronLeft, ChevronRight,
      Check, Heart, Minus, NotebookPen, Lock, BookOpen, Timer, Search, Cake, PartyPopper, Star, Stethoscope, ExternalLink,
    },
  });
}

// =========================================================
// LÓGICA DE DATOS
// =========================================================

function normalizeRoutines(r) {
  const out = structuredClone(DEFAULT_ROUTINES);
  DAYS.forEach(({ key }) => {
    if (!r || !r[key]) return;
    out[key] = {
      title: r[key].title || '',
      exercises: (r[key].exercises || []).map(e => typeof e === 'string'
        ? { name: e, sets: 3, reps: '12', rest: 90, notes: '' }
        : {
          name: e.name || '', sets: parseInt(e.sets, 10) || 3, reps: String(e.reps || ''),
          rest: parseInt(e.rest, 10) || 90, notes: e.notes || '',
        }),
    };
  });
  return out;
}

const REST_ROUTINE = { title: 'Descanso', exercises: [] };

/** Qué rutina hace una usuaria en una fecha: la del día, o la que eligió si la movió. */
function plannedDayKey(dateStr, uid = state.user?.id) {
  return state.plans[`${dateStr}_${uid}`]?.day || weekdayKey(parseDate(dateStr));
}
function isMoved(dateStr, uid = state.user?.id) {
  return Boolean(state.plans[`${dateStr}_${uid}`]);
}
function routineForDate(dateStr, uid = state.user?.id) {
  const key = plannedDayKey(dateStr, uid);
  if (key === 'descanso') return REST_ROUTINE;
  return state.routines[key] || { title: '', exercises: [] };
}

async function setPlan(dateStr, dayKey) {
  const uid = state.user.id;
  const id = `${dateStr}_${uid}`;
  if (!dayKey || dayKey === weekdayKey(parseDate(dateStr))) {
    delete state.plans[id];
    await store.removeItem('plans', id);
  } else {
    state.plans[id] = { bestie: uid, date: dateStr, day: dayKey };
    await store.setItem('plans', id, state.plans[id]);
  }
}

function logsOn(dateStr, uid) {
  return state.workouts.filter(w => w.date === dateStr && w.bestie === uid);
}

function logFor(dateStr, uid, exName) {
  return state.workouts.find(w => w.date === dateStr && w.bestie === uid && norm(w.name) === norm(exName));
}

function routineProgress(dateStr, uid) {
  const exs = routineForDate(dateStr, uid).exercises;
  const done = exs.filter(e => logFor(dateStr, uid, e.name)).length;
  return { done, total: exs.length };
}

/** Un día cuenta como "fue" cuando terminó toda la rutina (o se marcó a mano). */
function completedOn(dateStr, uid) {
  const att = state.attendance[dateStr];
  return Boolean(att && att[uid]);
}
function partialOn(dateStr, uid) {
  return !completedOn(dateStr, uid) && logsOn(dateStr, uid).length > 0;
}
function measuredOn(dateStr, uid) {
  return state.measurements.some(m => m.date === dateStr && m.bestie === uid);
}

function maxWeight(log) {
  return (log.setsDetail || []).reduce((m, s) => Math.max(m, parseFloat(s.weight) || 0), 0);
}

/** Registro más reciente de un ejercicio antes de cierta fecha (para el peso sugerido). */
function lastLogBefore(uid, name, dateStr) {
  return state.workouts
    .filter(l => l.bestie === uid && norm(l.name) === norm(name) && l.date < dateStr)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.timestamp || 0) - (a.timestamp || 0))[0] || null;
}

function fmtRest(sec = 90) {
  const s = parseInt(sec, 10) || 90;
  return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min` : `${s} s`;
}

// ---------- Temporizador de descanso ----------
let restTimer = null;
function startRest(seconds) {
  stopRest();
  const el = document.getElementById('rest-timer');
  const end = Date.now() + seconds * 1000;
  const tick = () => {
    const left = Math.max(0, Math.round((end - Date.now()) / 1000));
    el.querySelector('[data-rest-time]').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    el.querySelector('[data-rest-bar]').style.width = `${(left / seconds) * 100}%`;
    if (left <= 0) {
      stopRest();
      showToast('¡Descanso terminado! Siguiente serie');
      try { navigator.vibrate?.([200, 100, 200]); } catch { /* sin vibración */ }
    }
  };
  el.classList.remove('hidden');
  tick();
  restTimer = setInterval(tick, 250);
}
function stopRest() {
  clearInterval(restTimer);
  restTimer = null;
  document.getElementById('rest-timer')?.classList.add('hidden');
}

function wellnessOf(dateStr, uid) { return state.wellness[`${dateStr}_${uid}`] || null; }

function healthyStats(w) {
  if (!w || !w.meals) return null;
  const vals = MEALS.map(m => w.meals[m.key]).filter(v => v === 'sana' || v === 'nosana');
  if (vals.length === 0) return null;
  const sanas = vals.filter(v => v === 'sana').length;
  return { sanas, total: vals.length, pct: Math.round((sanas / vals.length) * 100) };
}

/** Recalcula si la rutina del día quedó completa y lo guarda en asistencia. */
async function syncCompletion(dateStr, uid) {
  const { done, total } = routineProgress(dateStr, uid);
  const complete = total > 0 && done >= total;
  const current = state.attendance[dateStr] || {};
  if (Boolean(current[uid]) === complete) return complete;
  const updated = { ...current, [uid]: complete };
  state.attendance[dateStr] = updated;
  await store.setItem('attendance', dateStr, updated);
  return complete;
}

// =========================================================
// RENDER GENERAL
// =========================================================

let renderQueued = false;
let renderBlocked = false;

function render() {
  const root = document.getElementById('root');
  if (chart) { chart.destroy(); chart = null; }

  if (!state.user) {
    root.innerHTML = viewLogin();
    drawIcons();
    return;
  }

  root.innerHTML = viewShell();
  const views = { inicio: viewInicio, rutinas: viewRutinas, progreso: viewProgreso, medidas: viewMedidas, calendario: viewCalendario, bienestar: viewBienestar, horario: viewHorario };
  document.getElementById('view').innerHTML = views[state.tab]();
  drawIcons();
  if (state.tab === 'progreso') drawProgressChart();
  maybeNotify();
}

/** Re-render cuando llegan datos, sin pisar lo que se está escribiendo. */
function scheduleRender() {
  const a = document.activeElement;
  if (a && a.closest && a.closest('#view') && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) {
    renderBlocked = true;
    return;
  }
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; render(); });
}
document.addEventListener('focusout', () => {
  if (!renderBlocked) return;
  setTimeout(() => {
    const a = document.activeElement;
    if (a && a.closest && a.closest('#view') && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
    renderBlocked = false;
    scheduleRender();
  }, 0);
});

// ---------- Componentes ----------

const card = (inner, extra = '') => `<section class="glass-card rounded-3xl p-5 shadow-soft ${extra}">${inner}</section>`;
const eyebrow = (text, cls = 'text-blush-500 bg-blush-50 border-blush-200') =>
  `<span class="inline-block text-[11px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${cls}">${text}</span>`;
const avatar = (uid, size = 'w-7 h-7 text-xs') =>
  `<span class="${size} rounded-full ${PCOLOR[uid].solid} inline-flex items-center justify-center font-bold shrink-0">${USERS[uid].name[0]}</span>`;
const inputCls = 'w-full bg-cream border border-[#DFD5CA] focus:border-blush-300 focus:bg-paper rounded-2xl px-4 py-2.5 text-sm font-semibold outline-none transition-colors';
const btnPrimary = 'bg-blush-400 hover:bg-blush-500 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-pill transition-transform active:scale-[.98]';
const btnGhost = 'bg-paper hover:bg-blush-50 text-blush-500 border border-blush-200 font-bold text-xs px-3 py-1.5 rounded-full transition-colors';

function segmented(options, active, action) {
  return `<div class="inline-flex bg-cream p-1 rounded-2xl border border-[#E5DDD3]">
    ${options.map(o => `<button type="button" data-action="${action}" data-value="${o.value}"
      class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${o.value === active ? 'bg-paper text-blush-500 shadow-soft' : 'text-stone-500 hover:text-ink'}">${o.label}</button>`).join('')}
  </div>`;
}

function select(change, options, value) {
  return `<select data-change="${change}" class="${inputCls} appearance-none">
    ${options.map(o => `<option value="${esc(o.value)}" ${o.value === value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
  </select>`;
}

// =========================================================
// LOGIN
// =========================================================

function viewLogin() {
  return `
  <div class="min-h-screen flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-sm">
      <div class="text-center mb-7">
        <div class="mx-auto w-16 h-16 rounded-3xl bg-blush-100 border border-blush-200 flex items-center justify-center text-blush-400 mb-4 shadow-soft">
          ${icon('heart', 'w-7 h-7 fill-blush-300')}
        </div>
        <h1 class="font-display font-bold text-4xl text-ink">Gym Systers</h1>
        <p class="text-sm text-stone-500 mt-1.5">Nuestro diario de gym</p>
      </div>
      <form data-submit="login" class="glass-card rounded-3xl p-6 shadow-cute space-y-4">
        <div>
          <label class="block text-xs font-bold text-stone-600 mb-1.5" for="login-user">Nombre</label>
          <input id="login-user" name="username" autocomplete="username" required class="${inputCls}">
        </div>
        <div>
          <label class="block text-xs font-bold text-stone-600 mb-1.5" for="login-pass">Contraseña</label>
          <input id="login-pass" name="password" type="password" autocomplete="current-password" required class="${inputCls}">
        </div>
        <p id="login-error" class="hidden text-xs text-blush-500 font-bold bg-blush-50 border border-blush-200 rounded-xl px-3 py-2">Nombre o contraseña incorrectos.</p>
        <button type="submit" class="w-full ${btnPrimary}">Entrar</button>
      </form>
      <p class="text-center text-xs text-stone-400 mt-5">Acceso privado</p>
    </div>
  </div>`;
}

// =========================================================
// SHELL (header + navegación)
// =========================================================

function viewShell() {
  const u = state.user;
  const c = PCOLOR[u.id];
  const dateText = cap(new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }));
  return `
  <div class="max-w-3xl mx-auto px-4 pt-5 pb-28 md:pb-12">
    <header class="glass-card rounded-3xl px-4 py-3.5 sm:px-5 mb-5 shadow-cute flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-2xl bg-blush-100 border border-blush-200 flex items-center justify-center text-blush-400 shrink-0">
          ${icon('heart', 'w-5 h-5 fill-blush-300')}
        </div>
        <div class="min-w-0">
          <h1 class="font-display font-bold text-xl sm:text-2xl text-ink leading-tight">Gym Systers</h1>
          <p class="text-xs text-stone-500 font-medium truncate">${dateText}</p>
        </div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <span class="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full ${c.soft} border ${c.border}">
          ${avatar(u.id)}<span class="text-sm font-bold text-ink">${u.name}</span>
        </span>
        <button data-action="logout" title="Cerrar sesión" aria-label="Cerrar sesión" class="p-2 rounded-xl text-stone-400 hover:text-ink hover:bg-cream transition-colors">${icon('log-out')}</button>
      </div>
    </header>

    <nav class="hidden md:flex glass-card rounded-2xl p-1.5 mb-6 shadow-soft gap-1">
      ${TABS.map(t => `<button data-action="tab" data-value="${t.key}"
        class="flex-1 py-2.5 px-2 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all ${state.tab === t.key ? 'bg-blush-100 text-blush-500 font-bold' : 'text-stone-500 font-semibold hover:bg-cream'}">
        ${icon(t.icon)} ${t.label}</button>`).join('')}
    </nav>

    <main id="view" class="space-y-5"></main>
  </div>

  <nav class="md:hidden fixed bottom-0 inset-x-0 bg-paper/95 backdrop-blur-md border-t border-[#E8DFD5] px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] z-30 grid grid-cols-7">
    ${TABS.map(t => `<button data-action="tab" data-value="${t.key}"
      class="flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl text-[10px] transition-all ${state.tab === t.key ? 'text-blush-500 font-bold bg-blush-50' : 'text-stone-400 font-medium'}">
      ${icon(t.icon, 'w-5 h-5')}<span>${t.label}</span></button>`).join('')}
  </nav>`;
}

// =========================================================
// INICIO: rutina de hoy para llenar series y pesos
// =========================================================

function draftFor(dateStr, exItem) {
  const key = `${dateStr}|${norm(exItem.name)}`;
  if (!state.drafts[key]) {
    const reps = parseInt(exItem.reps, 10);
    state.drafts[key] = Array.from({ length: Math.max(1, exItem.sets || 3) }, () => ({ weight: '', reps: isNaN(reps) ? '' : String(reps) }));
  }
  return { key, sets: state.drafts[key] };
}

// ---------- Avisos: medirse y fechas importantes ----------

function reminders() {
  const uid = state.user.id;
  const today = todayStr();
  const list = [];

  const mine = state.measurements.filter(m => m.bestie === uid).sort((a, b) => b.date.localeCompare(a.date));
  if (!mine.length) {
    list.push({ id: 'medidas-inicio', icon: 'ruler', tone: 'sage', title: 'Registra tus medidas iniciales', body: 'Así podrás ver tus cambios cada 2 semanas.', tab: 'medidas' });
  } else {
    const since = daysBetween(mine[0].date, today);
    if (since >= 14) list.push({ id: `medidas-${mine[0].date}`, icon: 'ruler', tone: 'sage', title: 'Toca medirte', body: `Tu última medición fue hace ${since} días.`, tab: 'medidas' });
  }

  [[today, 'Hoy'], [addDays(today, 1), 'Mañana']].forEach(([ds, when]) => {
    eventsOn(ds).forEach(e => {
      const t = EVENT_TYPES[e.type] || EVENT_TYPES.otro;
      list.push({
        id: `evento-${e.id}-${ds}`, icon: t.icon, tone: 'blush',
        title: `${when}: ${e.title}`, body: `${t.label}${e.time ? ` a las ${e.time}` : ''}`, tab: 'horario',
      });
    });
  });
  return list;
}

const NOTIFIED_KEY = 'gym-systers-notified';
function notificationsOn() {
  return 'Notification' in window && Notification.permission === 'granted';
}
/** Manda una notificación del sistema por aviso, máximo una vez por día. */
function maybeNotify() {
  if (!state.user || !notificationsOn()) return;
  let sent = {};
  try { sent = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}'); } catch { /* vacío */ }
  const today = todayStr();
  let changed = false;
  reminders().forEach(r => {
    const k = `${state.user.id}:${r.id}`;
    if (sent[k] === today) return;
    try { new Notification(r.title, { body: r.body, icon: './icon.svg', tag: k }); } catch { /* algunos navegadores móviles solo permiten avisos desde un service worker */ }
    sent[k] = today;
    changed = true;
  });
  if (changed) { try { localStorage.setItem(NOTIFIED_KEY, JSON.stringify(sent)); } catch { /* privado */ } }
}

function remindersCard() {
  const list = reminders();
  const canAsk = 'Notification' in window && Notification.permission === 'default';
  if (!list.length && !canAsk) return '';
  const tones = {
    sage: 'bg-sage-50 border-sage-200 text-sage-500',
    blush: 'bg-blush-50 border-blush-200 text-blush-500',
  };
  return `
  <section class="space-y-2">
    ${list.map(r => `
      <button data-action="tab" data-value="${r.tab}" class="w-full text-left flex items-center gap-3 rounded-2xl border px-4 py-3 ${tones[r.tone]} hover:shadow-soft transition-shadow">
        <span class="w-9 h-9 rounded-xl bg-paper flex items-center justify-center shrink-0">${icon(r.icon)}</span>
        <span class="min-w-0"><span class="block text-sm font-bold text-ink">${esc(r.title)}</span><span class="block text-xs text-stone-500">${esc(r.body)}</span></span>
      </button>`).join('')}
    ${canAsk ? `<button data-action="enable-notifications" class="w-full text-xs font-bold text-lavender-500 bg-lavender-50 border border-lavender-200 rounded-2xl py-2.5 hover:bg-lavender-100">Activar avisos en este dispositivo</button>` : ''}
  </section>`;
}

/** Resumen de la semana para los días de descanso. */
function restDaySummary() {
  const uid = state.user.id;
  const monday = mondayOf(todayStr());
  const dates = Array.from({ length: 7 }, (_, i) => addDays(monday, i)).filter(d => d <= todayStr());
  const planned = dates.filter(d => routineForDate(d).exercises.length > 0);
  const completed = planned.filter(d => completedOn(d, uid)).length;
  const logs = state.workouts.filter(l => l.bestie === uid && dates.includes(l.date));
  const sets = logs.reduce((n, l) => n + (l.setsDetail || []).length, 0);
  const lifted = Math.round(logs.reduce((n, l) => n + (l.setsDetail || []).reduce((m, s) => m + (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0), 0), 0));
  const well = dates.map(d => wellnessOf(d, uid)).filter(Boolean);
  const sleepVals = well.map(w => w.sleepHours).filter(v => typeof v === 'number');
  const sleepAvg = sleepVals.length ? round1(sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length) : null;
  const healthy = well.map(healthyStats).filter(Boolean);
  const healthyAvg = healthy.length ? Math.round(healthy.reduce((a, h) => a + h.pct, 0) / healthy.length) : null;
  const tomorrow = addDays(todayStr(), 1);
  const next = routineForDate(tomorrow);
  const nextDay = DAYS.find(d => d.key === weekdayKey(parseDate(tomorrow)));
  const moveBack = isMoved(todayStr()) ? `<button data-action="plan-reset" class="${btnGhost} mt-3">Volver a la rutina del día</button>` : '';

  const stat = (label, value, cls) => `<div class="rounded-2xl p-3 text-center ${cls}"><div class="font-display font-bold text-2xl text-ink">${value}</div><div class="text-[11px] font-bold text-stone-500">${label}</div></div>`;
  let message = 'Semana tranquila. La próxima vamos con todo.';
  if (planned.length && completed === planned.length) message = '¡Cumpliste todas tus rutinas de la semana!';
  else if (completed >= Math.ceil(planned.length / 2)) message = 'Buena semana, vas por buen camino.';

  return card(`
    <div class="flex items-center justify-between mb-1">
      <h3 class="font-display font-bold text-lg text-ink">Tu semana</h3>
      <span class="text-xs font-bold text-blush-500">${completed} de ${planned.length} rutinas</span>
    </div>
    <p class="text-sm text-stone-600 mb-4">${message}</p>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      ${stat('Series', sets, 'bg-blush-50 border border-blush-200')}
      ${stat('lb levantadas', lifted.toLocaleString('es-MX'), 'bg-lavender-50 border border-lavender-200')}
      ${stat('Sueño prom.', sleepAvg !== null ? `${sleepAvg} h` : '--', 'bg-cream border border-[#E8DFD5]')}
      ${stat('Comida sana', healthyAvg !== null ? `${healthyAvg}%` : '--', 'bg-sage-50 border border-sage-200')}
    </div>
    ${next.exercises.length ? `<p class="text-xs font-semibold text-stone-500 mt-4">Mañana (${nextDay.label}): <span class="text-ink">${esc(next.title)}</span> · ${next.exercises.length} ejercicios</p>` : ''}
    <div class="flex flex-wrap gap-2">
      ${moveBack}
      <button data-action="plan-choose" class="${btnGhost} mt-3">Hacer otra rutina hoy</button>
    </div>
  `);
}

function viewInicio() {
  const u = state.user;
  const today = todayStr();
  const day = DAYS.find(d => d.key === weekdayKey());
  const planned = plannedDayKey(today);
  const moved = isMoved(today);
  const routine = routineForDate(today);
  const { done, total } = routineProgress(today, u.id);
  const plannedLabel = planned === 'descanso' ? 'descanso' : `rutina del ${DAYS.find(d => d.key === planned).label}`;
  const tomorrowLabel = DAYS.find(d => d.key === weekdayKey(parseDate(addDays(today, 1)))).label;
  const started = logsOn(today, u.id).length > 0;
  const complete = completedOn(today, u.id);
  const pct = total ? Math.round((done / total) * 100) : 0;

  let hero;
  if (total === 0) {
    hero = `<p class="text-sm text-stone-600 mt-1">Hoy descansas. Tu cuerpo también se fortalece recuperándose.</p>`;
  } else if (complete) {
    hero = `<p class="text-sm text-stone-600 mt-1">Rutina completa. Hoy ya cuenta en el calendario.</p>`;
  } else {
    hero = `<p class="text-sm text-stone-600 mt-1">Llena tus series y pesos. Al terminar todos los ejercicios, el día queda completo.</p>`;
  }

  const exercisesHtml = routine.exercises.map((e, i) => exerciseCard(today, e, i)).join('');

  return `
  ${remindersCard()}
  <section class="journal-accent rounded-3xl p-5 sm:p-6 shadow-cute">
    <div class="flex items-start justify-between gap-4">
      <div>
        ${eyebrow(`Hoy · ${day.label}${moved ? ` · ${plannedLabel}` : ''}`, 'text-blush-500 bg-paper border-blush-200')}
        <h2 class="font-display font-bold text-2xl sm:text-3xl text-ink mt-2">${esc(routine.title) || 'Rutina de hoy'}</h2>
        ${hero}
        ${total > 0 && !complete && !started ? `
        <div class="flex flex-wrap gap-2 mt-3">
          <button data-action="plan-tomorrow" class="${btnGhost}">Hoy no puedo · pasarla al ${tomorrowLabel.toLowerCase()}</button>
          <button data-action="plan-choose" class="${btnGhost}">Cambiar rutina</button>
        </div>` : ''}
      </div>
      ${total > 0 ? `
      <div class="shrink-0 text-center">
        <div class="w-16 h-16 rounded-full flex items-center justify-center ${complete ? 'bg-sage-400 text-white' : 'bg-paper border-2 border-blush-200'}">
          ${complete ? icon('check', 'w-7 h-7') : `<span class="font-display font-bold text-lg text-blush-500">${done}/${total}</span>`}
        </div>
      </div>` : ''}
    </div>
    ${total > 0 ? `
    <div class="mt-4 h-2 rounded-full bg-paper overflow-hidden border border-blush-100">
      <div class="h-full rounded-full ${complete ? 'bg-sage-400' : 'bg-blush-300'} transition-all" style="width:${pct}%"></div>
    </div>` : ''}
  </section>

  ${total > 0 ? `<div class="space-y-3">${exercisesHtml}</div>` : restDaySummary()}

  ${card(`
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-display font-bold text-lg text-ink">Nuestra semana</h3>
      <span class="text-xs font-bold text-stone-500">Juntas este mes: <span class="text-blush-500">${togetherThisMonth()}</span></span>
    </div>
    ${weekStrip()}
  `)}
  `;
}

function exerciseCard(dateStr, e, idx) {
  const uid = state.user.id;
  const log = logFor(dateStr, uid, e.name);
  const target = `${e.sets} × ${esc(e.reps)}`;

  if (log) {
    return `
    <article class="rounded-3xl p-4 bg-sage-50 border border-sage-200 shadow-soft">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-8 h-8 rounded-full bg-sage-400 text-white flex items-center justify-center shrink-0">${icon('check', 'w-4 h-4')}</span>
          <div class="min-w-0">
            <h4 class="font-bold text-sm text-ink truncate">${esc(e.name)}</h4>
            <p class="text-[11px] text-stone-500 font-semibold">Meta ${target} · máx ${maxWeight(log)} lb</p>
          </div>
        </div>
        <button data-action="undo-log" data-id="${esc(log.id || '')}" class="text-xs font-bold text-stone-400 hover:text-blush-500 px-2 py-1">Corregir</button>
      </div>
      <div class="flex flex-wrap gap-1.5 mt-3 pl-11">
        ${log.setsDetail.map((s, i) => `<span class="bg-paper border border-sage-200 px-2.5 py-0.5 rounded-lg text-[11px] font-bold text-stone-600">S${i + 1} · ${s.weight} lb × ${s.reps}</span>`).join('')}
      </div>
    </article>`;
  }

  const { key, sets } = draftFor(dateStr, e);
  const prev = lastLogBefore(uid, e.name, dateStr);
  return `
  <article class="glass-card rounded-3xl p-4 shadow-soft">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-start gap-3 min-w-0">
        <span class="w-8 h-8 rounded-full bg-blush-50 border border-blush-200 text-blush-500 font-bold text-xs flex items-center justify-center shrink-0">${idx + 1}</span>
        <div class="min-w-0">
          <h4 class="font-bold text-sm text-ink">${esc(e.name)}</h4>
          <p class="text-[11px] text-stone-500 font-semibold">Meta ${target} · descanso ${fmtRest(e.rest)}</p>
          ${prev ? `<p class="text-[11px] font-semibold text-lavender-500 mt-0.5">Última vez (${fmtDate(prev.date)}): ${prev.setsDetail.map(s => `${s.weight}×${s.reps}`).join(' · ')}</p>` : ''}
          ${e.notes ? `<p class="text-xs text-stone-600 bg-cream border border-[#E8DFD5] rounded-xl px-2.5 py-1.5 mt-1.5">${esc(e.notes)}</p>` : ''}
        </div>
      </div>
      <button type="button" data-action="technique" data-name="${esc(e.name)}" title="Ver técnica" aria-label="Ver técnica de ${esc(e.name)}"
        class="p-2 rounded-xl text-stone-400 hover:text-blush-500 hover:bg-blush-50 shrink-0">${icon('book-open')}</button>
    </div>
    <div class="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 text-center mb-1.5">
      <div class="col-span-2">Serie</div><div class="col-span-4">Peso (lb)</div><div class="col-span-4">Reps</div><div class="col-span-2"></div>
    </div>
    <div class="space-y-2">
      ${sets.map((s, i) => `
      <div class="grid grid-cols-12 gap-2 items-center">
        <div class="col-span-2 text-center"><span class="inline-block bg-lavender-50 text-lavender-500 font-bold text-xs px-2 py-1 rounded-lg">S${i + 1}</span></div>
        <input type="number" inputmode="decimal" step="0.5" min="0" placeholder="${prev && prev.setsDetail[i] ? prev.setsDetail[i].weight : '0'}" value="${esc(s.weight)}"
          data-draft="${esc(key)}" data-idx="${i}" data-field="weight" aria-label="Peso serie ${i + 1}"
          class="col-span-4 w-full bg-cream border border-[#DFD5CA] focus:border-blush-300 focus:bg-paper rounded-xl px-2 py-2 text-sm font-bold text-center outline-none">
        <input type="number" inputmode="numeric" min="1" placeholder="12" value="${esc(s.reps)}"
          data-draft="${esc(key)}" data-idx="${i}" data-field="reps" aria-label="Repeticiones serie ${i + 1}"
          class="col-span-4 w-full bg-cream border border-[#DFD5CA] focus:border-lavender-300 focus:bg-paper rounded-xl px-2 py-2 text-sm font-bold text-center outline-none">
        <button type="button" data-action="draft-remove" data-key="${esc(key)}" data-idx="${i}" aria-label="Quitar serie"
          class="col-span-2 text-stone-300 hover:text-blush-500 flex justify-center">${icon('x', 'w-4 h-4')}</button>
      </div>`).join('')}
    </div>
    <div class="flex items-center justify-between mt-3 gap-2">
      <div class="flex items-center gap-1.5">
        <button type="button" data-action="draft-add" data-key="${esc(key)}" class="${btnGhost}">+ Serie</button>
        <button type="button" data-action="rest-start" data-seconds="${e.rest || 90}" title="Iniciar descanso"
          class="bg-paper hover:bg-lavender-50 text-lavender-500 border border-lavender-200 font-bold text-xs px-3 py-1.5 rounded-full transition-colors inline-flex items-center gap-1">${icon('timer', 'w-3.5 h-3.5')} ${fmtRest(e.rest)}</button>
      </div>
      <button type="button" data-action="save-exercise" data-key="${esc(key)}" data-name="${esc(e.name)}"
        class="bg-ink hover:bg-stone-800 text-paper font-bold text-xs px-4 py-2 rounded-full shadow-pill transition-transform active:scale-95">Guardar ejercicio</button>
    </div>
  </article>`;
}

function weekStrip() {
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
  const dates = DAYS.map((_, i) => todayStr(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)));
  const today = todayStr();

  const header = `<div class="grid grid-cols-[5.5rem_repeat(7,minmax(0,1fr))] gap-1.5 text-[10px] font-bold text-stone-400 text-center mb-1.5">
    <div></div>${DAYS.map((d, i) => `<div class="${dates[i] === today ? 'text-blush-500' : ''}">${d.short}</div>`).join('')}</div>`;

  const rows = USER_IDS.map(uid => {
    const c = PCOLOR[uid];
    return `<div class="grid grid-cols-[5.5rem_repeat(7,minmax(0,1fr))] gap-1.5 items-center mb-1.5">
      <div class="flex items-center gap-1.5 text-xs font-bold text-ink truncate">${avatar(uid, 'w-5 h-5 text-[10px]')} ${USERS[uid].name}</div>
      ${dates.map(d => {
        const full = completedOn(d, uid);
        const part = partialOn(d, uid);
        const cls = full ? `${c.dot}` : part ? `bg-paper border-2 ${c.ring}` : 'bg-cream border border-[#E8DFD5]';
        return `<div class="flex justify-center"><span class="w-6 h-6 sm:w-7 sm:h-7 rounded-full ${cls}" title="${fmtDate(d)}"></span></div>`;
      }).join('')}
    </div>`;
  }).join('');

  return header + rows + `<p class="text-[11px] text-stone-400 mt-2">Relleno: rutina completa · Contorno: la empezó</p>`;
}

function togetherThisMonth() {
  const prefix = todayStr().slice(0, 7);
  return Object.keys(state.attendance).filter(d => d.startsWith(prefix) && completedOn(d, 'katia') && completedOn(d, 'mariana')).length;
}

// =========================================================
// RUTINAS: 7 días, editables
// =========================================================

function viewRutinas() {
  const todayKey = weekdayKey();
  const header = card(`
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        ${eyebrow(state.rutinasView === 'plan' ? 'Plan semanal' : 'Galería')}
        <h2 class="font-display font-bold text-2xl text-ink mt-2">${state.rutinasView === 'plan' ? 'Nuestras rutinas' : 'Técnica de ejercicios'}</h2>
        <p class="text-sm text-stone-500 mt-1">${state.rutinasView === 'plan'
          ? 'Toca el lápiz para editar ejercicios, series, reps, descanso y notas.'
          : 'Cómo hacer cada ejercicio bien y los errores más comunes.'}</p>
      </div>
      ${segmented([{ value: 'plan', label: 'Plan semanal' }, { value: 'galeria', label: 'Galería' }], state.rutinasView, 'rutinas-view')}
    </div>
  `);
  if (state.rutinasView === 'galeria') return header + viewGallery();

  return `
  ${header}
  <div class="grid gap-4 sm:grid-cols-2">
    ${DAYS.map(d => {
      const r = state.routines[d.key];
      const isToday = d.key === todayKey;
      return `
      <article class="rounded-3xl p-4 border shadow-soft ${isToday ? 'bg-blush-50 border-blush-200' : 'bg-paper border-[#E8DFD5]'}">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-display font-bold text-xl text-ink">${d.label}</h3>
              ${isToday ? `<span class="text-[10px] font-bold bg-blush-400 text-white px-2 py-0.5 rounded-full">Hoy</span>` : ''}
            </div>
            <p class="text-xs font-semibold text-stone-500 truncate">${esc(r.title) || 'Sin nombre'}</p>
          </div>
          <button data-action="edit-day" data-day="${d.key}" title="Editar ${d.label}" aria-label="Editar ${d.label}"
            class="p-2 rounded-xl text-stone-400 hover:text-blush-500 hover:bg-paper border border-transparent hover:border-blush-200 transition-colors">${icon('pencil')}</button>
        </div>
        ${r.exercises.length ? `
        <ul class="mt-3 divide-y divide-[#F0E8DF]">
          ${r.exercises.map(e => `
          <li class="py-2">
            <div class="flex items-center justify-between gap-3">
              <button data-action="technique" data-name="${esc(e.name)}" class="text-sm font-semibold text-ink text-left hover:text-blush-500 truncate">${esc(e.name)}</button>
              <span class="text-xs font-bold text-stone-500 bg-cream border border-[#E8DFD5] px-2.5 py-0.5 rounded-full whitespace-nowrap">${e.sets} × ${esc(e.reps)}</span>
            </div>
            <p class="text-[11px] text-stone-400 font-semibold mt-0.5">Descanso ${fmtRest(e.rest)}${e.notes ? ` · <span class="text-stone-500">${esc(e.notes)}</span>` : ''}</p>
          </li>`).join('')}
        </ul>` : `<p class="text-sm text-stone-400 mt-3 py-2">Día de descanso</p>`}
      </article>`;
    }).join('')}
  </div>

  ${card(`
    <h3 class="font-display font-bold text-lg text-ink mb-3">Últimos registros</h3>
    ${recentLogs()}
  `)}`;
}

function recentLogs() {
  if (state.workouts.length === 0) return `<p class="text-sm text-stone-400 text-center py-4">Todavía no hay registros. Empiecen desde Inicio.</p>`;
  return `<div class="space-y-2">${state.workouts.slice(0, 12).map(l => {
    const c = PCOLOR[l.bestie] || PCOLOR.katia;
    const mine = l.bestie === state.user.id;
    return `<div class="${c.soft} border ${c.border} rounded-2xl p-3">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          ${avatar(l.bestie, 'w-6 h-6 text-[10px]')}
          <span class="font-bold text-sm text-ink truncate">${esc(l.name)}</span>
          <span class="text-[11px] font-semibold text-stone-400 shrink-0">${fmtDate(l.date)}</span>
        </div>
        ${mine && l.id ? `<button data-action="delete-log" data-id="${esc(l.id)}" aria-label="Borrar registro" class="text-stone-300 hover:text-blush-500">${icon('trash-2', 'w-3.5 h-3.5')}</button>` : ''}
      </div>
      <div class="flex flex-wrap gap-1.5 mt-2">
        ${(l.setsDetail || []).map(s => `<span class="bg-paper px-2 py-0.5 rounded-lg text-[11px] font-bold text-stone-600">${s.weight} lb × ${s.reps}</span>`).join('')}
      </div>
    </div>`;
  }).join('')}</div>`;
}

function exRow(e = { name: '', sets: 3, reps: '12', rest: 90, notes: '' }) {
  const field = 'w-full bg-paper border border-[#DFD5CA] focus:border-blush-300 rounded-xl px-2.5 py-2 text-sm font-semibold outline-none';
  return `<div class="ex-row bg-cream border border-[#E8DFD5] rounded-2xl p-2.5 space-y-2">
    <div class="grid grid-cols-12 gap-2 items-center">
      <input class="ex-name col-span-6 ${field}" value="${esc(e.name)}" placeholder="Ejercicio" aria-label="Ejercicio" list="gallery-names">
      <input class="ex-sets col-span-2 ${field} text-center px-1" type="number" min="1" max="20" value="${esc(e.sets)}" aria-label="Series">
      <input class="ex-reps col-span-3 ${field} text-center px-1" value="${esc(e.reps)}" placeholder="12" aria-label="Repeticiones">
      <button type="button" data-action="remove-row" aria-label="Quitar" class="col-span-1 text-stone-300 hover:text-blush-500 flex justify-center">${icon('x', 'w-4 h-4')}</button>
    </div>
    <div class="grid grid-cols-12 gap-2 items-center">
      <select class="ex-rest col-span-4 ${field} text-xs px-1.5" aria-label="Descanso entre series">
        ${REST_OPTIONS.map(s => `<option value="${s}" ${s === (parseInt(e.rest, 10) || 90) ? 'selected' : ''}>Desc. ${fmtRest(s)}</option>`).join('')}
      </select>
      <input class="ex-notes col-span-8 ${field} text-xs font-medium" value="${esc(e.notes)}" maxlength="120" placeholder="Nota o técnica (opcional)" aria-label="Notas">
    </div>
  </div>`;
}

// ---------- Galería de técnica ----------

function viewGallery() {
  const groups = ['Todos', ...GROUPS.filter(g => EXERCISES.some(e => e.group === g))];
  const inRoutine = new Set(DAYS.flatMap(d => state.routines[d.key].exercises.map(e => findExercise(e.name)?.name).filter(Boolean)));
  const list = EXERCISES.filter(e => state.galleryGroup === 'Todos' || e.group === state.galleryGroup);
  const q = norm(state.gallerySearch);

  return card(`
    <div class="relative mb-3">
      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">${icon('search')}</span>
      <input data-gallery-search value="${esc(state.gallerySearch)}" placeholder="Buscar ejercicio o músculo…" aria-label="Buscar ejercicio" class="${inputCls} pl-10">
    </div>
    <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-4">
      ${groups.map(g => `<button data-action="gallery-group" data-value="${g}"
        class="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${state.galleryGroup === g ? 'bg-blush-400 text-white border-blush-400' : 'bg-paper text-stone-500 border-[#E5DDD3] hover:border-blush-200'}">${g}</button>`).join('')}
    </div>
    <div class="grid gap-2.5 sm:grid-cols-2">
      ${list.map(e => {
        const hay = norm(`${e.name} ${e.muscles} ${e.group} ${(e.aliases || []).join(' ')}`);
        return `<button data-action="technique" data-name="${esc(e.name)}" data-gallery-item="${esc(hay)}"
          class="${q && !hay.includes(q) ? 'hidden' : ''} text-left bg-cream hover:bg-blush-50 border border-[#E8DFD5] hover:border-blush-200 rounded-2xl p-2.5 transition-colors flex items-center gap-3">
          ${exerciseImages(e) ? `<img src="${exerciseImages(e)[1]}" alt="" loading="lazy" class="w-16 h-16 rounded-xl object-cover bg-white border border-[#E8DFD5] shrink-0">` : ''}
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-sm text-ink">${esc(e.name)}</span>
              ${inRoutine.has(e.name) ? `<span class="text-[10px] font-bold text-blush-500 bg-paper border border-blush-200 px-2 py-0.5 rounded-full shrink-0">En rutina</span>` : ''}
            </div>
            <p class="text-[11px] font-semibold text-stone-500 mt-1">${esc(e.group)} · ${esc(e.muscles)}</p>
          </div>
        </button>`;
      }).join('')}
    </div>
    <p data-gallery-empty class="hidden text-sm text-stone-400 text-center py-6">No encontramos ese ejercicio.</p>
  `);
}

function openTechnique(name) {
  const info = findExercise(name);
  const imgs = exerciseImages(info);
  const anim = imgs ? `
    <figure class="mb-4">
      <div class="ex-anim aspect-[4/3] rounded-2xl bg-white border border-[#E8DFD5]">
        <img src="${imgs[0]}" alt="${esc(info.name)}: posición inicial" loading="lazy">
        <img src="${imgs[1]}" alt="${esc(info.name)}: posición final" loading="lazy">
      </div>
      <figcaption class="flex justify-between text-[10px] font-semibold text-stone-400 mt-1.5 px-1">
        <span>Se alterna inicio y final del movimiento</span><span>Imágenes: Free Exercise DB</span>
      </figcaption>
    </figure>` : '';
  const routineNotes = DAYS.flatMap(d => state.routines[d.key].exercises)
    .filter(e => norm(e.name) === norm(name) && e.notes).map(e => e.notes);

  openModal(`
    <div class="flex items-start justify-between gap-3 mb-3">
      <div>
        ${info ? eyebrow(esc(info.group)) : ''}
        <h3 class="font-display font-bold text-2xl text-ink mt-1.5">${esc(info ? info.name : name)}</h3>
        ${info ? `<p class="text-xs font-semibold text-stone-500 mt-0.5">${esc(info.muscles)}</p>` : ''}
      </div>
      <button data-action="close-modal" aria-label="Cerrar" class="text-stone-400 hover:text-ink shrink-0">${icon('x', 'w-5 h-5')}</button>
    </div>
    ${anim}
    ${routineNotes.length ? `<div class="bg-lavender-50 border border-lavender-200 rounded-2xl p-3 mb-3"><p class="text-[11px] font-bold text-lavender-500 uppercase tracking-wider mb-1">Nuestra nota</p>${[...new Set(routineNotes)].map(n => `<p class="text-sm text-ink">${esc(n)}</p>`).join('')}</div>` : ''}
    ${info ? `
      <h4 class="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Cómo hacerlo</h4>
      <ol class="space-y-2">
        ${info.steps.map((s, i) => `<li class="flex gap-2.5 text-sm text-ink"><span class="w-6 h-6 rounded-full bg-blush-100 text-blush-500 font-bold text-xs flex items-center justify-center shrink-0">${i + 1}</span><span>${esc(s)}</span></li>`).join('')}
      </ol>
      <h4 class="text-xs font-bold uppercase tracking-wider text-stone-500 mt-4 mb-2">Errores comunes</h4>
      <ul class="space-y-1.5">
        ${info.mistakes.map(m => `<li class="flex gap-2 text-sm text-stone-600"><span class="w-1.5 h-1.5 rounded-full bg-blush-300 mt-2 shrink-0"></span><span>${esc(m)}</span></li>`).join('')}
      </ul>`
    : `<p class="text-sm text-stone-500">Este ejercicio todavía no tiene ficha en la galería. Puedes anotar la técnica en las notas del ejercicio al editar el día.</p>`}
  `);
}

function openEditDay(dayKey) {
  const d = DAYS.find(x => x.key === dayKey);
  const r = state.routines[dayKey];
  openModal(`
    <form data-submit="save-day" data-day="${dayKey}" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-display font-bold text-xl text-ink">Editar ${d.label}</h3>
        <button type="button" data-action="close-modal" aria-label="Cerrar" class="text-stone-400 hover:text-ink">${icon('x', 'w-5 h-5')}</button>
      </div>
      <div>
        <label class="block text-xs font-bold text-stone-600 mb-1.5">Enfoque del día</label>
        <input name="title" value="${esc(r.title)}" placeholder="Ej. Glúteo y femoral" class="${inputCls}">
      </div>
      <div>
        <div class="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
          <div class="col-span-6">Ejercicio</div><div class="col-span-2 text-center">Series</div><div class="col-span-3 text-center">Reps</div>
        </div>
        <div id="ex-rows" class="space-y-2">${r.exercises.map(e => exRow(e)).join('')}</div>
        <datalist id="gallery-names">${EXERCISES.map(g => `<option value="${esc(g.name)}">`).join('')}</datalist>
        <button type="button" data-action="add-ex-row" class="${btnGhost} mt-3">+ Agregar ejercicio</button>
        <p class="text-[11px] text-stone-400 mt-2">Deja la lista vacía para marcarlo como día de descanso.</p>
      </div>
      <button type="submit" class="w-full ${btnPrimary}">Guardar ${d.label}</button>
    </form>`);
}

// =========================================================
// PROGRESO: gráficas con filtros
// =========================================================

function exerciseOptions() {
  const map = {};
  state.workouts.forEach(l => { if (l.name && !map[norm(l.name)]) map[norm(l.name)] = l.name.trim(); });
  return Object.entries(map).map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
}

function rangeCutoff() {
  const months = { '1m': 1, '3m': 3, '6m': 6 }[state.progress.range];
  if (!months) return '0000-00-00';
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return todayStr(d);
}

function progressSeries() {
  const p = state.progress;
  const cutoff = rangeCutoff();
  const who = p.who === 'ambas' ? USER_IDS : [p.who];
  const series = {};
  who.forEach(uid => { series[uid] = {}; });

  if (p.type === 'ejercicio') {
    state.workouts.forEach(l => {
      if (norm(l.name) !== p.exercise || !series[l.bestie] || l.date < cutoff) return;
      series[l.bestie][l.date] = Math.max(series[l.bestie][l.date] || 0, maxWeight(l));
    });
  } else {
    state.measurements.forEach(m => {
      const v = m[p.measure];
      if (typeof v !== 'number' || !series[m.bestie] || m.date < cutoff) return;
      series[m.bestie][m.date] = v;
    });
  }
  return series;
}

function viewProgreso() {
  const p = state.progress;
  const exOpts = exerciseOptions();
  if (p.type === 'ejercicio' && !exOpts.find(o => o.value === p.exercise)) p.exercise = exOpts[0]?.value || '';

  const itemSelect = p.type === 'ejercicio'
    ? (exOpts.length ? select('prog-exercise', exOpts, p.exercise) : `<div class="${inputCls} text-stone-400">Sin ejercicios registrados</div>`)
    : select('prog-measure', MEAS_FIELDS.map(f => ({ value: f.key, label: `${f.label} (${f.unit})` })), p.measure);

  const series = progressSeries();
  const unit = p.type === 'ejercicio' ? 'lb' : MEAS_FIELDS.find(f => f.key === p.measure).unit;
  const hasData = Object.values(series).some(s => Object.keys(s).length > 0);

  const summary = Object.entries(series).map(([uid, s]) => {
    const dates = Object.keys(s).sort();
    const c = PCOLOR[uid];
    if (!dates.length) {
      return `<div class="${c.soft} border ${c.border} rounded-3xl p-4">
        <div class="flex items-center gap-2 font-bold text-sm">${avatar(uid)} ${USERS[uid].name}</div>
        <p class="text-xs text-stone-400 mt-2">Sin datos en este periodo.</p></div>`;
    }
    const first = s[dates[0]], last = s[dates[dates.length - 1]];
    const best = p.type === 'ejercicio' ? Math.max(...Object.values(s)) : null;
    return `<div class="${c.soft} border ${c.border} rounded-3xl p-4">
      <div class="flex items-center gap-2 font-bold text-sm">${avatar(uid)} ${USERS[uid].name}</div>
      <div class="grid grid-cols-3 gap-2 mt-3 text-center">
        <div class="bg-paper rounded-2xl p-2"><div class="text-[10px] font-bold text-stone-400 uppercase">Inicio</div><div class="font-display font-bold text-ink">${first} ${unit}</div></div>
        <div class="bg-paper rounded-2xl p-2"><div class="text-[10px] font-bold text-stone-400 uppercase">Actual</div><div class="font-display font-bold text-ink">${last} ${unit}</div></div>
        <div class="bg-paper rounded-2xl p-2"><div class="text-[10px] font-bold text-stone-400 uppercase">${best !== null ? 'Récord' : 'Cambio'}</div>
          <div class="font-display font-bold ${c.text}">${best !== null ? `${best} ${unit}` : signed(last - first, unit)}</div></div>
      </div>
      ${best !== null ? `<p class="text-[11px] font-semibold text-stone-500 mt-2">Cambio en el periodo: ${signed(last - first, unit)}</p>` : ''}
    </div>`;
  }).join('');

  return `
  ${card(`
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div>
        ${eyebrow('Progreso', 'text-lavender-500 bg-lavender-50 border-lavender-200')}
        <h2 class="font-display font-bold text-2xl text-ink mt-2">¿Cómo vamos?</h2>
      </div>
      ${segmented([{ value: 'ejercicio', label: 'Pesos por ejercicio' }, { value: 'medidas', label: 'Medidas' }], p.type, 'prog-type')}
    </div>
    <div class="grid gap-2.5 sm:grid-cols-3 mb-4">
      <div><label class="block text-[11px] font-bold text-stone-500 mb-1">${p.type === 'ejercicio' ? 'Ejercicio' : 'Medida'}</label>${itemSelect}</div>
      <div><label class="block text-[11px] font-bold text-stone-500 mb-1">Quién</label>${select('prog-who', [{ value: 'ambas', label: 'Ambas' }, { value: 'katia', label: 'Katia' }, { value: 'mariana', label: 'Mariana' }], p.who)}</div>
      <div><label class="block text-[11px] font-bold text-stone-500 mb-1">Periodo</label>${select('prog-range', [{ value: '1m', label: 'Último mes' }, { value: '3m', label: 'Últimos 3 meses' }, { value: '6m', label: 'Últimos 6 meses' }, { value: 'todo', label: 'Todo' }], p.range)}</div>
    </div>
    <div class="bg-paper rounded-2xl p-3 sm:p-4 border border-[#E8DFD5]">
      ${hasData
        ? `<div class="relative h-64 sm:h-72"><canvas id="prog-chart"></canvas></div>`
        : `<div class="py-14 text-center"><p class="text-sm font-bold text-stone-600">Aún no hay datos para graficar</p>
           <p class="text-xs text-stone-400 mt-1">${p.type === 'ejercicio' ? 'Registren sus series desde Inicio.' : 'Registren sus medidas en la sección Medidas.'}</p></div>`}
    </div>
  `, 'shadow-cute')}
  ${hasData ? `<div class="grid gap-4 sm:grid-cols-2">${summary}</div>` : ''}
  ${consistencyCard()}
  ${recordsCard()}`;
}

// ---------- Constancia y récords ----------

function streakFor(uid) {
  let ds = todayStr();
  // Si hoy toca y aún no termina, no rompe la racha: se empieza a contar desde ayer
  if (!completedOn(ds, uid)) ds = addDays(ds, -1);
  let streak = 0;
  for (let i = 0; i < 365; i++, ds = addDays(ds, -1)) {
    if (completedOn(ds, uid)) streak++;
    else if (routineForDate(ds, uid).exercises.length === 0) continue; // día de descanso: no rompe
    else break;
  }
  return streak;
}

function consistencyCard() {
  const who = state.progress.who === 'ambas' ? USER_IDS : [state.progress.who];
  const thisMonday = mondayOf(todayStr());
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(thisMonday, -7 * (7 - i)));
  const daysIn = (uid, from, n) => Array.from({ length: n }, (_, i) => addDays(from, i)).filter(d => completedOn(d, uid)).length;
  const monthPrefix = todayStr().slice(0, 7);

  const block = uid => {
    const c = PCOLOR[uid];
    const counts = weeks.map(w => daysIn(uid, w, 7));
    const max = Math.max(7, ...counts);
    const month = Object.keys(state.attendance).filter(d => d.startsWith(monthPrefix) && completedOn(d, uid)).length;
    const stat = (label, value) => `<div class="bg-paper rounded-2xl p-2.5 text-center"><div class="font-display font-bold text-2xl ${c.text}">${value}</div><div class="text-[10px] font-bold text-stone-400 uppercase">${label}</div></div>`;
    return `<div class="${c.soft} border ${c.border} rounded-3xl p-4">
      <div class="flex items-center gap-2 font-bold text-sm mb-3">${avatar(uid)} ${USERS[uid].name}</div>
      <div class="grid grid-cols-3 gap-2">
        ${stat('Esta semana', counts[7])}${stat('Este mes', month)}${stat('Racha', `${streakFor(uid)}<span class="text-xs"> d</span>`)}
      </div>
      <div class="flex items-end gap-1.5 h-20 mt-4" aria-label="Días por semana, últimas 8 semanas">
        ${counts.map((n, i) => `<div class="flex-1 flex flex-col items-center justify-end gap-1 h-full" title="Semana del ${fmtDate(weeks[i])}: ${n} días">
          <span class="text-[10px] font-bold text-stone-500">${n || ''}</span>
          <div class="w-full rounded-t-lg ${n ? c.dot : 'bg-paper'}" style="height:${Math.max(6, (n / max) * 100)}%"></div>
        </div>`).join('')}
      </div>
      <div class="flex justify-between text-[10px] font-semibold text-stone-400 mt-1"><span>Hace 8 semanas</span><span>Esta semana</span></div>
    </div>`;
  };

  return card(`
    <h3 class="font-display font-bold text-lg text-ink">Constancia</h3>
    <p class="text-xs text-stone-500 mb-3">Días con rutina completa. Los días de descanso no rompen la racha.</p>
    <div class="grid gap-4 ${who.length === 2 ? 'sm:grid-cols-2' : ''}">${who.map(block).join('')}</div>
  `);
}

function recordsCard() {
  const who = state.progress.who === 'ambas' ? USER_IDS : [state.progress.who];
  const map = {};
  state.workouts.forEach(l => {
    if (!who.includes(l.bestie)) return;
    const k = norm(l.name);
    map[k] = map[k] || { name: l.name.trim() };
    const best = (l.setsDetail || []).reduce((b, s) => (parseFloat(s.weight) || 0) > (b ? b.weight : -1) ? { weight: parseFloat(s.weight) || 0, reps: s.reps } : b, null);
    const cur = map[k][l.bestie];
    if (best && (!cur || best.weight > cur.weight || (best.weight === cur.weight && l.date < cur.date))) {
      map[k][l.bestie] = { ...best, date: l.date };
    }
  });
  const rows = Object.values(map).sort((a, b) => a.name.localeCompare(b.name));

  return card(`
    <h3 class="font-display font-bold text-lg text-ink mb-3">Récords personales</h3>
    ${rows.length ? `<div class="overflow-x-auto -mx-1"><table class="w-full text-sm">
      <thead><tr class="text-[11px] font-bold text-stone-400">
        <th class="text-left py-1.5 px-1 font-bold">Ejercicio</th>
        ${who.map(uid => `<th class="py-1.5 px-1 font-bold text-right ${PCOLOR[uid].text}">${USERS[uid].name}</th>`).join('')}
      </tr></thead>
      <tbody class="divide-y divide-[#F0E8DF]">
        ${rows.map(r => `<tr>
          <td class="py-2 px-1 font-semibold text-ink">${esc(r.name)}</td>
          ${who.map(uid => `<td class="py-2 px-1 text-right whitespace-nowrap">${r[uid]
            ? `<span class="font-bold text-ink">${r[uid].weight} lb</span><span class="text-[11px] text-stone-400"> × ${r[uid].reps}</span><div class="text-[10px] font-semibold text-stone-400">${fmtDate(r[uid].date)}</div>`
            : '<span class="text-stone-300">--</span>'}</td>`).join('')}
        </tr>`).join('')}
      </tbody></table></div>`
    : `<p class="text-sm text-stone-400 text-center py-4">Aún no hay récords. Se llenan solos al registrar tus series.</p>`}
  `);
}

function drawProgressChart() {
  const canvas = document.getElementById('prog-chart');
  if (!canvas) return;
  const p = state.progress;
  const series = progressSeries();
  const dates = [...new Set(Object.values(series).flatMap(s => Object.keys(s)))].sort();
  const unit = p.type === 'ejercicio' ? 'lb' : MEAS_FIELDS.find(f => f.key === p.measure).unit;
  const font = { family: 'Plus Jakarta Sans', weight: '600', size: 11 };

  chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: dates.map(d => fmtDate(d)),
      datasets: Object.entries(series).map(([uid, s]) => ({
        label: USERS[uid].name,
        data: dates.map(d => s[d] ?? null),
        borderColor: PCOLOR[uid].hex,
        backgroundColor: PCOLOR[uid].fill,
        pointBackgroundColor: PCOLOR[uid].hex,
        borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 6, tension: 0.35, spanGaps: true, fill: true,
      })),
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, font } },
        tooltip: {
          backgroundColor: '#FFFDF9', titleColor: '#2D2624', bodyColor: '#2D2624', borderColor: '#F0C7CE', borderWidth: 1, padding: 10,
          callbacks: { label: c => c.parsed.y === null ? null : ` ${c.dataset.label}: ${c.parsed.y} ${unit}` },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font, color: '#8a7f7a' } },
        y: { grid: { color: 'rgba(45,38,36,0.05)' }, ticks: { font, color: '#8a7f7a', callback: v => `${v} ${unit}` } },
      },
    },
  });
}

// =========================================================
// MEDIDAS
// =========================================================

function viewMedidas() {
  const u = state.user;
  const who = state.measWho || u.id;
  const mine = state.measurements.filter(m => m.bestie === u.id).sort((a, b) => b.date.localeCompare(a.date));
  const list = state.measurements.filter(m => m.bestie === who).sort((a, b) => b.date.localeCompare(a.date) || (b.timestamp || 0) - (a.timestamp || 0));
  const chron = [...list].reverse();

  let reminder;
  if (!mine.length) {
    reminder = `<h3 class="font-display font-bold text-lg text-ink">Registra tus medidas iniciales</h3>
      <p class="text-xs text-stone-600 mt-1">Después te recordamos cada 2 semanas para ver tus cambios.</p>`;
  } else {
    const since = daysBetween(mine[0].date, todayStr());
    const left = 14 - since;
    reminder = left <= 0
      ? `<h3 class="font-display font-bold text-lg text-ink">Toca medirte hoy</h3>
         <p class="text-xs text-stone-600 mt-1">Tu última medición fue hace ${since} días (${fmtDate(mine[0].date, { day: 'numeric', month: 'long' })}).</p>`
      : `<h3 class="font-display font-bold text-lg text-ink">Faltan ${left} ${left === 1 ? 'día' : 'días'} para tu próxima medición</h3>
         <p class="text-xs text-stone-600 mt-1">Última: ${fmtDate(mine[0].date, { day: 'numeric', month: 'long' })}.</p>`;
  }

  const field = (f, placeholder) => `
    <div class="bg-cream p-2.5 rounded-2xl border border-[#E8DFD5]">
      <label class="block text-[11px] font-bold text-stone-500 mb-1" for="m-${f.key}">${f.label} (${f.unit})</label>
      <input id="m-${f.key}" name="${f.key}" type="number" inputmode="decimal" step="0.1" min="0" placeholder="${placeholder}"
        class="w-full bg-paper border border-[#DFD5CA] focus:border-blush-300 rounded-xl px-2.5 py-1.5 text-sm font-bold outline-none">
    </div>`;
  const placeholders = { weight: '130', bust: '88', waist: '66', abdomen: '78', hip: '96', thigh: '54', arm: '27' };

  const compare = MEAS_FIELDS.map(f => {
    const vals = chron.filter(m => typeof m[f.key] === 'number');
    if (!vals.length) {
      return `<div class="bg-cream rounded-2xl p-3 border border-[#E8DFD5]">
        <div class="text-xs font-bold text-stone-500">${f.label}</div>
        <div class="font-display font-bold text-xl text-stone-300 mt-0.5">--</div></div>`;
    }
    const last = vals[vals.length - 1][f.key];
    const first = vals[0][f.key];
    const prev = vals.length > 1 ? vals[vals.length - 2][f.key] : null;
    return `<div class="bg-cream rounded-2xl p-3 border border-[#E8DFD5]">
      <div class="text-xs font-bold text-stone-500">${f.label}</div>
      <div class="font-display font-bold text-xl text-ink mt-0.5">${last} <span class="text-xs font-sans text-stone-400">${f.unit}</span></div>
      <div class="mt-2 pt-2 border-t border-[#E8DFD5] text-[11px] space-y-0.5">
        <div class="flex justify-between"><span class="text-stone-400 font-semibold">vs inicio</span><span class="font-bold text-ink">${signed(last - first, f.unit)}</span></div>
        <div class="flex justify-between"><span class="text-stone-400 font-semibold">vs anterior</span><span class="font-bold text-ink">${prev === null ? '--' : signed(last - prev, f.unit)}</span></div>
      </div></div>`;
  }).join('');

  return `
  <section class="bg-sage-50 rounded-3xl p-5 shadow-cute border border-sage-200">
    ${eyebrow('Cada 2 semanas', 'text-sage-500 bg-paper border-sage-200')}
    <div class="mt-2">${reminder}</div>
  </section>

  ${card(`
    <h2 class="font-display font-bold text-xl text-ink">Registrar medidas</h2>
    <p class="text-xs text-stone-500 mt-1 mb-4">Llena solo las que te tomaste hoy.</p>
    <form data-submit="save-meas" class="space-y-3">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div class="bg-cream p-2.5 rounded-2xl border border-[#E8DFD5]">
          <label class="block text-[11px] font-bold text-stone-500 mb-1" for="m-date">Fecha</label>
          <input id="m-date" name="date" type="date" value="${todayStr()}" max="${todayStr()}" required
            class="w-full bg-paper border border-[#DFD5CA] rounded-xl px-2 py-1.5 text-xs font-bold outline-none">
        </div>
        ${MEAS_FIELDS.map(f => field(f, placeholders[f.key])).join('')}
      </div>
      <input name="note" maxlength="100" placeholder="Nota opcional (ej. en ayunas)" class="${inputCls}">
      <button type="submit" class="w-full ${btnPrimary}">Guardar medidas</button>
    </form>
  `)}

  ${card(`
    <div class="flex items-center justify-between gap-3 mb-3">
      <h3 class="font-display font-bold text-lg text-ink">Cambios</h3>
      ${segmented(USER_IDS.map(id => ({ value: id, label: USERS[id].name })), who, 'meas-who')}
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">${compare}</div>
  `)}

  ${card(`
    <h3 class="font-display font-bold text-lg text-ink mb-3">Historial de ${USERS[who].name}</h3>
    ${list.length ? `<div class="space-y-2">${list.map(m => `
      <div class="p-3 rounded-2xl bg-cream border border-[#E8DFD5]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold ${PCOLOR[who].text}">${cap(fmtDate(m.date, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }))}</span>
          ${who === u.id && m.id ? `<button data-action="delete-meas" data-id="${esc(m.id)}" aria-label="Borrar medición" class="text-stone-300 hover:text-blush-500">${icon('trash-2', 'w-3.5 h-3.5')}</button>` : ''}
        </div>
        <div class="flex flex-wrap gap-1.5 mt-2">
          ${MEAS_FIELDS.filter(f => typeof m[f.key] === 'number').map(f => `<span class="bg-paper px-2 py-0.5 rounded-lg text-[11px] font-bold text-stone-600">${f.label}: ${m[f.key]} ${f.unit}</span>`).join('')}
        </div>
        ${m.note ? `<p class="text-xs text-stone-500 mt-2">${esc(m.note)}</p>` : ''}
      </div>`).join('')}</div>`
    : `<p class="text-sm text-stone-400 text-center py-4">Sin mediciones todavía.</p>`}
  `)}`;
}

// =========================================================
// CALENDARIO
// =========================================================

function viewCalendario() {
  const cur = state.calMonth;
  const y = cur.getFullYear(), mo = cur.getMonth();
  const offset = (new Date(y, mo, 1).getDay() + 6) % 7;
  const daysIn = new Date(y, mo + 1, 0).getDate();
  const today = todayStr();
  const prefix = `${y}-${String(mo + 1).padStart(2, '0')}`;

  let cells = '';
  for (let i = 0; i < offset; i++) cells += `<div></div>`;
  let together = 0, measured = 0;
  const count = { katia: 0, mariana: 0 };

  for (let d = 1; d <= daysIn; d++) {
    const ds = `${prefix}-${String(d).padStart(2, '0')}`;
    const k = completedOn(ds, 'katia'), m = completedOn(ds, 'mariana');
    const meas = measuredOn(ds, 'katia') || measuredOn(ds, 'mariana');
    if (k) count.katia++;
    if (m) count.mariana++;
    if (k && m) together++;
    if (meas) measured++;

    const both = k && m;
    const bg = both ? 'bg-gradient-to-br from-blush-100 to-lavender-100 border-blush-200' : 'bg-cream border-[#E8DFD5] hover:border-blush-200';
    const dots = USER_IDS.map(uid => {
      if (completedOn(ds, uid)) return `<span class="w-2 h-2 rounded-full ${PCOLOR[uid].dot}"></span>`;
      if (partialOn(ds, uid)) return `<span class="w-2 h-2 rounded-full border ${PCOLOR[uid].ring}"></span>`;
      return '';
    }).join('');

    cells += `
      <button data-action="day-detail" data-date="${ds}"
        class="relative aspect-square rounded-2xl border ${bg} ${ds === today ? 'ring-2 ring-blush-300 ring-offset-1 ring-offset-paper' : ''} flex flex-col items-center justify-center gap-1 transition-transform active:scale-95">
        ${meas ? `<span class="absolute top-1 right-1 text-sage-500">${icon('ruler', 'w-3 h-3')}</span>` : ''}
        ${both ? `<span class="absolute top-1 left-1 text-blush-400">${icon('heart', 'w-3 h-3 fill-blush-300')}</span>` : ''}
        <span class="text-xs sm:text-sm font-bold text-ink">${d}</span>
        <span class="flex gap-1 h-2">${dots}</span>
      </button>`;
  }

  const stat = (label, value, cls) => `<div class="rounded-2xl p-3 text-center ${cls}"><div class="font-display font-bold text-2xl">${value}</div><div class="text-[11px] font-bold">${label}</div></div>`;

  return `
  ${card(`
    <div class="flex items-center justify-between mb-4">
      <button data-action="cal-month" data-value="-1" aria-label="Mes anterior" class="p-2.5 rounded-2xl bg-cream hover:bg-blush-50 border border-[#E5DDD3]">${icon('chevron-left')}</button>
      <h2 class="font-display font-bold text-xl text-ink">${cap(cur.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }))}</h2>
      <button data-action="cal-month" data-value="1" aria-label="Mes siguiente" class="p-2.5 rounded-2xl bg-cream hover:bg-blush-50 border border-[#E5DDD3]">${icon('chevron-right')}</button>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-4 bg-cream py-2.5 px-3 rounded-2xl border border-[#E8DFD5] text-[11px] font-bold text-stone-600">
      <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blush-400"></span>Katia</span>
      <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-lavender-400"></span>Mariana</span>
      <span class="flex items-center gap-1.5 text-blush-500">${icon('heart', 'w-3 h-3 fill-blush-300')}Fuimos ambas</span>
      <span class="flex items-center gap-1.5 text-sage-500">${icon('ruler', 'w-3 h-3')}Nos medimos</span>
    </div>

    <div class="grid grid-cols-7 text-center text-[11px] font-bold text-stone-400 mb-2">
      ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => `<div>${d}</div>`).join('')}
    </div>
    <div class="grid grid-cols-7 gap-1.5 sm:gap-2">${cells}</div>
    <p class="text-center text-[11px] text-stone-400 mt-3">Punto relleno: rutina completa · Contorno: la empezó · Toca un día para ver el detalle</p>
  `, 'shadow-cute')}

  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    ${stat('Juntas', together, 'bg-gradient-to-br from-blush-100 to-lavender-100 text-ink')}
    ${stat('Katia', count.katia, 'bg-blush-50 border border-blush-200 text-blush-500')}
    ${stat('Mariana', count.mariana, 'bg-lavender-50 border border-lavender-200 text-lavender-500')}
    ${stat('Mediciones', measured, 'bg-sage-50 border border-sage-200 text-sage-500')}
  </div>`;
}

function openDayDetail(ds) {
  const uid = state.user.id;
  const block = (id) => {
    const c = PCOLOR[id];
    const logs = logsOn(ds, id);
    const meas = state.measurements.find(m => m.date === ds && m.bestie === id);
    const w = wellnessOf(ds, id);
    const h = healthyStats(w);
    const { done, total } = routineProgress(ds, id);
    const status = completedOn(ds, id) ? 'Rutina completa' : logs.length ? `Empezó (${done}/${total})` : 'No fue';
    return `<div class="${c.soft} border ${c.border} rounded-2xl p-3.5 space-y-2">
      <div class="flex items-center justify-between">
        <span class="flex items-center gap-2 font-bold text-sm">${avatar(id, 'w-6 h-6 text-[10px]')} ${USERS[id].name}</span>
        <span class="text-[11px] font-bold ${completedOn(ds, id) ? 'text-sage-500' : 'text-stone-400'}">${status}</span>
      </div>
      ${logs.length ? `<div class="flex flex-wrap gap-1.5">${logs.map(l => `<span class="bg-paper px-2 py-0.5 rounded-lg text-[11px] font-bold text-stone-600">${esc(l.name)} · ${maxWeight(l)} lb</span>`).join('')}</div>` : ''}
      ${meas ? `<p class="text-[11px] font-semibold text-sage-500">Se midió: ${MEAS_FIELDS.filter(f => typeof meas[f.key] === 'number').map(f => `${f.label} ${meas[f.key]} ${f.unit}`).join(' · ')}</p>` : ''}
      ${w && (w.sleepHours || h) ? `<p class="text-[11px] font-semibold text-stone-500">${w.sleepHours ? `Durmió ${w.sleepHours} h${w.sleepRating ? ` (${SLEEP_RATINGS[w.sleepRating].label.toLowerCase()})` : ''}` : ''}${w.sleepHours && h ? ' · ' : ''}${h ? `Comida ${h.pct}% sana` : ''}</p>` : ''}
    </div>`;
  };
  const isFuture = ds > todayStr();
  const manual = completedOn(ds, uid);
  openModal(`
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-display font-bold text-xl text-ink">${cap(fmtDate(ds, { weekday: 'long', day: 'numeric', month: 'long' }))}</h3>
      <button data-action="close-modal" aria-label="Cerrar" class="text-stone-400 hover:text-ink">${icon('x', 'w-5 h-5')}</button>
    </div>
    <div class="space-y-2.5">${USER_IDS.map(block).join('')}</div>
    ${isFuture ? '' : `
    <button data-action="toggle-attendance" data-date="${ds}" class="w-full mt-4 ${manual ? 'bg-paper border border-[#DFD5CA] text-stone-600' : 'bg-ink text-paper'} font-bold text-sm py-3 rounded-2xl">
      ${manual ? 'Quitar mi día completo' : 'Marcar que sí fui'}
    </button>
    <p class="text-[11px] text-stone-400 text-center mt-2">Úsalo si olvidaste registrar tus series ese día.</p>`}
  `);
}

// =========================================================
// BIENESTAR: sueño y comida, simple
// =========================================================

function wellDraft() {
  if (!state.wellDraft || state.wellDraft.date !== state.wellDate) {
    const saved = wellnessOf(state.wellDate, state.user.id);
    state.wellDraft = {
      date: state.wellDate,
      sleepHours: saved?.sleepHours ?? 7.5,
      sleepRating: saved?.sleepRating ?? null,
      meals: { desayuno: null, colacion: null, comida: null, cena: null, ...(saved?.meals || {}) },
      saved: Boolean(saved),
    };
  }
  return state.wellDraft;
}

function viewBienestar() {
  const d = wellDraft();
  const isToday = state.wellDate === todayStr();
  const h = healthyStats(d);

  const mealRow = (m) => {
    const v = d.meals[m.key];
    const pill = (value, label, on) => `<button type="button" data-action="meal" data-meal="${m.key}" data-value="${value}"
      class="px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${v === value ? on : 'bg-paper border-[#E5DDD3] text-stone-500 hover:border-stone-300'}">${label}</button>`;
    return `<div class="flex items-center justify-between gap-3 py-2.5">
      <span class="text-sm font-semibold text-ink">${m.label}</span>
      <div class="flex gap-1.5">${pill('sana', 'Sana', 'bg-sage-400 border-sage-400 text-white')}${pill('nosana', 'No tanto', 'bg-blush-300 border-blush-300 text-white')}</div>
    </div>`;
  };

  return `
  ${card(`
    <div class="flex items-center justify-between gap-2">
      <button data-action="well-day" data-value="-1" aria-label="Día anterior" class="p-2.5 rounded-2xl bg-cream hover:bg-blush-50 border border-[#E5DDD3]">${icon('chevron-left')}</button>
      <div class="text-center">
        <h2 class="font-display font-bold text-xl text-ink">${isToday ? 'Hoy' : cap(fmtDate(state.wellDate, { weekday: 'long' }))}</h2>
        <p class="text-xs text-stone-500 font-semibold">${fmtDate(state.wellDate, { day: 'numeric', month: 'long' })}</p>
      </div>
      <button data-action="well-day" data-value="1" aria-label="Día siguiente" ${isToday ? 'disabled' : ''}
        class="p-2.5 rounded-2xl bg-cream hover:bg-blush-50 border border-[#E5DDD3] disabled:opacity-30 disabled:pointer-events-none">${icon('chevron-right')}</button>
    </div>
  `)}

  ${card(`
    ${eyebrow('Sueño', 'text-lavender-500 bg-lavender-50 border-lavender-200')}
    <div class="flex items-center justify-between mt-3">
      <span class="text-sm font-bold text-ink">Horas dormidas</span>
      <div class="flex items-center gap-3">
        <button data-action="sleep" data-value="-0.5" aria-label="Menos" class="w-9 h-9 rounded-full bg-paper border border-lavender-200 text-lavender-500 flex items-center justify-center active:scale-90">${icon('minus')}</button>
        <span class="font-display font-bold text-2xl text-lavender-500 w-16 text-center">${d.sleepHours} h</span>
        <button data-action="sleep" data-value="0.5" aria-label="Más" class="w-9 h-9 rounded-full bg-lavender-400 text-white flex items-center justify-center active:scale-90">${icon('plus')}</button>
      </div>
    </div>
    <p class="text-sm font-bold text-ink mt-4 mb-2">¿Cómo dormiste?</p>
    <div class="grid grid-cols-3 gap-2">
      ${Object.entries(SLEEP_RATINGS).map(([k, r]) => `<button data-action="sleep-rating" data-value="${k}"
        class="py-2.5 rounded-2xl text-sm font-bold border transition-all ${d.sleepRating === k ? r.on : 'bg-paper border-[#E5DDD3] text-stone-500'}">${r.label}</button>`).join('')}
    </div>
  `)}

  ${card(`
    ${eyebrow('Comida', 'text-sage-500 bg-sage-50 border-sage-200')}
    <p class="text-sm text-stone-500 mt-2">Marca cada comida como sana o no tanto.</p>
    <div class="divide-y divide-[#F0E8DF] mt-2">${MEALS.map(mealRow).join('')}</div>
    <div class="mt-3 bg-cream rounded-2xl p-3.5 border border-[#E8DFD5]">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold text-stone-600">Comí sano</span>
        <span class="font-display font-bold text-lg ${h ? 'text-sage-500' : 'text-stone-300'}">${h ? `${h.pct}%` : '--'}</span>
      </div>
      <div class="h-2.5 rounded-full bg-paper overflow-hidden border border-[#E8DFD5]">
        <div class="h-full bg-sage-400 rounded-full transition-all" style="width:${h ? h.pct : 0}%"></div>
      </div>
      <p class="text-[11px] text-stone-400 mt-1.5">${h ? `${h.sanas} de ${h.total} comidas sanas` : 'Aún no marcas comidas'}</p>
    </div>
  `)}

  <button data-action="save-wellness" class="w-full ${btnPrimary}">${d.saved ? 'Actualizar día' : 'Guardar día'}</button>

  ${card(`
    <h3 class="font-display font-bold text-lg text-ink mb-3">Últimos 7 días</h3>
    ${wellnessWeek()}
  `)}`;
}

function wellnessWeek() {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(todayStr(), -i));
  const cell = (ds, uid) => {
    const w = wellnessOf(ds, uid);
    if (!w) return `<td class="py-2 text-center text-stone-300 text-xs">--</td>`;
    const h = healthyStats(w);
    const r = w.sleepRating ? SLEEP_RATINGS[w.sleepRating] : null;
    return `<td class="py-2 text-center">
      <div class="inline-flex flex-col items-center gap-1">
        <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${r ? r.soft : 'bg-cream text-stone-500'}">${w.sleepHours ?? '--'} h</span>
        <span class="text-[11px] font-bold text-sage-500">${h ? `${h.pct}% sano` : ''}</span>
      </div></td>`;
  };
  return `<div class="overflow-x-auto -mx-1"><table class="w-full text-sm">
    <thead><tr class="text-[11px] font-bold text-stone-400">
      <th class="text-left py-1 px-1 font-bold">Día</th>
      ${USER_IDS.map(uid => `<th class="py-1 font-bold ${PCOLOR[uid].text}">${USERS[uid].name}</th>`).join('')}
    </tr></thead>
    <tbody class="divide-y divide-[#F0E8DF]">
      ${dates.map(ds => `<tr><td class="py-2 px-1 text-xs font-bold text-stone-600 whitespace-nowrap">${cap(fmtDate(ds, { weekday: 'short', day: 'numeric' }))}</td>${USER_IDS.map(uid => cell(ds, uid)).join('')}</tr>`).join('')}
    </tbody></table></div>`;
}

// =========================================================
// HORARIO: agenda privada de cada una
// =========================================================

function agendaKey() { return `${state.user.id}_${state.agendaWeek}`; }

function agendaDoc() {
  const saved = state.agenda[agendaKey()];
  const days = {};
  DAYS.forEach(d => { days[d.key] = [...(saved?.days?.[d.key] || [])]; });
  return { weekly: [...(saved?.weekly || [])], days };
}

async function saveAgenda(doc) {
  const key = agendaKey();
  const payload = { bestie: state.user.id, week: state.agendaWeek, weekly: doc.weekly, days: doc.days };
  state.agenda[key] = payload;
  render();
  await store.setItem('agenda', key, payload);
}

// ---------- Actividades del horario ----------

const ACTIVITIES = [
  { key: 'gym', label: 'Gym' },
  { key: 'trabajo', label: 'Trabajar', sub: 'work' },
  { key: 'estudio', label: 'Estudiar', sub: 'study' },
  { key: 'universidad', label: 'Universidad' },
  { key: 'amigos', label: 'Tiempo con amigos' },
  { key: 'familia', label: 'Familia' },
  { key: 'caminar', label: 'Caminar' },
  { key: 'bano', label: 'Baño' },
  { key: 'arreglarse', label: 'Arreglarse' },
  { key: 'stream', label: 'Stream' },
  { key: 'videojuegos', label: 'Jugar videojuegos' },
  { key: 'libre', label: 'Tiempo libre' },
  { key: 'otro', label: 'Otro' },
];
const activityOf = key => ACTIVITIES.find(a => a.key === key) || null;
const DEFAULT_OPTIONS = { work: ['RentaClara', 'Tornofit'], study: [] };

function optionsKey() { return `${state.user.id}_opciones`; }
function myOptions() {
  const saved = state.agenda[optionsKey()];
  return {
    work: saved?.work || [...DEFAULT_OPTIONS.work],
    study: saved?.study || [...DEFAULT_OPTIONS.study],
  };
}
async function saveOptions(opts) {
  const key = optionsKey();
  const payload = { bestie: state.user.id, kind: 'opciones', work: opts.work, study: opts.study };
  state.agenda[key] = payload;
  await store.setItem('agenda', key, payload);
}

/** Minutos entre dos horas "HH:MM" (si termina después de medianoche, cruza el día). */
function minutesBetween(start, end) {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff <= 0) diff += 24 * 60;
  return diff;
}
function fmtHours(min) {
  if (!min) return '0 h';
  const h = Math.floor(min / 60), m = min % 60;
  return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`;
}
function itemTitle(item) {
  const a = activityOf(item.cat);
  if (!a) return item.text || '';
  return [a.label, item.sub].filter(Boolean).join(' · ');
}

function agendaItem(item, list, day = '') {
  const range = item.time ? `${esc(item.time)}${item.end ? `–${esc(item.end)}` : ''}` : '';
  const dur = minutesBetween(item.time, item.end);
  const title = itemTitle(item);
  const note = item.cat && item.text ? item.text : '';
  return `<li class="group flex items-center gap-2.5 py-2">
    <button data-action="agenda-toggle" data-list="${list}" data-day="${day}" data-id="${esc(item.id)}" aria-label="${item.done ? 'Marcar pendiente' : 'Marcar hecho'}"
      class="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${item.done ? 'bg-blush-400 border-blush-400 text-white' : 'border-blush-200 bg-paper hover:border-blush-300'}">
      ${item.done ? icon('check', 'w-3 h-3') : ''}</button>
    ${range ? `<span class="text-[11px] font-bold text-lavender-500 bg-lavender-50 px-2 py-0.5 rounded-full shrink-0">${range}</span>` : ''}
    <span class="flex-1 min-w-0 ${item.done ? 'line-through text-stone-400' : ''}">
      <span class="block text-sm ${item.done ? '' : 'text-ink font-semibold'} break-words">${esc(title)}</span>
      ${note || dur ? `<span class="block text-[11px] text-stone-400 font-medium">${[dur ? fmtHours(dur) : '', esc(note)].filter(Boolean).join(' · ')}</span>` : ''}
    </span>
    <button data-action="agenda-delete" data-list="${list}" data-day="${day}" data-id="${esc(item.id)}" aria-label="Borrar"
      class="text-stone-300 hover:text-blush-500 shrink-0">${icon('x', 'w-3.5 h-3.5')}</button>
  </li>`;
}

// ---------- Fechas importantes (privadas) ----------

function eventsKey() { return `${state.user.id}_eventos`; }
function myEvents() { return [...(state.agenda[eventsKey()]?.events || [])]; }

/** Eventos de un día; los cumpleaños se repiten cada año. */
function eventsOn(ds) {
  return myEvents()
    .filter(e => e.date === ds || (e.type === 'cumple' && e.date.slice(5) === ds.slice(5) && e.date <= ds))
    .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
}

async function saveEvents(events) {
  const key = eventsKey();
  const payload = { bestie: state.user.id, kind: 'eventos', events };
  state.agenda[key] = payload;
  render();
  await store.setItem('agenda', key, payload);
}

function upcomingEvents(days = 60) {
  const today = todayStr();
  const out = [];
  for (let i = 0; i <= days; i++) {
    const ds = addDays(today, i);
    eventsOn(ds).forEach(e => out.push({ ...e, on: ds }));
  }
  return out;
}

function eventChip(e, small = false) {
  const t = EVENT_TYPES[e.type] || EVENT_TYPES.otro;
  return `<span class="inline-flex items-center gap-1 ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'} font-bold rounded-full border ${t.chip} max-w-full">
    ${icon(t.icon, small ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0')}<span class="truncate">${e.time ? `${esc(e.time)} · ` : ''}${esc(e.title)}</span></span>`;
}

function viewHorarioCalendar() {
  const cur = state.horarioMonth;
  const y = cur.getFullYear(), mo = cur.getMonth();
  const offset = (new Date(y, mo, 1).getDay() + 6) % 7;
  const daysIn = new Date(y, mo + 1, 0).getDate();
  const today = todayStr();
  let cells = '';
  for (let i = 0; i < offset; i++) cells += '<div></div>';
  for (let d = 1; d <= daysIn; d++) {
    const ds = `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const evs = eventsOn(ds);
    cells += `<button data-action="event-day" data-date="${ds}"
      class="min-h-16 sm:min-h-20 rounded-2xl border p-1 sm:p-1.5 flex flex-col items-stretch gap-1 text-left transition-colors ${evs.length ? 'bg-paper border-blush-200' : 'bg-cream border-[#E8DFD5]'} hover:border-blush-300 ${ds === today ? 'ring-2 ring-blush-300 ring-offset-1 ring-offset-paper' : ''}">
      <span class="text-xs font-bold text-ink px-0.5">${d}</span>
      <span class="hidden sm:flex flex-col gap-0.5 min-w-0">${evs.slice(0, 2).map(e => eventChip(e, true)).join('')}${evs.length > 2 ? `<span class="text-[10px] font-bold text-stone-400 px-1">+${evs.length - 2}</span>` : ''}</span>
      <span class="flex sm:hidden flex-wrap gap-0.5 px-0.5">${evs.map(e => `<span class="w-1.5 h-1.5 rounded-full ${(EVENT_TYPES[e.type] || EVENT_TYPES.otro).dot}"></span>`).join('')}</span>
    </button>`;
  }

  const upcoming = upcomingEvents();
  return `
  ${card(`
    <div class="flex items-center justify-between mb-4">
      <button data-action="horario-month" data-value="-1" aria-label="Mes anterior" class="p-2.5 rounded-2xl bg-cream hover:bg-blush-50 border border-[#E5DDD3]">${icon('chevron-left')}</button>
      <h3 class="font-display font-bold text-xl text-ink">${cap(cur.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }))}</h3>
      <button data-action="horario-month" data-value="1" aria-label="Mes siguiente" class="p-2.5 rounded-2xl bg-cream hover:bg-blush-50 border border-[#E5DDD3]">${icon('chevron-right')}</button>
    </div>
    <div class="flex flex-wrap justify-center gap-1.5 mb-4">${Object.values(EVENT_TYPES).map(t => `<span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${t.chip}">${icon(t.icon, 'w-3 h-3')}${t.label}</span>`).join('')}</div>
    <div class="grid grid-cols-7 text-center text-[11px] font-bold text-stone-400 mb-2">${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => `<div>${d}</div>`).join('')}</div>
    <div class="grid grid-cols-7 gap-1 sm:gap-1.5">${cells}</div>
    <p class="text-center text-[11px] text-stone-400 mt-3">Toca un día para agregar una fecha importante. Los cumpleaños se repiten cada año.</p>
  `, 'shadow-cute')}

  ${card(`
    <h3 class="font-display font-bold text-lg text-ink mb-3">Próximas fechas</h3>
    ${upcoming.length ? `<ul class="space-y-2">${upcoming.map(e => `
      <li class="flex items-center gap-3">
        <div class="w-12 text-center shrink-0">
          <div class="font-display font-bold text-lg text-ink leading-none">${parseDate(e.on).getDate()}</div>
          <div class="text-[10px] font-bold text-stone-400 uppercase">${fmtDate(e.on, { month: 'short' })}</div>
        </div>
        <div class="min-w-0 flex-1">${eventChip(e)}</div>
        <span class="text-[11px] font-semibold text-stone-400 shrink-0">${e.on === todayStr() ? 'Hoy' : `en ${daysBetween(todayStr(), e.on)} d`}</span>
      </li>`).join('')}</ul>`
    : `<p class="text-sm text-stone-400 text-center py-3">Sin fechas en los próximos 2 meses.</p>`}
  `)}`;
}

function openEventDay(ds) {
  const evs = eventsOn(ds);
  openModal(`
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-display font-bold text-xl text-ink">${cap(fmtDate(ds, { weekday: 'long', day: 'numeric', month: 'long' }))}</h3>
      <button data-action="close-modal" aria-label="Cerrar" class="text-stone-400 hover:text-ink">${icon('x', 'w-5 h-5')}</button>
    </div>
    ${evs.length ? `<ul class="space-y-2 mb-4">${evs.map(e => `
      <li class="flex items-center justify-between gap-2">
        <div class="min-w-0">${eventChip(e)}${e.type === 'cumple' && e.date !== ds ? `<span class="text-[11px] text-stone-400 ml-1">(cada año)</span>` : ''}</div>
        <button data-action="event-delete" data-id="${esc(e.id)}" data-date="${ds}" aria-label="Borrar" class="text-stone-300 hover:text-blush-500 shrink-0">${icon('trash-2', 'w-4 h-4')}</button>
      </li>`).join('')}</ul>` : `<p class="text-sm text-stone-400 mb-4">Nada anotado este día.</p>`}
    <form data-submit="event-add" data-date="${ds}" class="space-y-3 bg-cream border border-[#E8DFD5] rounded-2xl p-3.5">
      <p class="text-xs font-bold text-stone-600">Agregar fecha importante</p>
      <input name="title" required maxlength="80" placeholder="Ej. Cumple de Sofi, cena con amigas…" class="${inputCls} bg-paper">
      <div class="grid grid-cols-4 gap-1.5">
        ${Object.entries(EVENT_TYPES).map(([k, t], i) => `
        <label class="cursor-pointer">
          <input type="radio" name="type" value="${k}" ${i === 0 ? 'checked' : ''} class="peer sr-only">
          <span class="flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-bold bg-paper border-[#E5DDD3] text-stone-500 ${t.picked}">${icon(t.icon)}${t.label}</span>
        </label>`).join('')}
      </div>
      <div class="flex gap-2">
        <input name="time" type="time" aria-label="Hora (opcional)" class="w-32 bg-paper border border-[#DFD5CA] rounded-2xl px-3 py-2.5 text-sm outline-none">
        <button type="submit" class="flex-1 ${btnPrimary} py-2.5">Guardar</button>
      </div>
    </form>
  `);
}

function viewHorario() {
  const segment = card(`
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        ${eyebrow(`${icon('lock', 'w-3 h-3 inline -mt-0.5')} Solo tú lo ves`, 'text-lavender-500 bg-lavender-50 border-lavender-200')}
        <h2 class="font-display font-bold text-2xl text-ink mt-1.5">Mi horario</h2>
      </div>
      ${segmented([{ value: 'semana', label: 'Semana' }, { value: 'tiempo', label: 'Mi tiempo' }, { value: 'calendario', label: 'Fechas' }], state.horarioView, 'horario-view')}
    </div>
  `);
  if (state.horarioView === 'calendario') return segment + viewHorarioCalendar();
  if (state.horarioView === 'tiempo') return segment + viewTiempo();
  return segment + viewHorarioWeek();
}

// ---------- Nueva actividad (modal) ----------

function openActivity(dayKey) {
  const d = DAYS.find(x => x.key === dayKey);
  const ds = addDays(state.agendaWeek, DAYS.indexOf(d));
  const opts = myOptions();
  const chip = 'flex items-center justify-center text-center px-2 py-2 rounded-xl border text-xs font-bold bg-paper border-[#E5DDD3] text-stone-600 peer-checked:bg-blush-100 peer-checked:border-blush-300 peer-checked:text-blush-500 transition-colors';
  const subChip = 'inline-flex px-3 py-1.5 rounded-full border text-xs font-bold bg-paper border-[#E5DDD3] text-stone-600 peer-checked:bg-lavender-100 peer-checked:border-lavender-300 peer-checked:text-lavender-500';
  const subBlock = (kind, label, names, placeholder) => `
    <div data-sub-for="${kind}" class="hidden bg-cream border border-[#E8DFD5] rounded-2xl p-3 space-y-2">
      <p class="text-xs font-bold text-stone-600">${label}</p>
      ${names.length ? `<div class="flex flex-wrap gap-1.5">${names.map((n, i) => `
        <label class="cursor-pointer"><input type="radio" name="sub-${kind}" value="${esc(n)}" ${i === 0 ? 'checked' : ''} class="peer sr-only"><span class="${subChip}">${esc(n)}</span></label>`).join('')}
      </div>` : ''}
      <input name="new-${kind}" maxlength="40" placeholder="${placeholder}" class="w-full bg-paper border border-[#DFD5CA] focus:border-lavender-300 rounded-xl px-3 py-2 text-sm outline-none">
      <p class="text-[11px] text-stone-400">Si escribes uno nuevo, se guarda como opción para la próxima.</p>
    </div>`;

  openModal(`
    <form data-submit="activity-add" data-day="${dayKey}" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-display font-bold text-xl text-ink">¿Qué harás?</h3>
          <p class="text-xs font-semibold text-stone-500">${cap(fmtDate(ds, { weekday: 'long', day: 'numeric', month: 'long' }))}</p>
        </div>
        <button type="button" data-action="close-modal" aria-label="Cerrar" class="text-stone-400 hover:text-ink">${icon('x', 'w-5 h-5')}</button>
      </div>
      <div class="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Actividad">
        ${ACTIVITIES.map(a => `<label class="cursor-pointer"><input type="radio" name="cat" value="${a.key}" required class="peer sr-only"><span class="${chip} min-h-11">${a.label}</span></label>`).join('')}
      </div>
      ${subBlock('work', '¿En qué trabajarás?', opts.work, 'Otro trabajo…')}
      ${subBlock('study', '¿Qué estudiarás?', opts.study, opts.study.length ? 'Otra materia…' : 'Ej. Inglés, Cálculo…')}
      <div class="grid grid-cols-2 gap-2">
        <label class="block"><span class="block text-xs font-bold text-stone-600 mb-1">De</span>
          <input name="time" type="time" required class="w-full bg-cream border border-[#DFD5CA] focus:border-blush-300 rounded-xl px-3 py-2.5 text-sm outline-none"></label>
        <label class="block"><span class="block text-xs font-bold text-stone-600 mb-1">A</span>
          <input name="end" type="time" required class="w-full bg-cream border border-[#DFD5CA] focus:border-blush-300 rounded-xl px-3 py-2.5 text-sm outline-none"></label>
      </div>
      <input name="note" maxlength="80" placeholder="Nota (opcional)" class="${inputCls}">
      <button type="submit" class="w-full ${btnPrimary}">Agregar</button>
    </form>`);
}

// ---------- Mi tiempo: en qué se va cada hora ----------

/** Junta las actividades propias con hora de inicio y fin entre dos fechas (incluidas). */
function timeByActivity(from, to) {
  const totals = {};
  let total = 0;
  const days = new Set();
  Object.values(state.agenda).forEach(doc => {
    if (doc.bestie !== state.user.id || !doc.week || !doc.days) return;
    DAYS.forEach((d, i) => {
      const ds = addDays(doc.week, i);
      if (ds < from || ds > to) return;
      (doc.days[d.key] || []).forEach(it => {
        const min = minutesBetween(it.time, it.end);
        if (!min) return;
        const cat = it.cat && activityOf(it.cat) ? it.cat : 'otro';
        totals[cat] = totals[cat] || { min: 0, subs: {} };
        totals[cat].min += min;
        if (it.sub) totals[cat].subs[it.sub] = (totals[cat].subs[it.sub] || 0) + min;
        total += min;
        days.add(ds);
      });
    });
  });
  return { totals, total, days: days.size };
}

function viewTiempo() {
  const isWeek = state.tiempoPeriod !== 'mes';
  let from, to, label;
  if (isWeek) {
    from = state.agendaWeek; to = addDays(from, 6);
    label = `${fmtDate(from, { day: 'numeric', month: 'short' })} – ${fmtDate(to, { day: 'numeric', month: 'short' })}`;
  } else {
    const m = state.tiempoMonth;
    from = todayStr(m); to = todayStr(new Date(m.getFullYear(), m.getMonth() + 1, 0));
    label = cap(m.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }));
  }
  const { totals, total, days } = timeByActivity(from, to);
  const rows = Object.entries(totals).sort((a, b) => b[1].min - a[1].min);
  const max = rows.length ? rows[0][1].min : 1;
  const pct = min => total ? Math.round((min / total) * 100) : 0;

  const bar = (labelText, min, sub = false) => `
    <div class="grid grid-cols-[7.5rem_1fr_auto] sm:grid-cols-[10rem_1fr_auto] items-center gap-3 ${sub ? 'pl-3' : ''}" title="${esc(labelText)}: ${fmtHours(min)} (${pct(min)}%)">
      <span class="${sub ? 'text-xs text-stone-500 font-semibold' : 'text-sm text-ink font-bold'} truncate">${esc(labelText)}</span>
      <div class="${sub ? 'h-3' : 'h-5'} bg-cream rounded-r-md overflow-hidden">
        <div class="h-full ${sub ? 'bg-blush-200' : 'bg-blush-300'} rounded-r-md" style="width:${Math.max(2, (min / max) * 100)}%"></div>
      </div>
      <span class="text-xs font-bold ${sub ? 'text-stone-400' : 'text-stone-600'} whitespace-nowrap tabular-nums">${fmtHours(min)}<span class="text-stone-400 font-semibold"> · ${pct(min)}%</span></span>
    </div>`;

  const stat = (lbl, value) => `<div class="bg-cream border border-[#E8DFD5] rounded-2xl p-3 text-center"><div class="font-display font-bold text-xl text-ink">${value}</div><div class="text-[11px] font-bold text-stone-500">${lbl}</div></div>`;

  return `
  ${card(`
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      ${segmented([{ value: 'semana', label: 'Semanal' }, { value: 'mes', label: 'Mensual' }], isWeek ? 'semana' : 'mes', 'tiempo-period')}
      <div class="flex items-center justify-between sm:justify-end gap-2">
        <button data-action="tiempo-move" data-value="-1" aria-label="Anterior" class="p-2 rounded-xl bg-cream hover:bg-blush-50 border border-[#E5DDD3]">${icon('chevron-left')}</button>
        <span class="text-sm font-bold text-ink min-w-36 text-center">${label}</span>
        <button data-action="tiempo-move" data-value="1" aria-label="Siguiente" class="p-2 rounded-xl bg-cream hover:bg-blush-50 border border-[#E5DDD3]">${icon('chevron-right')}</button>
      </div>
    </div>
  `)}

  <div class="grid grid-cols-3 gap-2.5">
    ${stat('Horas anotadas', fmtHours(total))}
    ${stat('Más tiempo en', rows.length ? esc(activityOf(rows[0][0]).label) : '--')}
    ${stat('Días con plan', days)}
  </div>

  ${card(`
    <h3 class="font-display font-bold text-lg text-ink">¿En qué se me va el tiempo?</h3>
    <p class="text-xs text-stone-500 mb-4">Horas por actividad, de más a menos. Solo cuentan las actividades con hora de inicio y fin.</p>
    ${rows.length ? `<div class="space-y-2.5">${rows.map(([cat, t]) => {
      const subs = Object.entries(t.subs).sort((a, b) => b[1] - a[1]);
      return bar(activityOf(cat).label, t.min) + (subs.length > 0 ? subs.map(([n, m]) => bar(n, m, true)).join('') : '');
    }).join('')}</div>`
    : `<p class="text-sm text-stone-400 text-center py-8">Aún no hay actividades con horario en este periodo. Agrégalas en la vista Semana.</p>`}
  `, 'shadow-cute')}`;
}

function viewHorarioWeek() {
  const doc = agendaDoc();
  const week = state.agendaWeek;
  const isThisWeek = week === mondayOf(todayStr());
  const today = todayStr();
  const sortByTime = (a, b) => (a.time || '99:99').localeCompare(b.time || '99:99');
  const pendingWeek = doc.weekly.filter(i => !i.done).length;
  const field = 'bg-cream border border-[#DFD5CA] focus:border-blush-300 focus:bg-paper rounded-xl px-3 py-2 text-sm outline-none';

  return `
  ${card(`
    <div class="flex items-center justify-between gap-2">
      <button data-action="agenda-week" data-value="-7" aria-label="Semana anterior" class="p-2.5 rounded-2xl bg-cream hover:bg-blush-50 border border-[#E5DDD3]">${icon('chevron-left')}</button>
      <div class="text-center">
        <h2 class="font-display font-bold text-xl text-ink">${isThisWeek ? 'Esta semana' : 'Semana'}</h2>
        <p class="text-xs text-stone-500 font-semibold">${fmtDate(week, { day: 'numeric', month: 'short' })} – ${fmtDate(addDays(week, 6), { day: 'numeric', month: 'short' })}</p>
      </div>
      <button data-action="agenda-week" data-value="7" aria-label="Semana siguiente" class="p-2.5 rounded-2xl bg-cream hover:bg-blush-50 border border-[#E5DDD3]">${icon('chevron-right')}</button>
    </div>
  `)}

  ${card(`
    <div class="flex items-center justify-between mb-1">
      <h3 class="font-display font-bold text-lg text-ink">Pendientes de la semana</h3>
      <span class="text-xs font-bold text-stone-400">${pendingWeek} por hacer</span>
    </div>
    <ul class="divide-y divide-[#F0E8DF]">${doc.weekly.map(i => agendaItem(i, 'weekly')).join('') || '<li class="py-2 text-sm text-stone-400">Nada pendiente todavía.</li>'}</ul>
    <form data-submit="agenda-add" data-list="weekly" class="flex gap-2 mt-3">
      <input name="text" maxlength="140" required placeholder="Agregar pendiente…" aria-label="Nuevo pendiente" class="flex-1 min-w-0 ${field}">
      <button type="submit" aria-label="Agregar" class="w-10 h-10 rounded-xl bg-blush-400 hover:bg-blush-500 text-white flex items-center justify-center shrink-0">${icon('plus')}</button>
    </form>
  `, 'shadow-cute')}

  <div class="grid gap-4 sm:grid-cols-2">
    ${DAYS.map((d, i) => {
      const ds = addDays(week, i);
      const items = [...doc.days[d.key]].sort(sortByTime);
      const isToday = ds === today;
      return `
      <article class="rounded-3xl p-4 border shadow-soft ${isToday ? 'bg-blush-50 border-blush-200' : 'bg-paper border-[#E8DFD5]'}">
        <div class="flex items-center justify-between">
          <div class="flex items-baseline gap-2">
            <h3 class="font-display font-bold text-lg text-ink">${d.label}</h3>
            <span class="text-xs font-semibold text-stone-400">${fmtDate(ds, { day: 'numeric', month: 'short' })}</span>
          </div>
          ${isToday ? `<span class="text-[10px] font-bold bg-blush-400 text-white px-2 py-0.5 rounded-full">Hoy</span>` : ''}
        </div>
        ${eventsOn(ds).length ? `<div class="flex flex-wrap gap-1 mt-2">${eventsOn(ds).map(e => eventChip(e, true)).join('')}</div>` : ''}
        <ul class="divide-y divide-[#F0E8DF] mt-1">${items.map(it => agendaItem(it, 'day', d.key)).join('')}</ul>
        <button data-action="activity-new" data-day="${d.key}"
          class="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-blush-500 bg-paper border border-dashed border-blush-200 hover:bg-blush-50 rounded-xl py-2.5">
          ${icon('plus', 'w-3.5 h-3.5')} ¿Qué harás?</button>
      </article>`;
    }).join('')}
  </div>`;
}

// =========================================================
// ACCIONES
// =========================================================

const ACTIONS = {
  tab(el) { state.tab = el.dataset.value; render(); window.scrollTo({ top: 0 }); },
  async logout() {
    stopRest();
    store.disconnect();
    connected = null;
    await logout();
    resetData();
    state.user = null;
    render();
  },
  'close-modal': closeModal,

  // Inicio
  'draft-add'(el) {
    const sets = state.drafts[el.dataset.key];
    const last = sets[sets.length - 1] || { weight: '', reps: '' };
    sets.push({ ...last });
    render();
  },
  'draft-remove'(el) {
    const sets = state.drafts[el.dataset.key];
    if (sets.length <= 1) return showToast('Debe haber al menos una serie');
    sets.splice(Number(el.dataset.idx), 1);
    render();
  },
  async 'save-exercise'(el) {
    const key = el.dataset.key;
    const name = el.dataset.name;
    const date = key.split('|')[0];
    const uid = state.user.id;
    const parsed = state.drafts[key]
      .map(s => ({ weight: num(s.weight), reps: parseInt(s.reps, 10) }))
      .filter(s => s.weight !== null && !isNaN(s.reps));
    if (!parsed.length) return showToast('Llena peso y reps en al menos una serie');

    const top = parsed.reduce((m, s) => Math.max(m, s.weight), 0);
    const prevBest = state.workouts.filter(l => l.bestie === uid && norm(l.name) === norm(name)).reduce((m, l) => Math.max(m, maxWeight(l)), 0);
    const entry = { bestie: uid, name, setsDetail: parsed, maxWeight: top, date, timestamp: Date.now() };

    state.workouts.unshift(entry);
    delete state.drafts[key];
    await store.addItem('workouts', entry);
    const complete = await syncCompletion(date, uid);
    render();
    if (complete) showToast('¡Rutina completa! Día marcado');
    else if (prevBest > 0 && top > prevBest) showToast(`Nuevo récord en ${name}: ${top} lb`);
    else showToast('Ejercicio guardado');
  },
  async 'undo-log'(el) {
    const log = state.workouts.find(l => l.id === el.dataset.id);
    if (!log) return;
    const key = `${log.date}|${norm(log.name)}`;
    state.drafts[key] = log.setsDetail.map(s => ({ weight: String(s.weight), reps: String(s.reps) }));
    state.workouts = state.workouts.filter(l => l !== log);
    await store.removeItem('workouts', log.id);
    await syncCompletion(log.date, log.bestie);
    render();
  },

  // Rutinas
  'edit-day'(el) { openEditDay(el.dataset.day); },
  'add-ex-row'() {
    const rows = document.getElementById('ex-rows');
    rows.insertAdjacentHTML('beforeend', exRow());
    drawIcons();
    rows.lastElementChild.querySelector('input').focus();
  },
  'remove-row'(el) { el.closest('.ex-row').remove(); },
  async 'delete-log'(el) {
    const log = state.workouts.find(l => l.id === el.dataset.id);
    if (!log || !confirm(`¿Borrar el registro de ${log.name}?`)) return;
    state.workouts = state.workouts.filter(l => l !== log);
    await store.removeItem('workouts', log.id);
    await syncCompletion(log.date, log.bestie);
    render();
    showToast('Registro borrado');
  },

  // Progreso
  'prog-type'(el) { state.progress.type = el.dataset.value; render(); },

  // Medidas
  'meas-who'(el) { state.measWho = el.dataset.value; render(); },
  async 'delete-meas'(el) {
    if (!confirm('¿Borrar esta medición?')) return;
    state.measurements = state.measurements.filter(m => m.id !== el.dataset.id);
    await store.removeItem('measurements', el.dataset.id);
    render();
    showToast('Medición borrada');
  },

  // Calendario
  'cal-month'(el) {
    const d = state.calMonth;
    state.calMonth = new Date(d.getFullYear(), d.getMonth() + Number(el.dataset.value), 1);
    render();
  },
  'day-detail'(el) { openDayDetail(el.dataset.date); },
  async 'toggle-attendance'(el) {
    const ds = el.dataset.date;
    const uid = state.user.id;
    const updated = { ...(state.attendance[ds] || {}), [uid]: !completedOn(ds, uid) };
    state.attendance[ds] = updated;
    await store.setItem('attendance', ds, updated);
    render();
    openDayDetail(ds);
  },

  // Bienestar
  'well-day'(el) {
    const next = addDays(state.wellDate, Number(el.dataset.value));
    if (next > todayStr()) return;
    state.wellDate = next;
    render();
  },
  sleep(el) {
    const d = wellDraft();
    d.sleepHours = Math.min(14, Math.max(0, d.sleepHours + Number(el.dataset.value)));
    render();
  },
  'sleep-rating'(el) {
    const d = wellDraft();
    d.sleepRating = d.sleepRating === el.dataset.value ? null : el.dataset.value;
    render();
  },
  meal(el) {
    const d = wellDraft();
    const k = el.dataset.meal;
    d.meals[k] = d.meals[k] === el.dataset.value ? null : el.dataset.value;
    render();
  },
  async 'save-wellness'() {
    const d = wellDraft();
    const uid = state.user.id;
    const key = `${d.date}_${uid}`;
    const payload = { bestie: uid, date: d.date, sleepHours: d.sleepHours, sleepRating: d.sleepRating, meals: d.meals };
    state.wellness[key] = payload;
    d.saved = true;
    await store.setItem('wellness', key, payload);
    render();
    showToast('Día guardado');
  },

  // Rutinas: galería, técnica y descanso
  'rutinas-view'(el) { state.rutinasView = el.dataset.value; render(); },
  'gallery-group'(el) { state.galleryGroup = el.dataset.value; render(); },
  technique(el) { openTechnique(el.dataset.name); },
  'rest-start'(el) { startRest(parseInt(el.dataset.seconds, 10) || 90); },
  'rest-stop'() { stopRest(); },
  async 'enable-notifications'() {
    const result = await Notification.requestPermission();
    showToast(result === 'granted' ? 'Avisos activados' : 'No se activaron los avisos');
    render();
  },

  // Horario: fechas importantes
  'horario-view'(el) { state.horarioView = el.dataset.value; render(); },
  'horario-month'(el) {
    const d = state.horarioMonth;
    state.horarioMonth = new Date(d.getFullYear(), d.getMonth() + Number(el.dataset.value), 1);
    render();
  },
  'event-day'(el) { openEventDay(el.dataset.date); },
  async 'event-delete'(el) {
    const ev = myEvents().find(e => e.id === el.dataset.id);
    if (!ev || !confirm(`¿Borrar "${ev.title}"?`)) return;
    await saveEvents(myEvents().filter(e => e.id !== el.dataset.id));
    openEventDay(el.dataset.date);
  },

  // Mover / cambiar la rutina de hoy (solo para quien inició sesión)
  async 'plan-tomorrow'() {
    const today = todayStr();
    const tomorrow = addDays(today, 1);
    const todays = plannedDayKey(today);
    await setPlan(tomorrow, todays);
    await setPlan(today, 'descanso');
    render();
    showToast(`Listo: mañana haces ${state.routines[todays]?.title || 'la rutina de hoy'}`);
  },
  'plan-choose'() {
    const today = todayStr();
    const current = plannedDayKey(today);
    const own = weekdayKey();
    const option = (key, title, detail) => `
      <button data-action="plan-set" data-value="${key}"
        class="w-full text-left flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${key === current ? 'bg-blush-50 border-blush-300' : 'bg-paper border-[#E8DFD5] hover:border-blush-200'}">
        <span class="min-w-0"><span class="block text-sm font-bold text-ink">${title}</span><span class="block text-xs text-stone-500 truncate">${detail}</span></span>
        ${key === current ? `<span class="text-blush-500 shrink-0">${icon('check')}</span>` : ''}
      </button>`;
    openModal(`
      <div class="flex items-center justify-between mb-1">
        <h3 class="font-display font-bold text-xl text-ink">¿Qué rutina haces hoy?</h3>
        <button data-action="close-modal" aria-label="Cerrar" class="text-stone-400 hover:text-ink">${icon('x', 'w-5 h-5')}</button>
      </div>
      <p class="text-xs text-stone-500 mb-4">Solo cambia tu día; el de tu amiga sigue igual.</p>
      <div class="space-y-2">
        ${DAYS.map(d => {
          const r = state.routines[d.key];
          return option(d.key, `${d.label}${d.key === own ? ' (la de hoy)' : ''}`, r.exercises.length ? `${esc(r.title)} · ${r.exercises.length} ejercicios` : 'Descanso');
        }).join('')}
        ${option('descanso', 'Descansar hoy', 'No rompe tu racha')}
      </div>`);
  },
  async 'plan-set'(el) {
    await setPlan(todayStr(), el.dataset.value);
    closeModal();
    render();
    showToast('Rutina de hoy actualizada');
  },
  async 'plan-reset'() {
    const today = todayStr();
    const tomorrow = addDays(today, 1);
    // Si la de hoy se había pasado a mañana, se deshace también
    if (plannedDayKey(today) === 'descanso' && plannedDayKey(tomorrow) === weekdayKey()) await setPlan(tomorrow, null);
    await setPlan(today, null);
    render();
    showToast('Volviste a la rutina del día');
  },

  // Horario: actividades y tiempo
  'activity-new'(el) { openActivity(el.dataset.day); },
  'tiempo-period'(el) { state.tiempoPeriod = el.dataset.value; render(); },
  'tiempo-move'(el) {
    const n = Number(el.dataset.value);
    if (state.tiempoPeriod === 'mes') {
      const m = state.tiempoMonth;
      state.tiempoMonth = new Date(m.getFullYear(), m.getMonth() + n, 1);
    } else {
      state.agendaWeek = addDays(state.agendaWeek, 7 * n);
    }
    render();
  },

  // Horario
  'agenda-week'(el) { state.agendaWeek = addDays(state.agendaWeek, Number(el.dataset.value)); render(); },
  'agenda-toggle'(el) {
    const doc = agendaDoc();
    const list = el.dataset.list === 'weekly' ? doc.weekly : doc.days[el.dataset.day];
    const item = list.find(i => i.id === el.dataset.id);
    if (!item) return;
    const idx = list.indexOf(item);
    list[idx] = { ...item, done: !item.done };
    saveAgenda(doc);
  },
  'agenda-delete'(el) {
    const doc = agendaDoc();
    if (el.dataset.list === 'weekly') doc.weekly = doc.weekly.filter(i => i.id !== el.dataset.id);
    else doc.days[el.dataset.day] = doc.days[el.dataset.day].filter(i => i.id !== el.dataset.id);
    saveAgenda(doc);
  },
};

const CHANGES = {
  'prog-exercise'(v) { state.progress.exercise = v; render(); },
  'prog-measure'(v) { state.progress.measure = v; render(); },
  'prog-who'(v) { state.progress.who = v; render(); },
  'prog-range'(v) { state.progress.range = v; render(); },
};

const SUBMITS = {
  async login(form) {
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Entrando…';
    const user = await login(form.username.value, form.password.value);
    btn.disabled = false;
    btn.textContent = 'Entrar';
    if (!user) {
      document.getElementById('login-error').classList.remove('hidden');
      form.password.value = '';
      form.password.focus();
      return;
    }
    state.user = user;
    state.tab = 'inicio';
    startData();
    render();
  },
  async 'save-day'(form) {
    const dayKey = form.dataset.day;
    const exercises = [...form.querySelectorAll('.ex-row')].map(row => ({
      name: row.querySelector('.ex-name').value.trim(),
      sets: Math.max(1, parseInt(row.querySelector('.ex-sets').value, 10) || 1),
      reps: row.querySelector('.ex-reps').value.trim() || '10',
      rest: parseInt(row.querySelector('.ex-rest').value, 10) || 90,
      notes: row.querySelector('.ex-notes').value.trim(),
    })).filter(e => e.name);
    state.routines[dayKey] = { title: form.elements.title.value.trim(), exercises };
    closeModal();
    await store.saveConfig({ weeklyRoutines: state.routines });
    render();
    showToast(`${DAYS.find(d => d.key === dayKey).label} actualizado`);
  },
  async 'save-meas'(form) {
    const entry = { bestie: state.user.id, date: form.date.value || todayStr(), note: form.note.value.trim(), timestamp: Date.now() };
    let any = false;
    MEAS_FIELDS.forEach(f => { const v = num(form[f.key].value); entry[f.key] = v; if (v !== null) any = true; });
    if (!any) return showToast('Anota al menos una medida');
    state.measurements.unshift(entry);
    await store.addItem('measurements', entry);
    state.measWho = state.user.id;
    render();
    showToast('Medidas guardadas');
  },
  async 'event-add'(form) {
    const title = form.elements.title.value.trim();
    if (!title) return;
    const ds = form.dataset.date;
    const ev = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: ds, title, type: form.querySelector('input[name="type"]:checked')?.value || 'otro', time: form.time.value || '',
    };
    await saveEvents([...myEvents(), ev]);
    openEventDay(ds);
    showToast('Fecha guardada');
  },
  async 'activity-add'(form) {
    const cat = form.querySelector('input[name="cat"]:checked')?.value;
    if (!cat) return showToast('Elige una actividad');
    const a = activityOf(cat);
    let sub = '';
    const opts = myOptions();
    if (a.sub) {
      const typed = form.elements[`new-${a.sub}`].value.trim();
      sub = typed || form.querySelector(`input[name="sub-${a.sub}"]:checked`)?.value || '';
      if (!sub) return showToast(a.sub === 'work' ? 'Escribe en qué trabajarás' : 'Escribe qué estudiarás');
      if (typed && !opts[a.sub].some(n => norm(n) === norm(typed))) {
        opts[a.sub] = [...opts[a.sub], typed];
        await saveOptions(opts);
      }
    }
    const start = form.elements.time.value, end = form.elements.end.value;
    if (!start || !end) return showToast('Pon la hora de inicio y de fin');
    const doc = agendaDoc();
    doc.days[form.dataset.day].push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      cat, sub, time: start, end, text: form.elements.note.value.trim(), done: false,
    });
    closeModal();
    await saveAgenda(doc);
    showToast(`${itemTitle({ cat, sub })} agregado`);
  },
  async 'agenda-add'(form) {
    const text = form.text.value.trim();
    if (!text) return;
    const doc = agendaDoc();
    const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, done: false };
    const { list, day } = form.dataset;
    if (list === 'weekly') doc.weekly.push(item);
    else doc.days[day].push({ ...item, time: form.time.value || '' });
    await saveAgenda(doc);
    // Regresar el cursor al mismo campo para seguir anotando
    const sel = list === 'weekly'
      ? '#view form[data-submit="agenda-add"][data-list="weekly"] input[name="text"]'
      : `#view form[data-submit="agenda-add"][data-day="${day}"] input[name="text"]`;
    document.querySelector(sel)?.focus();
  },
};

document.addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') return closeModal();
  const el = e.target.closest('[data-action]');
  if (!el || !ACTIONS[el.dataset.action]) return;
  e.preventDefault();
  ACTIONS[el.dataset.action](el);
});

document.addEventListener('change', (e) => {
  // En "¿Qué harás?": mostrar la elección de trabajo/estudio solo cuando aplica
  if (e.target.name === 'cat') {
    const sub = activityOf(e.target.value)?.sub;
    document.querySelectorAll('#modal-box [data-sub-for]').forEach(b => b.classList.toggle('hidden', b.dataset.subFor !== sub));
    return;
  }
  const el = e.target.closest('[data-change]');
  if (el && CHANGES[el.dataset.change]) CHANGES[el.dataset.change](el.value);
});

document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset && 'gallerySearch' in el.dataset) {
    // Filtra la galería sin re-render para no perder el foco
    state.gallerySearch = el.value;
    const q = norm(el.value);
    let shown = 0;
    document.querySelectorAll('[data-gallery-item]').forEach(item => {
      const match = !q || item.dataset.galleryItem.includes(q);
      item.classList.toggle('hidden', !match);
      if (match) shown++;
    });
    document.querySelector('[data-gallery-empty]')?.classList.toggle('hidden', shown > 0);
    return;
  }
  if (!el.dataset || !el.dataset.draft) return;
  const sets = state.drafts[el.dataset.draft];
  if (sets && sets[el.dataset.idx]) sets[el.dataset.idx][el.dataset.field] = el.value;
});

document.addEventListener('submit', (e) => {
  const form = e.target.closest('form[data-submit]');
  if (!form) return;
  e.preventDefault();
  SUBMITS[form.dataset.submit](form);
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// =========================================================
// DATOS Y ARRANQUE
// =========================================================

function startData() {
  if (connected === state.user.id) return;
  connected = state.user.id;
  const byNewest = (a, b) => (b.timestamp || 0) - (a.timestamp || 0);
  store.connect({
    config(data) {
      if (!data || !data.weeklyRoutines) {
        store.saveConfig({ weeklyRoutines: state.routines });
        return;
      }
      state.routines = normalizeRoutines(data.weeklyRoutines);
      scheduleRender();
    },
    attendance(docs) {
      const map = {};
      docs.forEach(({ id, ...rest }) => { map[id] = rest; });
      state.attendance = map;
      scheduleRender();
    },
    workouts(docs) { state.workouts = docs.sort(byNewest); scheduleRender(); },
    wellness(docs) {
      const map = {};
      docs.forEach(({ id, ...rest }) => { map[id] = rest; });
      state.wellness = map;
      scheduleRender();
    },
    measurements(docs) {
      state.measurements = docs.sort((a, b) => b.date.localeCompare(a.date) || byNewest(a, b));
      scheduleRender();
    },
    plans(docs) {
      const map = {};
      docs.forEach(({ id, ...rest }) => { map[id] = rest; });
      state.plans = map;
      scheduleRender();
    },
    agenda(docs) {
      // La vista solo lee la clave "<usuaria>_<semana>" de quien inició sesión
      const map = {};
      docs.forEach(({ id, ...rest }) => { map[id] = rest; });
      state.agenda = map;
      scheduleRender();
    },
  }, state.user.id, (isSynced) => {
    if (!isSynced && store.getMode() === 'firebase') showToast('Sin conexión: se guardará al volver internet');
  });
}

function resetData() {
  Object.assign(state, {
    routines: structuredClone(DEFAULT_ROUTINES), workouts: [], attendance: {}, wellness: {}, measurements: [], agenda: {}, plans: {},
    drafts: {}, wellDraft: null, measWho: null,
  });
}

// Arranque: recupera la sesión (con Firebase espera a que confirme quién es)
(async () => {
  document.getElementById('root').innerHTML = `<div class="min-h-screen flex items-center justify-center text-blush-300">
    <span class="font-display font-bold text-2xl text-ink/70">Gym Systers</span></div>`;
  state.user = await restoreSession();
  if (state.user) startData();
  render();
})();
