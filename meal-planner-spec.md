# Meal Rotation Planner — spec tecnico

App personale di pianificazione pasti Lun-Ven con flessibilità nel weekend, lista della spesa automatica e gestione "jolly" per pasti fuori programma (pizza, sushi, ristorante).

## 1. Obiettivo e logica

- **Lun-Ven**: rotazione fissa di pasti (colazione/pranzo/cena/spuntini), scelta da un set di varianti gestite in chat con Claude e aggiunte qui.
- **Sab-Dom**: nessun pasto prescritto, solo target calorico/proteico di riferimento mostrato come promemoria.
- **Jolly**: qualunque giorno feriale può essere "sostituito" con una voce jolly (pizza, sushi, ristorante, altro) con stima kcal/proteine, senza ricalcolare la rotazione né gestire scorte avanzate.
- **Spesa**: generata una volta a settimana, aggregando solo i 5 giorni feriali × le varianti attive quella settimana.

## 2. Design system

Stile moderno e minimale in linea con l'app RACK, adattato a una palette da nutrizione (invece dei toni energici da workout). Nessuna emoji in nessun punto dell'interfaccia: solo icone SVG (outline, stroke coerente, 20-24px).

**Palette** (dark-first, con variante light via `prefers-color-scheme`)
| Ruolo | Dark | Light |
|---|---|---|
| Sfondo pagina | `#12151A` | `#F7F5F0` |
| Superficie card | `#1B1F26` | `#FFFFFF` |
| Superficie alternata | `#232833` | `#EFEBE2` |
| Testo primario | `#EDEAE2` | `#1A1C20` |
| Testo secondario | `#8C919C` | `#6B6F78` |
| Accento — piano fisso | `#5B8C74` (verde salvia) | `#3F6B54` |
| Accento — modalità libera | `#C99A4B` (ocra caldo) | `#9C7530` |
| Accento — jolly | `#C4685A` (terracotta) | `#A34A2C` |
| Bordo | `#2B303B` | `#E3DFD3` |

**Tipografia**
- Titoli/numeri hero: font serif o grottesco moderno (es. `Fraunces` o `General Sans`), peso 500-600
- Corpo/UI: sans-serif neutro (es. `Inter`), peso 400-500
- Numeri (kcal, grammi, percentuali): font monospace tabulare (es. `JetBrains Mono`) per allineamento pulito nelle tabelle

**Icone**: solo SVG outline (stroke 1.5-2px), mai emoji — coerente in tutta l'app, incluse le notifiche/empty state.

**Layout**: card con bordo sottile (1px), raggio 10-12px, niente ombre pesanti né gradienti. Vista settimanale a 7 colonne (5 evidenziate come "piano fisso", 2 come "libere") su desktop, stack verticale su mobile.

## 3. Modello dati

```
meals
  id, meal_type (colazione|pranzo|cena|spuntino_mattina|spuntino_sera)
  variant_label (A|B|C|D...)
  ingredients: [{ name, quantity, unit }]
  kcal, protein_g, fat_g, carbs_g
  active (bool)  # per disattivare varianti senza cancellarle

weekday_rotation
  weekday (lun..ven)
  meal_type
  meal_id (fk -> meals)

weekend_targets
  kcal, protein_g   # riferimento unico, non per-giorno

jolly_entries
  id, label (pizza|sushi|ristorante|altro)
  kcal_estimate, protein_estimate

day_log
  date, weekday
  status (piano|jolly|libero)
  jolly_entry_id (fk, nullable)
  note (opzionale, testo libero)

shopping_list  # derivata, non salvata: calcolata on-demand da weekday_rotation
```

## 4. Funzionalità

1. **Vista settimanale** — 7 colonne, Lun-Ven mostrano la variante assegnata per pasto (da `weekday_rotation`), Sab-Dom mostrano solo il target di riferimento.
2. **Swap giornaliero** — su un giorno feriale, sostituire il pasto pianificato con una voce jolly (dropdown pizza/sushi/ristorante/altro + stima libera). Non ricalcola la spesa né gestisce avanzi: è solo un log per tenere visibile il totale calorico del giorno.
3. **Editor varianti** — form per aggiungere/modificare una variante pasto: tipo, label, ingredienti con quantità, calcolo automatico di kcal/proteine/grassi/carboidrati a partire dai singoli ingredienti (serve una piccola tabella di riferimento nutrizionale per gli ingredienti ricorrenti, es. per 100g pollo/riso/avena/whey ecc. — da popolare inizialmente con i valori già condivisi in chat).
4. **Lista della spesa** — bottone "Genera lista settimana", aggrega le quantità di tutti gli ingredienti usati in `weekday_rotation` per i 5 giorni feriali, raggruppati per categoria (proteine, carboidrati, latticini, grassi/dispensa, verdure).
5. **Riepilogo giornaliero** — card con kcal/proteine totali del giorno corrente (piano fisso o jolly), confrontate col target.
6. **Storico settimanale leggero** — `day_log` per vedere quanti giorni jolly ci sono stati nell'ultima settimana (nessun grafico complesso richiesto, solo un conteggio/lista).

## 5. Struttura file suggerita

```
/src
  /data
    meals.json          # seed iniziale con le varianti A/B/C attuali
    ingredients-ref.json # valori nutrizionali per 100g degli ingredienti ricorrenti
  /components
    WeekView.*
    MealVariantEditor.*
    JollyPicker.*
    ShoppingList.*
    DaySummaryCard.*
  /lib
    nutrition-calc.*     # somma kcal/proteine da ingredienti+quantità
    shopping-aggregate.* # genera lista spesa da weekday_rotation
  /icons                 # SVG outline, un file per icona
  App.*
```

## 6. Note tecniche

- Stack libero (React/Vite consigliato per coerenza con altri progetti, ma va bene anche vanilla se si preferisce leggerezza).
- Persistenza: localStorage sufficiente per uso singolo dispositivo; se serve accesso da telefono e computer, aggiungere un piccolo backend (SQLite + API leggera, oppure Supabase/Firebase) — da valutare solo se l'attrito multi-dispositivo diventa un problema reale in uso.
- Seed iniziale (`meals.json`) da popolare con le varianti A/B/C di colazione/pranzo/cena/spuntini già definite, così l'app parte già utilizzabile al primo avvio.
- Nuove varianti pasto vengono definite in chat con Claude (calcolo macro) e poi aggiunte a `meals.json` — l'app non deve fare da calcolatore nutrizionale autonomo, solo da gestore della rotazione e della lista spesa.

## 7. Repository e deploy

- Repository su GitHub sotto l'account `gmennonna` (accesso già disponibile a Claude Code in locale) — nome suggerito: `meal-rotation-planner` (o altro nome a scelta al momento dell'init).
- Setup: `git init`, primo commit con la struttura base, poi creazione del repo remoto e push — stesso flusso già seguito per `gmennonna/rack-tracker`.
- Deploy suggerito: GitHub Pages, come per RACK (pubblicato su `gmennonna.github.io/rack-tracker/`) — se lo stack scelto è compatibile con un build statico, pubblicare su `gmennonna.github.io/meal-rotation-planner/` con lo stesso meccanismo.
- Se in seguito si aggiunge un backend (vedi nota sulla persistenza sopra), GitHub Pages copre solo il frontend statico: valutare in quel momento un hosting separato per l'API.
