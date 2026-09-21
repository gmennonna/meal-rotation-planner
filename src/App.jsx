import { useMemo, useState } from 'react'
import './App.css'
import { DaySummaryCard } from './components/DaySummaryCard'
import { JollyHistory } from './components/JollyHistory'
import { JollyPicker } from './components/JollyPicker'
import { MealVariantEditor } from './components/MealVariantEditor'
import { ShoppingList } from './components/ShoppingList'
import { WeekView } from './components/WeekView'
import { generateShoppingList } from './lib/shopping-aggregate'
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  isoDate,
  loadState,
  saveState,
  weekdayKeyFromDate,
} from './lib/storage'

const TABS = [
  { id: 'week', label: 'Settimana' },
  { id: 'variants', label: 'Varianti pasto' },
  { id: 'shopping', label: 'Spesa' },
]

function usePersistedState() {
  const [state, setState] = useState(loadState)
  function update(updater) {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveState(next)
      return next
    })
  }
  return [state, update]
}

export default function App() {
  const [state, setState] = usePersistedState()
  const [activeTab, setActiveTab] = useState('week')
  const [shoppingList, setShoppingList] = useState(null)
  const [jollyTarget, setJollyTarget] = useState(null)

  const today = useMemo(() => new Date(), [])
  const todayDate = isoDate(today)
  const todayWeekday = weekdayKeyFromDate(today)
  const isWeekday = WEEKDAYS.includes(todayWeekday)

  const mealsById = useMemo(() => new Map(state.meals.map((m) => [m.id, m])), [state.meals])

  const jollyEntriesById = useMemo(() => new Map(state.jollyEntries.map((j) => [j.id, j])), [state.jollyEntries])

  // WeekView shows the recurring weekday plan; jolly swaps are logged per date, so we
  // resolve which weekdays of the current calendar week have a jolly entry logged.
  const currentWeekJolly = useMemo(() => {
    const map = new Map()
    const monday = getMonday(today)
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = isoDate(d)
      const log = state.dayLog.find((entry) => entry.date === dateStr && entry.status === 'jolly')
      if (log) {
        const jolly = jollyEntriesById.get(log.jolly_entry_id)
        if (jolly) map.set(WEEKDAYS[i], { ...jolly, date: dateStr })
      }
    }
    return map
  }, [state.dayLog, jollyEntriesById, today])

  const todayJolly = currentWeekJolly.get(todayWeekday)

  const last7Jolly = useMemo(() => {
    const cutoff = new Date(today)
    cutoff.setDate(cutoff.getDate() - 6)
    return state.dayLog
      .filter((entry) => entry.status === 'jolly' && new Date(entry.date) >= cutoff && new Date(entry.date) <= today)
      .map((entry) => ({ ...entry, label: jollyEntriesById.get(entry.jolly_entry_id)?.label ?? '—' }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [state.dayLog, jollyEntriesById, today])

  function handleChangeVariant(weekday, mealType, mealId) {
    setState((prev) => ({
      ...prev,
      weekdayRotation: {
        ...prev.weekdayRotation,
        [weekday]: { ...prev.weekdayRotation[weekday], [mealType]: mealId },
      },
    }))
  }

  function handleOpenJolly(weekday) {
    setJollyTarget(weekday)
  }

  function handleConfirmJolly(payload) {
    const monday = getMonday(today)
    const index = WEEKDAYS.indexOf(jollyTarget)
    const d = new Date(monday)
    d.setDate(monday.getDate() + index)
    const dateStr = isoDate(d)
    const jollyId = `jolly-${Date.now()}`

    setState((prev) => ({
      ...prev,
      jollyEntries: [...prev.jollyEntries, { id: jollyId, ...payload }],
      dayLog: [
        ...prev.dayLog.filter((entry) => entry.date !== dateStr),
        { date: dateStr, weekday: jollyTarget, status: 'jolly', jolly_entry_id: jollyId, note: '' },
      ],
    }))
    setJollyTarget(null)
  }

  function handleClearJolly(weekday) {
    const monday = getMonday(today)
    const index = WEEKDAYS.indexOf(weekday)
    const d = new Date(monday)
    d.setDate(monday.getDate() + index)
    const dateStr = isoDate(d)
    setState((prev) => ({
      ...prev,
      dayLog: prev.dayLog.filter((entry) => entry.date !== dateStr),
    }))
  }

  function handleSaveMeal(meal) {
    setState((prev) => {
      const exists = prev.meals.some((m) => m.id === meal.id)
      return {
        ...prev,
        meals: exists ? prev.meals.map((m) => (m.id === meal.id ? meal : m)) : [...prev.meals, meal],
      }
    })
  }

  function handleDeleteMeal(mealId) {
    setState((prev) => ({
      ...prev,
      meals: prev.meals.filter((m) => m.id !== mealId),
      weekdayRotation: Object.fromEntries(
        Object.entries(prev.weekdayRotation).map(([weekday, plan]) => [
          weekday,
          Object.fromEntries(Object.entries(plan).map(([type, id]) => [type, id === mealId ? null : id])),
        ]),
      ),
    }))
  }

  function handleToggleActive(mealId) {
    setState((prev) => ({
      ...prev,
      meals: prev.meals.map((m) => (m.id === mealId ? { ...m, active: !m.active } : m)),
    }))
  }

  function handleGenerateShoppingList() {
    setShoppingList(generateShoppingList(state.weekdayRotation, state.meals))
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Meal Rotation Planner</h1>
          <p className="text-secondary">{WEEKDAY_LABELS[todayWeekday]} · {todayDate}</p>
        </div>
        <nav className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="app-layout">
        <main className="app-main">
          {activeTab === 'week' && (
            <WeekView
              meals={state.meals}
              weekdayRotation={state.weekdayRotation}
              onChangeVariant={handleChangeVariant}
              dayJollyByWeekday={currentWeekJolly}
              weekendTargets={state.weekendTargets}
              onOpenJolly={handleOpenJolly}
              onClearJolly={handleClearJolly}
              todayWeekday={todayWeekday}
            />
          )}
          {activeTab === 'variants' && (
            <MealVariantEditor
              meals={state.meals}
              onSave={handleSaveMeal}
              onDelete={handleDeleteMeal}
              onToggleActive={handleToggleActive}
            />
          )}
          {activeTab === 'shopping' && <ShoppingList list={shoppingList} onGenerate={handleGenerateShoppingList} />}
        </main>

        <aside className="app-sidebar">
          <DaySummaryCard
            weekdayKey={todayWeekday}
            isWeekday={isWeekday}
            dayPlan={state.weekdayRotation[todayWeekday] ?? {}}
            jollyEntry={todayJolly}
            mealsById={mealsById}
            weekendTargets={state.weekendTargets}
          />
          <JollyHistory entries={last7Jolly} />
        </aside>
      </div>

      {jollyTarget && (
        <JollyPicker
          weekdayLabel={WEEKDAY_LABELS[jollyTarget]}
          onConfirm={handleConfirmJolly}
          onCancel={() => setJollyTarget(null)}
        />
      )}
    </div>
  )
}

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}
