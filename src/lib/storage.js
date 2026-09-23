import seedMeals from '../data/meals.json'
import weekdayRotationSeed from '../data/weekday-rotation.json'

// Bumped from v1: v1 saves could carry a stale default weekdayRotation from
// before the real weekday-rotation.json seed existed.
const STORAGE_KEY = 'meal-planner-state-v2'

export const WEEKDAYS = ['lun', 'mar', 'mer', 'gio', 'ven']
export const WEEKDAY_LABELS = {
  lun: 'Lunedì',
  mar: 'Martedì',
  mer: 'Mercoledì',
  gio: 'Giovedì',
  ven: 'Venerdì',
  sab: 'Sabato',
  dom: 'Domenica',
}
export const MEAL_TYPES = ['colazione', 'spuntino_mattina', 'pranzo', 'spuntino_sera', 'cena']
export const MEAL_TYPE_LABELS = {
  colazione: 'Colazione',
  spuntino_mattina: 'Spuntino mattina',
  pranzo: 'Pranzo',
  spuntino_sera: 'Spuntino sera',
  cena: 'Cena',
}
export const JOLLY_LABELS = ['pizza', 'sushi', 'ristorante', 'altro']

function buildDefaultRotation(meals) {
  const rotation = {}
  for (const weekday of WEEKDAYS) {
    rotation[weekday] = {}
    for (const mealType of MEAL_TYPES) {
      // Fallback for any weekday/meal_type not covered by weekday-rotation.json
      // (e.g. a new meal_type added without updating the seed rotation).
      const firstActive = meals.find((meal) => meal.meal_type === mealType && meal.active)
      rotation[weekday][mealType] = firstActive ? firstActive.id : null
    }
  }
  for (const entry of weekdayRotationSeed) {
    if (!rotation[entry.weekday]) continue
    rotation[entry.weekday][entry.meal_type] = entry.meal_id
  }
  return rotation
}

function buildDefaultState() {
  return {
    meals: seedMeals,
    weekdayRotation: buildDefaultRotation(seedMeals),
    weekendTargets: { kcal: 2875, protein_g: 155 },
    jollyEntries: [],
    dayLog: [],
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildDefaultState()
    const parsed = JSON.parse(raw)
    return {
      ...buildDefaultState(),
      ...parsed,
    }
  } catch {
    return buildDefaultState()
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable (private mode, quota) — state stays in-memory only
  }
}

export function isoDate(date = new Date()) {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 10)
}

const ISO_WEEKDAY_KEYS = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']

export function weekdayKeyFromDate(date = new Date()) {
  return ISO_WEEKDAY_KEYS[date.getDay()]
}
