# Diceborn

A phone-first dice-board adventure. Roll a die, walk a winding road, and auto-battle slimes, bats, goblins, knights, and a dragon-ish boss. Fenn, a fox-eared wanderer, starts the story. More heroes, pets, and mounts unlock as you play.

There is no account, no ads, no energy, and nothing to buy with real money. Gold, gems, keys, and chests all come from runs, bonus games, and the daily pile.

## Play

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 43123
```

Then visit `http://127.0.0.1:43123`. Serving over HTTP lets the service worker cache the game for offline play (`diceborn-v2`). Progress stays in `localStorage` under `diceborn.v1`.

## How a run works

1. From camp, pick a stage you have unlocked and tap **Play**.
2. Tap **ROLL**. The die moves you that many tiles, and each tile resolves before the next step.
3. Fights play themselves. Speed up with the **Speed** button. After a win, pick 1 of 3 boons.
4. Shrines, snags, peddlers, and free bonus games (wheel, higher-or-lower, chests, cards, slots) fill the road.
5. Beat the boss for bonus gold and the next stage. If you fall, gold already pocketed stays in camp.

## Camp

- **Training** spends gold on permanent attack, health, defense, and crit.
- **Talents** spend points earned from experience.
- **Gear** drops from fights, shops, and chests. Fuse three of the same slot and rarity into the next: common, uncommon, rare, epic, legendary. Matching sets add bonuses.
- **Chests** open with keys or gems you earned.
- **Daily pile** is a free login reward. The streak resets if you skip a day, and it never asks you to pay.

The in-game **How to play** button repeats this in short form.
