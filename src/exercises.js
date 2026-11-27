// Galería de ejercicios: técnica correcta, errores comunes y músculos.
// `aliases` permite que un ejercicio de la rutina con otro nombre encuentre su ficha.

export const GROUPS = ['Glúteo', 'Pierna', 'Espalda', 'Pecho', 'Hombro', 'Brazos', 'Core', 'Full body'];

export const EXERCISES = [
  // ---------------- Glúteo ----------------
  {
    name: 'Hip Thrust', img: 'Barbell_Hip_Thrust', group: 'Glúteo', muscles: 'Glúteo mayor, isquiotibiales',
    aliases: ['hip thrust con barra', 'empuje de cadera'],
    steps: [
      'Apoya la parte baja de los omóplatos en el borde de una banca, con la barra sobre la cadera (usa almohadilla).',
      'Pies al ancho de cadera, plantados, a una distancia en la que las espinillas queden verticales arriba.',
      'Mete ligeramente la barbilla y empuja con los talones hasta que la cadera quede alineada con hombros y rodillas.',
      'Aprieta glúteos 1 segundo arriba y baja controlando hasta casi tocar el piso.',
    ],
    mistakes: ['Arquear la espalda baja al subir en lugar de extender la cadera.', 'Pies demasiado lejos (trabaja más el femoral) o demasiado cerca (más cuádriceps).', 'Mirar al techo: mantén la mirada al frente.'],
  },
  {
    name: 'Puente de glúteo', img: 'Butt_Lift_Bridge', group: 'Glúteo', muscles: 'Glúteo mayor',
    aliases: ['glute bridge', 'puente de gluteo'],
    steps: [
      'Acostada boca arriba, rodillas flexionadas y pies al ancho de cadera.',
      'Empuja con los talones y eleva la cadera hasta formar una línea de hombros a rodillas.',
      'Aprieta glúteos arriba 1–2 segundos y baja lento.',
    ],
    mistakes: ['Empujar con las puntas de los pies.', 'Hiperextender la zona lumbar arriba.'],
  },
  {
    name: 'Patada de glúteo en polea', img: 'One-Legged_Cable_Kickback', group: 'Glúteo', muscles: 'Glúteo mayor',
    aliases: ['patada en polea', 'patada de gluteo', 'kickback en polea'],
    steps: [
      'Coloca el tobillo en la polea baja y sujétate de la máquina con el torso ligeramente inclinado.',
      'Con la rodilla un poco flexionada, lleva la pierna hacia atrás y arriba apretando el glúteo.',
      'Detente cuando la cadera empiece a girar o la espalda se arquee; regresa lento.',
    ],
    mistakes: ['Arquear la espalda para subir más la pierna.', 'Usar impulso en lugar de controlar el movimiento.'],
  },
  {
    name: 'Abducción en máquina', img: 'Thigh_Abductor', group: 'Glúteo', muscles: 'Glúteo medio y menor',
    aliases: ['abduccion', 'abducción', 'abductores'],
    steps: [
      'Siéntate con la espalda apoyada (o inclinada un poco al frente para más glúteo).',
      'Abre las piernas empujando con la parte externa de las rodillas.',
      'Pausa 1 segundo afuera y cierra lento sin que las placas choquen.',
    ],
    mistakes: ['Soltar el peso de golpe al cerrar.', 'Usar demasiado peso y acortar el recorrido.'],
  },
  {
    name: 'Peso muerto rumano', img: 'Romanian_Deadlift', group: 'Glúteo', muscles: 'Isquiotibiales, glúteo, espalda baja',
    aliases: ['rdl', 'peso muerto rumano con barra'],
    steps: [
      'De pie, pies al ancho de cadera, barra o mancuernas pegadas a los muslos.',
      'Rodillas ligeramente flexionadas y fijas; lleva la cadera hacia atrás como si cerraras una puerta con los glúteos.',
      'Baja la barra pegada a las piernas hasta sentir el estiramiento del femoral (aprox. media espinilla).',
      'Sube empujando la cadera al frente y apretando glúteos, con la espalda neutra todo el tiempo.',
    ],
    mistakes: ['Redondear la espalda.', 'Doblar las rodillas como en una sentadilla.', 'Alejar la barra del cuerpo.'],
  },
  {
    name: 'Peso muerto con mancuerna', img: 'Stiff-Legged_Dumbbell_Deadlift', group: 'Glúteo', muscles: 'Isquiotibiales, glúteo',
    aliases: ['peso muerto mancuernas', 'peso muerto con mancuernas'],
    steps: [
      'Mancuernas frente a los muslos, pies al ancho de cadera.',
      'Lleva la cadera atrás con espalda neutra y baja las mancuernas cerca de las piernas.',
      'Sube apretando glúteos hasta quedar erguida, sin echarte hacia atrás.',
    ],
    mistakes: ['Redondear la espalda.', 'Bloquear por completo las rodillas.'],
  },
  {
    name: 'Kettlebell swing', img: 'One-Arm_Kettlebell_Swings', group: 'Full body', muscles: 'Glúteo, isquiotibiales, core, hombros',
    aliases: ['swing con kettlebell', 'swing'],
    steps: [
      'Pies un poco más abiertos que la cadera, la pesa en el piso frente a ti.',
      'Llévala hacia atrás entre las piernas flexionando la cadera (no es sentadilla).',
      'Empuja la cadera al frente con fuerza; la pesa sube por inercia hasta la altura del pecho.',
      'Deja que caiga y vuelve a cargar la cadera atrás.',
    ],
    mistakes: ['Levantar la pesa con los brazos.', 'Hacer una sentadilla en vez de bisagra de cadera.', 'Arquear la espalda arriba.'],
  },

  // ---------------- Pierna ----------------
  {
    name: 'Sentadilla', img: 'Barbell_Squat', group: 'Pierna', muscles: 'Cuádriceps, glúteo, aductores',
    aliases: ['sentadilla libre', 'sentadilla con barra', 'squat'],
    steps: [
      'Pies al ancho de hombros, puntas ligeramente hacia afuera.',
      'Inhala, aprieta el abdomen y baja llevando la cadera atrás y abajo.',
      'Las rodillas siguen la dirección de las puntas; baja hasta que los muslos queden al menos paralelos.',
      'Sube empujando todo el pie contra el piso, sin despegar los talones.',
    ],
    mistakes: ['Rodillas que se van hacia adentro.', 'Levantar los talones.', 'Inclinar demasiado el torso o redondear la espalda.'],
  },
  {
    name: 'Sentadilla búlgara', img: 'Split_Squat_with_Dumbbells', group: 'Pierna', muscles: 'Cuádriceps, glúteo',
    aliases: ['bulgara', 'búlgara', 'split squat'],
    steps: [
      'Apoya el empeine de la pierna trasera en una banca; el pie delantero a un paso largo.',
      'Baja en línea recta hasta que la rodilla trasera casi toque el piso.',
      'Inclina un poco el torso al frente para más glúteo, o mantenlo recto para más cuádriceps.',
      'Sube empujando con el talón delantero.',
    ],
    mistakes: ['Pie delantero demasiado cerca de la banca.', 'Rodilla delantera hacia adentro.', 'Rebotar abajo.'],
  },
  {
    name: 'Zancadas', img: 'Dumbbell_Lunges', group: 'Pierna', muscles: 'Cuádriceps, glúteo',
    aliases: ['zancadas caminando', 'desplantes', 'lunges'],
    steps: [
      'Da un paso largo al frente y baja hasta que ambas rodillas formen 90°.',
      'Torso erguido y abdomen firme.',
      'Empuja con el talón delantero para avanzar al siguiente paso o regresar.',
    ],
    mistakes: ['Pasos muy cortos.', 'Rodilla delantera hacia adentro.', 'Golpear la rodilla trasera contra el piso.'],
  },
  {
    name: 'Step-ups', img: 'Dumbbell_Step_Ups', group: 'Pierna', muscles: 'Cuádriceps, glúteo',
    aliases: ['step up', 'subida al cajón', 'step-ups en banco'],
    steps: [
      'Coloca todo el pie sobre un cajón o banca estable.',
      'Sube empujando con la pierna de arriba, sin impulsarte con la de abajo.',
      'Baja lento controlando con la misma pierna.',
    ],
    mistakes: ['Impulsarse con la pierna de abajo.', 'Cajón demasiado alto que obliga a redondear la espalda.'],
  },
  {
    name: 'Prensa de pierna', img: 'Leg_Press', group: 'Pierna', muscles: 'Cuádriceps, glúteo',
    aliases: ['prensa', 'leg press'],
    steps: [
      'Espalda y cadera bien apoyadas en el respaldo.',
      'Pies al ancho de cadera en la plataforma (más arriba = más glúteo).',
      'Baja hasta que las rodillas lleguen a ~90° sin que la cadera se despegue.',
      'Empuja sin bloquear las rodillas al final.',
    ],
    mistakes: ['Bajar tanto que la cadera se despega del asiento.', 'Bloquear las rodillas arriba.'],
  },
  {
    name: 'Extensión de cuádriceps', img: 'Leg_Extensions', group: 'Pierna', muscles: 'Cuádriceps',
    aliases: ['extension de cuadriceps', 'extensiones'],
    steps: [
      'Ajusta la máquina para que la rodilla quede alineada con el eje.',
      'Extiende las piernas hasta casi estirarlas y aprieta 1 segundo.',
      'Baja lento.',
    ],
    mistakes: ['Usar impulso.', 'Despegar la cadera del asiento.'],
  },
  {
    name: 'Curl femoral', img: 'Lying_Leg_Curls', group: 'Pierna', muscles: 'Isquiotibiales',
    aliases: ['curl de pierna', 'femoral acostada', 'curl femoral sentada'],
    steps: [
      'Ajusta la almohadilla justo arriba de los talones.',
      'Flexiona las rodillas llevando los talones hacia los glúteos.',
      'Regresa lento sin dejar caer el peso.',
    ],
    mistakes: ['Levantar la cadera.', 'Movimientos rápidos sin control.'],
  },
  {
    name: 'Elevación de talones', img: 'Standing_Calf_Raises', group: 'Pierna', muscles: 'Pantorrillas',
    aliases: ['pantorrilla', 'elevacion de talones', 'calf raises'],
    steps: [
      'Puntas sobre un escalón, talones en el aire.',
      'Sube lo más alto posible y pausa 1 segundo.',
      'Baja lento hasta sentir el estiramiento.',
    ],
    mistakes: ['Rebotar.', 'Recorrido corto.'],
  },

  // ---------------- Espalda ----------------
  {
    name: 'Jalón al pecho', img: 'Wide-Grip_Lat_Pulldown', group: 'Espalda', muscles: 'Dorsal ancho, bíceps',
    aliases: ['jalon al pecho', 'lat pulldown', 'jalón'],
    steps: [
      'Agarra la barra un poco más abierta que los hombros y ajusta las rodillas bajo el soporte.',
      'Pecho arriba, hombros abajo y atrás.',
      'Jala la barra hacia la parte alta del pecho llevando los codos hacia abajo.',
      'Sube controlando hasta estirar los brazos.',
    ],
    mistakes: ['Jalar detrás de la nuca.', 'Echarse muy atrás y usar impulso.', 'Encoger los hombros.'],
  },
  {
    name: 'Remo con mancuerna', img: 'One-Arm_Dumbbell_Row', group: 'Espalda', muscles: 'Dorsal, romboides, bíceps',
    aliases: ['remo mancuerna', 'remo a una mano'],
    steps: [
      'Apoya rodilla y mano del mismo lado en una banca; espalda plana.',
      'Jala la mancuerna hacia la cadera llevando el codo pegado al cuerpo.',
      'Aprieta la espalda arriba y baja estirando el brazo.',
    ],
    mistakes: ['Girar el torso para subir más.', 'Jalar hacia el hombro en lugar de la cadera.'],
  },
  {
    name: 'Remo en polea baja', img: 'Seated_Cable_Rows', group: 'Espalda', muscles: 'Espalda media, dorsal',
    aliases: ['remo sentado', 'remo en polea'],
    steps: [
      'Sentada, pies apoyados y rodillas un poco flexionadas, espalda recta.',
      'Jala el agarre hacia el abdomen juntando los omóplatos.',
      'Regresa estirando los brazos sin redondear la espalda.',
    ],
    mistakes: ['Balancear el torso adelante y atrás.', 'Encoger los hombros.'],
  },
  {
    name: 'Face pull', img: 'Face_Pull', group: 'Hombro', muscles: 'Deltoide posterior, espalda alta',
    aliases: ['facepull', 'jalón a la cara'],
    steps: [
      'Polea a la altura de la cara con cuerda.',
      'Jala la cuerda hacia la frente separando las manos y abriendo los codos.',
      'Aprieta la espalda alta y regresa lento.',
    ],
    mistakes: ['Usar demasiado peso y echarse atrás.', 'Bajar los codos.'],
  },

  // ---------------- Pecho y hombro ----------------
  {
    name: 'Press de pecho con mancuernas', img: 'Dumbbell_Bench_Press', group: 'Pecho', muscles: 'Pectoral, tríceps, deltoide anterior',
    aliases: ['press pecho', 'press de banca con mancuernas', 'press plano'],
    steps: [
      'Acostada en la banca, pies firmes, omóplatos juntos.',
      'Baja las mancuernas a los lados del pecho con codos a ~45° del cuerpo.',
      'Empuja hacia arriba hasta casi estirar los brazos.',
    ],
    mistakes: ['Abrir los codos a 90°.', 'Despegar la cadera de la banca.'],
  },
  {
    name: 'Press militar', img: 'Dumbbell_Shoulder_Press', group: 'Hombro', muscles: 'Deltoides, tríceps',
    aliases: ['press hombro', 'press de hombro', 'press hombro mancuernas'],
    steps: [
      'Sentada o de pie, mancuernas o barra a la altura de los hombros.',
      'Aprieta abdomen y glúteos.',
      'Empuja hacia arriba hasta estirar los brazos sobre la cabeza.',
      'Baja controlado a la altura de la barbilla.',
    ],
    mistakes: ['Arquear la espalda baja.', 'Bajar muy poco el peso.'],
  },
  {
    name: 'Elevaciones laterales', img: 'Side_Lateral_Raise', group: 'Hombro', muscles: 'Deltoide lateral',
    aliases: ['elevacion lateral', 'laterales'],
    steps: [
      'De pie, mancuernas a los lados, codos ligeramente flexionados.',
      'Sube los brazos a los lados hasta la altura de los hombros, guiando con los codos.',
      'Baja lento, sin dejar caer.',
    ],
    mistakes: ['Usar impulso con el cuerpo.', 'Subir más arriba de los hombros o encogerlos.'],
  },

  // ---------------- Brazos ----------------
  {
    name: 'Curl de bíceps', img: 'Dumbbell_Bicep_Curl', group: 'Brazos', muscles: 'Bíceps',
    aliases: ['curl biceps', 'curl con mancuernas', 'curl de biceps'],
    steps: [
      'De pie, codos pegados al cuerpo, palmas al frente.',
      'Flexiona los codos subiendo las mancuernas sin mover los hombros.',
      'Baja lento hasta estirar los brazos.',
    ],
    mistakes: ['Balancear el cuerpo.', 'Mover los codos hacia adelante.'],
  },
  {
    name: 'Extensión de tríceps', img: 'Triceps_Pushdown_-_Rope_Attachment', group: 'Brazos', muscles: 'Tríceps',
    aliases: ['extension de triceps', 'triceps en polea', 'jalón de tríceps'],
    steps: [
      'En polea alta, codos pegados a los costados.',
      'Extiende los brazos hacia abajo hasta estirarlos por completo.',
      'Regresa hasta ~90° sin despegar los codos.',
    ],
    mistakes: ['Despegar los codos del cuerpo.', 'Inclinarse sobre la polea para empujar.'],
  },
  {
    name: 'Fondos en banco', img: 'Bench_Dips', group: 'Brazos', muscles: 'Tríceps',
    aliases: ['fondos', 'dips en banco'],
    steps: [
      'Manos en el borde de la banca, dedos al frente, piernas estiradas o flexionadas.',
      'Baja flexionando los codos hacia atrás hasta ~90°.',
      'Empuja para subir sin encoger los hombros.',
    ],
    mistakes: ['Bajar demasiado y forzar el hombro.', 'Abrir los codos hacia los lados.'],
  },

  // ---------------- Core ----------------
  {
    name: 'Plancha', img: 'Plank', group: 'Core', muscles: 'Abdomen, core',
    aliases: ['plancha abdominal', 'plank'],
    steps: [
      'Antebrazos en el piso, codos debajo de los hombros.',
      'Cuerpo en línea recta de cabeza a talones.',
      'Aprieta abdomen y glúteos; respira normal.',
    ],
    mistakes: ['Cadera caída o muy elevada.', 'Aguantar la respiración.'],
  },
  {
    name: 'Crunch en polea', img: 'Cable_Crunch', group: 'Core', muscles: 'Recto abdominal',
    aliases: ['crunch polea', 'abdominal en polea'],
    steps: [
      'De rodillas frente a la polea alta, cuerda a los lados de la cabeza.',
      'Flexiona el torso llevando los codos hacia las rodillas, enrollando la columna.',
      'Regresa lento sin soltar la tensión.',
    ],
    mistakes: ['Jalar con los brazos.', 'Mover la cadera en lugar de flexionar el abdomen.'],
  },
];

const normalize = s => (s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Busca la ficha de un ejercicio por nombre o alias (ignora acentos y mayúsculas). */
export function findExercise(name) {
  const n = normalize(name);
  if (!n) return null;
  const exact = EXERCISES.find(e => normalize(e.name) === n || (e.aliases || []).some(a => normalize(a) === n));
  if (exact) return exact;
  // Coincidencia parcial: gana el nombre/alias más largo contenido en el texto
  // (así "Sentadilla búlgara con mancuernas" encuentra la búlgara y no la sentadilla normal).
  let best = null, bestLen = 0;
  EXERCISES.forEach(e => {
    [e.name, ...(e.aliases || [])].map(normalize).forEach(k => {
      if (k.length > bestLen && n.includes(k)) { best = e; bestLen = k.length; }
    });
  });
  return best;
}

// Imágenes: Free Exercise DB (https://github.com/yuhonas/free-exercise-db), dominio público (Unlicense).
// Cada ejercicio tiene 2 fotos (posición inicial y final) que se alternan como animación.
const IMG_BASE = "./exercises"; // copias locales en public/exercises
export function exerciseImages(info) {
  if (!info || !info.img) return null;
  return [0, 1].map(i => `${IMG_BASE}/${info.img}/${i}.jpg`);
}
