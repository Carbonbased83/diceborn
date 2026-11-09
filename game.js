(() => {
  'use strict';

  const SAVE_KEY = 'diceborn.v1';
  const SLOTS = ['weapon', 'helm', 'armor', 'boots', 'ring', 'charm'];
  const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const RARITY_MULT = { common: 1, uncommon: 1.45, rare: 1.95, epic: 2.6, legendary: 3.4 };
  const SET_IDS = ['campfire', 'nightglass', 'briar', 'goldleaf'];
  const SALVAGE_GOLD = { common: 6, uncommon: 14, rare: 28, epic: 55, legendary: 90 };
  const SALVAGE_GEMS = { common: 0, uncommon: 0, rare: 1, epic: 2, legendary: 4 };

  const ROADS = ['Dewdrop Trail', 'Bat Orchard', 'Goblin Steps', 'Tin Gate', 'Cinder Ridge', 'Mothlantern Path', 'Briar Keep', 'Glass Dunes', 'Coinwell Depths', 'Last Ember Road'];
  const BOSSES = ['Cinderwyrm', 'Ashmaw', 'Goldspine', 'Stormcoil', 'Thornking', 'Umberdrake', 'Mirewyrm', 'Glassfang', 'Gildmaw', 'Crownwyrm'];
  const MINI_NAME = { wheel: 'Lucky Wheel', hilo: 'Higher or Lower', chests: 'Three Chests', cards: 'Whisker Cards', slots: 'Dice Slots' };
  const WHEEL_LABELS = ['15g', 'Heal', '28g', '+ATK', 'Key', 'Gems', 'Egg', 'Pal'];
  const SLOT_LABELS = ['Fox', 'Coin', 'Gem', 'Paw', 'Slime'];

  const HEROES = {
    fenn: {
      name: 'Fenn', role: 'Fox wanderer',
      blurb: 'Fox-eared and dice-lucky. A steady traveler with a bright burst of emberlight.',
      ult: 'Foxfire', ultDesc: 'Emberlight that slips past some armor.',
      base: { hp: 100, atk: 16, def: 4, spd: 12, crit: 0.06 },
      ultMult: 2.5, ultPen: 0.4, ultHeal: 0, ultShield: 0, thorns: 0,
      unlockText: 'With you from the first roll.',
      met: () => true,
    },
    bramble: {
      name: 'Bramble', role: 'Badger knight',
      blurb: 'A round badger in a patched cloak. Slow, sturdy, and prickly when struck.',
      ult: 'Shell Slam', ultDesc: 'A heavy bash that raises a stone shield.',
      base: { hp: 132, atk: 13, def: 8, spd: 8, crit: 0.03 },
      ultMult: 1.85, ultPen: 0.1, ultHeal: 0, ultShield: 18, thorns: 3,
      unlockText: 'Reach stage 3.',
      met: (s) => s.highestStage >= 3,
    },
    luma: {
      name: 'Luma', role: 'Lantern moth',
      blurb: 'A moth with a lantern almost as big as they are. Fragile, and brilliant.',
      ult: 'Lantern Beam', ultDesc: 'A spear of light that ignores most armor.',
      base: { hp: 78, atk: 20, def: 2, spd: 15, crit: 0.11 },
      ultMult: 2.15, ultPen: 0.65, ultHeal: 0, ultShield: 0, thorns: 0,
      unlockText: 'Reach stage 6.',
      met: (s) => s.highestStage >= 6,
    },
    cobble: {
      name: 'Cobble', role: 'River pup',
      blurb: 'A pup pebbled from smooth stones. Hard to crack, and kind when it counts.',
      ult: 'Pebbleheart', ultDesc: 'A thud that mends Cobble’s own cracks.',
      base: { hp: 148, atk: 14, def: 6, spd: 8, crit: 0.04 },
      ultMult: 1.9, ultPen: 0.15, ultHeal: 0.08, ultShield: 0, thorns: 0,
      unlockText: 'Win 6 runs.',
      met: (s) => s.wins >= 6,
    },
  };

  const PETS = {
    nib: { name: 'Nib', blurb: 'A sprout with opinions. Nibbles anything that starts a fight.', mul: 1, spd: 0, unlockText: 'Win 1 run.', met: (s) => s.wins >= 1 },
    wisp: { name: 'Wisp', blurb: 'A polite ghost-light. Hits a little harder than it looks.', mul: 1.28, spd: 0, unlockText: 'Reach stage 4.', met: (s) => s.highestStage >= 4 },
    pip: { name: 'Pip', blurb: 'A pocket bat. Quick pecks, and your own steps quicken.', mul: 1.12, spd: 4, unlockText: 'Reach stage 7.', met: (s) => s.highestStage >= 7 },
    emberkit: { name: 'Emberkit', blurb: 'A spark the size of a bun. Mean, for something so small.', mul: 1.45, spd: 0, unlockText: 'Reach stage 10, or hatch an egg.', met: (s) => s.highestStage >= 10 },
  };

  const MOUNTS = {
    dusthare: { name: 'Dusthare', blurb: 'Long ears, longer roads. You attack a little faster.', mods: { spd: 8 }, unlockText: 'Finish 2 runs, win or lose.', met: (s) => s.runs >= 2 },
    mossram: { name: 'Mossram', blurb: 'A ram knitted out of moss. More health, and a stitch after fights.', mods: { hp: 20, healOnKill: 4 }, unlockText: 'Reach stage 4.', met: (s) => s.highestStage >= 4 },
    cindermare: { name: 'Cindermare', blurb: 'A pony with a campfire mane. Your strikes hit harder.', mods: { atk: 5 }, unlockText: 'Reach stage 8.', met: (s) => s.highestStage >= 8 },
    coinback: { name: 'Coinback', blurb: 'A turtle who keeps the change. More gold, and a sip of lifesteal.', mods: { gold: 0.15, ls: 0.03 }, unlockText: 'Claim 7 daily piles, or reach stage 9.', met: (s) => (s.daily && s.daily.total >= 7) || s.highestStage >= 9 },
  };

  const HERO_IDS = Object.keys(HEROES);
  const PET_IDS = Object.keys(PETS);
  const MOUNT_IDS = Object.keys(MOUNTS);

  const TRAINING = [
    { id: 'atk', name: 'Fang Drills', detail: '+3 attack per rank', max: 25 },
    { id: 'hp', name: 'Hearty Stew', detail: '+14 health per rank', max: 25 },
    { id: 'def', name: 'Guard Drills', detail: '+2 defense per rank', max: 25 },
    { id: 'crit', name: 'Lucky Paw', detail: '+2% crit per rank', max: 20 },
  ];

  const TALENTS = [
    { id: 'ult', name: 'Ember Study', detail: '+8% ultimate damage', max: 8 },
    { id: 'gold', name: 'Deep Pockets', detail: '+6% gold found', max: 8 },
    { id: 'pet', name: 'Pet Bond', detail: '+12% pet damage', max: 8 },
    { id: 'mend', name: 'Trail Mender', detail: '+4 HP after each fight', max: 5 },
    { id: 'shield', name: 'Opening Guard', detail: '+6 shield when a fight starts', max: 5 },
    { id: 'spd', name: 'Light Feet', detail: '+4 speed', max: 8 },
    { id: 'mini', name: 'Lucky Road', detail: '+8% bonus-game rewards', max: 5 },
    { id: 'boss', name: 'Boss Hunter', detail: '+5% damage to bosses', max: 5 },
  ];

  const CARDS = [
    { id: 'keen-fang', name: 'Keen Fang', rarity: 'common', desc: '+4 attack for this road.', mods: { atk: 4 } },
    { id: 'iron-pelt', name: 'Iron Pelt', rarity: 'common', desc: '+3 defense for this road.', mods: { def: 3 } },
    { id: 'swift-paws', name: 'Swift Paws', rarity: 'common', desc: '+12 speed for this road.', mods: { spd: 12 } },
    { id: 'vital-spark', name: 'Vital Spark', rarity: 'common', desc: '+20 max HP and heal 20.', mods: { hp: 20 }, heal: 20 },
    { id: 'lucky-whisker', name: 'Lucky Whisker', rarity: 'common', desc: '+6% crit chance.', mods: { crit: 0.06 } },
    { id: 'ember-nick', name: 'Ember Nick', rarity: 'common', desc: 'Hits deal +3 bonus damage.', mods: { onHit: 3 } },
    { id: 'thorncoat', name: 'Thorncoat', rarity: 'common', desc: 'Reflect 4 damage when hit.', mods: { thorns: 4 } },
    { id: 'sip-drop', name: 'Sip Drop', rarity: 'common', desc: 'Heal 2 HP whenever you hit.', mods: { lifeFlat: 2 } },
    { id: 'closing-mend', name: 'Closing Mend', rarity: 'common', desc: 'Heal 10 HP after each fight.', mods: { healOnKill: 10 } },
    { id: 'foxfire-oil', name: 'Foxfire Oil', rarity: 'common', desc: 'Ultimates deal +30% damage.', mods: { ultBonus: 0.3 } },
    { id: 'dawn-aegis', name: 'Dawn Aegis', rarity: 'common', desc: 'Start each fight with 14 shield.', mods: { shield: 14 } },
    { id: 'bright-whisk', name: 'Bright Whisk', rarity: 'common', desc: '+2 attack and +3% crit.', mods: { atk: 2, crit: 0.03 } },
    { id: 'crimson-fang', name: 'Crimson Fang', rarity: 'rare', desc: 'Heal for 10% of damage dealt.', mods: { ls: 0.1 } },
    { id: 'mirror-hide', name: 'Mirror Hide', rarity: 'rare', desc: 'Reflect 25% of damage taken, plus 2.', mods: { thornsPct: 0.25, thorns: 2 } },
    { id: 'starfall-core', name: 'Starfall Core', rarity: 'rare', desc: '+7 attack. Ultimates deal +45% damage.', mods: { atk: 7, ultBonus: 0.45 } },
    { id: 'gambler-die', name: 'Gambler Die', rarity: 'rare', desc: '+10% crit. Crits hit 30% harder.', mods: { crit: 0.1, cdmg: 0.3 } },
    { id: 'bulwark-heart', name: 'Bulwark Heart', rarity: 'rare', desc: '+5 defense and 16 starting shield.', mods: { def: 5, shield: 16 } },
    { id: 'goldwhisker', name: 'Goldwhisker', rarity: 'rare', desc: '+4 attack and +15% gold.', mods: { atk: 4, gold: 0.15 } },
    { id: 'ninetail', name: 'Ninetail Blessing', rarity: 'epic', desc: '+8 attack, +24 HP, and 6% lifesteal.', mods: { atk: 8, hp: 24, ls: 0.06 } },
    { id: 'sunforge', name: 'Sunforge Heart', rarity: 'epic', desc: '28 starting shield. Heal 14 after fights.', mods: { shield: 28, healOnKill: 14 } },
    { id: 'dicewyrm', name: 'Dicewyrm Pact', rarity: 'epic', desc: '+10% crit, +10 speed, ultimates +55%.', mods: { crit: 0.1, spd: 10, ultBonus: 0.55 } },
  ];

  const RELICS = [
    { id: 'rabbit', name: 'Rabbit Foot', desc: '+6% crit this road.', mods: { crit: 0.06 } },
    { id: 'purse', name: 'Coin Purse', desc: '+15% gold this road.', mods: { gold: 0.15 } },
    { id: 'bell', name: 'Guard Bell', desc: '+3 defense this road.', mods: { def: 3 } },
    { id: 'vial', name: 'Vial Belt', desc: 'Heal 8 more after each fight.', mods: { healOnKill: 8 } },
    { id: 'whet', name: 'Whetstone', desc: '+4 attack this road.', mods: { atk: 4 } },
    { id: 'spurs', name: 'Fox Spurs', desc: '+10 speed this road.', mods: { spd: 10 } },
  ];

  const BUFF_POOL = [
    { name: 'War Drum', desc: '+4 attack this road.', mods: { atk: 4 } },
    { name: 'Iron Tea', desc: '+3 defense this road.', mods: { def: 3 } },
    { name: 'Tailwind', desc: '+10 speed this road.', mods: { spd: 10 } },
    { name: 'Lucky Leaf', desc: '+5% crit this road.', mods: { crit: 0.05 } },
    { name: 'Honeycomb', desc: 'Restore 35% of your health.', healPct: 0.35 },
    { name: 'Second Skin', desc: '+16 max HP and heal 16.', mods: { hp: 16 }, heal: 16 },
  ];

  const ENEMY_BASE = {
    slime: { name: 'Dewdrop Slime', kind: 'slime', hp: 42, atk: 11, def: 1, spd: 8, gold: 9 },
    bat: { name: 'Dusk Bat', kind: 'bat', hp: 54, atk: 14, def: 2, spd: 12, gold: 11 },
    goblin: { name: 'Pebble Goblin', kind: 'goblin', hp: 68, atk: 15, def: 4, spd: 10, gold: 13 },
    knight: { name: 'Tin Squire', kind: 'knight', hp: 88, atk: 16, def: 7, spd: 8, gold: 15 },
  };
  const ELITE_BASE = {
    slime: { name: 'Crown Jelly', kind: 'slime', hp: 96, atk: 16, def: 5, spd: 9, gold: 24 },
    goblin: { name: 'Banner Goblin', kind: 'goblin', hp: 104, atk: 17, def: 6, spd: 10, gold: 26 },
    knight: { name: 'Gilded Squire', kind: 'knight', hp: 112, atk: 17, def: 8, spd: 8, gold: 28 },
    bat: { name: 'Dire Bat', kind: 'bat', hp: 90, atk: 16, def: 4, spd: 13, gold: 24 },
  };

  const GEAR_NAMES = {
    campfire: { weapon: 'Campfire Diceblade', helm: 'Campfire Cap', armor: 'Campfire Cloak', boots: 'Campfire Boots', ring: 'Campfire Band', charm: 'Campfire Ember' },
    nightglass: { weapon: 'Nightglass Fang', helm: 'Nightglass Hood', armor: 'Nightglass Wrap', boots: 'Nightglass Treads', ring: 'Nightglass Loop', charm: 'Nightglass Eye' },
    briar: { weapon: 'Briar Knife', helm: 'Briar Cap', armor: 'Briar Hide', boots: 'Briar Boots', ring: 'Briar Knot', charm: 'Briar Burr' },
    goldleaf: { weapon: 'Goldleaf Scepter', helm: 'Goldleaf Circlet', armor: 'Goldleaf Coat', boots: 'Goldleaf Shoes', ring: 'Goldleaf Ring', charm: 'Goldleaf Bell' },
  };
  const SLOT_LABEL = { weapon: 'Weapon', helm: 'Helm', armor: 'Armor', boots: 'Boots', ring: 'Ring', charm: 'Charm' };
  const SET_INFO = {
    campfire: { name: 'Campfire', two: 'Heal 6 after each fight', three: '+18 HP and +3 defense' },
    nightglass: { name: 'Nightglass', two: '+5% crit', three: '+6% crit and harder crits' },
    briar: { name: 'Briar', two: 'Thorns +4', three: 'More thorns and 15% reflect' },
    goldleaf: { name: 'Goldleaf', two: '+10% gold', three: '+12% gold and +3 attack' },
  };
  const SET_BONUS = {
    campfire: { two: { healOnKill: 6 }, three: { hp: 18, def: 3 } },
    nightglass: { two: { crit: 0.05 }, three: { crit: 0.06, cdmg: 0.25 } },
    briar: { two: { thorns: 4 }, three: { thorns: 6, thornsPct: 0.15 } },
    goldleaf: { two: { gold: 0.1 }, three: { gold: 0.12, atk: 3 } },
  };

  const CHESTS = {
    wood: { name: 'Wooden chest', keys: 1, gems: 8 },
    iron: { name: 'Iron chest', keys: 3, gems: 22 },
    gilt: { name: 'Gilded chest', keys: 8, gems: 50 },
  };
  const DAILY = [
    { label: 'Pocket coins and a key', gold: 22, keys: 1 },
    { label: 'A wooden chest', chest: 'wood' },
    { label: 'A handful of gems', gems: 8 },
    { label: 'A fatter purse', gold: 45 },
    { label: 'A warm egg', egg: 1 },
    { label: 'Keys and gems', gems: 10, keys: 2 },
    { label: 'An iron chest and coins', chest: 'iron', gold: 60 },
  ];

  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

  const State = {
    save: null,
    run: null,
    rng: null,
    screen: 'camp',
    overlay: null,
    battle: null,
    result: null,
    busy: false,
    speed: 1,
    pick: null,
    fuse: [],
    dieFace: 5,
    partyTab: 'heroes',
    mountView: 'deploy',
    forgeTab: 'merge',
    focusHero: null,
    focusMount: null,
    treeNode: 'hp',
    raf: 0,
    lastTick: 0,
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
  function reduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function todayKey(date) {
    const d = date || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function yesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return todayKey(d);
  }
  function roadName(stage) { return ROADS[stage - 1] || ('Wild Road ' + stage); }
  function bossName(stage) { return BOSSES[stage - 1] || ('Wyrm of Toll ' + stage); }
  function blankMods() {
    return {
      hp: 0, atk: 0, def: 0, spd: 0, crit: 0, cdmg: 0, onHit: 0, thorns: 0, thornsPct: 0,
      ls: 0, lifeFlat: 0, healOnKill: 0, ultBonus: 0, shield: 0, gold: 0, mini: 0, bossDmg: 0,
    };
  }
  function createRng(seed) {
    let a = seed >>> 0;
    return {
      next() {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      int(n) { return Math.floor(this.next() * n); },
      pick(arr) { return arr[this.int(arr.length)]; },
      state() { return a >>> 0; },
    };
  }
  function rngInt(n) {
    const value = State.rng.int(n);
    if (State.run) State.run.rngState = State.rng.state();
    return value;
  }
  function shuffleIn(arr, rng) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = rng.int(i + 1);
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }
  function randomSeed() {
    return (Date.now() ^ ((Math.random() * 0x100000000) >>> 0)) >>> 0;
  }

  function toast(message) {
    const host = document.getElementById('toasts');
    if (!host || !message) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }
  function coinPop(text) {
    const host = document.getElementById('toasts');
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'pop';
    el.textContent = text;
    host.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  let audioCtx = null;
  function ensureAudio() {
    if (State.save && State.save.muted) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (err) { audioCtx = null; }
  }
  function blip(freq, dur, type, vol) {
    if (!audioCtx || (State.save && State.save.muted)) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq;
      gain.gain.value = vol || 0.04;
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (err) { /* ignore a single failed blip */ }
  }

  function defaultSave() {
    return {
      gold: 0, gems: 0, keys: 1, xp: 0, talentPoints: 0, eggs: 0,
      training: { atk: 0, hp: 0, def: 0, crit: 0 },
      talents: { ult: 0, gold: 0, pet: 0, mend: 0, shield: 0, spd: 0, mini: 0, boss: 0 },
      highestStage: 1, stage: 1, wins: 0, runs: 0,
      hero: 'fenn', pet: null, mount: null,
      petsUnlocked: [], mountsUnlocked: [],
      gear: [], equipped: { weapon: null, helm: null, armor: null, boots: null, ring: null, charm: null },
      bestRolls: 0,
      mountSlots: [null, null, null],
      mountLevel: {},
      sentinelLevel: { pebble: 0, amber: 0, moss: 0 },
      sentinelDeploy: [null, null, null],
      heroRank: {},
      skin: {},
      chests: { wood: 1, iron: 0, gilt: 0 },
      daily: { last: null, streak: 0, total: 0 },
      muted: false, seenHelp: false, nextId: 1, run: null,
    };
  }
  function loadSave() {
    const fresh = defaultSave();
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (err) { raw = null; }
    if (!raw || typeof raw !== 'object') return fresh;
    const save = Object.assign(fresh, raw);
    save.training = Object.assign(defaultSave().training, raw.training || {});
    save.talents = Object.assign(defaultSave().talents, raw.talents || {});
    save.equipped = Object.assign({ weapon: null, helm: null, armor: null, boots: null, ring: null, charm: null }, raw.equipped || {});
    if (save.equipped.trinket && !save.equipped.charm) save.equipped.charm = save.equipped.trinket;
    save.chests = Object.assign({ wood: 0, iron: 0, gilt: 0 }, raw.chests || {});
    save.daily = Object.assign({ last: null, streak: 0, total: 0 }, raw.daily || {});
    save.gear = Array.isArray(raw.gear) ? raw.gear : [];
    save.petsUnlocked = Array.isArray(raw.petsUnlocked) ? raw.petsUnlocked : [];
    save.mountsUnlocked = Array.isArray(raw.mountsUnlocked) ? raw.mountsUnlocked : [];
    save.run = raw.run || null;
    ['gold', 'gems', 'keys', 'eggs', 'talentPoints', 'xp', 'wins', 'runs'].forEach((key) => {
      save[key] = Math.max(0, save[key] | 0);
    });
    save.highestStage = Math.max(1, save.highestStage | 0);
    save.stage = clamp(save.stage | 0 || 1, 1, save.highestStage);
    save.nextId = Math.max(1, save.nextId | 0);
    if (!HEROES[save.hero]) save.hero = 'fenn';
    if (save.pet && !PETS[save.pet]) save.pet = null;
    if (save.mount && !MOUNTS[save.mount]) save.mount = null;
    save.bestRolls = Math.max(0, save.bestRolls | 0);
    save.mountSlots = Array.isArray(raw.mountSlots) ? raw.mountSlots.slice(0, 3) : [save.mount || null, null, null];
    while (save.mountSlots.length < 3) save.mountSlots.push(null);
    if (save.mount && save.mountSlots.every((id) => !id)) save.mountSlots[0] = save.mount;
    save.mount = save.mountSlots[0] || null;
    save.mountLevel = Object.assign({}, raw.mountLevel || {});
    save.sentinelLevel = Object.assign({ pebble: 0, amber: 0, moss: 0 }, raw.sentinelLevel || {});
    save.sentinelDeploy = Array.isArray(raw.sentinelDeploy) ? raw.sentinelDeploy.slice(0, 3) : [null, null, null];
    while (save.sentinelDeploy.length < 3) save.sentinelDeploy.push(null);
    save.heroRank = Object.assign({}, raw.heroRank || {});
    save.skin = Object.assign({}, raw.skin || {});
    save.gear.forEach((gear) => {
      if (gear.slot === 'trinket') gear.slot = 'charm';
      const n = parseInt(String(gear.id).replace(/\D/g, ''), 10);
      if (n >= save.nextId) save.nextId = n + 1;
    });
    SLOTS.forEach((slot) => {
      if (save.equipped[slot] && !save.gear.some((gear) => gear.id === save.equipped[slot])) save.equipped[slot] = null;
    });
    return save;
  }
  function saveGame() {
    if (State.run) {
      State.run.rngState = State.rng ? State.rng.state() : State.run.rngState;
      State.save.run = State.run;
    }
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(State.save)); } catch (err) { /* storage full or blocked */ }
  }

  function levelProgress(xp) {
    let lvl = 1;
    let rest = Math.max(0, xp | 0);
    let need = 24;
    while (rest >= need && lvl < 80) {
      rest -= need;
      lvl += 1;
      need = Math.round(22 + (lvl - 1) * 16);
    }
    return { lvl, rest, need };
  }
  function addXp(amount) {
    if (!amount) return;
    const before = levelProgress(State.save.xp).lvl;
    State.save.xp += amount;
    const after = levelProgress(State.save.xp).lvl;
    const gain = after - before;
    if (gain > 0) {
      State.save.talentPoints += gain;
      toast('Level ' + after + '. +' + gain + ' talent point' + (gain > 1 ? 's' : '') + '.');
    }
  }
  function trainCost(rank) { return Math.round(28 * Math.pow(1.48, rank)); }
  function heroUnlocked(id) { return !!(HEROES[id] && (HEROES[id].met(State.save))); }
  function petUnlocked(id) {
    if (!PETS[id]) return false;
    return State.save.petsUnlocked.includes(id) || PETS[id].met(State.save);
  }
  function mountUnlocked(id) {
    if (!MOUNTS[id]) return false;
    return State.save.mountsUnlocked.includes(id) || MOUNTS[id].met(State.save);
  }
  function snapshotUnlocks() {
    return {
      heroes: HERO_IDS.filter(heroUnlocked),
      pets: PET_IDS.filter(petUnlocked),
      mounts: MOUNT_IDS.filter(mountUnlocked),
    };
  }
  function diffUnlocks(before) {
    const now = snapshotUnlocks();
    const names = [];
    now.heroes.forEach((id) => { if (!before.heroes.includes(id)) names.push(HEROES[id].name + ' can travel'); });
    now.pets.forEach((id) => { if (!before.pets.includes(id)) names.push(PETS[id].name + ' is in camp'); });
    now.mounts.forEach((id) => { if (!before.mounts.includes(id)) names.push(MOUNTS[id].name + ' is in the stable'); });
    return names;
  }
  function autoEquipNew(before) {
    if (!State.save.pet) {
      const id = PET_IDS.find((petId) => petUnlocked(petId) && !before.pets.includes(petId));
      if (id) State.save.pet = id;
    }
    if (!State.save.mount) {
      const id = MOUNT_IDS.find((mountId) => mountUnlocked(mountId) && !before.mounts.includes(mountId));
      if (id) State.save.mount = id;
    }
  }

  function gearById(id) {
    if (!id || !State.save) return null;
    return State.save.gear.find((gear) => gear.id === id) || null;
  }
  function addInto(target, extra) {
    if (!extra) return;
    Object.keys(extra).forEach((key) => { target[key] = (target[key] || 0) + extra[key]; });
  }
  function gearStats(save) {
    const total = blankMods();
    SLOTS.forEach((slot) => {
      const gear = gearById(save.equipped[slot]);
      if (gear && gear.stats) addInto(total, gear.stats);
    });
    return total;
  }
  function setCounts(save) {
    const counts = {};
    SLOTS.forEach((slot) => {
      const gear = gearById(save.equipped[slot]);
      if (gear) counts[gear.set] = (counts[gear.set] || 0) + 1;
    });
    return counts;
  }
  function setBonus(save) {
    const counts = setCounts(save);
    const bonus = blankMods();
    SET_IDS.forEach((id) => {
      const n = counts[id] || 0;
      if (n >= 2) addInto(bonus, SET_BONUS[id].two);
      if (n >= 3) addInto(bonus, SET_BONUS[id].three);
    });
    bonus.counts = counts;
    return bonus;
  }
  const SENTINELS = {
    pebble: { name: 'Pebble Warden', blurb: 'A round stone guardian. More health for the whole camp.', stat: 'hp', per: 10, met: () => true, text: 'Awake from the first morning.' },
    amber: { name: 'Amber Watch', blurb: 'A lantern statue. Sharper strikes.', stat: 'atk', per: 2, met: (s) => s.highestStage >= 3, text: 'Reach stage 3.' },
    moss: { name: 'Moss Bulwark', blurb: 'A garden golem. A sturdier hide.', stat: 'def', per: 1, met: (s) => s.highestStage >= 5, text: 'Reach stage 5.' },
  };
  const SENTINEL_IDS = Object.keys(SENTINELS);
  const SKINS = {
    fenn: [
      { id: 'road', name: 'Road Scarf', filter: '', met: () => true },
      { id: 'moon', name: 'Moonlit', filter: 'hue-rotate(200deg) saturate(1.2)', met: (s) => s.highestStage >= 4 },
      { id: 'leaf', name: 'Leafcloak', filter: 'hue-rotate(78deg)', met: (s) => s.wins >= 2 },
    ],
    bramble: [
      { id: 'road', name: 'Patch Cloak', filter: '', met: () => true },
      { id: 'dusk', name: 'Dusk Pelt', filter: 'hue-rotate(250deg)', met: (s) => s.wins >= 4 },
    ],
    luma: [
      { id: 'road', name: 'Lantern', filter: '', met: () => true },
      { id: 'rose', name: 'Rose Lamp', filter: 'hue-rotate(300deg)', met: (s) => s.highestStage >= 8 },
    ],
    cobble: [
      { id: 'road', name: 'River Stone', filter: '', met: () => true },
      { id: 'fern', name: 'Fern Coat', filter: 'hue-rotate(90deg)', met: (s) => s.wins >= 8 },
    ],
  };
  function sentinelReady(id) { return !!(SENTINELS[id] && SENTINELS[id].met(State.save)); }
  function sentinelLv(id) { return Math.max(0, (State.save.sentinelLevel && State.save.sentinelLevel[id]) || 0); }
  function mountLv(id) { return Math.max(1, (State.save.mountLevel && State.save.mountLevel[id]) || 1); }
  function deployedMountIds(save) {
    const slots = save.mountSlots && save.mountSlots.length ? save.mountSlots : [save.mount || null, null, null];
    return [0, 1, 2].map((i) => slots[i] || null);
  }
  function skinFilter(heroId) {
    const list = SKINS[heroId] || [];
    const chosen = (State.save.skin && State.save.skin[heroId]) || 'road';
    const skin = list.find((item) => item.id === chosen) || list[0];
    return skin && skin.filter ? skin.filter : '';
  }
  function heroProgress(id) {
    const save = State.save;
    if (id === 'fenn') return heroUnlocked(id) ? 'Ready' : '0/1';
    if (id === 'bramble') return heroUnlocked(id) ? 'Ready' : Math.min(save.highestStage, 3) + '/3 stages';
    if (id === 'luma') return heroUnlocked(id) ? 'Ready' : Math.min(save.highestStage, 6) + '/6 stages';
    return heroUnlocked(id) ? 'Ready' : Math.min(save.wins, 6) + '/6 wins';
  }
  function profile(save, run) {
    const heroId = run && run.heroId ? run.heroId : save.hero;
    const hero = HEROES[heroId] || HEROES.fenn;
    const petId = run ? run.petId : save.pet;
    const pet = petId && PETS[petId] ? PETS[petId] : null;
    const mods = Object.assign(blankMods(), run ? run.mods : {});
    const gear = gearStats(save);
    const set = setBonus(save);
    const tr = save.training;
    const tl = save.talents;
    const mm = blankMods();
    deployedMountIds(save).forEach((id) => {
      const mount = id && MOUNTS[id];
      if (!mount || !mount.mods) return;
      const lv = Math.max(1, (save.mountLevel && save.mountLevel[id]) || 1);
      Object.keys(mount.mods).forEach((key) => {
        const flat = key === 'hp' || key === 'atk' || key === 'def' || key === 'spd' || key === 'healOnKill';
        mm[key] = (mm[key] || 0) + mount.mods[key] * (flat ? lv : 1);
      });
    });
    const sent = { hp: 0, atk: 0, def: 0 };
    (save.sentinelDeploy || []).forEach((id) => {
      const def = id && SENTINELS[id];
      if (!def || !def.met(save)) return;
      const lv = Math.max(1, (save.sentinelLevel && save.sentinelLevel[id]) || 1);
      sent[def.stat] += def.per * lv;
    });
    const rank = (save.heroRank && save.heroRank[heroId]) || 0;
    let synCrit = 0;
    let synUlt = 0;
    let synDef = 0;
    let synHp = 0;
    if (heroId === 'fenn' && petId === 'nib') synCrit += 0.04;
    if (heroId === 'bramble' && (save.sentinelDeploy || []).indexOf('pebble') >= 0) synDef += 2;
    if (heroId === 'luma' && petId === 'wisp') synUlt += 0.08;
    if (heroId === 'cobble' && deployedMountIds(save).indexOf('mossram') >= 0) synHp += 12;
    const maxHp = Math.max(20, hero.base.hp + tr.hp * 14 + (gear.hp || 0) + (set.hp || 0) + (mm.hp || 0) + (mods.hp || 0) + sent.hp + rank * 8 + synHp);
    return {
      heroId, name: hero.name, ultName: hero.ult,
      maxHp,
      atk: Math.max(1, hero.base.atk + tr.atk * 3 + (gear.atk || 0) + (set.atk || 0) + (mm.atk || 0) + (mods.atk || 0) + sent.atk + rank),
      def: Math.max(0, hero.base.def + tr.def * 2 + (gear.def || 0) + (set.def || 0) + (mm.def || 0) + (mods.def || 0) + sent.def + synDef),
      spd: Math.max(1, hero.base.spd + tl.spd * 4 + (gear.spd || 0) + (mm.spd || 0) + (mods.spd || 0) + (pet ? pet.spd || 0 : 0)),
      crit: clamp(hero.base.crit + tr.crit * 0.02 + (gear.crit || 0) + (set.crit || 0) + (mods.crit || 0) + synCrit, 0, 0.7),
      cdmg: 1.65 + (gear.cdmg || 0) + (set.cdmg || 0) + (mods.cdmg || 0),
      onHit: (gear.onHit || 0) + (mods.onHit || 0),
      thorns: (hero.thorns || 0) + (gear.thorns || 0) + (set.thorns || 0) + (mods.thorns || 0),
      thornsPct: (gear.thornsPct || 0) + (set.thornsPct || 0) + (mods.thornsPct || 0),
      ls: (gear.ls || 0) + (mm.ls || 0) + (mods.ls || 0),
      lifeFlat: mods.lifeFlat || 0,
      healOnKill: tl.mend * 4 + (gear.healOnKill || 0) + (set.healOnKill || 0) + (mm.healOnKill || 0) + (mods.healOnKill || 0),
      ultBonus: tl.ult * 0.08 + (gear.ult || 0) + (mods.ultBonus || 0) + synUlt,
      shield: tl.shield * 6 + (gear.shield || 0) + (mods.shield || 0),
      gold: tl.gold * 0.06 + (gear.gold || 0) + (set.gold || 0) + (mm.gold || 0) + (mods.gold || 0),
      mini: tl.mini * 0.08,
      bossDmg: tl.boss * 0.05 + (mods.bossDmg || 0),
      ultMult: hero.ultMult, ultPen: hero.ultPen, ultHeal: hero.ultHeal || 0, ultShield: hero.ultShield || 0,
      petMul: pet ? pet.mul * (1 + tl.pet * 0.12) : 0,
      petName: pet ? pet.name : '',
      petId: pet ? petId : null,
    };
  }
  function fmtStat(key, value) {
    if (!value) return '';
    const pct = ['crit', 'ls', 'gold', 'ult', 'thornsPct', 'cdmg'].indexOf(key) >= 0;
    const labels = {
      hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD', crit: 'crit', cdmg: 'crit damage',
      onHit: 'on hit', thorns: 'thorns', thornsPct: 'reflect', ls: 'lifesteal',
      gold: 'gold find', ult: 'ult power', shield: 'shield', healOnKill: 'mend',
    };
    return '+' + (pct ? Math.round(value * 100) + '%' : value) + ' ' + (labels[key] || key);
  }
  function describeStats(gear) {
    if (!gear || !gear.stats) return 'A curious keepsake';
    const bits = Object.keys(gear.stats).map((key) => fmtStat(key, gear.stats[key])).filter(Boolean);
    return bits.join(' · ') || 'A curious keepsake';
  }
  function makeGear(slot, rarity, ilevel, setId) {
    const ri = Math.max(0, RARITIES.indexOf(rarity));
    const mult = (RARITY_MULT[rarity] || 1) * (1 + (Math.max(1, ilevel) - 1) * 0.05);
    const stats = {};
    if (slot === 'weapon') {
      stats.atk = Math.max(1, Math.round((2.1 + ri * 0.45) * mult));
      if (ri >= 2) stats.crit = Math.round((0.015 + ri * 0.008) * 1000) / 1000;
    } else if (slot === 'helm') {
      stats.hp = Math.round((6 + ri * 2) * mult);
      stats.def = 1 + Math.floor(ri / 2);
    } else if (slot === 'armor') {
      stats.hp = Math.round((10 + ri * 3) * mult);
      stats.def = 1 + ri + Math.floor((Math.max(1, ilevel) - 1) / 4);
      if (setId === 'briar') stats.thorns = 1 + ri;
    } else if (slot === 'boots') {
      stats.spd = 2 + ri * 2;
      if (ri >= 1) stats.def = 1;
    } else if (slot === 'ring') {
      stats.crit = Math.round((0.015 + ri * 0.01) * 1000) / 1000;
      if (setId === 'goldleaf') stats.gold = Math.round((0.04 + ri * 0.012) * 1000) / 1000;
    } else if (setId === 'nightglass') {
      stats.crit = Math.round((0.02 + ri * 0.012) * 1000) / 1000;
    } else if (setId === 'goldleaf') {
      stats.gold = Math.round((0.05 + ri * 0.015) * 1000) / 1000;
      if (ri >= 2) stats.atk = 1 + Math.floor(ri / 2);
    } else if (setId === 'campfire') {
      stats.hp = Math.round(8 * mult);
      stats.healOnKill = 2 + ri;
    } else {
      stats.thorns = 2 + ri;
    }
    if (ri >= 3 && (slot === 'charm' || slot === 'ring')) stats.ult = 0.06;
    const names = GEAR_NAMES[setId] || GEAR_NAMES.campfire;
    return {
      id: 'g' + (State.save.nextId++),
      slot, rarity, set: setId, ilevel: Math.max(1, ilevel),
      name: names[slot] || 'Odd Relic',
      stats,
    };
  }
  function pickSlot() { return SLOTS[Math.floor(Math.random() * SLOTS.length)]; }
  function pickSet() { return SET_IDS[Math.floor(Math.random() * SET_IDS.length)]; }
  function addGear(gear) {
    if (!gear) return null;
    if (State.save.gear.length >= 60) {
      gainGold(SALVAGE_GOLD[gear.rarity] || 6);
      toast('Pack is full. The extra piece became gold.');
      return null;
    }
    State.save.gear.push(gear);
    if (!State.save.equipped[gear.slot]) State.save.equipped[gear.slot] = gear.id;
    return gear;
  }
  function payoutGold(base) {
    const prof = profile(State.save, State.run);
    return Math.max(1, Math.round(base * (1 + (prof.gold || 0)) * (1 + (prof.mini || 0))));
  }
  function fightGold(base) {
    const prof = profile(State.save, State.run);
    return Math.max(1, Math.round(base * (1 + (prof.gold || 0))));
  }
  function payoutGem(base) {
    const prof = profile(State.save, State.run);
    return Math.max(1, Math.round(base * (1 + (prof.mini || 0))));
  }
  function gainGold(amount) {
    const n = Math.round(amount);
    if (!n) return 0;
    State.save.gold += n;
    if (State.run) State.run.foundGold = (State.run.foundGold || 0) + n;
    const el = document.getElementById('gold-val');
    if (el) el.textContent = String(State.save.gold);
    coinPop('+' + n);
    blip(880, 0.08, 'square', 0.04);
    saveGame();
    return n;
  }
  function spendGold(amount) {
    State.save.gold = Math.max(0, State.save.gold - amount);
    const el = document.getElementById('gold-val');
    if (el) el.textContent = String(State.save.gold);
  }
  function addMods(mods) {
    if (!State.run || !mods) return;
    Object.keys(mods).forEach((key) => {
      State.run.mods[key] = (State.run.mods[key] || 0) + mods[key];
    });
  }
  function healPct(pct) {
    const max = profile(State.save, State.run).maxHp;
    const heal = Math.max(1, Math.round(max * pct));
    State.run.hp = Math.min(max, (State.run.hp || 0) + heal);
    return 'healed ' + heal;
  }
  function grantRandomCompanion() {
    const options = [];
    PET_IDS.forEach((id) => { if (!petUnlocked(id)) options.push({ kind: 'pet', id }); });
    MOUNT_IDS.forEach((id) => { if (!mountUnlocked(id)) options.push({ kind: 'mount', id }); });
    if (!options.length) {
      State.save.gems += 8;
      return 'Every companion is already with you. +8 gems.';
    }
    const pick = options[Math.floor(Math.random() * options.length)];
    if (pick.kind === 'pet') {
      if (!State.save.petsUnlocked.includes(pick.id)) State.save.petsUnlocked.push(pick.id);
      if (!State.save.pet) State.save.pet = pick.id;
      return PETS[pick.id].name + ' joins the camp!';
    }
    if (!State.save.mountsUnlocked.includes(pick.id)) State.save.mountsUnlocked.push(pick.id);
    if (!State.save.mount) State.save.mount = pick.id;
    return MOUNTS[pick.id].name + ' is yours!';
  }

  function scaleFoe(base, stage) {
    const t = Math.max(0, stage - 1);
    return Object.assign({}, base, {
      hp: Math.round(base.hp * (1 + t * 0.17)),
      atk: Math.max(1, Math.round(base.atk * (1 + t * 0.14))),
      def: base.def + t,
      gold: Math.round(base.gold * (1 + t * 0.22)),
    });
  }
  function quotas(total, stage) {
    const mid = total - 2;
    let fights = stage <= 1 ? 4 : stage <= 3 ? 5 : 6;
    let elites = stage >= 6 ? 2 : 1;
    let shops = 2;
    let hazards = stage <= 1 ? 1 : 2;
    let minis = 3;
    let buffs = mid - (fights + elites + shops + hazards + minis);
    while (buffs < 2) {
      if (minis > 2) minis -= 1;
      else if (fights > 3) fights -= 1;
      else if (hazards > 1) hazards -= 1;
      else break;
      buffs = mid - (fights + elites + shops + hazards + minis);
    }
    while (buffs > 4 && fights < (stage <= 1 ? 5 : 7)) {
      fights += 1;
      buffs -= 1;
    }
    while (buffs > 5) {
      minis += 1;
      buffs -= 1;
    }
    return { fights, elites, shops, hazards, minis, buffs };
  }
  function rollBuffs(rng) {
    const pool = BUFF_POOL.map((buff) => Object.assign({}, buff, { mods: Object.assign({}, buff.mods || {}) }));
    shuffleIn(pool, rng);
    return pool.slice(0, 3);
  }
  function rollShop(rng, stage) {
    const charms = [
      { key: 'atk', amount: 3, label: '+3 attack this road' },
      { key: 'def', amount: 2, label: '+2 defense this road' },
      { key: 'spd', amount: 8, label: '+8 speed this road' },
      { key: 'crit', amount: 0.04, label: '+4% crit this road' },
    ];
    const charm = rng.pick(charms);
    const gear = makeGear(rng.pick(SLOTS), rng.next() < 0.28 ? 'uncommon' : 'common', stage, rng.pick(SET_IDS));
    const stock = [
      { kind: 'heal', label: 'Field stew', desc: 'Heal 42% of your health.', cost: 14 + (stage - 1) * 3, sold: false },
      { kind: 'charm', label: 'Road charm', desc: charm.label, key: charm.key, amount: charm.amount, cost: 18 + (stage - 1) * 3, sold: false },
      { kind: 'gear', label: gear.name, desc: describeStats(gear), gear, cost: 24 + (stage - 1) * 4, sold: false },
    ];
    if (rng.next() < 0.42) {
      const relic = rng.pick(RELICS);
      stock.push({ kind: 'relic', relic: relic.id, label: relic.name, desc: relic.desc, cost: 36 + (stage - 1) * 5, sold: false });
    } else {
      const rare = makeGear(rng.pick(SLOTS), 'rare', stage, rng.pick(SET_IDS));
      stock.push({ kind: 'gear', label: rare.name, desc: 'A strong piece. ' + describeStats(rare), gear: rare, cost: 48 + (stage - 1) * 6, sold: false });
    }
    return stock;
  }
  function pickEnemyKind(i, count, stage, elite, rng) {
    if (elite) {
      const pool = stage < 3 ? ['slime', 'goblin'] : ['goblin', 'knight', 'bat'];
      return pool[rng.int(pool.length)];
    }
    if (stage === 1 && i === 0) return 'slime';
    const p = count <= 1 ? 0 : i / (count - 1);
    if (p < 0.34) return rng.pick(['slime', 'slime', 'bat']);
    if (p < 0.7) return rng.pick(['bat', 'goblin', 'goblin']);
    return rng.pick(['goblin', 'knight', 'knight']);
  }
  function fixOrder(mid) {
    const swap = (i, j) => { const tmp = mid[i]; mid[i] = mid[j]; mid[j] = tmp; };
    const fightAt = mid.findIndex((tile) => tile.type === 'fight');
    if (fightAt > 0) swap(0, fightAt);
    const half = Math.floor(mid.length / 2);
    if (!mid.slice(0, half).some((tile) => tile.type === 'shop')) {
      const shopAt = mid.findIndex((tile, index) => tile.type === 'shop' && index >= half);
      const swapAt = mid.findIndex((tile, index) => index > 0 && index < half && tile.type !== 'fight' && tile.type !== 'elite');
      if (shopAt > 0 && swapAt > 0) swap(shopAt, swapAt);
    }
    for (let i = 0; i < mid.length; i += 1) {
      if (mid[i].type === 'elite' && i < half) {
        const j = mid.findIndex((tile, index) => index >= half && tile.type === 'fight');
        if (j > 0) swap(i, j);
      }
    }
    for (let i = 1; i < mid.length; i += 1) {
      if (mid[i].type === 'hazard' && mid[i - 1].type === 'hazard') {
        const j = mid.findIndex((tile, index) => index > i && tile.type !== 'hazard');
        if (j > 0) swap(i, j);
      }
    }
  }
  function generateTiles(rng, stage) {
    const total = 18 + rng.int(5);
    const q = quotas(total, stage);
    const bag = [];
    for (let i = 0; i < q.fights; i += 1) bag.push({ type: 'fight' });
    for (let i = 0; i < q.elites; i += 1) bag.push({ type: 'elite' });
    const games = ['wheel', 'hilo', 'chests', 'cards', 'slots'];
    shuffleIn(games, rng);
    for (let i = 0; i < q.minis; i += 1) bag.push({ type: 'mini', game: games[i % games.length] });
    for (let i = 0; i < q.buffs; i += 1) bag.push({ type: 'buff', offers: rollBuffs(rng) });
    const hazardKinds = ['toll', 'rust', 'pack', 'die'];
    for (let i = 0; i < q.hazards; i += 1) bag.push({ type: 'hazard', kind: hazardKinds[rng.int(hazardKinds.length)] });
    for (let i = 0; i < q.shops; i += 1) bag.push({ type: 'shop' });
    shuffleIn(bag, rng);
    fixOrder(bag);
    const combats = bag.filter((tile) => tile.type === 'fight' || tile.type === 'elite');
    let seen = 0;
    bag.forEach((tile) => {
      tile.resolved = false;
      if (tile.type === 'fight' || tile.type === 'elite') {
        const elite = tile.type === 'elite';
        const kind = pickEnemyKind(seen, combats.length, stage, elite, rng);
        const base = elite ? ELITE_BASE[kind] : ENEMY_BASE[kind];
        tile.foe = scaleFoe(Object.assign({}, base, { elite }), stage);
        seen += 1;
      }
      if (tile.type === 'shop') tile.stock = rollShop(rng, stage);
    });
    if (stage === 1 && bag[0] && bag[0].type === 'fight') {
      bag[0].foe = scaleFoe(Object.assign({}, ENEMY_BASE.slime, { elite: false }), stage);
    }
    const tiles = [{ type: 'start', resolved: true }];
    bag.forEach((tile) => tiles.push(tile));
    tiles.push({
      type: 'boss',
      resolved: false,
      foe: scaleFoe({
        name: bossName(stage), kind: 'dragon', hp: 210, atk: 18, def: 7, spd: 9, gold: 36, boss: true, elite: false,
      }, stage),
    });
    return tiles;
  }
  function buildRun(stage) {
    const seed = randomSeed();
    const rng = createRng(seed);
    const run = {
      seed,
      rngState: 0,
      stage,
      tiles: generateTiles(rng, stage),
      index: 0,
      hp: 1,
      mods: blankMods(),
      relics: [],
      boons: [],
      foundGold: 0,
      rolls: 0,
      heroId: State.save.hero,
      petId: State.save.pet,
      mountId: (State.save.mountSlots && State.save.mountSlots[0]) || State.save.mount,
      wound: 0,
      rollCap: 0,
      stepsLeft: 0,
      pendingCards: null,
      banner: '',
    };
    run.hp = profile(State.save, run).maxHp;
    run.rngState = rng.state();
    return { run, rng };
  }
  function sanitizeRun(run) {
    if (!run || !Array.isArray(run.tiles) || run.tiles.length < 8) return null;
    run.mods = Object.assign(blankMods(), run.mods || {});
    run.index = clamp(run.index | 0, 0, run.tiles.length - 1);
    run.relics = Array.isArray(run.relics) ? run.relics : [];
    run.boons = Array.isArray(run.boons) ? run.boons : [];
    run.foundGold = run.foundGold | 0;
    run.rolls = run.rolls | 0;
    run.wound = run.wound || 0;
    run.rollCap = run.rollCap || 0;
    run.stepsLeft = run.stepsLeft | 0;
    run.banner = run.banner || '';
    if (!Array.isArray(run.pendingCards) || run.pendingCards.length !== 3) run.pendingCards = null;
    if (!HEROES[run.heroId]) run.heroId = 'fenn';
    if (!isFinite(run.hp)) run.hp = profile(State.save, run).maxHp;
    return run;
  }
  function currentTile() {
    if (!State.run) return null;
    return State.run.tiles[State.run.index] || null;
  }

  function hurt(atk, defense, pen) {
    const reduced = Math.max(0, defense * (1 - (pen || 0)));
    return Math.max(1, Math.round(atk * (50 / (50 + reduced))));
  }
  function attackDelay(spd) {
    return 1 / (0.55 * (1 + spd / 32));
  }
  function shake() {
    const frame = document.getElementById('frame');
    if (!frame) return;
    frame.classList.remove('shake');
    void frame.offsetWidth;
    frame.classList.add('shake');
  }
  function floater(text, x, y, kind) {
    const arena = document.querySelector('.arena');
    if (!arena) return;
    const el = document.createElement('span');
    el.className = 'floater ' + kind;
    el.textContent = text;
    el.style.left = x + '%';
    el.style.top = y + '%';
    arena.appendChild(el);
    setTimeout(() => el.remove(), 820);
  }
  function pulseClass(id, cls) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
  function startBattle(tile) {
    const run = State.run;
    const prof = profile(State.save, run);
    let hp = Math.min(run.hp, prof.maxHp);
    if (run.wound) {
      hp = Math.max(1, Math.round(hp * (1 - run.wound)));
      run.wound = 0;
    }
    const foe = tile.foe;
    State.battle = {
      tile,
      speed: State.speed,
      over: false,
      log: foe.name + ' blocks the path.',
      petCd: prof.petMul ? 1.3 : 1e9,
      hero: {
        name: prof.name, hp, maxHp: prof.maxHp, shield: prof.shield || 0,
        atk: prof.atk, def: prof.def, spd: prof.spd, crit: prof.crit, cdmg: prof.cdmg,
        onHit: prof.onHit, thorns: prof.thorns, thornsPct: prof.thornsPct,
        ls: prof.ls, lifeFlat: prof.lifeFlat, ult: 20, ultName: prof.ultName,
        ultMult: prof.ultMult, ultPen: prof.ultPen, ultBonus: prof.ultBonus,
        ultHeal: prof.ultHeal, ultShield: prof.ultShield, bossDmg: prof.bossDmg,
        petMul: prof.petMul, petName: prof.petName, heroId: prof.heroId,
        cd: attackDelay(prof.spd) * 0.25,
      },
      foe: {
        name: foe.name, kind: foe.kind, boss: !!foe.boss, elite: !!foe.elite,
        hp: foe.hp, maxHp: foe.hp, atk: foe.atk, def: foe.def, spd: foe.spd, gold: foe.gold || 0,
        cd: attackDelay(foe.spd) * 0.7, hits: 0,
      },
    };
    State.screen = 'battle';
    State.overlay = null;
    saveGame();
    render();
    startLoop();
  }
  function startLoop() {
    if (State.raf) cancelAnimationFrame(State.raf);
    State.lastTick = 0;
    const frame = (now) => {
      if (!State.battle || State.battle.over) return;
      if (!State.lastTick) State.lastTick = now;
      let dt = Math.min(0.05, (now - State.lastTick) / 1000);
      State.lastTick = now;
      dt *= State.battle.speed || 1;
      stepBattle(dt);
      updateBattleDom();
      if (State.battle && !State.battle.over) State.raf = requestAnimationFrame(frame);
    };
    State.raf = requestAnimationFrame(frame);
  }
  function dealToFoe(hero, foe, amount, kind) {
    foe.hp -= amount;
    const heal = (hero.lifeFlat || 0) + Math.round(amount * (hero.ls || 0));
    if (heal > 0) {
      hero.hp = Math.min(hero.maxHp, hero.hp + heal);
      floater('+' + heal, 30, 58, 'heal');
    }
    floater((kind === 'crit' ? 'CRIT ' : '') + amount, 76, 62, kind === 'ult' ? 'ult' : kind === 'crit' ? 'crit' : 'hit');
    pulseClass('fx-slash', 'go');
    pulseClass('fx-hit', 'go');
    pulseClass('actor-foe', 'flash');
    const battle = State.battle;
    if (kind === 'ult') battle.log = hero.ultName + ' deals ' + amount + '.';
    else battle.log = hero.name + ' hits for ' + amount + (kind === 'crit' ? '. A crit!' : '.');
    blip(kind === 'crit' ? 720 : kind === 'ult' ? 520 : 210, kind === 'ult' ? 0.16 : 0.06, 'square', 0.04);
  }
  function stepBattle(dt) {
    const battle = State.battle;
    if (!battle || battle.over) return;
    const hero = battle.hero;
    const foe = battle.foe;
    hero.cd -= dt;
    foe.cd -= dt;
    battle.petCd -= dt;
    battle.elapsed = (battle.elapsed || 0) + dt;
    if (battle.elapsed > 45) {
      endBattle(hero.hp / hero.maxHp >= foe.hp / foe.maxHp && hero.hp > 0);
      return;
    }
    hero.ult = Math.min(100, hero.ult + 12 * dt);
    if (hero.cd <= 0 && hero.hp > 0 && foe.hp > 0) {
      hero.cd += attackDelay(hero.spd);
      hero.ult = Math.min(100, hero.ult + 7);
      const crit = Math.random() < hero.crit;
      let amount = hurt(hero.atk + (hero.onHit || 0), foe.def);
      if (crit) amount = Math.round(amount * hero.cdmg);
      if (foe.boss) amount = Math.round(amount * (1 + (hero.bossDmg || 0)));
      battle.swings = (battle.swings || 0) + 1;
      dealToFoe(hero, foe, amount, crit ? 'crit' : 'hit');
      pulseClass('actor-hero', 'lunging');
      if (crit) shake();
    }
    if (foe.hp <= 0 || hero.hp <= 0) { resolveDeath(); return; }
    if (hero.ult >= 100 && foe.hp > 0 && hero.hp > 0) {
      hero.ult = 0;
      let amount = hurt(hero.atk * hero.ultMult * (1 + (hero.ultBonus || 0)), foe.def, hero.ultPen || 0);
      if (foe.boss) amount = Math.round(amount * (1 + (hero.bossDmg || 0)));
      if (hero.ultHeal) hero.hp = Math.min(hero.maxHp, hero.hp + Math.round(hero.maxHp * hero.ultHeal));
      if (hero.ultShield) hero.shield += hero.ultShield;
      dealToFoe(hero, foe, amount, 'ult');
      pulseClass('actor-hero', 'lunging');
      shake();
    }
    if (foe.hp <= 0 || hero.hp <= 0) { resolveDeath(); return; }
    if (battle.petCd <= 0 && hero.petMul && foe.hp > 0) {
      battle.petCd += 1.65;
      const amount = hurt((4 + hero.atk * 0.18) * hero.petMul, foe.def);
      foe.hp -= amount;
      floater(String(amount), 48, 70, 'pet');
      pulseClass('actor-pet', 'lunging');
      battle.log = hero.petName + ' nips for ' + amount + '.';
    }
    if (foe.hp <= 0 || hero.hp <= 0) { resolveDeath(); return; }
    if (foe.cd <= 0 && foe.hp > 0 && hero.hp > 0) {
      foe.cd += attackDelay(foe.spd);
      foe.hits += 1;
      const breath = foe.boss && foe.hits % 5 === 0;
      let amount = hurt(foe.atk * (breath ? 1.4 : 1), hero.def);
      const shown = amount;
      if (hero.shield > 0) {
        const absorbed = Math.min(hero.shield, amount);
        hero.shield -= absorbed;
        amount -= absorbed;
      }
      hero.hp -= amount;
      const thorns = (hero.thorns || 0) + Math.round(Math.max(0, amount) * (hero.thornsPct || 0));
      if (thorns) foe.hp -= thorns;
      floater(amount > 0 ? '−' + amount : 'block', 26, 56, 'bad');
      if (thorns) floater(String(thorns), 78, 48, 'thorn');
      pulseClass('actor-foe', 'lunging');
      pulseClass('actor-hero', 'flash');
      if (amount >= 14 || breath) shake();
      battle.log = breath ? foe.name + ' breathes for ' + shown + '!' : foe.name + ' hits for ' + shown + '.';
      blip(140, 0.07, 'sawtooth', 0.035);
      if (hero.hp <= 0 || foe.hp <= 0) resolveDeath();
    }
  }
  function resolveDeath() {
    const battle = State.battle;
    if (!battle || battle.over) return;
    if (battle.hero.hp <= 0) {
      battle.hero.hp = 0;
      endBattle(false);
    } else if (battle.foe.hp <= 0) {
      battle.foe.hp = 0;
      endBattle(true);
    }
  }
  function endBattle(win) {
    const battle = State.battle;
    if (!battle || battle.over) return;
    battle.over = true;
    if (State.raf) cancelAnimationFrame(State.raf);
    State.raf = 0;
    setTimeout(() => {
      if (State.battle !== battle) return;
      if (win) onWin(battle);
      else onLose(battle);
    }, reduceMotion() ? 60 : 680);
  }
  function rollDrop(foe, stage) {
    const roll = Math.random();
    let rarity = 'common';
    if (foe.boss) rarity = roll < 0.22 ? 'uncommon' : roll < 0.72 ? 'rare' : roll < 0.93 ? 'epic' : 'legendary';
    else if (foe.elite) rarity = roll < 0.5 ? 'common' : roll < 0.88 ? 'uncommon' : 'rare';
    else rarity = roll < 0.78 ? 'common' : 'uncommon';
    return makeGear(pickSlot(), rarity, stage, pickSet());
  }
  function draftCards(elite) {
    const weights = elite ? { common: 50, rare: 38, epic: 12 } : { common: 74, rare: 22, epic: 4 };
    const pool = CARDS.map((card) => Object.assign({}, card, { mods: Object.assign({}, card.mods || {}) }));
    const picked = [];
    while (picked.length < 3 && pool.length) {
      const roll = rngInt(100);
      let rarity = 'common';
      if (roll >= weights.common + weights.rare) rarity = 'epic';
      else if (roll >= weights.common) rarity = 'rare';
      let choices = pool.filter((card) => card.rarity === rarity);
      if (!choices.length) choices = pool;
      const choice = choices[rngInt(choices.length)];
      picked.push(choice);
      pool.splice(pool.indexOf(choice), 1);
    }
    return picked;
  }
  function onWin(battle) {
    const run = State.run;
    const foe = battle.foe;
    const before = snapshotUnlocks();
    run.hp = Math.max(0, battle.hero.hp);
    const prof = profile(State.save, run);
    if (prof.healOnKill) run.hp = Math.min(prof.maxHp, run.hp + Math.round(prof.healOnKill));
    battle.tile.resolved = true;
    const lines = ['+' + gainGold(fightGold(foe.gold)) + ' gold'];
    addXp(foe.boss ? 36 + run.stage * 4 : foe.elite ? 18 : 12);
    const dropChance = foe.boss ? 1 : foe.elite ? 0.45 : 0.12;
    if (Math.random() < dropChance) {
      const gear = rollDrop(foe, run.stage);
      if (addGear(gear)) lines.push(gear.name + ' (' + gear.rarity + ')');
    }
    if (foe.elite) {
      State.save.gems += 1;
      lines.push('+1 gem');
      if (Math.random() < 0.1) { State.save.eggs += 1; lines.push('an egg'); }
    }
    if (foe.boss) {
      const bonus = gainGold(fightGold(24 + run.stage * 6));
      const gems = 3 + Math.floor(run.stage / 2);
      State.save.gems += gems;
      State.save.keys += 1;
      const chest = run.stage % 4 === 0 ? 'iron' : 'wood';
      State.save.chests[chest] += 1;
      lines.push('boss bonus +' + bonus + ' gold', '+' + gems + ' gems', '+1 key', CHESTS[chest].name);
      if (Math.random() < 0.4) { State.save.eggs += 1; lines.push('an egg'); }
      if (Math.random() < 0.22) lines.push(grantRandomCompanion());
      State.save.wins += 1;
      State.save.runs += 1;
      State.save.bestRolls = Math.max(State.save.bestRolls || 0, run.rolls || 0);
      State.save.highestStage = Math.max(State.save.highestStage, run.stage + 1);
      const unlocks = diffUnlocks(before);
      autoEquipNew(before);
      State.result = { won: true, stage: run.stage, road: roadName(run.stage), boss: foe.name, lines, unlocks, hero: HEROES[run.heroId].name };
      State.save.run = null;
      State.run = null;
      State.battle = null;
      State.screen = 'victory';
      State.overlay = null;
      saveGame();
      render();
      confetti();
      [523, 659, 784].forEach((freq, i) => setTimeout(() => blip(freq, 0.12, 'triangle', 0.05), i * 90));
      return;
    }
    run.pendingElite = !!foe.elite;
    run.freeReroll = true;
    run.pendingCards = draftCards(!!foe.elite);
    run.banner = lines.join(' · ');
    State.pick = null;
    State.battle = null;
    State.screen = 'cards';
    State.overlay = null;
    saveGame();
    render();
  }
  function onLose(battle) {
    const run = State.run;
    if (!run) return;
    const before = snapshotUnlocks();
    State.save.bestRolls = Math.max(State.save.bestRolls || 0, run.rolls || 0);
    State.save.runs += 1;
    const unlocks = diffUnlocks(before);
    autoEquipNew(before);
    State.result = {
      won: false,
      retired: battle && battle.fled,
      stage: run.stage,
      road: roadName(run.stage),
      foe: battle && battle.foe ? battle.foe.name : 'the road',
      hero: HEROES[run.heroId].name,
      found: run.foundGold || 0,
      unlocks,
    };
    State.save.run = null;
    State.run = null;
    State.battle = null;
    State.screen = 'defeat';
    State.overlay = null;
    saveGame();
    render();
    blip(150, 0.28, 'sawtooth', 0.04);
  }

  function svg(body) {
    return '<svg viewBox="0 0 80 80" aria-hidden="true">' + body + '</svg>';
  }
  const SPRITES = {
    fenn: '<svg viewBox="0 0 80 120" aria-hidden="true"><ellipse cx="16" cy="86" rx="14" ry="8" fill="#f29a3a" stroke="#24160c" stroke-width="2.4" transform="rotate(-32 16 86)"/><ellipse cx="6" cy="78" rx="6" ry="5" fill="#fff4e4" stroke="#24160c" stroke-width="2" transform="rotate(-32 6 78)"/><rect x="30" y="96" width="9" height="16" rx="4" fill="#e07a28" stroke="#24160c" stroke-width="2.2"/><rect x="46" y="96" width="9" height="16" rx="4" fill="#e07a28" stroke="#24160c" stroke-width="2.2"/><ellipse cx="44" cy="84" rx="18" ry="16" fill="#f29a3a" stroke="#24160c" stroke-width="2.6"/><ellipse cx="44" cy="90" rx="10" ry="8" fill="#ffe6c8" stroke="#24160c" stroke-width="2"/><path d="M30 70h28l-4 12H34z" fill="#e23b4a" stroke="#24160c" stroke-width="2.2"/><path d="M28 52 L16 14 L40 42Z" fill="#f29a3a" stroke="#24160c" stroke-width="2.4"/><path d="M60 52 L72 14 L48 42Z" fill="#f29a3a" stroke="#24160c" stroke-width="2.4"/><path d="M30 46 L22 20 L40 40Z" fill="#ffb4c8"/><path d="M58 46 L66 20 L48 40Z" fill="#ffb4c8"/><circle cx="44" cy="50" r="18" fill="#f29a3a" stroke="#24160c" stroke-width="2.6"/><ellipse cx="44" cy="56" rx="10" ry="8" fill="#ffe6c8" stroke="#24160c" stroke-width="2"/><circle cx="37" cy="48" r="2.4" fill="#24160c"/><circle cx="51" cy="48" r="2.4" fill="#24160c"/><circle cx="37.8" cy="47.2" r=".8" fill="#fff"/><circle cx="51.8" cy="47.2" r=".8" fill="#fff"/><ellipse cx="44" cy="55" rx="2.2" ry="1.6" fill="#24160c"/><rect x="62" y="74" width="5" height="22" rx="1" fill="#e8eef6" stroke="#24160c" stroke-width="2"/><rect x="58" y="72" width="13" height="5" rx="1" fill="#c9843a" stroke="#24160c" stroke-width="2"/></svg>',
    bramble: svg('<ellipse cx="40" cy="58" rx="22" ry="16" fill="#8d8a96"/><ellipse cx="40" cy="62" rx="12" ry="8" fill="#f4f0e6"/><path d="M18 48 Q8 30 22 24 Q24 40 28 46Z" fill="#6f6a78"/><path d="M62 48 Q72 30 58 24 Q56 40 52 46Z" fill="#6f6a78"/><circle cx="40" cy="36" r="16" fill="#9b97a3"/><path d="M40 22 l4 16 h-8z" fill="#f7f4ea"/><circle cx="34" cy="36" r="2.2" fill="#2a1608"/><circle cx="46" cy="36" r="2.2" fill="#2a1608"/><ellipse cx="40" cy="42" rx="3" ry="2" fill="#2a1608"/><path d="M24 48 h32 l-4 14 H30z" fill="#8a3a3a"/><rect x="18" y="46" width="10" height="14" rx="2" fill="#c0c6d0"/>'),
    luma: svg('<ellipse cx="18" cy="40" rx="16" ry="22" fill="#c9b0ff"/><ellipse cx="62" cy="40" rx="16" ry="22" fill="#c9b0ff"/><ellipse cx="18" cy="40" rx="8" ry="12" fill="#ffe29a"/><ellipse cx="62" cy="40" rx="8" ry="12" fill="#ffe29a"/><circle cx="40" cy="42" r="14" fill="#f3e6ff"/><circle cx="35" cy="42" r="2" fill="#2a1608"/><circle cx="45" cy="42" r="2" fill="#2a1608"/><path d="M36 48 q4 4 8 0" stroke="#2a1608" fill="none" stroke-width="1.5"/><circle cx="40" cy="64" r="8" fill="#f0c14a"/><rect x="37" y="54" width="6" height="8" fill="#c8892a"/>'),
    cobble: svg('<ellipse cx="40" cy="66" rx="18" ry="8" fill="#8d97a3"/><ellipse cx="28" cy="58" rx="12" ry="10" fill="#aeb6c0"/><ellipse cx="50" cy="56" rx="14" ry="12" fill="#98a2ae"/><circle cx="40" cy="40" r="16" fill="#c5ccd4"/><circle cx="34" cy="40" r="2.2" fill="#2a1608"/><circle cx="46" cy="40" r="2.2" fill="#2a1608"/><path d="M34 46 q6 5 12 0" stroke="#2a1608" fill="none" stroke-width="1.6"/><ellipse cx="54" cy="34" rx="6" ry="4" fill="#7dcea0"/>'),
    slime: svg('<ellipse cx="40" cy="58" rx="24" ry="16" fill="#67c46a"/><ellipse cx="40" cy="50" rx="20" ry="16" fill="#8be08a"/><ellipse cx="32" cy="44" rx="6" ry="3" fill="#eaffea" opacity=".8"/><circle cx="32" cy="50" r="3" fill="#16321a"/><circle cx="48" cy="50" r="3" fill="#16321a"/><path d="M34 58 q6 5 12 0" stroke="#16321a" fill="none" stroke-width="1.6"/><path d="M40 28 q8 6 4 14 q-8-2-4-14z" fill="#3e8f45"/>'),
    bat: svg('<path d="M8 42 Q20 18 40 36 Q60 18 72 42 Q58 40 40 48 Q22 40 8 42Z" fill="#7a5bd6"/><circle cx="40" cy="46" r="12" fill="#9a7de6"/><path d="M30 36 L34 24 L40 34Z" fill="#6a4cc4"/><path d="M50 36 L46 24 L40 34Z" fill="#6a4cc4"/><circle cx="36" cy="46" r="2" fill="#1b1030"/><circle cx="44" cy="46" r="2" fill="#1b1030"/><path d="M37 52 h6" stroke="#1b1030" stroke-width="1.4"/>'),
    goblin: svg('<circle cx="40" cy="36" r="16" fill="#6fbf56"/><path d="M22 34 L10 18 L28 28Z" fill="#5aaa44"/><path d="M58 34 L70 18 L52 28Z" fill="#5aaa44"/><ellipse cx="40" cy="62" rx="14" ry="12" fill="#62b34c"/><circle cx="34" cy="36" r="2.4" fill="#1b3016"/><circle cx="46" cy="36" r="2.4" fill="#1b3016"/><path d="M34 42 q6 6 12 0" stroke="#1b3016" fill="none"/><path d="M22 30 h36" stroke="#d24b4b" stroke-width="4"/><rect x="54" y="48" width="6" height="18" rx="2" fill="#8a5a2a"/>'),
    knight: svg('<path d="M28 66 h24 l4 8 H24z" fill="#9aa3b2"/><rect x="26" y="40" width="28" height="26" rx="8" fill="#d5dbe6"/><path d="M22 46 h36 v10 H22z" fill="#b4233a"/><circle cx="40" cy="30" r="14" fill="#eef2f8"/><rect x="28" y="26" width="24" height="6" rx="2" fill="#2a313c"/><path d="M48 18 h6 v28 h-6z" fill="#cfd6e2"/>'),
    dragon: svg('<ellipse cx="34" cy="58" rx="20" ry="12" fill="#e07a45"/><path d="M14 50 Q4 30 20 28 Q18 42 24 48Z" fill="#c45d38"/><path d="M62 36 Q78 24 70 48 Q60 40 58 32Z" fill="#c45d38"/><circle cx="48" cy="36" r="16" fill="#f09455"/><ellipse cx="50" cy="42" rx="8" ry="6" fill="#ffe0b5"/><circle cx="44" cy="34" r="2.2" fill="#2a1608"/><circle cx="56" cy="34" r="2.2" fill="#2a1608"/><path d="M40 22 L44 10 L50 22Z" fill="#f0c14a"/><path d="M54 20 L62 8 L60 24Z" fill="#f0c14a"/><path d="M62 58 q12 8 8 16" stroke="#e07a45" stroke-width="6" fill="none"/>'),
    nib: svg('<ellipse cx="40" cy="54" rx="16" ry="14" fill="#7dce74"/><circle cx="40" cy="48" r="12" fill="#b6e8a4"/><circle cx="36" cy="48" r="1.8" fill="#1d3a1c"/><circle cx="44" cy="48" r="1.8" fill="#1d3a1c"/><path d="M40 28 q10 10 0 18 q-10-8 0-18z" fill="#3f8f45"/>'),
    wisp: svg('<ellipse cx="40" cy="46" rx="14" ry="20" fill="#9ee7ff"/><ellipse cx="40" cy="44" rx="8" ry="12" fill="#f4fdff"/><circle cx="36" cy="42" r="1.8" fill="#1a3550"/><circle cx="44" cy="42" r="1.8" fill="#1a3550"/><path d="M32 62 q8 10 16 0 q-4 8-8 8 q-4 0-8-8z" fill="#7fd4f0"/>'),
    pip: svg('<path d="M12 44 Q24 24 40 40 Q56 24 68 44 Q54 42 40 50 Q26 42 12 44Z" fill="#6d63c8"/><circle cx="40" cy="46" r="10" fill="#8d86de"/><circle cx="36" cy="46" r="1.7" fill="#1b1030"/><circle cx="44" cy="46" r="1.7" fill="#1b1030"/>'),
    emberkit: svg('<path d="M28 30 L22 12 L36 26Z" fill="#ffb15a"/><path d="M52 30 L58 12 L44 26Z" fill="#ffb15a"/><circle cx="40" cy="42" r="16" fill="#ff7a3c"/><circle cx="40" cy="46" r="8" fill="#ffe08a"/><circle cx="34" cy="40" r="2" fill="#2a1608"/><circle cx="46" cy="40" r="2" fill="#2a1608"/><path d="M18 58 q10 8 8-4" stroke="#ffb15a" stroke-width="6" fill="none"/>'),
    dusthare: svg('<ellipse cx="36" cy="58" rx="18" ry="10" fill="#c9842a"/><circle cx="50" cy="42" r="12" fill="#e0a15a"/><path d="M44 32 L40 8 L52 30Z" fill="#e0a15a"/><path d="M58 32 L66 10 L60 32Z" fill="#e0a15a"/><circle cx="54" cy="42" r="1.8" fill="#2a1608"/><ellipse cx="22" cy="62" rx="8" ry="4" fill="#f4e2c4" opacity=".7"/>'),
    mossram: svg('<ellipse cx="40" cy="52" rx="22" ry="16" fill="#d9e2c8"/><circle cx="40" cy="36" r="12" fill="#e7f0d8"/><path d="M28 28 q-8-12 2-6" stroke="#8a9a6a" stroke-width="3" fill="none"/><path d="M52 28 q8-12-2-6" stroke="#8a9a6a" stroke-width="3" fill="none"/><circle cx="36" cy="36" r="1.7" fill="#24301c"/><circle cx="44" cy="36" r="1.7" fill="#24301c"/><ellipse cx="28" cy="48" rx="6" ry="4" fill="#7dcea0"/>'),
    cindermare: svg('<ellipse cx="38" cy="56" rx="20" ry="12" fill="#d4533c"/><circle cx="58" cy="40" r="12" fill="#e36a48"/><path d="M50 30 q8-16 14-4 q-8 2-14 4z" fill="#f0c14a"/><circle cx="62" cy="38" r="1.8" fill="#2a1608"/><path d="M18 58 l8 10 M30 62 l4 10" stroke="#a33b2a" stroke-width="3"/>'),
    coinback: svg('<ellipse cx="40" cy="58" rx="16" ry="8" fill="#7dcea0"/><circle cx="40" cy="42" r="16" fill="#f0c14a"/><circle cx="40" cy="42" r="10" fill="#c8892a"/><circle cx="28" cy="48" r="6" fill="#8ee0a8"/><circle cx="26" cy="47" r="1.4" fill="#1d3a1c"/>'),
  };
  const ART = {
    fenn: 'art/fenn.png', bramble: 'art/bramble.png', luma: 'art/luma.png', cobble: 'art/cobble.png',
    slime: 'art/slime.png', bat: 'art/bat.png', goblin: 'art/goblin.png', knight: 'art/knight.png', dragon: 'art/dragon.png',
  };
  function sprite(id) {
    if (ART[id]) return '<span class="chibi"><img src="' + ART[id] + '" alt="" draggable="false"></span>';
    return '<span class="chibi">' + (SPRITES[id] || SPRITES.fenn) + '</span>';
  }
  const FACE_TURN = {
    1: 'rotateX(0deg) rotateY(0deg)',
    2: 'rotateY(-90deg)',
    3: 'rotateX(-90deg)',
    4: 'rotateX(90deg)',
    5: 'rotateY(90deg)',
    6: 'rotateY(180deg)',
  };
  function icon(path) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg>';
  }
  const ICONS = {
    coin: icon('<circle cx="12" cy="12" r="8" fill="#f0c14a"/><circle cx="12" cy="12" r="4" fill="none" stroke="#2a1608" stroke-width="1.6"/>'),
    gem: icon('<path d="M12 3 L20 10 L12 21 L4 10 Z" fill="#8ec0ff"/><path d="M4 10 H20 L12 3 Z" fill="#d7ecff"/>'),
    key: icon('<circle cx="9" cy="12" r="4" fill="none" stroke="#f0c14a" stroke-width="2"/><path d="M12 12 H20 M17 12 V15 M20 12 V14" stroke="#f0c14a" stroke-width="2"/>'),
    die: icon('<rect x="4" y="4" width="16" height="16" rx="4" fill="#fff4d2"/><circle cx="8" cy="8" r="1.3" fill="#2a1608"/><circle cx="12" cy="12" r="1.3" fill="#2a1608"/><circle cx="16" cy="16" r="1.3" fill="#2a1608"/>'),
    sound: icon('<path d="M4 10 H8 L13 6 V18 L8 14 H4 Z" fill="#f7f0e4"/><path d="M16 9 Q19 12 16 15" stroke="#f7f0e4" fill="none" stroke-width="1.6"/>'),
    mute: icon('<path d="M4 10 H8 L13 6 V18 L8 14 H4 Z" fill="#f7f0e4"/><path d="M16 9 L21 15 M21 9 L16 15" stroke="#f7f0e4" stroke-width="1.6"/>'),
    camp: icon('<path d="M4 20 L12 6 L20 20 Z" fill="currentColor"/><rect x="10.5" y="14" width="3" height="6" fill="#2a1608"/>'),
    party: icon('<circle cx="9" cy="9" r="3" fill="currentColor"/><circle cx="16" cy="10" r="2.4" fill="currentColor"/><path d="M4 19 Q9 13 14 19 M12 19 Q16 14 21 19" fill="currentColor"/>'),
    gear: icon('<path d="M12 3 L14 7 L18 6 L17 10 L21 12 L17 14 L18 18 L14 17 L12 21 L10 17 L6 18 L7 14 L3 12 L7 10 L6 6 L10 7 Z" fill="currentColor"/>'),
    grow: icon('<path d="M12 20 V10" stroke="currentColor" stroke-width="2"/><path d="M12 12 Q6 10 7 4 Q14 6 12 12 Z M12 14 Q18 12 17 6 Q10 8 12 14 Z" fill="currentColor"/>'),
    chest: icon('<rect x="3" y="9" width="18" height="10" rx="2" fill="currentColor"/><path d="M3 13 H21" stroke="#2a1608"/><rect x="10" y="11" width="4" height="4" fill="#f0c14a"/>'),
    sword: icon('<path d="M12 2 L14 12 H10 Z M8 13 H16 V16 H8 Z M11 16 H13 V22 H11 Z" fill="#fff"/>'),
    crown: icon('<path d="M4 16 L7 8 L12 13 L17 8 L20 16 Z" fill="#f0c14a"/>'),
    star: icon('<path d="M12 3 L14 9 H20 L15 13 L17 20 L12 16 L7 20 L9 13 L4 9 H10 Z" fill="#fff"/>'),
    heart: icon('<path d="M12 19 Q4 12 6 7 Q9 4 12 8 Q15 4 18 7 Q20 12 12 19 Z" fill="#fff"/>'),
    thorn: icon('<path d="M12 3 C14 8 18 10 18 14 C18 18 15 21 12 21 C9 21 6 18 6 14 C6 10 10 8 12 3 Z" fill="#fff"/>'),
    bag: icon('<path d="M8 9 H16 L18 20 H6 Z" fill="#fff"/><path d="M10 9 Q12 4 14 9" stroke="#fff" fill="none"/>'),
    flame: icon('<path d="M12 2 Q16 8 14 12 Q20 12 16 22 Q8 20 8 13 Q12 12 10 8 Z" fill="#f0c14a"/>'),
    fire: icon('<path d="M12 4 Q16 10 13 14 Q18 16 12 22 Q6 16 10 12 Q8 8 12 4 Z" fill="#f0c14a"/>'),
    shield: icon('<path d="M12 3 L20 7 V13 Q12 21 4 13 V7 Z" fill="#8ecbff" stroke="#24160c" stroke-width="1.4"/>'),
    paw: icon('<circle cx="8" cy="8" r="2.2" fill="#f29a3a"/><circle cx="16" cy="8" r="2.2" fill="#f29a3a"/><circle cx="6" cy="13" r="2" fill="#f29a3a"/><circle cx="18" cy="13" r="2" fill="#f29a3a"/><ellipse cx="12" cy="16" rx="4" ry="3.2" fill="#f29a3a"/>'),
    armor: icon('<path d="M6 6 H18 V12 Q12 20 6 12 Z" fill="#d5dbe6" stroke="#24160c" stroke-width="1.4"/>'),
    boot: icon('<path d="M8 4 H14 V14 H18 V18 H6 V12 H8 Z" fill="#c9843a" stroke="#24160c" stroke-width="1.2"/>'),
  };
  function skillBadge(card) {
    const m = (card && card.mods) || {};
    let bg = '#ffb15a';
    let glyph = '<path d="M32 10 L38 28 H54 L41 38 L46 56 L32 46 L18 56 L23 38 L10 28 H26 Z" fill="#fff" stroke="#24160c" stroke-width="2"/>';
    if (m.hp || m.healOnKill || m.lifeFlat || m.ls) {
      bg = '#ff5d73';
      glyph = '<path d="M32 50 C12 34 14 16 26 16 C32 16 32 22 32 22 C32 22 32 16 38 16 C50 16 52 34 32 50Z" fill="#fff" stroke="#24160c" stroke-width="2"/>';
    } else if (m.def || m.shield) {
      bg = '#5aa7ff';
      glyph = '<path d="M32 8 L52 16 V32 Q32 56 12 32 V16 Z" fill="#fff" stroke="#24160c" stroke-width="2"/>';
    } else if (m.spd) {
      bg = '#7dce8a';
      glyph = '<path d="M14 40 L34 12 L30 32 H50 L28 54 L34 36 Z" fill="#fff" stroke="#24160c" stroke-width="2"/>';
    } else if (m.crit || m.cdmg) {
      bg = '#ffe56a';
      glyph = '<circle cx="32" cy="32" r="14" fill="#fff" stroke="#24160c" stroke-width="2"/><path d="M32 8 V18 M32 46 V56 M8 32 H18 M46 32 H56" stroke="#24160c" stroke-width="3"/>';
    } else if (m.ultBonus) {
      bg = '#ff7a3a';
      glyph = '<path d="M32 6 C40 20 48 22 44 36 C52 34 50 50 32 58 C14 50 12 34 20 36 C16 22 24 20 32 6Z" fill="#fff" stroke="#24160c" stroke-width="2"/>';
    } else if (m.thorns || m.thornsPct) {
      bg = '#7a4ad0';
      glyph = '<path d="M32 8 L38 28 L32 24 L26 28 Z M32 24 V54" fill="#fff" stroke="#24160c" stroke-width="2"/>';
    } else if (m.atk || m.onHit) {
      bg = '#f29a3a';
      glyph = '<path d="M18 46 L40 12 L36 34 H50 L26 54 L32 36 Z" fill="#fff" stroke="#24160c" stroke-width="2"/>';
    }
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="4" width="56" height="56" rx="14" fill="' + bg + '" stroke="#24160c" stroke-width="3"/>' + glyph + '</svg>';
  }
  function boonIcon(card) {
    const m = (card && card.mods) || {};
    if (m.ultBonus) return ICONS.flame;
    if (m.ls || m.lifeFlat || m.healOnKill) return ICONS.heart;
    if (m.thorns || m.thornsPct) return ICONS.thorn;
    if (m.shield) return ICONS.shield;
    if (m.crit || m.cdmg) return ICONS.star;
    if (m.spd) return ICONS.paw;
    if (m.def) return ICONS.armor;
    if (m.hp) return ICONS.heart;
    return ICONS.sword;
  }
  function slotIcon(slot) {
    if (slot === 'weapon') return ICONS.sword;
    if (slot === 'helm') return ICONS.crown;
    if (slot === 'armor') return ICONS.armor;
    if (slot === 'boots') return ICONS.boot;
    if (slot === 'ring') return ICONS.star;
    return ICONS.gem;
  }
  function cubeHTML() {
    const face = (n, cls) => '<div class="cube-face ' + cls + '">' + diePips(n) + '</div>';
    const turn = FACE_TURN[State.dieFace] || FACE_TURN[1];
    return '<div class="die-stage"><div class="cube" id="cube" style="transform:' + turn + '">' +
      face(1, 'f1') + face(2, 'f2') + face(3, 'f3') + face(4, 'f4') + face(5, 'f5') + face(6, 'f6') +
      '</div></div>';
  }
  function tileIcon(type) {
    const map = { start: ICONS.fire, fight: ICONS.sword, elite: ICONS.crown, mini: ICONS.star, buff: ICONS.heart, hazard: ICONS.thorn, shop: ICONS.bag, boss: ICONS.flame };
    return map[type] || ICONS.star;
  }
  function diePips(face) {
    const on = PIPS[face] || PIPS[1];
    let cells = '';
    for (let i = 0; i < 9; i += 1) cells += '<i class="' + (on.indexOf(i) >= 0 ? 'on' : '') + '"></i>';
    return '<div class="die-grid">' + cells + '</div>';
  }
  function chestArt(open) {
    const lid = open ? '#f0c14a' : '#c8892a';
    return '<svg viewBox="0 0 80 64" aria-hidden="true"><rect x="8" y="24" width="64" height="32" rx="6" fill="#8a5a2a"/><path d="M8 28 H72 V20 Q40 4 8 20 Z" fill="' + lid + '"/><rect x="36" y="30" width="8" height="10" rx="2" fill="#f0c14a"/></svg>';
  }

  function render() {
    renderTop();
    renderView();
    renderDock();
    renderOverlay();
  }
  function renderTop() {
    const save = State.save;
    document.getElementById('top').innerHTML =
      '<button class="icon-btn" data-act="mute" aria-label="' + (save.muted ? 'Unmute' : 'Mute') + '">' + (save.muted ? ICONS.mute : ICONS.sound) + '</button>' +
      '<div class="brand">' + ICONS.die + '<span>DICEBORN</span></div>' +
      '<div class="currs"><span title="Gold">' + ICONS.coin + '<b id="gold-val">' + save.gold + '</b></span>' +
      '<span title="Gems">' + ICONS.gem + '<b id="gem-val">' + save.gems + '</b></span>' +
      '<span title="Keys">' + ICONS.key + '<b id="key-val">' + save.keys + '</b></span></div>';
  }
  function navHTML() {
    const points = State.save.talentPoints;
    const items = [
      ['camp', 'Adventure', ICONS.camp],
      ['gear', 'Forge', ICONS.gear],
      ['chests', 'Chests', ICONS.chest],
      ['grow', 'Talents', ICONS.grow],
      ['party', 'Heroes', ICONS.party],
    ];
    return '<nav class="nav">' + items.map(([id, label, pic]) =>
      '<button data-act="goto" data-to="' + id + '" class="' + (State.screen === id ? 'on' : '') + '" aria-current="' + (State.screen === id ? 'page' : 'false') + '">' +
      pic + label + (id === 'grow' && points ? '<i class="badge">' + points + '</i>' : '') + '</button>'
    ).join('') + '</nav>';
  }
  function renderDock() {
    const dock = document.getElementById('dock');
    if (State.screen === 'battle') {
      dock.innerHTML = '<button class="roll" id="speed-btn" data-act="speed" aria-label="Battle speed, free">Speed ' + State.speed + '×</button>';
      return;
    }
    if (State.screen === 'cards') {
      dock.innerHTML = '<button class="roll" data-act="take-card"' + (State.pick == null ? ' disabled' : '') + '>Learn skill</button>';
      return;
    }
    if (State.screen === 'victory' || State.screen === 'defeat') {
      dock.innerHTML = '<button class="roll" data-act="camp">Back to camp</button>';
      return;
    }
    if (State.screen === 'board' && State.run) {
      const tile = currentTile();
      const atEnd = State.run.index >= State.run.tiles.length - 1;
      const pending = (State.run.stepsLeft || 0) > 0 && tile && tile.resolved && !atEnd;
      const ready = tile && tile.resolved && !atEnd && !pending;
      const label = pending ? 'WALK' : (tile && !tile.resolved ? 'LOOK' : 'END');
      const act = pending ? 'continue' : 'enter';
      dock.innerHTML = '<div class="dice-dock">' +
        '<div class="roll-pill"><b>' + (State.run.rolls || 0) + '</b><small>rolls</small></div>' +
        (ready
          ? '<button class="dice-btn' + (State.save.runs === 0 && State.run.index === 0 ? ' pulse' : '') + '" data-act="roll" aria-label="Roll the die"><span id="iso-die">' + isoDie(State.dieFace) + '</span><span>ROLL</span></button>'
          : '<button class="dice-btn" data-act="' + act + '"><span id="iso-die">' + isoDie(State.dieFace) + '</span><span>' + label + '</span></button>') +
        '<div class="roll-pill"><b>' + (State.run.index + 1) + '/' + State.run.tiles.length + '</b><small>path</small></div>' +
        '</div><div class="subdock"><button data-act="ask-retire">Retire</button><button data-act="help">How to play</button></div>';
      return;
    }
    dock.innerHTML = navHTML();
  }
  function renderView() {
    const view = document.getElementById('view');
    const screens = { camp: viewCamp, party: viewParty, gear: viewGear, grow: viewGrow, chests: viewChests, board: viewBoard, battle: viewBattle, cards: viewCards, victory: viewEnd, defeat: viewEnd };
    const fn = screens[State.screen] || viewCamp;
    view.innerHTML = fn();
    if (State.screen === 'board') {
      const tile = view.querySelector('.tile.current');
      if (tile) tile.scrollIntoView({ block: 'nearest' });
    }
  }

  function statChips(prof) {
    const bits = [['HP', prof.maxHp], ['ATK', prof.atk], ['DEF', prof.def], ['SPD', prof.spd], ['CRIT', Math.round(prof.crit * 100) + '%']];
    return '<div class="stats">' + bits.map(([name, value]) => '<div class="stat"><b>' + value + '</b><span>' + name + '</span></div>').join('') + '</div>';
  }
  function arenaBackdrop(boss) {
    const sky = boss ? '#ff9a4a' : '#8fd8ff';
    const hill = boss ? '#6a4030' : '#3c8f38';
    const floor = boss ? '#6a5348' : '#d9c4a0';
    const floor2 = boss ? '#4e3b34' : '#c4ab84';
    let stones = '';
    for (let r = 0; r < 4; r += 1) {
      for (let c = 0; c < 7; c += 1) {
        const x = 20 + c * 48 + (r % 2) * 24;
        const y = 196 + r * 28;
        stones += '<polygon points="' + x + ',' + y + ' ' + (x + 28) + ',' + (y + 12) + ' ' + x + ',' + (y + 24) + ' ' + (x - 28) + ',' + (y + 12) + '" fill="' + ((c + r) % 2 ? floor : floor2) + '" stroke="#24160c" stroke-width="1.4"/>';
      }
    }
    return '<svg class="backdrop" viewBox="0 0 360 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="340" fill="' + sky + '"/><circle cx="300" cy="48" r="26" fill="#ffe56a" stroke="#24160c" stroke-width="3"/><ellipse cx="60" cy="120" rx="28" ry="16" fill="#fff" stroke="#24160c" stroke-width="2"/><ellipse cx="78" cy="116" rx="18" ry="12" fill="#fff" stroke="#24160c" stroke-width="2"/><ellipse cx="40" cy="168" rx="100" ry="36" fill="' + hill + '"/><ellipse cx="320" cy="176" rx="90" ry="32" fill="' + hill + '"/><rect x="18" y="150" width="12" height="40" fill="#6b4428" stroke="#24160c"/><circle cx="24" cy="132" r="28" fill="#2f7d32" stroke="#24160c" stroke-width="3"/><circle cx="8" cy="146" r="16" fill="#4eaa45" stroke="#24160c" stroke-width="2"/><rect x="326" y="146" width="12" height="44" fill="#6b4428" stroke="#24160c"/><circle cx="332" cy="128" r="30" fill="#2f7d32" stroke="#24160c" stroke-width="3"/>' + stones + '</svg>';
  }
  function treeSvg() {
    return '<svg viewBox="0 0 70 92" aria-hidden="true"><rect x="30" y="58" width="10" height="28" fill="#8a5a32" stroke="#24160c" stroke-width="2"/><circle cx="35" cy="40" r="26" fill="#3f9a34" stroke="#24160c" stroke-width="3"/><circle cx="22" cy="48" r="14" fill="#67c453" stroke="#24160c" stroke-width="2"/><circle cx="48" cy="46" r="12" fill="#2f7d32" stroke="#24160c" stroke-width="2"/></svg>';
  }
  function viewCamp() {
    const save = State.save;
    const prof = profile(save, null);
    const lv = levelProgress(save.xp);
    const hero = HEROES[save.hero];
    const filter = skinFilter(save.hero);
    const slots = SLOTS.map((slot) => {
      const gear = gearById(save.equipped[slot]);
      return '<button class="eq eq-' + slot + (gear ? ' rarity-' + gear.rarity : '') + '" data-act="goto" data-to="gear" aria-label="' + SLOT_LABEL[slot] + '">' + slotIcon(slot) + '<small>' + SLOT_LABEL[slot] + '</small></button>';
    }).join('');
    const pet = save.pet && PETS[save.pet] ? '<button class="buddy pet" data-act="goto" data-to="party">' + sprite(save.pet) + '</button>' : '';
    const leadMount = deployedMountIds(save).find(Boolean);
    const mount = leadMount ? '<button class="buddy mount" data-act="goto" data-to="party">' + sprite(leadMount) + '</button>' : '';
    const dailyReady = save.daily.last !== todayKey();
    return '<section class="camp-world"><div class="camp-stage painted">' +
      slots + pet + mount +
      '<div class="hero-stand" style="' + (filter ? 'filter:' + filter : '') + '">' + sprite(save.hero) + '</div>' +
      '<div class="nameplate"><b>' + esc(hero.name) + '</b><span>Lv ' + lv.lvl + ' · longest ' + (save.bestRolls || 0) + ' rolls</span></div></div>' +
      '<div class="ribbon"><span>' + prof.maxHp + '<i>HP</i></span><span>' + prof.atk + '<i>ATK</i></span><span>' + prof.def + '<i>DEF</i></span><span>' + prof.spd + '<i>SPD</i></span></div>' +
      '<div class="sign"><button data-act="stage" data-dir="-1" aria-label="Lower stage"' + (save.stage <= 1 ? ' disabled' : '') + '>‹</button><div><div class="kicker">Chapter ' + save.stage + '</div><b>' + esc(roadName(save.stage)) + '</b></div><button data-act="stage" data-dir="1" aria-label="Higher stage"' + (save.stage >= save.highestStage ? ' disabled' : '') + '>›</button></div>' +
      (save.run ? '<button class="play" data-act="resume">RESUME</button>' : '<button class="play" data-act="play">START</button>') +
      (dailyReady ? '<button class="gift ready" data-act="daily">Daily gift is ready</button>' : '<p class="tiny">Daily gift returns tomorrow. Nothing here costs money.</p>') +
      '</section>';
  }
  function viewParty() {
    const tab = State.partyTab || 'heroes';
    const tabs = [['heroes', 'Heroes'], ['pets', 'Pets'], ['mounts', 'Mounts'], ['sentinels', 'Sentinels']].map(([id, label]) =>
      '<button data-act="party-tab" data-to="' + id + '" class="' + (tab === id ? 'on' : '') + '">' + label + '</button>'
    ).join('');
    let body = '';
    if (tab === 'heroes') body = heroesPane();
    else if (tab === 'pets') body = petsPane();
    else if (tab === 'mounts') body = mountsPane();
    else body = sentinelsPane();
    return '<section><div class="tabs">' + tabs + '</div>' + body + '</section>';
  }
  function heroesPane() {
    const save = State.save;
    const focus = State.focusHero && HEROES[State.focusHero] ? State.focusHero : save.hero;
    const hero = HEROES[focus];
    const open = heroUnlocked(focus);
    const prof = profile(Object.assign({}, save, { hero: focus }), null);
    const rank = (save.heroRank && save.heroRank[focus]) || 0;
    const cost = Math.round(22 * Math.pow(1.45, rank));
    const skins = (SKINS[focus] || []).map((skin) => {
      const owned = skin.met(save);
      const on = ((save.skin && save.skin[focus]) || 'road') === skin.id;
      return '<button data-act="skin" data-id="' + focus + '" data-skin="' + skin.id + '"' + (owned ? '' : ' disabled') + ' class="' + (on ? 'on' : '') + '">' + esc(skin.name) + '</button>';
    }).join('');
    const synergy = focus === 'fenn' ? 'With Nib: +4% crit' : focus === 'bramble' ? 'With Pebble Warden: +2 DEF' : focus === 'luma' ? 'With Wisp: stronger ultimate' : 'With Mossram: +12 HP';
    const grid = HERO_IDS.map((id) => '<button class="' + (id === focus ? 'on' : '') + '" data-act="focus-hero" data-id="' + id + '">' + sprite(id) + '<small>' + esc(heroProgress(id)) + '</small></button>').join('');
    return '<article class="hero-sheet painted"><div class="big" style="filter:' + skinFilter(focus) + '">' + sprite(focus) + '</div><div class="sheet-copy"><p class="kicker">' + esc(open ? hero.role : 'Locked') + '</p><h2>' + esc(hero.name) + '</h2><p class="muted">Rank ' + rank + ' · ' + esc(hero.ult) + '</p><div class="statbox"><span>HP ' + prof.maxHp + '</span><span>ATK ' + prof.atk + '</span><span>DEF ' + prof.def + '</span><span>SPD ' + prof.spd + '</span></div><p class="muted">' + esc(hero.ultDesc) + '</p><p class="muted">Synergy: ' + synergy + '</p></div></article>' +
      '<div class="panel"><div class="tabs">' + skins + '</div><button class="gold-btn" data-act="enhance-hero" data-id="' + focus + '"' + (open ? '' : ' disabled') + '>Enhance · ' + cost + ' gold</button><button class="ghost" data-act="equip-hero" data-id="' + focus + '">' + (save.hero === focus ? 'Traveling with you' : 'Swap in') + '</button><p class="muted">' + esc(open ? hero.blurb : hero.unlockText) + '</p></div>' +
      '<div class="panel"><h3>Roster</h3><div class="hero-grid">' + grid + '</div></div>';
  }
  function petsPane() {
    const save = State.save;
    const grid = PET_IDS.map((id) => '<button class="' + (save.pet === id ? 'on' : '') + '" data-act="equip-pet" data-id="' + id + '">' + sprite(id) + '<small>' + esc(petUnlocked(id) ? PETS[id].name : PETS[id].unlockText) + '</small></button>').join('');
    return '<div class="habitat">' + (save.pet ? sprite(save.pet) : '<p class="tiny">No pet out</p>') + '</div><div class="panel"><button class="gold-btn" data-act="hatch"' + (save.eggs ? '' : ' disabled') + '>' + (save.eggs ? 'Hatch egg (' + save.eggs + ')' : 'Eggs come from bosses and gifts') + '</button><div class="pet-grid">' + grid + '</div></div>';
  }
  function mountsPane() {
    const save = State.save;
    const view = State.mountView || 'deploy';
    const focus = State.focusMount && MOUNTS[State.focusMount] ? State.focusMount : (deployedMountIds(save).find(Boolean) || 'dusthare');
    const slots = [0, 1, 2].map((i) => {
      const id = (save.mountSlots || [])[i];
      return '<button class="pedestal" data-act="mount-slot" data-slot="' + i + '">' + (id ? sprite(id) : '<b>+</b>') + '<small>' + (id ? esc(MOUNTS[id].name) : 'Empty') + '</small></button>';
    }).join('');
    const strip = MOUNT_IDS.map((id) => '<button class="' + (id === focus ? 'on' : '') + '" data-act="focus-mount" data-id="' + id + '">' + sprite(id) + '<small>' + (mountUnlocked(id) ? 'Lv ' + mountLv(id) : 'Locked') + '</small></button>').join('');
    const cost = 20 * mountLv(focus);
    const body = view === 'deploy'
      ? '<div class="habitat"><div class="pedestals" style="width:100%">' + slots + '</div></div><p class="tiny">Tap a pedestal, then a mount below, to deploy. Up to three.</p>'
      : '<div class="hero-sheet"><div class="big">' + sprite(focus) + '</div><div><h2>' + esc(MOUNTS[focus].name) + '</h2><p class="muted">' + esc(mountUnlocked(focus) ? MOUNTS[focus].blurb : MOUNTS[focus].unlockText) + '</p><button class="gold-btn" data-act="level-mount" data-id="' + focus + '"' + (mountUnlocked(focus) ? '' : ' disabled') + '>Level · ' + cost + ' gold</button></div></div>';
    return '<div class="tabs"><button data-act="mount-view" data-to="deploy" class="' + (view === 'deploy' ? 'on' : '') + '">Deploy</button><button data-act="mount-view" data-to="collection" class="' + (view === 'collection' ? 'on' : '') + '">Collection</button></div>' + body + '<div class="panel"><div class="pet-grid">' + strip + '</div></div>';
  }
  function sentinelsPane() {
    const save = State.save;
    const pads = [0, 1, 2].map((i) => {
      const id = (save.sentinelDeploy || [])[i];
      const def = id && SENTINELS[id];
      return '<button class="pedestal" data-act="clear-sentinel" data-slot="' + i + '">' + (def ? '<b>' + esc(def.name) + '</b><small>Lv ' + Math.max(1, sentinelLv(id)) + '</small>' : '<b>+</b><small>Pedestal</small>') + '</button>';
    }).join('');
    const list = SENTINEL_IDS.map((id) => {
      const def = SENTINELS[id];
      const ready = sentinelReady(id);
      const lv = sentinelLv(id);
      const cost = lv <= 0 ? 0 : 16 * lv;
      return '<div class="row"><span class="row-art">' + sprite(id === 'pebble' ? 'cobble' : id === 'amber' ? 'emberkit' : 'nib') + '</span><span><b>' + esc(def.name) + '</b><span class="muted">' + esc(ready ? def.blurb : def.text) + '</span></span><button class="buy" data-act="level-sentinel" data-id="' + id + '"' + (ready ? '' : ' disabled') + '>' + (lv <= 0 ? 'Awaken' : cost + ' g') + '</button></div>';
    }).join('');
    return '<div class="habitat"><div class="pedestals" style="width:100%">' + pads + '</div></div><div class="panel"><p class="muted">Awaken a sentinel, then tap a pedestal and choose one. Bonuses apply at once. Gold only.</p>' + list + '<div class="tabs">' + SENTINEL_IDS.map((id) => '<button data-act="place-sentinel" data-id="' + id + '"' + (sentinelReady(id) ? '' : ' disabled') + '>Place ' + esc(SENTINELS[id].name.split(' ')[0]) + '</button>').join('') + '</div></div>';
  }
  function companionRow(kind, id, data, on, open) {
    return '<button class="row' + (on ? ' on' : '') + (open ? '' : ' lock') + '" data-act="equip-' + kind + '" data-id="' + id + '"><span class="row-art">' + sprite(id) + '</span><span><b>' + esc(data.name) + '</b><span class="muted">' + esc(open ? data.blurb : data.unlockText) + '</span></span><span class="pill">' + (on ? 'Active' : open ? 'Ready' : 'Locked') + '</span></button>';
  }
  function viewGear() {
    const save = State.save;
    const counts = setCounts(save);
    const equipped = SLOTS.map((slot) => {
      const gear = gearById(save.equipped[slot]);
      return '<button class="slot" data-act="item" data-id="' + (gear ? gear.id : '') + '"><small>' + slot + '</small><b>' + esc(gear ? gear.name : 'Empty') + '</b><span>' + esc(gear ? describeStats(gear) : 'Tap a piece below') + '</span></button>';
    }).join('');
    const sets = SET_IDS.map((id) => {
      const n = counts[id] || 0;
      const info = SET_INFO[id];
      const on = n >= 2;
      return '<p class="set-line' + (on ? ' on' : '') + '">' + esc(info.name) + ' ' + n + '/3 · ' + esc(n >= 3 ? info.three : n >= 2 ? info.two : 'needs 2 pieces') + '</p>';
    }).join('');
    const fuseCells = [0, 1, 2].map((i) => {
      const gear = gearById(State.fuse[i]);
      return '<div class="fuse-cell"><b>' + (gear ? esc(gear.name) : 'Slot ' + (i + 1)) + '</b><span>' + (gear ? esc(gear.rarity + ' ' + gear.slot) : 'Pick from the pack') + '</span></div>';
    }).join('');
    const sorted = save.gear.slice().sort((a, b) => RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity) || a.slot.localeCompare(b.slot));
    const rows = sorted.length ? sorted.map((gear) => {
      const marked = State.fuse.indexOf(gear.id) >= 0;
      return '<button class="row rarity-' + gear.rarity + (marked ? ' on' : '') + '" data-act="item" data-id="' + gear.id + '"><span class="row-art">' + ICONS.gear + '</span><span><b>' + esc(gear.name) + '</b><span class="muted">' + esc(describeStats(gear)) + '</span></span><span class="pill tag-' + gear.rarity + '">' + gear.rarity + '</span></button>';
    }).join('') : '<p class="muted">No gear yet. Win fights, open chests, and visit peddlers.</p>';
    const ready = State.fuse.length === 3;
    const grid = sorted.length ? sorted.map((gear) => {
      const marked = State.fuse.indexOf(gear.id) >= 0;
      return '<button class="rarity-' + gear.rarity + (marked ? ' on' : '') + '" data-act="item" data-id="' + gear.id + '" style="background:' + (gear.rarity === 'rare' ? '#d7ecff' : gear.rarity === 'epic' ? '#f3d6ff' : gear.rarity === 'legendary' ? '#ffe7a4' : gear.rarity === 'uncommon' ? '#d9f7e2' : '#fff') + '">' + slotIcon(gear.slot) + '<small>Lv' + gear.ilevel + '</small></button>';
    }).join('') : '<p class="muted">The racks are empty. Win fights and open chests.</p>';
    return '<section><div class="forge-head"><div class="forge-fire"></div><div class="smith">' + sprite('bramble') + '</div><div class="bubble" style="position:absolute;left:78px;top:16px;max-width:180px">Hearth is hot. Three of a kind become the next rarity.</div></div>' +
      '<div class="tabs"><button data-act="forge-tab" data-to="merge" class="' + ((State.forgeTab || 'merge') === 'merge' ? 'on' : '') + '">Merge</button><button data-act="forge-tab" data-to="break" class="' + (State.forgeTab === 'break' ? 'on' : '') + '">Dismantle</button></div>' +
      '<div class="panel"><p class="muted">Power ' + Math.round(profile(save, null).atk * 10 + profile(save, null).maxHp * 0.4) + '</p><div class="equip-row">' + equipped + '</div>' + sets +
      '<div class="fuse-tray">' + fuseCells + '</div><button class="gold-btn" data-act="fuse-go"' + (ready ? '' : ' disabled') + '>Merge selected</button><button class="ghost" data-act="quick-merge">Quick merge</button><div class="inv-grid" style="margin-top:8px">' + grid + '</div></div></section>';
  }
  function viewGrow() {
    const save = State.save;
    const lv = levelProgress(save.xp);
    const training = TRAINING.map((spec) => {
      const rank = save.training[spec.id] || 0;
      const maxed = rank >= spec.max;
      const cost = trainCost(rank);
      return '<div class="row"><span class="row-art">' + ICONS.grow + '</span><span><b>' + spec.name + '</b><span class="muted">' + spec.detail + ' · rank ' + rank + '/' + spec.max + '</span></span><button class="buy" data-act="train" data-id="' + spec.id + '"' + (maxed || save.gold < cost ? ' disabled' : '') + '>' + (maxed ? 'Mastered' : cost + ' g') + '</button></div>';
    }).join('');
    const talents = TALENTS.map((spec) => {
      const rank = save.talents[spec.id] || 0;
      const maxed = rank >= spec.max;
      return '<div class="row"><span class="row-art">' + ICONS.star + '</span><span><b>' + spec.name + '</b><span class="muted">' + spec.detail + ' · rank ' + rank + '/' + spec.max + '</span></span><button class="buy" data-act="talent" data-id="' + spec.id + '"' + (maxed || save.talentPoints < 1 ? ' disabled' : '') + '>' + (maxed ? 'Mastered' : '1 pt') + '</button></div>';
    }).join('');
    const nodes = [
      ['hp', 50, 86], ['atk', 22, 70], ['def', 78, 70],
      ['mend', 32, 54], ['shield', 68, 54],
      ['spd', 18, 38], ['pet', 50, 38], ['gold', 82, 38],
      ['mini', 34, 22], ['ult', 66, 22], ['boss', 50, 8],
    ];
    const links = [['hp', 'atk'], ['hp', 'def'], ['atk', 'mend'], ['def', 'shield'], ['mend', 'spd'], ['mend', 'pet'], ['shield', 'pet'], ['shield', 'gold'], ['spd', 'mini'], ['pet', 'mini'], ['pet', 'ult'], ['gold', 'ult'], ['mini', 'boss'], ['ult', 'boss']];
    const pos = {};
    nodes.forEach((n) => { pos[n[0]] = n; });
    const lines = links.map(([a, b]) => '<line x1="' + pos[a][1] + '" y1="' + pos[a][2] + '" x2="' + pos[b][1] + '" y2="' + pos[b][2] + '" stroke="#ffd04a" stroke-width="1.2"/>').join('');
    const selected = State.treeNode || 'hp';
    const bubbles = nodes.map(([id, x, y]) => {
      const train = TRAINING.find((item) => item.id === id);
      const talent = TALENTS.find((item) => item.id === id);
      const rank = train ? (save.training[id] || 0) : (save.talents[id] || 0);
      const label = train ? train.name.split(' ')[0] : talent.name.split(' ')[0];
      return '<button class="node' + (selected === id ? ' on' : '') + '" style="left:' + x + '%;top:' + y + '%" data-act="tree" data-id="' + id + '">' + esc(label) + '<small>' + rank + '</small></button>';
    }).join('');
    const specT = TRAINING.find((item) => item.id === selected);
    const specL = TALENTS.find((item) => item.id === selected);
    let detail = '';
    if (specT) {
      const rank = save.training[selected] || 0;
      const cost = trainCost(rank);
      detail = '<b>' + specT.name + '</b><p class="muted">' + specT.detail + ' · rank ' + rank + '. Applies the moment you pay.</p><button class="gold-btn" data-act="train" data-id="' + selected + '"' + (rank >= specT.max || save.gold < cost ? ' disabled' : '') + '>' + (rank >= specT.max ? 'Mastered' : 'Train · ' + cost + ' gold') + '</button>';
    } else if (specL) {
      const rank = save.talents[selected] || 0;
      detail = '<b>' + specL.name + '</b><p class="muted">' + specL.detail + ' · rank ' + rank + '/' + specL.max + '. No wait.</p><button class="gold-btn" data-act="talent" data-id="' + selected + '"' + (rank >= specL.max || save.talentPoints < 1 ? ' disabled' : '') + '>' + (rank >= specL.max ? 'Mastered' : 'Learn · 1 point') + '</button>';
    }
    return '<section><div class="web"><svg class="links" viewBox="0 0 100 100" preserveAspectRatio="none">' + lines + '</svg>' + bubbles + '</div><div class="panel"><p class="muted">Level ' + lv.lvl + ' · ' + save.talentPoints + ' talent point' + (save.talentPoints === 1 ? '' : 's') + '. Gold trains the roots. Points light the stars. Instant.</p>' + detail + '</div></section>';
  }
  function viewChests() {
    const save = State.save;
    const cards = Object.keys(CHESTS).map((kind) => {
      const spec = CHESTS[kind];
      const count = save.chests[kind] || 0;
      return '<article class="panel"><h3>' + spec.name + '</h3><p class="muted">You hold ' + count + '. Open with ' + spec.keys + ' key' + (spec.keys > 1 ? 's' : '') + ' or ' + spec.gems + ' gems you earned.</p>' +
        '<button class="gold-btn" data-act="open-chest" data-kind="' + kind + '" data-pay="key"' + (count && save.keys >= spec.keys ? '' : ' disabled') + '>Use ' + spec.keys + ' key' + (spec.keys > 1 ? 's' : '') + '</button>' +
        '<button class="ghost" data-act="open-chest" data-kind="' + kind + '" data-pay="gem"' + (count && save.gems >= spec.gems ? '' : ' disabled') + '>Use ' + spec.gems + ' gems</button></article>';
    }).join('');
    return '<section><div class="panel" style="text-align:center"><h2>Chest hollow</h2><div style="width:120px;margin:8px auto">' + chestArt(false) + '</div><p class="muted">Keys ' + save.keys + ' · Gems ' + save.gems + ' · Eggs ' + save.eggs + '. Earned on the road. Never sold for real money.</p></div>' + cards + '</section>';
  }
  function boardGeom(count) {
    const way = [[188, 448], [78, 400], [44, 312], [86, 214], [168, 142], [262, 124], [322, 196], [318, 292], [246, 358], [150, 348], [112, 268], [168, 214], [236, 196], [286, 248]];
    const seg = [];
    let total = 0;
    for (let i = 1; i < way.length; i += 1) {
      const len = Math.hypot(way[i][0] - way[i - 1][0], way[i][1] - way[i - 1][1]);
      seg.push(len);
      total += len;
    }
    const positions = [];
    for (let n = 0; n < count; n += 1) {
      let dist = count === 1 ? 0 : (n / (count - 1)) * total;
      let acc = 0;
      let x = way[0][0];
      let y = way[0][1];
      for (let s = 0; s < seg.length; s += 1) {
        if (acc + seg[s] >= dist || s === seg.length - 1) {
          const t = seg[s] ? Math.min(1, Math.max(0, (dist - acc) / seg[s])) : 0;
          x = way[s][0] + (way[s + 1][0] - way[s][0]) * t;
          y = way[s][1] + (way[s + 1][1] - way[s][1]) * t;
          break;
        }
        acc += seg[s];
      }
      positions.push({ x: x - 36, y: y - 34, w: 72, h: 68, cx: x, cy: y });
    }
    return { positions, width: 366, height: 530 };
  }
  function tileArt(tile) {
    const known = { start: 1, fight: 1, elite: 1, buff: 1, hazard: 1, shop: 1, mini: 1, boss: 1 };
    const type = tile && known[tile.type] ? tile.type : 'fight';
    return '<img src="art/tile-' + type + '.png" alt="" draggable="false">';
  }
  function tileArtUnused(tile) {
    const tops = { start: '#f2c56a', fight: '#d7ecb0', elite: '#f0b44a', buff: '#8fd4ff', hazard: '#d9a6f2', shop: '#f0a05a', mini: '#7dce8a', boss: '#ef6a6a' };
    const fill = tops[tile.type] || '#efe8dc';
    const shade = { start: '#d9a64a', fight: '#b7d48a', elite: '#d09030', buff: '#5eb0e0', hazard: '#b07ad0', shop: '#d08040', mini: '#5aaa68', boss: '#c84848' }[tile.type] || '#d9c8a4';
    const props = {
      start: '<rect x="22" y="14" width="20" height="5" rx="1" fill="#8a5a32" stroke="#24160c"/><path d="M32 6c3 5 7 6 5 11-5-1-9 1-5-11z" fill="#ff7a3a" stroke="#24160c" stroke-width="1.2"/><path d="M28 9c2 3 4 3 3 6-3 0-5 1-3-6z" fill="#ffe56a"/>',
      fight: '<ellipse cx="32" cy="16" rx="9" ry="6" fill="#8be08a" stroke="#24160c" stroke-width="1.4"/><ellipse cx="32" cy="15" rx="5" ry="3" fill="#d8ffd0"/><circle cx="29" cy="15" r="1.2" fill="#16321a"/><circle cx="35" cy="15" r="1.2" fill="#16321a"/>',
      elite: '<path d="M22 18l4-8 4 5 4-5 4 8z" fill="#ffd04a" stroke="#24160c" stroke-width="1.3"/><rect x="24" y="17" width="16" height="4" fill="#e23b4a" stroke="#24160c"/>',
      buff: '<rect x="29" y="12" width="6" height="9" rx="1" fill="#c9843a" stroke="#24160c"/><path d="M32 5c2 3 4 3 3 6-3 0-5 1-3-6z" fill="#ffe56a" stroke="#24160c"/><circle cx="32" cy="8" r="3" fill="#fff6b0" opacity=".8"/>',
      hazard: '<path d="M26 18c2-8 6-8 4 0" fill="none" stroke="#5a2d86" stroke-width="2"/><path d="M32 18c2-10 6-8 3 0" fill="none" stroke="#7a3aad" stroke-width="2"/><path d="M38 18c2-7 5-6 3 0" fill="none" stroke="#5a2d86" stroke-width="2"/><circle cx="30" cy="9" r="1.4" fill="#c9f27a"/><circle cx="36" cy="7" r="1.4" fill="#c9f27a"/>',
      shop: '<path d="M22 16h20l-2 6H24z" fill="#ff5d73" stroke="#24160c"/><rect x="24" y="16" width="16" height="6" fill="#c9843a" stroke="#24160c"/><circle cx="27" cy="23" r="1.5" fill="#24160c"/><circle cx="37" cy="23" r="1.5" fill="#24160c"/>',
      mini: '<path d="M20 18 L32 8 L44 18" fill="#ff5d73" stroke="#24160c"/><path d="M26 18 L32 12 L38 18" fill="#fff" stroke="#24160c"/><rect x="28" y="18" width="8" height="5" fill="#ffe56a" stroke="#24160c"/>',
      boss: '<path d="M22 20 V11 H42 V20" fill="#5a3038" stroke="#24160c" stroke-width="1.6"/><path d="M30 20 V13 H34 V20" fill="#24160c"/><path d="M20 11h6l-3-4z" fill="#e23b4a" stroke="#24160c"/><path d="M38 11h6l-3-4z" fill="#e23b4a" stroke="#24160c"/>',
    };
    return '<svg viewBox="0 0 64 50" aria-hidden="true"><polygon points="32,2 62,16 32,30 2,16" fill="' + fill + '" stroke="#24160c" stroke-width="2.2"/><polygon points="32,8 52,16 32,24 12,16" fill="' + shade + '" opacity=".45"/><polygon points="2,16 32,30 32,42 2,28" fill="#b08a66" stroke="#24160c" stroke-width="2.2"/><polygon points="62,16 32,30 32,42 62,28" fill="#8a6848" stroke="#24160c" stroke-width="2.2"/>' + (props[tile.type] || props.fight) + '</svg>';
  }
  function wagonSvg() {
    return '<svg viewBox="0 0 92 70" aria-hidden="true"><rect x="18" y="28" width="58" height="22" rx="3" fill="#c9843a" stroke="#24160c" stroke-width="2.4"/><path d="M16 30 H78 L70 16 H26 Z" fill="#ff5d73" stroke="#24160c" stroke-width="2.4"/><path d="M30 30 L34 16 H46 L42 30" fill="#fff" stroke="#24160c"/><rect x="46" y="34" width="8" height="8" fill="#7ad0ff" stroke="#24160c"/><rect x="56" y="34" width="8" height="8" fill="#ffe56a" stroke="#24160c"/><circle cx="30" cy="52" r="7" fill="#5a4030" stroke="#24160c" stroke-width="2"/><circle cx="64" cy="52" r="7" fill="#5a4030" stroke="#24160c" stroke-width="2"/><circle cx="30" cy="52" r="3" fill="#e7c48a"/><circle cx="64" cy="52" r="3" fill="#e7c48a"/></svg>';
  }
  function chestSvg() {
    return '<svg viewBox="0 0 70 54" aria-hidden="true"><rect x="8" y="22" width="54" height="26" rx="4" fill="#c9843a" stroke="#24160c" stroke-width="2.4"/><path d="M8 26 H62 V18 Q35 4 8 18 Z" fill="#f0c14a" stroke="#24160c" stroke-width="2.4"/><rect x="30" y="24" width="10" height="10" rx="2" fill="#ffe56a" stroke="#24160c"/><circle cx="35" cy="29" r="1.6" fill="#24160c"/></svg>';
  }
  function isoDie(face) {
    const n = face >= 1 && face <= 6 ? face : 1;
    return '<img class="die-face" src="art/die-' + n + '.png" alt="" width="104" height="104" draggable="false">';
  }
  function tileLabel(tile) {
    if (tile.type === 'start') return 'Camp';
    if (tile.type === 'mini') return (MINI_NAME[tile.game] || 'Bonus').split(' ')[0];
    if (tile.type === 'buff') return 'Shrine';
    if (tile.type === 'hazard') return 'Snag';
    if (tile.type === 'shop') return 'Peddler';
    if (tile.type === 'boss') return 'Boss';
    if (tile.type === 'elite') return 'Elite';
    return 'Fight';
  }
  function viewBoard() {
    const run = State.run;
    const prof = profile(State.save, run);
    const geom = boardGeom(run.tiles.length);
    const path = geom.positions.map((pos, index) => (index ? 'L' : 'M') + pos.cx + ' ' + pos.cy).join(' ');
    const tiles = run.tiles.map((tile, index) => {
      const pos = geom.positions[index];
      const cls = 'tile ' + tile.type + (tile.resolved ? ' done' : '') + (index === run.index ? ' current' : '') + (index > run.index ? ' ahead' : '');
      return '<div class="' + cls + '" style="left:' + pos.x + 'px;top:' + pos.y + 'px;width:' + pos.w + 'px;height:' + pos.h + 'px">' + tileArt(tile) + '</div>';
    }).join('');
    const token = geom.positions[run.index];
    const tile = currentTile();
    const hpPct = Math.max(0, Math.min(100, run.hp / prof.maxHp * 100));
    const blurb = !tile ? '' : tile.type === 'start' ? 'Campfire. Roll when you are ready.' : hiddenName(tile);
    return '<section class="run-hud"><div class="hud-row"><span>' + esc(roadName(run.stage)) + '</span><span>HP ' + Math.round(run.hp) + '/' + prof.maxHp + '</span></div>' +
      '<div class="bar" role="progressbar" aria-label="Health" aria-valuenow="' + Math.round(run.hp) + '" aria-valuemax="' + prof.maxHp + '"><div style="width:' + hpPct + '%"></div></div>' +
      '<p class="now-line">' + esc(blurb) + (run.stepsLeft ? ' · ' + run.stepsLeft + ' steps left' : '') + '</p>' +
      '<div class="world painted" style="width:' + geom.width + 'px;height:' + geom.height + 'px">' +
      '<img class="world-bg" src="art/board.jpg" alt="">' +
      '<img class="oak l" src="art/tree.png" alt=""><img class="oak r" src="art/tree.png" alt="">' +
      '<img class="wagon" src="art/wagon.png" alt=""><img class="treasure" src="art/chest.png" alt="">' +
      tiles + '<div class="token" id="token" style="left:' + token.cx + 'px;top:' + token.cy + 'px">' + sprite(run.heroId) + '</div></div></section>';
  }
  function hiddenName(tile) {
    if (tile.foe) return tile.foe.name + ' waits on this stone.';
    if (tile.type === 'shop') return 'A cart of wares.';
    if (tile.type === 'buff') return 'A lantern shrine.';
    if (tile.type === 'hazard') return 'Briars across the path.';
    if (tile.type === 'mini') return (MINI_NAME[tile.game] || 'A bonus tent') + '. Free to play.';
    if (tile.type === 'boss') return 'The gate at the end.';
    return 'The path is quiet.';
  }
  function viewBattle() {
    const battle = State.battle;
    if (!battle) return '';
    const hero = battle.hero;
    const foe = battle.foe;
    const run = State.run;
    const pals = [];
    if (run && run.petId && hero.petMul) pals.push('<div class="actor pet" id="actor-pet">' + sprite(run.petId) + '</div>');
    (State.save.sentinelDeploy || []).forEach((id, index) => {
      if (id && sentinelReady(id)) pals.push('<div class="actor pet" style="left:' + (70 + index * 36) + 'px;width:48px;height:56px">' + sprite(id === 'pebble' ? 'cobble' : id === 'amber' ? 'emberkit' : 'nib') + '</div>');
    });
    const boons = (run && run.boons ? run.boons : []).slice(0, 4).map((boon) => '<div class="skill ' + boon.rarity + '" title="' + esc(boon.name) + '">' + boonIcon(boon) + '</div>').join('');
    return '<section class="battle"><div class="arena' + (foe.boss ? ' boss' : '') + '">' +
      '<div class="plate hero"><div class="who">' + esc(hero.name) + '</div><div class="bar"><div id="hp-hero" style="width:' + (hero.hp / hero.maxHp * 100) + '%"></div></div><div class="hp-num" id="hp-hero-num">' + Math.max(0, Math.ceil(hero.hp)) + '/' + hero.maxHp + '</div></div>' +
      '<div class="plate foe"><div class="who">' + esc(foe.name) + '</div><div class="bar"><div id="hp-foe" style="width:' + (foe.hp / foe.maxHp * 100) + '%"></div></div><div class="hp-num" id="hp-foe-num">' + Math.max(0, Math.ceil(foe.hp)) + '/' + foe.maxHp + '</div></div>' +
      '<div class="fx-slash" id="fx-slash"></div><div class="fx-hit" id="fx-hit"></div>' +
      '<div class="actor hero" id="actor-hero">' + sprite(hero.heroId) + '</div>' + pals.join('') +
      '<div class="actor foe" id="actor-foe">' + sprite(foe.kind) + '</div></div>' +
      '<p class="now-line" id="pass-num">Pass ' + (battle.swings || 1) + '</p>' +
      '<div class="ult-wrap"><div class="who"><span>' + esc(hero.ultName) + '</span><span id="ult-num">' + Math.floor(hero.ult) + '%</span></div><div class="bar ult"><div id="ult-bar" style="width:' + hero.ult + '%"></div></div></div>' +
      '<div class="skills"><div class="skill">' + ICONS.sword + '</div><div class="skill">' + ICONS.flame + '<i id="ult-fill" style="width:' + hero.ult + '%"></i></div>' + boons + '</div>' +
      '<p class="log" id="battle-log">' + esc(battle.log) + '</p><button class="flee" data-act="flee">Flee</button></section>';
  }
  function updateBattleDom() {
    const battle = State.battle;
    if (!battle) return;
    const heroBar = document.getElementById('hp-hero');
    if (!heroBar) return;
    const hero = battle.hero;
    const foe = battle.foe;
    heroBar.style.width = Math.max(0, hero.hp / hero.maxHp * 100) + '%';
    document.getElementById('hp-foe').style.width = Math.max(0, foe.hp / foe.maxHp * 100) + '%';
    document.getElementById('hp-hero-num').textContent = Math.max(0, Math.ceil(hero.hp)) + '/' + hero.maxHp + (hero.shield ? ' · shield ' + Math.ceil(hero.shield) : '');
    document.getElementById('hp-foe-num').textContent = Math.max(0, Math.ceil(foe.hp)) + '/' + foe.maxHp;
    document.getElementById('ult-bar').style.width = hero.ult + '%';
    document.getElementById('ult-num').textContent = Math.floor(hero.ult) + '%';
    const fill = document.getElementById('ult-fill');
    if (fill) fill.style.width = hero.ult + '%';
    const pass = document.getElementById('pass-num');
    if (pass) pass.textContent = 'Pass ' + (battle.swings || 1);
    document.getElementById('battle-log').textContent = battle.log;
  }
  function viewCards() {
    const run = State.run;
    if (!run || !run.pendingCards) return '<p class="muted">The road is quiet.</p>';
    const cards = run.pendingCards.map((card, index) =>
      '<button class="boon ' + card.rarity + (State.pick === index ? ' picked' : '') + '" data-act="pick-card" data-i="' + index + '"><span class="skill-ico">' + skillBadge(card) + '</span><span><span class="pill">' + card.rarity + '</span><h3>' + esc(card.name) + '</h3><p class="muted">' + esc(card.desc) + '</p></span></button>'
    ).join('');
    const reroll = run.freeReroll ? 'Reroll · free' : 'Reroll · 10 gold';
    return '<section class="pick-scene"><img class="pick-bg" src="art/board.jpg" alt=""><div class="pick"><div class="banner-flag">POWER UP!</div><p class="lead">Pick one skill to learn.</p>' +
      (run.banner ? '<p class="banner">' + esc(run.banner) + '</p>' : '') +
      '<div class="boons">' + cards + '</div><button class="ghost reroll" data-act="reroll-cards">' + reroll + '</button></div></section>';
  }
  function viewEnd() {
    const result = State.result || { won: false, lines: [], unlocks: [], hero: 'Fenn', foe: 'the road', road: '', found: 0, stage: 1 };
    if (result.won) {
      return '<section class="end-card"><p class="kicker">Stage ' + result.stage + ' clear</p><h1>' + esc(result.boss) + ' yields</h1>' + sprite('dragon') +
        '<p>' + esc(result.road) + ' is behind you. Stage ' + (result.stage + 1) + ' is unlocked.</p><ul>' +
        (result.lines || []).map((line) => '<li>' + esc(line) + '</li>').join('') +
        (result.unlocks || []).map((line) => '<li>' + esc(line) + '</li>').join('') + '</ul></section>';
    }
    const hint = State.save.gold >= trainCost(State.save.training.atk || 0) ? 'The training yard could use a visit.' : 'Gold already in camp stays with you.';
    return '<section class="end-card"><p class="kicker">' + (result.retired ? 'Retired' : 'Defeated') + '</p><h1>' + esc(result.hero) + ' heads home</h1>' + sprite(State.save.hero) +
      '<p>' + (result.retired ? 'You leave the road on purpose.' : esc(result.foe) + ' wins the exchange.') + ' ' + hint + '</p>' +
      '<ul><li>Picked up this road: ' + (result.found || 0) + ' gold</li><li>Gold in camp: ' + State.save.gold + '</li>' +
      (result.unlocks || []).map((line) => '<li>' + esc(line) + '</li>').join('') + '</ul></section>';
  }
  function confetti() {
    const frame = document.getElementById('frame');
    if (!frame) return;
    const colors = ['#f0c14a', '#ff8b6a', '#7ddea0', '#e7a6ff', '#fff'];
    for (let i = 0; i < 28; i += 1) {
      const bit = document.createElement('i');
      bit.className = 'confetti';
      bit.style.left = Math.random() * 100 + '%';
      bit.style.background = colors[i % colors.length];
      bit.style.animationDelay = (Math.random() * 0.3) + 's';
      frame.appendChild(bit);
      setTimeout(() => bit.remove(), 1600);
    }
  }

  function sheet(inner, title) {
    return '<div class="sheet" role="document"><div class="grab"></div>' + (title ? '<h2>' + esc(title) + '</h2>' : '') + inner + '</div>';
  }
  function renderOverlay() {
    const el = document.getElementById('overlay');
    if (!State.overlay) {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }
    el.hidden = false;
    const overlay = State.overlay;
    let inner = '';
    if (overlay.type === 'help') inner = helpHTML();
    else if (overlay.type === 'daily') inner = dailyHTML();
    else if (overlay.type === 'buff') inner = buffHTML();
    else if (overlay.type === 'hazard') inner = hazardHTML();
    else if (overlay.type === 'shop') inner = shopHTML();
    else if (overlay.type === 'mini') inner = miniHTML();
    else if (overlay.type === 'item') inner = itemHTML(overlay.id);
    else if (overlay.type === 'confirm') inner = confirmHTML();
    else if (overlay.type === 'loot') inner = lootHTML();
    else if (overlay.type === 'fuse') inner = fuseHTML();
    else if (overlay.type === 'hatch') inner = hatchHTML();
    el.innerHTML = sheet(inner);
  }
  function helpHTML() {
    return '<div class="help"><h2>How to play</h2>' +
      '<p>Roll the big die. Fenn walks each stone. Fights play themselves. After a win, learn one skill.</p>' +
      '<p>Shrines, snags, Nim’s cart, and free carnival games sit on the path. A boss waits at the end.</p>' +
      '<p>Gold stays if you fall. Spend it in camp. No ads, no energy, nothing to buy with real money.</p>' +
      '<button class="gold-btn" data-act="close">Let\'s roll</button></div>';
  }
  function predictedStreak() {
    const daily = State.save.daily;
    if (daily.last === todayKey()) return daily.streak || 1;
    if (daily.last === yesterdayKey()) return (daily.streak || 0) + 1;
    return 1;
  }
  function dailyHTML() {
    const streak = predictedStreak();
    const index = (streak - 1) % DAILY.length;
    const reward = DAILY[index];
    const track = DAILY.map((day, i) => '<i class="' + (i === index ? 'on' : '') + '">' + (i + 1) + '</i>').join('');
    return '<h2>Daily pile</h2><p class="muted">Day ' + streak + ' of the streak. Miss a day and it starts over, still free.</p><div class="track">' + track + '</div><p>' + esc(reward.label) + '</p><button class="gold-btn" data-act="claim">Claim</button><button class="text-btn" data-act="close">Later</button>';
  }
  function buffHTML() {
    const tile = currentTile();
    const offers = tile && tile.offers ? tile.offers : [];
    return '<h2>Wayside shrine</h2><p class="muted">Choose one blessing for the rest of this road.</p>' +
      offers.map((offer, index) => '<button class="choice" data-act="buff" data-i="' + index + '"><b>' + esc(offer.name) + '</b><span>' + esc(offer.desc) + '</span></button>').join('');
  }
  function hazardOptions(kind) {
    const stage = State.run ? State.run.stage : 1;
    const pay = 12 + stage * 3;
    if (kind === 'toll') {
      return [
        { label: 'Pay ' + (pay + 6) + ' gold', detail: 'The briars open if you feed them.', gold: pay + 6, result: 'You pay the toll.' },
        { label: 'Lose 14 HP', detail: 'Push through the thorns.', dmg: 14, result: 'The thorns take their due.' },
        { label: '−3 attack this road', detail: 'Drop your guard and slip by.', mods: { atk: -3 }, result: 'Your strikes feel duller.' },
      ];
    }
    if (kind === 'rust') {
      return [
        { label: 'Pay ' + pay + ' gold', detail: 'Wipe the curse off.', gold: pay, result: 'The rust flakes away.' },
        { label: '−2 defense this road', detail: 'Let it chew a buckle.', mods: { def: -2 }, result: 'A strap rusts through.' },
        { label: 'Next fight starts wounded', detail: 'Breathe it in and keep walking.', wound: 0.22, result: 'Your lungs sting.' },
      ];
    }
    if (kind === 'pack') {
      return [
        { label: '−8 speed this road', detail: 'Haul the extra weight.', mods: { spd: -8 }, result: 'Your steps get heavy.' },
        { label: 'Lose 12 HP', detail: 'Shrug it off the hard way.', dmg: 12, result: 'You scrape free.' },
        { label: '−4% crit this road', detail: 'Something lucky falls out.', mods: { crit: -0.04 }, result: 'A charm cracks.' },
      ];
    }
    return [
      { label: 'Next roll is only 1–3', detail: 'Accept a stubborn die.', rollCap: 3, result: 'The die feels weighted.' },
      { label: 'Lose 12 HP', detail: 'Smack the curse out.', dmg: 12, result: 'You sting, but the die is honest.' },
      { label: 'Pay ' + pay + ' gold', detail: 'Hire a lucky whisper.', gold: pay, result: 'The whisper steadies the die.' },
    ];
  }
  function hazardHTML() {
    const tile = currentTile();
    const options = hazardOptions(tile ? tile.kind : 'die');
    const titles = { toll: 'Briar toll', rust: 'Rust curse', pack: 'Heavy pack', die: 'Stubborn die' };
    return '<h2>' + esc(titles[tile && tile.kind] || 'A snag') + '</h2><p class="muted">Every option is a setback. Pick the one you can live with.</p>' +
      options.map((option, index) => {
        const poor = option.gold && State.save.gold < option.gold;
        return '<button class="choice" data-act="hazard" data-i="' + index + '"' + (poor ? ' disabled' : '') + '><b>' + esc(option.label) + '</b><span>' + esc(option.detail) + (poor ? ' · not enough gold' : '') + '</span></button>';
      }).join('');
  }
  function shopHTML() {
    const tile = currentTile();
    const stock = tile && tile.stock ? tile.stock : [];
    const rows = stock.map((item, index) => {
      const owned = item.kind === 'relic' && State.run && State.run.relics.indexOf(item.relic) >= 0;
      const poor = State.save.gold < item.cost;
      return '<button class="choice" data-act="buy" data-i="' + index + '"' + (item.sold || owned || poor ? ' disabled' : '') + '><b>' + esc(item.label) + ' · ' + item.cost + 'g</b><span>' + esc(item.desc) + (item.sold ? ' · sold' : owned ? ' · already carried' : poor ? ' · need more gold' : '') + '</span></button>';
    }).join('');
    return '<div class="merchant-row"><div>' + sprite('bramble') + '</div><div class="bubble"><b>Nim the otter</b><p class="muted">Gold from the road only. Nothing here is for sale with real money.</p></div></div>' + rows + '<button class="ghost" data-act="reroll-shop">Reroll wares · 8 gold</button><button class="gold-btn" data-act="resolve">Exit</button>';
  }
  function miniHTML() {
    const tile = currentTile();
    if (!tile) return '';
    if (tile.game === 'wheel') return wheelHTML(tile);
    if (tile.game === 'hilo') return hiloHTML(tile);
    if (tile.game === 'chests') return chestsHTML(tile);
    if (tile.game === 'cards') return cardsMiniHTML(tile);
    return slotsHTML(tile);
  }
  function wheelHTML(tile) {
    const play = tile.play || {};
    const rot = play.done ? wheelRotation(play.index || 0) : 0;
    const labels = WHEEL_LABELS.map((label, index) => '<div class="wlab" style="transform:rotate(' + (index * 45 + 22.5) + 'deg)"><span>' + label + '</span></div>').join('');
    return '<h2>Lucky wheel</h2><p class="muted">One free spin. It always gives something.</p><div class="wheel-wrap"><div class="pointer"></div><div class="wheel" id="wheel" style="transform:rotate(' + rot + 'deg)">' + labels + '<div class="wheel-hub"></div></div></div>' +
      (play.done ? '<p class="banner">' + esc(play.text) + '</p><button class="gold-btn" data-act="resolve">Continue</button>' : '<button class="gold-btn" id="spin-btn" data-act="spin">Spin</button>');
  }
  function wheelRotation(index) { return 360 * 6 + (360 - (index * 45 + 22.5)); }
  function hiloHTML(tile) {
    const play = tile.play || { face: 1, streak: 0, bank: 0, text: 'Higher or lower?' };
    const lowerOff = play.face <= 1 || play.done;
    const higherOff = play.face >= 6 || play.done;
    return '<h2>Higher or lower</h2><p class="muted">No stake. Call the next die. A tie lets you guess again. Cash out whenever the bank looks tasty.</p>' +
      '<div class="die big-die" aria-label="Die showing ' + play.face + '">' + diePips(play.face) + '</div>' +
      '<p>Streak ' + (play.streak || 0) + ' · Bank ' + (play.bank || 0) + ' gold</p><p class="muted">' + esc(play.text || '') + '</p>' +
      (play.done ? '<button class="gold-btn" data-act="resolve">Continue</button>' :
        '<div class="hilo-actions"><button class="choice" data-act="hilo" data-dir="lower"' + (lowerOff ? ' disabled' : '') + '><b>Lower</b></button><button class="choice" data-act="hilo" data-dir="higher"' + (higherOff ? ' disabled' : '') + '><b>Higher</b></button></div><button class="gold-btn" data-act="cashout"' + (play.bank ? '' : ' disabled') + '>Cash out ' + (play.bank || 0) + '</button>');
  }
  function chestsHTML(tile) {
    const play = tile.play || { options: [], picked: null };
    const buttons = (play.options || []).map((option, index) => {
      const open = play.picked != null;
      const picked = play.picked === index;
      return '<button class="chest-btn' + (open ? ' open' : '') + (picked ? ' picked' : '') + '" data-act="pick-chest" data-i="' + index + '"' + (open ? ' disabled' : '') + '>' + chestArt(open) + '<span>' + esc(open ? option.reveal : 'Chest') + '</span></button>';
    }).join('');
    return '<h2>Three chests</h2><p class="muted">Pick one. The others open so you can groan.</p><div class="chests">' + buttons + '</div>' +
      (play.done ? '<p class="banner">' + esc(play.text) + '</p><button class="gold-btn" data-act="resolve">Continue</button>' : '');
  }
  function cardsMiniHTML(tile) {
    const play = tile.play || { cards: [], pot: [], text: '' };
    const cards = (play.cards || []).map((card, index) =>
      '<button class="flip' + (card.up ? ' show' : '') + '" data-act="flip" data-i="' + index + '"' + (play.done || card.up ? ' disabled' : '') + '><div class="flip-inner"><div class="face back">?</div><div class="face front">' + esc(card.label) + '</div></div></button>'
    ).join('');
    return '<h2>Whisker cards</h2><p class="muted">Flip until you stop. A bandit scatters the pot, but leaves a little pity gold.</p><div class="cards-row">' + cards + '</div><p class="muted">' + esc(play.text || 'The pot is empty.') + '</p>' +
      (play.done ? '<button class="gold-btn" data-act="resolve">Continue</button>' : '<button class="gold-btn" data-act="stop-cards">Stop and take</button>');
  }
  function slotsHTML(tile) {
    const play = tile.play || {};
    const boxes = [0, 1, 2].map((i) => {
      const label = play.done ? SLOT_LABELS[play.reels[i]] : '—';
      return '<div class="reel"><b id="slot-' + i + '">' + esc(label) + '</b></div>';
    }).join('');
    return '<h2>Dice slots</h2><p class="muted">One free pull. Matches pay. A miss still tips you.</p><div class="reels">' + boxes + '</div>' +
      (play.done ? '<p class="banner">' + esc(play.text) + '</p><button class="gold-btn" data-act="resolve">Continue</button>' : '<button class="gold-btn" data-act="slot-roll">Pull</button>');
  }
  function itemHTML(id) {
    const gear = gearById(id);
    if (!gear) return '<h2>Empty slot</h2><p class="muted">Win a fight or open a chest.</p><button class="text-btn" data-act="close">Close</button>';
    const equipped = State.save.equipped[gear.slot] === gear.id;
    const marked = State.fuse.indexOf(gear.id) >= 0;
    return '<p class="pill tag-' + gear.rarity + '">' + gear.rarity + ' · ' + gear.slot + '</p><h2>' + esc(gear.name) + '</h2><p>' + esc(describeStats(gear)) + '</p><p class="muted">' + esc(SET_INFO[gear.set].name) + ' set · found at stage ' + gear.ilevel + '</p>' +
      '<button class="gold-btn" data-act="equip" data-id="' + gear.id + '">' + (equipped ? 'Unequip' : 'Equip') + '</button>' +
      '<button class="ghost" data-act="fuse-add" data-id="' + gear.id + '">' + (marked ? 'Remove from fuse' : 'Add to fuse') + '</button>' +
      '<button class="text-btn" data-act="ask-salvage" data-id="' + gear.id + '">Break down for ' + SALVAGE_GOLD[gear.rarity] + ' gold</button>';
  }
  function confirmHTML() {
    const overlay = State.overlay;
    return '<h2>Are you sure?</h2><p>' + esc(overlay.text || '') + '</p><button class="gold-btn" data-act="' + esc(overlay.act) + '" data-id="' + esc(overlay.id || '') + '">Yes</button><button class="text-btn" data-act="close">Cancel</button>';
  }
  function lootHTML() {
    const overlay = State.overlay;
    const lines = (overlay.lines || []).map((line) => '<li>' + esc(line) + '</li>').join('');
    return '<h2>' + esc(overlay.title || 'Reward') + '</h2><ul class="end-card" style="text-align:left">' + lines + '</ul><button class="gold-btn" data-act="close">Nice</button>';
  }
  function fuseHTML() {
    const gear = State.overlay.gear;
    return '<h2>Fused</h2><p class="banner">' + esc(gear.name) + '</p><p>' + esc(describeStats(gear)) + '</p><p class="muted">' + esc(gear.rarity) + ' ' + esc(SET_INFO[gear.set].name) + '</p><button class="gold-btn" data-act="close">Pocket it</button>';
  }
  function hatchHTML() {
    const pet = PETS[State.overlay.id];
    return '<h2>The egg cracks</h2><div class="portrait" style="margin:8px auto">' + sprite(State.overlay.id) + '</div><p>' + esc(pet.name) + ' looks up.</p><p class="muted">' + esc(pet.blurb) + '</p><button class="gold-btn" data-act="close">Welcome</button>';
  }

  function initMini(tile) {
    if (tile.play) return;
    if (tile.game === 'wheel') tile.play = { done: false, index: 0, text: '' };
    else if (tile.game === 'hilo') tile.play = { face: 1 + rngInt(6), streak: 0, bank: 0, done: false, text: 'Higher or lower?' };
    else if (tile.game === 'chests') {
      const options = [
        { kind: 'gold', n: 30, reveal: 'A fat purse' },
        { kind: 'heal', n: 0.3, reveal: 'A warm salve' },
        { kind: 'mixed', reveal: 'A trick latch' },
      ];
      shuffleIn(options, State.rng);
      if (State.run) State.run.rngState = State.rng.state();
      tile.play = { options, picked: null, done: false, text: '' };
    } else if (tile.game === 'cards') {
      const cards = [
        { id: 'gold', label: '18 gold', kind: 'gold', n: 18, up: false },
        { id: 'gems', label: '4 gems', kind: 'gems', n: 4, up: false },
        { id: 'heal', label: 'Heal', kind: 'heal', n: 0.28, up: false },
        { id: 'atk', label: '+2 ATK', kind: 'atk', n: 2, up: false },
        { id: 'bandit', label: 'Bandit', kind: 'bandit', up: false },
      ];
      shuffleIn(cards, State.rng);
      if (State.run) State.run.rngState = State.rng.state();
      tile.play = { cards, pot: [], done: false, text: 'Flip a card.' };
    } else tile.play = { done: false, reels: [0, 0, 0], text: '' };
  }
  function openEncounter() {
    const tile = currentTile();
    if (!tile || tile.resolved || State.busy) return;
    if (tile.type === 'fight' || tile.type === 'elite' || tile.type === 'boss') {
      startBattle(tile);
      return;
    }
    if (tile.type === 'mini') initMini(tile);
    const type = tile.type === 'mini' ? 'mini' : tile.type;
    if (type === 'buff' || type === 'hazard' || type === 'shop' || type === 'mini') {
      State.overlay = { type, mandatory: true };
      saveGame();
      render();
    }
  }
  function resolveTile() {
    const tile = currentTile();
    if (tile) tile.resolved = true;
    State.overlay = null;
    State.screen = 'board';
    saveGame();
    render();
    if (State.run && State.run.stepsLeft > 0 && State.run.index < State.run.tiles.length - 1) advanceSteps();
  }
  function applyWheel(index) {
    if (index === 0) return '+' + gainGold(payoutGold(15)) + ' gold';
    if (index === 1) return healPct(0.3);
    if (index === 2) return '+' + gainGold(payoutGold(28)) + ' gold';
    if (index === 3) { addMods({ atk: 2 }); return '+2 attack this road'; }
    if (index === 4) { State.save.keys += 1; saveGame(); return '+1 key'; }
    if (index === 5) { const n = payoutGem(5); State.save.gems += n; saveGame(); return '+' + n + ' gems'; }
    if (index === 6) { State.save.eggs += 1; saveGame(); return 'A warm egg'; }
    return grantRandomCompanion();
  }
  async function spinWheel() {
    const tile = currentTile();
    if (State.busy || !tile || !tile.play || tile.play.done) return;
    State.busy = true;
    const index = rngInt(WHEEL_LABELS.length);
    tile.play.index = index;
    tile.play.text = applyWheel(index);
    tile.play.done = true;
    saveGame();
    const wheel = document.getElementById('wheel');
    if (wheel && !reduceMotion()) {
      wheel.style.transition = 'transform 2.35s cubic-bezier(.15,.85,.15,1)';
      void wheel.offsetWidth;
      wheel.style.transform = 'rotate(' + wheelRotation(index) + 'deg)';
      blip(440, 0.08, 'square', 0.03);
      await wait(2450);
    }
    State.busy = false;
    render();
  }
  function guessHilo(dir) {
    const play = currentTile().play;
    if (!play || play.done) return;
    if ((play.face <= 1 && dir === 'lower') || (play.face >= 6 && dir === 'higher')) return;
    const next = 1 + rngInt(6);
    if (next === play.face) {
      play.text = 'It ties on ' + next + '. Guess again.';
    } else if ((dir === 'higher' && next > play.face) || (dir === 'lower' && next < play.face)) {
      play.streak += 1;
      play.bank += payoutGold(6 + play.streak * 5);
      play.face = next;
      play.text = 'Yes — ' + next + '. Bank ' + play.bank + ' gold.';
      blip(620, 0.08, 'triangle', 0.04);
      if (play.streak >= 5) {
        cashHilo();
        return;
      }
    } else {
      play.face = next;
      play.bank = 0;
      play.done = true;
      const pity = gainGold(payoutGold(5));
      play.text = 'It is ' + next + '. The bank slips. Pity +' + pity + ' gold.';
    }
    saveGame();
    render();
  }
  function cashHilo() {
    const play = currentTile().play;
    if (!play || play.done) return;
    if (!play.bank) { toast('Win a guess first.'); return; }
    const n = gainGold(play.bank);
    play.bank = n;
    play.done = true;
    play.text = 'You pocket ' + n + ' gold.';
    saveGame();
    render();
  }
  function pickChest(index) {
    const play = currentTile().play;
    if (!play || play.picked != null) return;
    play.picked = index;
    const option = play.options[index];
    if (option.kind === 'gold') play.text = '+' + gainGold(payoutGold(option.n)) + ' gold';
    else if (option.kind === 'heal') play.text = healPct(option.n);
    else {
      State.run.hp = Math.max(1, State.run.hp - 8);
      play.text = 'It nips for 8 HP, then coughs up +' + gainGold(payoutGold(10)) + ' gold.';
    }
    play.done = true;
    saveGame();
    render();
  }
  function applyCardReward(card) {
    if (card.kind === 'gold') return '+' + gainGold(payoutGold(card.n)) + ' gold';
    if (card.kind === 'gems') {
      const n = payoutGem(card.n);
      State.save.gems += n;
      saveGame();
      return '+' + n + ' gems';
    }
    if (card.kind === 'heal') return healPct(card.n);
    addMods({ atk: card.n });
    return '+2 attack this road';
  }
  function flipCard(index) {
    const play = currentTile().play;
    if (!play || play.done) return;
    const card = play.cards[index];
    if (!card || card.up) return;
    card.up = true;
    if (card.kind === 'bandit') {
      play.done = true;
      const pity = gainGold(payoutGold(play.pot.length ? 4 : 6));
      play.text = play.pot.length ? 'A bandit scatters the pot. Pity +' + pity + ' gold.' : 'A bandit on the first flip. Pity +' + pity + ' gold.';
      play.pot = [];
    } else {
      play.pot.push(card);
      play.text = card.label + ' is in the pot.';
    }
    saveGame();
    render();
  }
  function stopCards() {
    const play = currentTile().play;
    if (!play || play.done) return;
    if (!play.pot.length) { toast('Flip at least one card.'); return; }
    play.text = play.pot.map(applyCardReward).join(' ');
    play.done = true;
    saveGame();
    render();
  }
  function applySlots(reels) {
    const ids = reels.map((index) => SLOT_LABELS[index]);
    const all = ids[0] === ids[1] && ids[1] === ids[2];
    const pair = ids[0] === ids[1] || ids[1] === ids[2] || ids[0] === ids[2];
    if (all && ids[0] === 'Fox') { addMods({ atk: 3 }); return 'Three foxes. +3 attack and +' + gainGold(payoutGold(18)) + ' gold.'; }
    if (all && ids[0] === 'Coin') return 'Jackpot. +' + gainGold(payoutGold(40)) + ' gold.';
    if (all && ids[0] === 'Gem') { const n = payoutGem(6); State.save.gems += n; saveGame(); return 'Three gems. +' + n + ' gems.'; }
    if (all && ids[0] === 'Paw') { addMods({ def: 2 }); return 'Three paws. +2 defense and ' + healPct(0.32) + '.'; }
    if (all && ids[0] === 'Slime') { State.save.keys += 1; State.run.hp = Math.max(1, State.run.hp - 6); saveGame(); return 'Three slimes. −6 HP, and a key.'; }
    if (pair) return 'A pair. +' + gainGold(payoutGold(14)) + ' gold.';
    return 'No match, still a tip. +' + gainGold(payoutGold(6)) + ' gold.';
  }
  async function rollSlots() {
    const tile = currentTile();
    if (State.busy || !tile || !tile.play || tile.play.done) return;
    State.busy = true;
    const reels = [rngInt(5), rngInt(5), rngInt(5)];
    tile.play.reels = reels;
    tile.play.text = applySlots(reels);
    tile.play.done = true;
    saveGame();
    const frames = reduceMotion() ? 1 : 14;
    for (let frame = 0; frame < frames; frame += 1) {
      for (let i = 0; i < 3; i += 1) {
        const box = document.getElementById('slot-' + i);
        if (!box) continue;
        const stopAt = 7 + i * 3;
        const idx = frame >= stopAt ? reels[i] : Math.floor(Math.random() * 5);
        box.textContent = SLOT_LABELS[idx];
      }
      blip(300 + frame * 20, 0.04, 'square', 0.02);
      await wait(70);
    }
    State.busy = false;
    render();
  }
  function applyHazard(index) {
    const tile = currentTile();
    const option = hazardOptions(tile.kind)[index];
    if (!option) return;
    if (option.gold) {
      if (State.save.gold < option.gold) { toast('Not enough gold.'); return; }
      spendGold(option.gold);
    }
    if (option.dmg) State.run.hp = Math.max(1, State.run.hp - option.dmg);
    if (option.mods) addMods(option.mods);
    if (option.wound) State.run.wound = option.wound;
    if (option.rollCap) State.run.rollCap = option.rollCap;
    toast(option.result);
    resolveTile();
  }
  function applyBuff(index) {
    const offer = currentTile().offers[index];
    if (!offer) return;
    addMods(offer.mods || {});
    const max = profile(State.save, State.run).maxHp;
    if (offer.heal) State.run.hp = Math.min(max, State.run.hp + offer.heal);
    if (offer.healPct) State.run.hp = Math.min(max, State.run.hp + Math.round(max * offer.healPct));
    toast(offer.name);
    resolveTile();
  }
  function buyStock(index) {
    const item = currentTile().stock[index];
    if (!item || item.sold) return;
    if (State.save.gold < item.cost) { toast('Not enough gold.'); return; }
    if (item.kind === 'relic' && State.run.relics.indexOf(item.relic) >= 0) { toast('Already carrying that.'); return; }
    spendGold(item.cost);
    item.sold = true;
    if (item.kind === 'heal') {
      const max = profile(State.save, State.run).maxHp;
      const amount = Math.round(max * 0.42) + 8;
      State.run.hp = Math.min(max, State.run.hp + amount);
      toast('Healed ' + amount + '.');
    } else if (item.kind === 'charm') {
      addMods({ [item.key]: item.amount });
      toast(item.desc);
    } else if (item.kind === 'gear') {
      const added = addGear(item.gear);
      toast(added ? 'Packed ' + added.name + '.' : 'The pack was full.');
    } else if (item.kind === 'relic') {
      const relic = RELICS.find((entry) => entry.id === item.relic);
      State.run.relics.push(relic.id);
      addMods(relic.mods);
      toast(relic.name);
    }
    saveGame();
    render();
  }
  function takeCard() {
    const run = State.run;
    if (!run || State.pick == null) return;
    const card = run.pendingCards[State.pick];
    if (!card) return;
    addMods(card.mods || {});
    const max = profile(State.save, run).maxHp;
    if (card.heal) run.hp = Math.min(max, run.hp + card.heal);
    else run.hp = Math.min(max, run.hp);
    run.boons.push({ name: card.name, rarity: card.rarity });
    run.pendingCards = null;
    run.banner = '';
    State.pick = null;
    State.screen = 'board';
    saveGame();
    render();
    toast(card.name);
    if (State.run && State.run.stepsLeft > 0 && State.run.index < State.run.tiles.length - 1) advanceSteps();
  }
  function salvage(id) {
    const gear = gearById(id);
    if (!gear) return;
    State.save.gear = State.save.gear.filter((item) => item.id !== id);
    if (State.save.equipped[gear.slot] === id) State.save.equipped[gear.slot] = null;
    State.fuse = State.fuse.filter((item) => item !== id);
    const gems = SALVAGE_GEMS[gear.rarity] || 0;
    gainGold(SALVAGE_GOLD[gear.rarity] || 0);
    if (gems) State.save.gems += gems;
    State.overlay = null;
    saveGame();
    render();
    if (gems) toast('+' + gems + ' gems from the scraps.');
  }
  function fuseSelected() {
    if (State.fuse.length !== 3) return;
    const items = State.fuse.map(gearById);
    if (items.some((gear) => !gear)) return;
    const slot = items[0].slot;
    const rarity = items[0].rarity;
    if (items.some((gear) => gear.slot !== slot || gear.rarity !== rarity)) {
      toast('Use three of the same slot and rarity.');
      return;
    }
    const rank = RARITIES.indexOf(rarity);
    if (rank < 0 || rank >= RARITIES.length - 1) { toast('Legendary gear stays as it is.'); return; }
    const counts = {};
    items.forEach((gear) => { counts[gear.set] = (counts[gear.set] || 0) + 1; });
    let setId = items[0].set;
    let best = 0;
    Object.keys(counts).forEach((id) => { if (counts[id] > best) { best = counts[id]; setId = id; } });
    if (best < 2) setId = items[Math.floor(Math.random() * items.length)].set;
    const ilevel = Math.max.apply(null, items.map((gear) => gear.ilevel));
    State.fuse.forEach((id) => {
      State.save.gear = State.save.gear.filter((gear) => gear.id !== id);
      SLOTS.forEach((key) => { if (State.save.equipped[key] === id) State.save.equipped[key] = null; });
    });
    const gear = makeGear(slot, RARITIES[rank + 1], ilevel, setId);
    addGear(gear);
    State.fuse = [];
    State.overlay = { type: 'fuse', gear };
    saveGame();
    render();
  }
  function claimDaily() {
    if (State.save.daily.last === todayKey()) return;
    const before = snapshotUnlocks();
    if (State.save.daily.last === yesterdayKey()) State.save.daily.streak += 1;
    else State.save.daily.streak = 1;
    State.save.daily.last = todayKey();
    State.save.daily.total = (State.save.daily.total || 0) + 1;
    const reward = DAILY[(State.save.daily.streak - 1) % DAILY.length];
    const lines = [reward.label];
    if (reward.gold) lines.push('+' + gainGold(reward.gold) + ' gold');
    if (reward.gems) { State.save.gems += reward.gems; lines.push('+' + reward.gems + ' gems'); }
    if (reward.keys) { State.save.keys += reward.keys; lines.push('+' + reward.keys + ' key' + (reward.keys > 1 ? 's' : '')); }
    if (reward.egg) { State.save.eggs += reward.egg; lines.push('an egg'); }
    if (reward.chest) { State.save.chests[reward.chest] += 1; lines.push(CHESTS[reward.chest].name); }
    const unlocks = diffUnlocks(before);
    autoEquipNew(before);
    State.overlay = { type: 'loot', title: 'Daily pile', lines: lines.concat(unlocks) };
    saveGame();
    render();
  }
  function openChest(kind, pay) {
    const spec = CHESTS[kind];
    if (!spec || State.save.chests[kind] <= 0) return;
    if (pay === 'key' && State.save.keys < spec.keys) { toast('Need more keys.'); return; }
    if (pay === 'gem' && State.save.gems < spec.gems) { toast('Need more gems.'); return; }
    if (pay === 'key') State.save.keys -= spec.keys;
    else State.save.gems -= spec.gems;
    State.save.chests[kind] -= 1;
    const lines = [];
    const roll = Math.random();
    if (kind === 'wood') {
      lines.push('+' + gainGold(16 + Math.floor(Math.random() * 13)) + ' gold');
      const gear = makeGear(pickSlot(), Math.random() < 0.25 ? 'uncommon' : 'common', Math.max(1, State.save.stage), pickSet());
      if (addGear(gear)) lines.push(gear.name);
      const gems = 1 + Math.floor(Math.random() * 2);
      State.save.gems += gems;
      lines.push('+' + gems + ' gems');
      addXp(12);
    } else if (kind === 'iron') {
      lines.push('+' + gainGold(40 + Math.floor(Math.random() * 31)) + ' gold');
      const rarity = roll < 0.6 ? 'uncommon' : roll < 0.95 ? 'rare' : 'epic';
      const gear = makeGear(pickSlot(), rarity, Math.max(1, State.save.highestStage), pickSet());
      if (addGear(gear)) lines.push(gear.name);
      const gems = 4 + Math.floor(Math.random() * 3);
      State.save.gems += gems;
      lines.push('+' + gems + ' gems');
      if (Math.random() < 0.35) { State.save.eggs += 1; lines.push('an egg'); }
      addXp(24);
    } else {
      lines.push('+' + gainGold(90 + Math.floor(Math.random() * 51)) + ' gold');
      const rarity = roll < 0.4 ? 'rare' : roll < 0.8 ? 'epic' : 'legendary';
      const gear = makeGear(pickSlot(), rarity, Math.max(1, State.save.highestStage), pickSet());
      if (addGear(gear)) lines.push(gear.name);
      const gems = 8 + Math.floor(Math.random() * 5);
      State.save.gems += gems;
      lines.push('+' + gems + ' gems');
      if (Math.random() < 0.7) { State.save.eggs += 1; lines.push('an egg'); }
      if (Math.random() < 0.25) lines.push(grantRandomCompanion());
      addXp(40);
    }
    State.overlay = { type: 'loot', title: spec.name, lines };
    saveGame();
    render();
  }
  function hatchEgg() {
    if (State.save.eggs <= 0) return;
    State.save.eggs -= 1;
    const locked = PET_IDS.filter((id) => !petUnlocked(id));
    if (!locked.length) {
      State.save.gems += 12;
      State.overlay = { type: 'loot', title: 'A familiar egg', lines: ['Every pet is already in camp.', '+12 gems'] };
    } else {
      const id = locked[Math.floor(Math.random() * locked.length)];
      if (!State.save.petsUnlocked.includes(id)) State.save.petsUnlocked.push(id);
      if (!State.save.pet) State.save.pet = id;
      State.overlay = { type: 'hatch', id };
    }
    saveGame();
    render();
  }
  function closeOverlay() {
    if (!State.overlay || State.overlay.mandatory || State.busy) return;
    const wasHelp = State.overlay.type === 'help';
    if (wasHelp) {
      State.save.seenHelp = true;
      saveGame();
    }
    State.overlay = null;
    if (wasHelp && State.screen === 'camp' && State.save.daily.last !== todayKey()) {
      State.overlay = { type: 'daily' };
    }
    render();
  }
  function paintDie(face, rolling) {
    State.dieFace = face;
    const holder = document.getElementById('iso-die');
    if (!holder) return;
    holder.classList.toggle('tumbling', !!rolling);
    holder.innerHTML = isoDie(face);
  }
  function paintToken() {
    if (!State.run) return;
    const geom = boardGeom(State.run.tiles.length);
    const pos = geom.positions[State.run.index];
    const token = document.getElementById('token');
    if (token && pos) {
      token.style.left = pos.cx + 'px';
      token.style.top = pos.cy + 'px';
    }
    document.querySelectorAll('.tile').forEach((el, index) => {
      el.classList.toggle('current', index === State.run.index);
      el.classList.toggle('done', !!(State.run.tiles[index] && State.run.tiles[index].resolved));
    });
    const current = document.querySelector('.tile.current');
    if (current) current.scrollIntoView({ block: 'nearest', behavior: reduceMotion() ? 'auto' : 'smooth' });
  }
  async function onRoll() {
    if (State.busy || State.screen !== 'board' || !State.run) return;
    const tile = currentTile();
    if (!tile || !tile.resolved) { openEncounter(); return; }
    if ((State.run.stepsLeft || 0) > 0) { advanceSteps(); return; }
    if (State.run.index >= State.run.tiles.length - 1) return;
    ensureAudio();
    State.busy = true;
    const button = document.querySelector('[data-act="roll"]');
    if (button) button.disabled = true;
    const cap = State.run.rollCap || 6;
    State.run.rollCap = 0;
    const face = 1 + rngInt(cap);
    const frames = reduceMotion() ? 1 : 10;
    for (let i = 0; i < frames; i += 1) {
      paintDie(1 + Math.floor(Math.random() * 6), true);
      blip(180 + i * 30, 0.04, 'square', 0.03);
      await wait(70);
    }
    paintDie(face, false);
    blip(520, 0.1, 'triangle', 0.05);
    State.run.rolls = (State.run.rolls || 0) + 1;
    State.run.stepsLeft = face;
    State.busy = false;
    await advanceSteps();
  }
  async function advanceSteps() {
    if (!State.run || State.busy) return;
    State.busy = true;
    const last = State.run.tiles.length - 1;
    while (State.run && State.run.stepsLeft > 0 && State.run.index < last) {
      State.run.index += 1;
      State.run.stepsLeft -= 1;
      paintToken();
      blip(320, 0.04, 'square', 0.03);
      await wait(reduceMotion() ? 40 : 260);
      const tile = currentTile();
      saveGame();
      if (tile && !tile.resolved) {
        State.busy = false;
        openEncounter();
        return;
      }
    }
    if (State.run) State.run.stepsLeft = 0;
    State.busy = false;
    saveGame();
    render();
  }
  function startNewRun() {
    if (State.save.run && State.run) {
      State.screen = State.run.pendingCards ? 'cards' : 'board';
      State.overlay = null;
      render();
      return;
    }
    const built = buildRun(State.save.stage);
    State.run = built.run;
    State.rng = built.rng;
    State.save.run = State.run;
    State.screen = 'board';
    State.overlay = null;
    State.dieFace = 5;
    saveGame();
    render();
  }

  function onClick(event) {
    if (event.target.id === 'overlay') { closeOverlay(); return; }
    const el = event.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const act = el.dataset.act;
    if (State.busy && act !== 'speed') return;
    ensureAudio();
    if (act === 'mute') {
      State.save.muted = !State.save.muted;
      saveGame();
      renderTop();
      return;
    }
    if (act === 'party-tab') { State.partyTab = el.dataset.to; render(); return; }
    if (act === 'mount-view') { State.mountView = el.dataset.to; render(); return; }
    if (act === 'forge-tab') { State.forgeTab = el.dataset.to; render(); return; }
    if (act === 'tree') { State.treeNode = el.dataset.id; render(); return; }
    if (act === 'focus-hero') { State.focusHero = el.dataset.id; render(); return; }
    if (act === 'focus-mount') {
      State.focusMount = el.dataset.id;
      if (State.mountView !== 'collection' && State.mountPick != null && mountUnlocked(el.dataset.id)) {
        const slots = State.save.mountSlots;
        const prev = slots.indexOf(el.dataset.id);
        if (prev >= 0) slots[prev] = null;
        slots[State.mountPick] = el.dataset.id;
        State.save.mount = slots[0] || null;
      }
      saveGame();
      render();
      return;
    }
    if (act === 'mount-slot') { State.mountPick = Number(el.dataset.slot); toast('Now pick a mount.'); return; }
    if (act === 'level-mount') { levelMount(el.dataset.id); return; }
    if (act === 'level-sentinel') { levelSentinel(el.dataset.id); return; }
    if (act === 'place-sentinel') { placeSentinel(el.dataset.id); return; }
    if (act === 'clear-sentinel') {
      State.save.sentinelDeploy[Number(el.dataset.slot)] = null;
      saveGame();
      render();
      return;
    }
    if (act === 'enhance-hero') { enhanceHero(el.dataset.id); return; }
    if (act === 'skin') {
      const skin = (SKINS[el.dataset.id] || []).find((item) => item.id === el.dataset.skin);
      if (!skin || !skin.met(State.save)) return;
      State.save.skin[el.dataset.id] = skin.id;
      saveGame();
      render();
      return;
    }
    if (act === 'quick-merge') { quickMerge(); return; }
    if (act === 'reroll-cards') { rerollCards(); return; }
    if (act === 'reroll-shop') { rerollShop(); return; }
    if (act === 'goto') {
      State.screen = el.dataset.to;
      State.overlay = null;
      render();
      return;
    }
    if (act === 'camp') {
      State.screen = 'camp';
      State.overlay = null;
      render();
      return;
    }
    if (act === 'help') { State.overlay = { type: 'help' }; renderOverlay(); return; }
    if (act === 'close') { closeOverlay(); return; }
    if (act === 'daily') { State.overlay = { type: 'daily' }; render(); return; }
    if (act === 'claim') { claimDaily(); return; }
    if (act === 'stage') {
      const dir = Number(el.dataset.dir);
      State.save.stage = clamp(State.save.stage + dir, 1, State.save.highestStage);
      saveGame();
      render();
      return;
    }
    if (act === 'play' || act === 'resume') { startNewRun(); return; }
    if (act === 'continue') { advanceSteps(); return; }
    if (act === 'roll') { onRoll(); return; }
    if (act === 'enter') { openEncounter(); return; }
    if (act === 'ask-retire') {
      State.overlay = { type: 'confirm', text: 'Leave this road? Gold already pocketed stays in camp.', act: 'retire-yes' };
      render();
      return;
    }
    if (act === 'retire-yes') {
      if (State.run) onLose({ foe: { name: 'the long walk' }, fled: true });
      return;
    }
    if (act === 'speed') {
      const speeds = [1, 2, 4];
      State.speed = speeds[(speeds.indexOf(State.speed) + 1) % speeds.length];
      if (State.battle) State.battle.speed = State.speed;
      const button = document.getElementById('speed-btn');
      if (button) button.textContent = 'Speed ' + State.speed + '×';
      return;
    }
    if (act === 'flee') {
      if (State.battle && !State.battle.over) {
        State.battle.fled = true;
        State.battle.log = 'You slip off the road.';
        endBattle(false);
      }
      return;
    }
    if (act === 'pick-card') { State.pick = Number(el.dataset.i); render(); return; }
    if (act === 'take-card') { takeCard(); return; }
    if (act === 'train') { buyTraining(el.dataset.id); return; }
    if (act === 'talent') { buyTalent(el.dataset.id); return; }
    if (act === 'equip-hero') {
      const id = el.dataset.id;
      if (!heroUnlocked(id)) { toast(HEROES[id].unlockText); return; }
      State.save.hero = id;
      saveGame();
      render();
      return;
    }
    if (act === 'equip-pet') {
      const id = el.dataset.id;
      if (!petUnlocked(id)) { toast(PETS[id].unlockText); return; }
      State.save.pet = State.save.pet === id ? null : id;
      saveGame();
      render();
      return;
    }
    if (act === 'equip-mount') {
      const id = el.dataset.id;
      if (!mountUnlocked(id)) { toast(MOUNTS[id].unlockText); return; }
      State.save.mount = State.save.mount === id ? null : id;
      saveGame();
      render();
      return;
    }
    if (act === 'hatch') { hatchEgg(); return; }
    if (act === 'open-chest') { openChest(el.dataset.kind, el.dataset.pay); return; }
    if (act === 'item') {
      if (!el.dataset.id) { State.screen = 'gear'; render(); return; }
      if (State.forgeTab === 'break') {
        const broken = gearById(el.dataset.id);
        if (!broken) return;
        State.overlay = { type: 'confirm', text: 'Dismantle ' + broken.name + ' for ' + SALVAGE_GOLD[broken.rarity] + ' gold?', act: 'salvage-yes', id: broken.id };
        render();
        return;
      }
      State.overlay = { type: 'item', id: el.dataset.id };
      render();
      return;
    }
    if (act === 'equip') {
      const gear = gearById(el.dataset.id);
      if (!gear) return;
      State.save.equipped[gear.slot] = State.save.equipped[gear.slot] === gear.id ? null : gear.id;
      saveGame();
      State.overlay = null;
      render();
      return;
    }
    if (act === 'fuse-add') {
      const id = el.dataset.id;
      const gear = gearById(id);
      if (!gear) return;
      if (State.fuse.indexOf(id) >= 0) State.fuse = State.fuse.filter((item) => item !== id);
      else if (State.fuse.length >= 3) toast('The fuse tray holds three.');
      else if (State.fuse.length && gearById(State.fuse[0]) && (gearById(State.fuse[0]).slot !== gear.slot || gearById(State.fuse[0]).rarity !== gear.rarity)) toast('Match the slot and rarity already in the tray.');
      else State.fuse.push(id);
      State.overlay = null;
      State.screen = 'gear';
      render();
      return;
    }
    if (act === 'fuse-go') { fuseSelected(); return; }
    if (act === 'ask-salvage') {
      const gear = gearById(el.dataset.id);
      if (!gear) return;
      State.overlay = { type: 'confirm', text: 'Break down ' + gear.name + ' for ' + SALVAGE_GOLD[gear.rarity] + ' gold?', act: 'salvage-yes', id: gear.id };
      render();
      return;
    }
    if (act === 'salvage-yes') { salvage(el.dataset.id); return; }
    if (act === 'buff') { applyBuff(Number(el.dataset.i)); return; }
    if (act === 'hazard') { applyHazard(Number(el.dataset.i)); return; }
    if (act === 'buy') { buyStock(Number(el.dataset.i)); return; }
    if (act === 'spin') { spinWheel(); return; }
    if (act === 'hilo') { guessHilo(el.dataset.dir); return; }
    if (act === 'cashout') { cashHilo(); return; }
    if (act === 'pick-chest') { pickChest(Number(el.dataset.i)); return; }
    if (act === 'flip') { flipCard(Number(el.dataset.i)); return; }
    if (act === 'stop-cards') { stopCards(); return; }
    if (act === 'slot-roll') { rollSlots(); return; }
    if (act === 'resolve') {
      const tile = currentTile();
      if (tile && tile.type === 'mini' && tile.play && !tile.play.done) { toast('Finish the game first.'); return; }
      resolveTile();
    }
  }
  function levelSentinel(id) {
    if (!sentinelReady(id)) return;
    const lv = sentinelLv(id);
    if (lv <= 0) {
      State.save.sentinelLevel[id] = 1;
      const empty = State.save.sentinelDeploy.indexOf(null);
      if (empty >= 0 && State.save.sentinelDeploy.indexOf(id) < 0) State.save.sentinelDeploy[empty] = id;
    } else {
      const cost = 16 * lv;
      if (State.save.gold < cost) { toast('Not enough gold.'); return; }
      spendGold(cost);
      State.save.sentinelLevel[id] = lv + 1;
    }
    saveGame();
    render();
  }
  function placeSentinel(id) {
    if (!sentinelReady(id) || sentinelLv(id) <= 0) { toast('Awaken them first.'); return; }
    const slots = State.save.sentinelDeploy;
    const have = slots.indexOf(id);
    if (have >= 0) slots[have] = null;
    let slot = slots.indexOf(null);
    if (slot < 0) slot = 0;
    slots[slot] = id;
    saveGame();
    render();
  }
  function levelMount(id) {
    if (!mountUnlocked(id)) return;
    const lv = mountLv(id);
    const cost = 20 * lv;
    if (State.save.gold < cost) { toast('Not enough gold.'); return; }
    spendGold(cost);
    State.save.mountLevel[id] = lv + 1;
    saveGame();
    render();
  }
  function enhanceHero(id) {
    if (!heroUnlocked(id)) { toast(HEROES[id].unlockText); return; }
    const rank = (State.save.heroRank[id] || 0);
    const cost = Math.round(22 * Math.pow(1.45, rank));
    if (State.save.gold < cost) { toast('Not enough gold.'); return; }
    spendGold(cost);
    State.save.heroRank[id] = rank + 1;
    saveGame();
    render();
  }
  function quickMerge() {
    const groups = {};
    State.save.gear.forEach((gear) => {
      if (gear.rarity === 'legendary') return;
      const key = gear.slot + '|' + gear.rarity;
      groups[key] = groups[key] || [];
      groups[key].push(gear.id);
    });
    const hit = Object.keys(groups).map((key) => groups[key]).find((ids) => ids.length >= 3);
    if (!hit) { toast('No three of a kind yet.'); return; }
    State.fuse = hit.slice(0, 3);
    fuseSelected();
  }
  function rerollCards() {
    const run = State.run;
    if (!run || !run.pendingCards) return;
    if (!run.freeReroll) {
      if (State.save.gold < 10) { toast('Need 10 gold.'); return; }
      spendGold(10);
    }
    run.freeReroll = false;
    run.pendingCards = draftCards(!!run.pendingElite);
    State.pick = null;
    saveGame();
    render();
  }
  function rerollShop() {
    const tile = currentTile();
    if (!tile || tile.type !== 'shop') return;
    if (State.save.gold < 8) { toast('Need 8 gold.'); return; }
    spendGold(8);
    tile.stock = rollShop(State.rng, State.run.stage);
    State.run.rngState = State.rng.state();
    saveGame();
    render();
  }
  function buyTraining(id) {
    const spec = TRAINING.find((item) => item.id === id);
    const rank = State.save.training[id] || 0;
    if (!spec || rank >= spec.max) return;
    const cost = trainCost(rank);
    if (State.save.gold < cost) { toast('Not enough gold.'); return; }
    spendGold(cost);
    State.save.training[id] = rank + 1;
    saveGame();
    blip(540, 0.08, 'triangle', 0.05);
    render();
  }
  function buyTalent(id) {
    const spec = TALENTS.find((item) => item.id === id);
    const rank = State.save.talents[id] || 0;
    if (!spec || rank >= spec.max) return;
    if (State.save.talentPoints < 1) { toast('Earn a level to gain a talent point.'); return; }
    State.save.talentPoints -= 1;
    State.save.talents[id] = rank + 1;
    saveGame();
    render();
  }
  function onKey(event) {
    if (event.key === ' ' && State.screen === 'board' && !State.overlay) {
      event.preventDefault();
      onRoll();
    }
  }
  function boot() {
    State.save = loadSave();
    if (State.save.run) {
      State.run = sanitizeRun(State.save.run);
      if (State.run) {
        State.rng = createRng(State.run.rngState || State.run.seed || 1);
        State.screen = State.run.pendingCards ? 'cards' : 'board';
        const tile = currentTile();
        if (State.screen === 'board' && tile && !tile.resolved && tile.type !== 'start' && tile.type !== 'fight' && tile.type !== 'elite' && tile.type !== 'boss') {
          if (tile.type === 'mini') initMini(tile);
          State.overlay = { type: tile.type === 'mini' ? 'mini' : tile.type, mandatory: true };
        }
      } else State.save.run = null;
    }
    if (State.screen === 'camp' && State.save.daily.last !== todayKey() && State.save.runs > 0 && !State.overlay) {
      State.overlay = { type: 'daily' };
    }
    document.body.addEventListener('click', onClick);
    document.body.addEventListener('keydown', onKey);
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
    render();
  }

  try { boot(); }
  catch (err) {
    const view = document.getElementById('view');
    if (view) view.textContent = 'Diceborn stumbled while waking. Reload the page. ' + (err && err.message ? err.message : '');
  }
})();
