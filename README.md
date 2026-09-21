# Meal Rotation Planner

App personale di pianificazione pasti Lun-Ven con flessibilità nel weekend, lista della spesa automatica e gestione "jolly" per pasti fuori programma. Vedi `meal-planner-spec.md` per lo spec completo.

## Stack

React + Vite, persistenza su `localStorage` (uso singolo dispositivo).

## Sviluppo

```
npm install
npm run dev
npm run build
npm run lint
```

## Struttura

```
src/
  data/
    meals.json            # varianti pasto (seed di esempio, da sostituire con le tue)
    ingredients-ref.json  # valori nutrizionali per 100g degli ingredienti ricorrenti
  components/              # WeekView, MealVariantEditor, JollyPicker, ShoppingList, DaySummaryCard, JollyHistory
  lib/
    nutrition-calc.js      # somma kcal/proteine/grassi/carboidrati da ingredienti+quantità
    shopping-aggregate.js  # genera lista spesa da weekday_rotation
    storage.js              # stato persistito in localStorage + costanti (weekday, meal_type...)
  icons/                   # SVG outline, un file per icona
```

## Note

- I 13 pasti in `meals.json` sono un seed di esempio (colazione/pranzo/cena/spuntini con macro coerenti) — non sono le varianti reali discusse altrove: sostituiscile o modificale dalla tab "Varianti pasto" nell'app.
- Il deploy su GitHub Pages è configurato in `vite.config.js` (`base: '/meal-rotation-planner/'`), da attivare quando il repository verrà creato.
