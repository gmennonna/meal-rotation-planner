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
    meals.json            # varianti pasto reali, macro ricalcolati dagli ingredienti
    ingredients-ref.json  # valori nutrizionali di riferimento (per 100g/100ml/pz/cucchiaio) degli ingredienti ricorrenti
  components/              # WeekView, MealVariantEditor, JollyPicker, ShoppingList, DaySummaryCard, JollyHistory
  lib/
    nutrition-calc.js      # somma kcal/proteine/grassi/carboidrati da ingredienti+quantità (rispetto a ingredients-ref.json)
    shopping-aggregate.js  # genera lista spesa da weekday_rotation
    storage.js              # stato persistito in localStorage + costanti (weekday, meal_type, target giornaliero...)
  icons/                   # SVG outline, un file per icona
```

## Note

- I 13 pasti in `meals.json` sono le varianti reali (colazione/spuntino mattina/pranzo/spuntino sera/cena); i macro sono ricalcolati dagli ingredienti tramite `nutrition-calc.js`, non stimati a mano.
- Il target giornaliero di riferimento (`weekendTargets` in `storage.js`, usato anche per il confronto nei giorni feriali) è 2875 kcal / 155g proteine — punto medio del range 2850-2900 kcal indicato.
- Il deploy su GitHub Pages è configurato in `vite.config.js` (`base: '/meal-rotation-planner/'`) e automatizzato via GitHub Actions (`.github/workflows/deploy.yml`) su ogni push a `main`.
