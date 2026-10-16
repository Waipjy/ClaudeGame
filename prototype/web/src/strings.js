// All visible strings. Short labels only (zh <= 6 CJK chars, en <= 14 chars), no sentences, no sentence punctuation. {0} {1} = numbers drawn by drawNum.
const STR = {
  zh: {
    "ui.settings": "設定", "ui.codex": "圖鑑", "ui.act": "第{0}幕", "ui.round": "回合", "ui.money": "錢", "ui.goal": "目標", "ui.refine": "煉金", "ui.fill": "填滿目標",
    "ui.mult": "倍率", "ui.charms": "護符", "ui.pours": "倒料", "ui.deck": "牌堆", "ui.each": "每回合", "ui.full": "滿", "ui.lidOn": "蓋著", "ui.left": "剩", "ui.miss": "未達標", "ui.fail": "失敗",
    "ui.perLamp": "每亮一盞", "ui.allLamp": "全亮", "ui.blast": "爆蓋",
    "btn.match": "點火", "btn.lid": "加蓋", "btn.lidOff": "開蓋", "btn.end": "結束回合",
    "el.0": "火", "el.1": "水", "el.2": "土", "el.3": "氣",
    "tut.pour": "倒料",
    "mat.sand": "沙", "mat.water": "水", "mat.oil": "油", "mat.lava": "熔岩", "mat.acid": "酸", "mat.powder": "火藥", "mat.ice": "冰", "mat.seed": "種子", "mat.ember": "火星", "mat.sulfur": "硫磺",
    "arc.pyro": "烈焰", "arc.tower": "水塔", "arc.glass": "琉璃", "arc.demolition": "爆破", "arc.greenhouse": "溫室", "arc.alkahest": "萬能溶劑", "arc.nozzle": "噴嘴", "arc.hotplate": "加熱板",
    "arc.spare": "備用瓶", "arc.magma": "岩漿", "arc.freezer": "冷凍", "arc.matchbox": "火柴盒", "arc.thickglass": "厚玻璃", "arc.ashes": "灰燼", "arc.scorched": "焦土", "arc.popritual": "爆蓋儀式",
    "shop.title": "藥鋪", "shop.vials": "瓶", "shop.charms": "護符", "shop.reroll": "重抽", "shop.exit": "離開", "shop.deck": "牌組",
    "end.fail": "失敗", "end.win": "通關", "end.again": "再來一局",
    "set.title": "設定", "set.close": "關閉", "set.sound": "音效", "set.anim": "動畫速度", "set.lang": "語言", "set.vib": "震動", "set.tut": "重看教學", "set.on": "開", "set.off": "關", "set.done": "已設定",
    "lang.zh": "繁中", "lang.en": "English",
  },
  en: {
    "ui.settings": "Settings", "ui.codex": "Codex", "ui.act": "Act {0}", "ui.round": "Round", "ui.money": "Coins", "ui.goal": "Goal", "ui.refine": "Make gold", "ui.fill": "Fill the goal",
    "ui.mult": "Multiplier", "ui.charms": "Charms", "ui.pours": "Pours", "ui.deck": "Deck", "ui.each": "Per round", "ui.full": "Full", "ui.lidOn": "Lid on", "ui.left": "Left", "ui.miss": "Short", "ui.fail": "Fail",
    "ui.perLamp": "Per lit", "ui.allLamp": "All lit", "ui.blast": "Lid pop",
    "btn.match": "Ignite", "btn.lid": "Lid on", "btn.lidOff": "Lid off", "btn.end": "End round",
    "el.0": "Fire", "el.1": "Water", "el.2": "Earth", "el.3": "Air",
    "tut.pour": "Pour",
    "mat.sand": "Sand", "mat.water": "Water", "mat.oil": "Oil", "mat.lava": "Lava", "mat.acid": "Acid", "mat.powder": "Powder", "mat.ice": "Ice", "mat.seed": "Seed", "mat.ember": "Ember", "mat.sulfur": "Sulfur",
    "arc.pyro": "Pyro", "arc.tower": "Tower", "arc.glass": "Glassworks", "arc.demolition": "Demolition", "arc.greenhouse": "Greenhouse", "arc.alkahest": "Alkahest", "arc.nozzle": "Nozzle", "arc.hotplate": "Hotplate",
    "arc.spare": "Spare vial", "arc.magma": "Magma", "arc.freezer": "Freezer", "arc.matchbox": "Matchbox", "arc.thickglass": "Thick glass", "arc.ashes": "Ashes", "arc.scorched": "Scorched", "arc.popritual": "Pop ritual",
    "shop.title": "Apothecary", "shop.vials": "Vials", "shop.charms": "Charms", "shop.reroll": "Reroll", "shop.exit": "Leave", "shop.deck": "Deck",
    "end.fail": "Failed", "end.win": "Cleared", "end.again": "Again",
    "set.title": "Settings", "set.close": "Close", "set.sound": "Sound", "set.anim": "Anim speed", "set.lang": "Language", "set.vib": "Vibration", "set.tut": "Replay intro", "set.on": "On", "set.off": "Off", "set.done": "Done",
    "lang.zh": "繁中", "lang.en": "English",
  },
};
if (typeof module !== "undefined") module.exports = STR;
