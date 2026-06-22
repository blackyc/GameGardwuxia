/**
 * game.js — 主游戏类
 * 从 ghost_mud_v2.html 的 Game 类迁移而来
 * 参考猫国建设者 game.js 的类结构
 * 
 * 主要职责：
 * 1. 游戏状态初始化
 * 2. 游戏循环（idleTick / daoxinTick / triggerIdleEvent / checkBreakthrough）
 * 3. 移动系统（explore）
 * 4. NPC 遭遇系统
 * 5. 帮派/拜师系统
 * 6. 战斗系统
 * 7. 任务系统
 * 8. 物品/搜索系统
 * 9. 命令处理
 */

import { collectData, getData, pickEnemy } from './data/data_loader.js';
import { Timer } from './core/timer.js';
import { TabManager } from './core/tabmanager.js';
import { ResourcePool } from './core/respool.js';
import { Storage } from './core/storage.js';
import { InputManager } from './ui/input.js';
import { Renderer } from './ui/renderer.js';

export class Game {
  constructor() {
    window.game = this;
    console.log('[Game] Constructor started');

    // 核心引擎
    this.timer = new Timer();
    this.tabManager = new TabManager();
    this.resPool = new ResourcePool();
    this.storage = new Storage();
    this.renderer = new Renderer(this);
    this.input = new InputManager(this);

    // 数据
    this.data = collectData();
    console.log('[Game] Data collected:', {
      REALMS: (this.data.REALMS || []).length,
      LOCATIONS: Object.keys(this.data.LOCATIONS || {}).length,
      ENEMIES: Object.keys(this.data.ENEMIES || {}).length,
      FACTIONS: Object.keys(this.data.FACTIONS || {}).length,
      QUESTS: (this.data.QUESTS || []).length,
      ROGUE_SKILLS: this.data.ROGUE_SKILLS ? 'has skills' : 'missing',
      getDesc: typeof this.data.getDesc
    });

    // 解构常用数据
    const { REALMS, LOCATIONS, NPC_ENCOUNTERS, FACTIONS, ROGUE_SKILLS, QUESTS, ITEMS, ROOM_SEARCH, MAP_POS, MAP_CONN, getDesc } = this.data;
    this.REALMS = REALMS;
    this.LOCATIONS = LOCATIONS;
    this.NPC_ENCOUNTERS = NPC_ENCOUNTERS;
    this.FACTIONS = FACTIONS;
    this.ROGUE_SKILLS = ROGUE_SKILLS;
    this.QUESTS = QUESTS;
    this.ITEMS = ITEMS;
    this.ROOM_SEARCH = ROOM_SEARCH;
    this.MAP_POS = MAP_POS;
    this.MAP_CONN = MAP_CONN;
    this.getDesc = getDesc || ((obj) => obj?.desc || '');

    // UI 状态
    this.currentTab = null;
    this.mapOpen = false;

    // 游戏状态
    const r0 = this.REALMS[0];
    this.state = {
      realm: 0,
      cultivation: 0,
      daoxin: 100, maxDaoXin: 100,
      hp: r0.hp, maxHp: r0.hp,
      lifespan: 80,
      spiritStones: 0,
      attack: r0.atk, defense: r0.def,
      location: '应天府·十字街口',
      inventory: [],
      equipment: { weapon: null, armor: null },
      techniques: [],
      killCount: 0,
      totalCultivation: 0,
      isResting: false,
      gameStart: Date.now(),
      combat: null,
      npcEncounter: null,
      explored: ['应天府·十字街口'],
      activeQuests: [],
      completedQuests: [],
      questStages: {},
      // 帮派/技能系统
      faction: '散修',
      skills: {},
      equippedSkill: null,
      factionRep: 0,
      performCooldowns: {},
      roundCount: 0,
    };

    // 尝试加载存档
    const saved = this.storage.load();
    if (saved) {
      Object.assign(this.state, saved);
      this.addLog('📂 存档已加载。', 'system');
    }

    this.init();
  }

  init() {
    console.log('[Game] init() called');
    this.renderer.updateLocationIcon();
    this.input.init();
    this._registerTabs();
    this._registerTimers();
    this.startGameAsRogue();
    console.log('[Game] init() completed. Timer intervals:', this.timer._intervals.size);
  }

  _registerTabs() {
    this.tabManager.init();
    this.tabManager.register('char', () => {});
    this.tabManager.register('bag', () => this.renderer.renderInventory());
    this.tabManager.register('wuxue', () => this.renderer.renderWuxue());
    this.tabManager.register('quest', () => this.renderer.renderQuests());
    this.tabManager.register('status', () => {});
  }

  _registerTimers() {
    this.timer.register('idle', () => this.idleTick(), 3000);
    this.timer.register('daoxin', () => this.daoxinTick(), 15000);
  }

  startGameAsRogue() {
    const s = this.state;
    // 散修起始技能
    if (this.ROGUE_SKILLS && this.ROGUE_SKILLS.skills) {
      const starterSkills = this.ROGUE_SKILLS.skills.filter(sk => sk.minLevel === 0);
      if (starterSkills.length > 0) {
        this.addLog('📖 自行研习基础功法：', 'special');
        starterSkills.forEach(sk => {
          if (!s.skills[sk.id]) {
            s.skills[sk.id] = { level: 1, exp: 0 };
            this.addLog('   「' + sk.name + '」Lv.1', 'info');
          }
        });
      }
    }
    this.startGameAfterStartup();
  }

  startGameAfterStartup() {
    this.timer.start();
    this.renderer.updateLocationIcon();
    this.addLog('正德年间，世有修行之人。吐纳灵气，参悟大道。然修炼一途，每破一境便近祂一分——世人却未必知晓这是在敲谁的门。', 'system');
    this.addLog('你从顺天府暗巷醒来——脑中残留着经文与经络的碎片。你是谁？不重要。重要的是：你还活着。', 'system');
    this.addLog('🕯 挂机已启动。前路莫测，望君保重。', 'system');
    this.addLog('💡 城中探索将遇奇遇，野外险地方有敌袭。搜索可得金银器物。输入「帮助」查看命令。', 'system');
    this.addLog('⚡ 你尚未拜入任何帮派——在不同的城区探索，可能遇到各帮派的接引人。', 'system');
    this.renderer.updateUI();
  }

  // ============ 游戏循环 ============

  idleTick() {
    if (this.state.combat || this.state.npcEncounter) return;
    const s = this.state;
    if (s.isResting) {
      s.hp = Math.min(s.maxHp, s.hp + 3);
      s.daoxin = Math.min(s.maxDaoXin, s.daoxin + 1);
      s.cultivation += 1;
    } else {
      const base = 2 + s.realm * 1.5;
      const equipBonus = s.equipment.weapon ? 0.5 : 0;
      const techBonus = s.techniques.length * 0.3;
      s.cultivation += Math.floor(base + equipBonus + techBonus);
      s.totalCultivation += Math.floor(base + equipBonus + techBonus);
    }
    if (Math.random() < 0.05 && !s.isResting) this.triggerIdleEvent();
    this.checkBreakthrough();
    this.renderer.updateUI();
  }

  daoxinTick() {
    if (this.state.combat || this.state.npcEncounter || this.state.isResting) return;
    const s = this.state;
    const loc = this.LOCATIONS[s.location];
    const d = (loc ? loc.danger : 1) * 2 + (Math.random() > 0.7 ? 1 : 0);
    s.daoxin = Math.max(0, s.daoxin - d);
    if (s.daoxin < 20 && Math.random() < 0.3) {
      this.addLog('😰 道心动摇……你低头看见自己的手指——过长了一寸。也许没有。也许一直都这么长。', 'event');
      s.cultivation += 10;
    }
    if (s.daoxin <= 0) {
      s.daoxin = 0;
      this.gameOver('道心崩坏——你不再是你自己了。最后的念头散成无数碎片，其中一片还记得你的名字。只是一片。');
    }
    this.renderer.updateUI();
  }

  triggerIdleEvent() {
    const ev = [
      { text: '🌑 暮色忽然沉了三寸。不是天黑——是有什么东西在半空中张开了。你数不出那是什么。', effect: () => { this.state.daoxin -= 5; } },
      { text: '🌀 丹田内忽然翻涌——不是真气。是一小口苦味。你想吐出来，但喉咙里什么都没有。', effect: () => { this.state.cultivation += 20; } },
      { text: '👁 有人在看你。不是错觉——你后颈的皮肤知道。你猛地转身，只有一面旧墙，墙上的裂纹恰好排成一张脸的轮廓。', effect: () => { this.state.daoxin -= 3; } },
      { text: '📜 一行经文从你读过的那本残卷里浮上心头。你明明记得下一句是什么——但此刻读出来的，不是那个字。', effect: () => { this.state.cultivation += 15; this.state.daoxin -= 2; } },
      { text: '🕳 忘尘宗的真意在脑中一闪：忘我，忘尘，忘一切——包括自己正在忘。等你回过神来，已经过了一炷香——还是半个时辰？你看不清日晷。', effect: () => {
        if (!this.state.techniques.includes('忘尘经')) {
          this.state.techniques.push('忘尘经');
          this.addLog('🧠 你领悟了忘尘宗的皮毛。获得功法：忘尘经', 'special');
        }
        this.state.cultivation += 25; this.state.daoxin -= 8;
      } },
      { text: '💀 路过一口枯井时你停住了——不是因为井里有东西。是因为你在井壁上看到了自己的倒影。它在对你笑。你没在笑。', effect: () => { this.state.daoxin -= 5; this.state.cultivation += 30; } },
      { text: '🔥 远方山上亮起一盏灯——你已经走了一夜，那个方向不该有人家。灯亮着。亮了一盏。又亮了一盏。一共七盏。然后一盏接一盏灭了。', effect: () => { this.state.daoxin -= 4; this.state.cultivation += 10; } },
    ];
    const e = ev[Math.floor(Math.random() * ev.length)];
    this.addLog(e.text, 'event');
    e.effect();
  }

  checkBreakthrough() {
    const s = this.state;
    if (s.realm >= this.REALMS.length - 1) return;
    const n = this.REALMS[s.realm + 1];
    if (s.cultivation >= n.cost) {
      const ch = Math.min(0.95, 0.7 - s.realm * 0.08 + (s.daoxin / s.maxDaoXin) * 0.2);
      if (Math.random() < ch) {
        s.realm++;
        s.cultivation = 0;
        const r = this.REALMS[s.realm];
        s.attack = r.atk;
        s.defense = r.def;
        s.maxHp = r.hp;
        s.hp = r.hp;
        s.maxDaoXin += 20;
        s.daoxin = s.maxDaoXin;
        s.lifespan += 20;
        this.renderer.updateLocationIcon();
        this.addLog('🌟 突破！你已踏入 <b>' + r.name + '</b> 之境！', 'breakthrough');
        if (r.desc) this.addLog('   ' + r.desc, 'event');
      } else {
        s.cultivation = Math.floor(n.cost * 0.6);
        s.daoxin -= 15;
        this.addLog('💥 冲关失败！修为震荡，道心遭受重创…', 'combat');
        if (s.daoxin <= 0) this.gameOver('冲关失败，道心崩裂');
      }
    }
  }

  // ============ 移动系统 ============

  explore(dir) {
    if (this.state.combat || this.state.npcEncounter) { this.addLog('当前无法移动！请先结束当前互动。', 'combat'); return; }
    const s = this.state;
    const loc = this.LOCATIONS[s.location];
    if (!loc) { this.addLog('此处地脉紊乱，感知不到方位…', 'system'); return; }

    const DIR_CN = { north:'北', south:'南', east:'东', west:'西', up:'上', down:'下', in:'入', out:'出' };
    const cnDir = DIR_CN[dir] || dir;
    const target = loc.connections[cnDir] || loc.connections[dir];
    if (!target) { this.addLog('前方的路不见了。也许从来就没有过。', 'system'); return; }
    if (!this.LOCATIONS[target]) { this.addLog('那个地方……你记不起是哪里了。明明刚刚还记得。', 'system'); return; }

    s.location = target;
    if (!s.explored.includes(target)) s.explored.push(target);
    const nl = this.LOCATIONS[target];
    this.addLog('🚶 向' + this.dirName(dir) + '方行去…', 'info');
    this.addLog('📍 抵达 <b>' + target + '</b> —— ' + this.getDesc(nl), 'info');

    // Room events
    if (nl.events && nl.events.length > 0 && Math.random() < 0.5) {
      this.addLog(nl.events[Math.floor(Math.random() * nl.events.length)], 'event');
    }

    // Encounter system
    if (nl.danger <= 2) {
      if (Math.random() < 0.35) this.triggerNPCEncounter(false);
    } else if (nl.danger >= 5) {
      if (Math.random() < nl.danger * 0.15) this.triggerEncounter(nl);
    } else {
      if (Math.random() < 0.2) {
        Math.random() < 0.5 ? this.triggerNPCEncounter(false) : this.triggerEncounter(nl);
      }
    }

    if (nl.boss && Math.random() < 0.3) this.addLog('⚠ 此地弥漫着危险的气息——强敌就在附近…', 'combat');

    this.renderer.updateLocationIcon();
    this.renderer.renderMap();
    this.checkQuestProgress('go', target);
    this.renderer.updateUI();

    // 自动存档
    this.storage.save(this.state);
  }

  dirName(d) {
    return { north:'北', south:'南', east:'东', west:'西', up:'上', down:'下', in:'入', out:'出',
             '北':'北', '南':'南', '东':'东', '西':'西', '上':'上', '下':'下', '入':'入', '出':'出' }[d] || d;
  }

  quickTravel(loc) {
    // 地图点击快速旅行
    const s = this.state;
    if (s.combat || s.npcEncounter) return;
    // 只允许旅行到已探明地点
    if (!s.explored.includes(loc)) return;
    s.location = loc;
    this.addLog('🗺 快速前往 <b>' + loc + '</b>', 'info');
    this.renderer.renderMap();
    this.renderer.updateUI();
  }

  // ============ NPC 遭遇系统 ============

  triggerNPCEncounter(active) {
    const room = this.state.location;
    let pool = this.NPC_ENCOUNTERS[room];

    // 帮派招募NPC
    const factionPool = (typeof FACTION_RECRUITER_ENCOUNTERS !== 'undefined') ? (window.FACTION_RECRUITER_ENCOUNTERS || FACTION_RECRUITER_ENCOUNTERS)[room] : null;

    if ((!pool || pool.length === 0) && factionPool && factionPool.length > 0 && this.state.faction === '散修' && Math.random() < 0.4) {
      pool = factionPool;
    } else if (!pool || pool.length === 0) {
      if (active) this.addLog('此处荒无人烟，你环顾四周却不见半个人影。换个热闹的地方试试？', 'system');
      return;
    }

    const enc = pool[Math.floor(Math.random() * pool.length)];
    this.state.npcEncounter = enc;

    document.getElementById('npc-title').textContent = '👥 ' + enc.title;
    document.getElementById('npc-desc').textContent = this.getDesc(enc);
    const choicesDiv = document.getElementById('npc-choices');
    choicesDiv.innerHTML = enc.results.map((r, i) =>
      '<button class="modal-choice" data-npc-choice="' + i + '">' + r.choice + '</button>'
    ).join('');

    // 绑定点击事件
    choicesDiv.querySelectorAll('[data-npc-choice]').forEach(btn => {
      btn.addEventListener('click', () => this.npcChoice(parseInt(btn.dataset.npcChoice)));
    });

    document.getElementById('npc-modal').classList.add('active');
  }

  npcChoice(index) {
    const enc = this.state.npcEncounter;
    if (!enc) return;
    const result = enc.results[index];
    if (!result) return;
    const s = this.state;

    // 帮派招募NPC
    if (enc.npc_type === 'faction_recruiter' && enc.faction) {
      if (result.questStart) this.startQuest(result.questStart);
      if (result.log) this.addLog(result.log, 'npc');
      this.closeNPC();
      return;
    }

    // Process effects
    if (result.effect) {
      const parts = result.effect.split(';');
      for (const part of parts) {
        const [key, val] = part.split(':');
        if (key === 'spend_gold') s.spiritStones -= parseInt(val);
        else if (key === 'lose_gold') s.spiritStones = Math.max(0, s.spiritStones - parseInt(val));
        else if (key === 'check_atk') {
          if (s.attack >= parseInt(val)) {
            this.addLog(result.successLog || '成功！', 'npc');
            if (result.successReward) this.applyReward(result.successReward);
          } else {
            this.addLog(result.failLog || '失败…', 'npc');
          }
        } else if (key === 'check_agility') {
          if (Math.random() < 0.6) {
            this.addLog(result.successLog || '成功！', 'npc');
            if (result.successReward) this.applyReward(result.successReward);
          } else {
            this.addLog(result.failLog || '失败…', 'npc');
          }
        } else if (['heal','hp','daoxin','gain_gold','gain_cultivation','random_item','random_technique'].indexOf(key) >= 0) {
          this.applyReward(part);
        }
      }
    }

    if (result.reward) this.applyReward(result.reward);
    if (result.failReward) this.applyReward(result.failReward);

    const logText = result.log || result.successLog || '';
    if (logText && !logText.startsWith('成功') && !logText.startsWith('失败')) {
      this.addLog(logText, 'npc');
    }

    if (result.questStart || enc.questTrigger) {
      this.startQuest(result.questStart || enc.questTrigger);
    }

    this.closeNPC();
  }

  closeNPC() {
    this.state.npcEncounter = null;
    document.getElementById('npc-modal').classList.remove('active');
    this.renderer.updateUI();
  }

  // ============ 帮派系统 ============

  joinFaction(name) {
    const s = this.state;
    const oldFaction = s.faction;
    s.faction = name;
    s.skills = {};
    s.factionRep = 0;

    const ceremonies = {
      '忘尘宗': '🙏 「忘尘即是归宗。从今日起，你即忘尘宗弟子。忘我，忘尘，忘一切——连自己正在忘也一并忘记。入我忘尘，心即是空。」',
      '赤霞峰': '☯ 「赤霞峰上无日月，唯有霞光七色万年如一。从今日起，你的气脉即是山峰的支脉。道生一，一生二，二生三，三生万物——万物最后都会被霞光洗净。」',
      '锈剑冢': '⚔ 「锈剑冢中万剑沉寂。从今日起，你手持的是败剑——败在他人手中，锈在自己手上。败剑不折，因为已经折过一次了。」',
      '丝狱': '🐜 「丝狱之中，千丝万缕皆有声息。从今日起，世间每一句话都落在你的耳中。听得越多，越难分辨——哪些是别人的话，哪些是丝的声音。」',
      '焚身道': '🔥 「焚身道的圣火已在你丹田种下。从今日起，你的血是流动的焰——烧自己，也烧敌人。圣火不灭，焚身证道。」',
      '逍遥驿': '🎨 「逍遥驿不收弟子，只收过客。从今日起，天下之大，唯自由不可拘。他日你若想回头，驿门永远开着。」',
      '药王谷': '☠ 「药王谷的丹房为你敞开。从今日起，万毒皆你可控之物。剂量定生死——毒即是药，药即是毒。只是偶尔，毒会自己加一味。」',
      '血禅寺': '🩸 「血禅寺的戒刀在你掌心划了一道。从今日起，你的血与禅合而为一。猎头的路，只进不退——除非你不再是你。」',
      '镜阁': '🔱 「镜阁之中，万镜同照。从今日起，对手的手段皆可映回。只是照得越久，镜中之人越不像是你。」',
      '归墟': '🌑 「归墟——世界的尽头，亦是始处。从今日起，你行走在生与死的边界。归墟不收活人——但你也不是全然活着。」',
      '青囊庐': '💚 「青囊庐悬壶济世。从今日起，你的手即是救人之手。只是救回来的人，偶尔会说自己不该醒来。」',
      '傀坊': '🤖 「傀坊的机关为你转了起来。从今日起，108具傀儡任你驱使。只是其中一具，你造的时候不记得给它写了什么——但它动了。」',
      '散修': '⚡ 「你重新踏上了散修的路。天下之大，无拘无束。但无人告诉你——散修看得最多，也最容易看见不该看见的东西。」'
    };
    const msg = ceremonies[name] || ('⚡ 「你已加入' + name + '。前路漫漫，江湖险恶，望君保重。」');
    if (oldFaction !== '散修' && oldFaction !== name) {
      this.addLog('⚠ 你脱离了' + oldFaction + '，加入了' + name + '。', 'system');
    }
    this.addLog(msg, 'breakthrough');

    // 入帮自动获取入门技能
    if (name !== '散修') {
      const faction = this.FACTIONS[name];
      if (faction && faction.skills) {
        const starterSkills = faction.skills.filter(sk => sk.minLevel === 0);
        if (starterSkills.length > 0) {
          this.addLog('📖 拜入' + name + '，习得入门武学：', 'special');
          starterSkills.forEach(sk => {
            if (!s.skills[sk.id]) {
              s.skills[sk.id] = { level: 1, exp: 0 };
              this.addLog('   「' + sk.name + '」Lv.1', 'info');
            }
          });
        }
      }
    } else {
      if (this.ROGUE_SKILLS && this.ROGUE_SKILLS.skills) {
        const rSkills = this.ROGUE_SKILLS.skills.filter(sk => sk.minLevel === 0);
        if (rSkills.length > 0) {
          this.addLog('📖 自行研习基础功法：', 'special');
          rSkills.forEach(sk => {
            if (!s.skills[sk.id]) {
              s.skills[sk.id] = { level: 1, exp: 0 };
              this.addLog('   「' + sk.name + '」Lv.1', 'info');
            }
          });
        }
      }
    }

    this.renderer.updateUI();
    if (this.currentTab === 'wuxue') this.renderer.renderWuxue();
  }

  // ============ 武学系统 ============

  getSkillName(skillId) {
    const allFactions = { ...this.FACTIONS };
    if (this.ROGUE_SKILLS) allFactions['散修'] = this.ROGUE_SKILLS;
    for (const [fname, fdata] of Object.entries(allFactions)) {
      if (!fdata.skills) continue;
      const sk = fdata.skills.find(s => s.id === skillId);
      if (sk) return sk.name;
    }
    return skillId;
  }

  getSkillData(skillId) {
    const allFactions = { ...this.FACTIONS };
    if (this.ROGUE_SKILLS) allFactions['散修'] = this.ROGUE_SKILLS;
    for (const [fname, fdata] of Object.entries(allFactions)) {
      if (!fdata.skills) continue;
      const sk = fdata.skills.find(s => s.id === skillId);
      if (sk) return sk;
    }
    return null;
  }

  skillDetail(skillId) {
    const sk = this.getSkillData(skillId);
    const s = this.state;
    if (!sk) { this.addLog('武学典籍缺失。', 'system'); return; }
    const learned = s.skills[skillId];
    this.addLog('━━ 「' + sk.name + '」 ━━', 'special');
    this.addLog('类型：' + sk.type + ' | ' + (learned ? '已学 Lv.' + learned.level + ' EXP:' + Math.floor(learned.exp) : '未解锁'), 'info');
    if (sk.description) this.addLog(sk.description, 'event');
    if (sk.performs && sk.performs.length > 0) {
      this.addLog('绝招：', 'special');
      sk.performs.forEach(p => {
        this.addLog('  「' + p.name + '」—— ' + (p.description || ''), 'info');
      });
    }
    this.switchTab('wuxue');
  }

  practiceSkill(skillId) {
    const s = this.state;
    const sk = this.getSkillData(skillId);
    if (!sk) return;
    if (!s.skills[skillId]) { this.addLog('你尚未习得此武学。', 'system'); return; }
    const cost = 10 + s.skills[skillId].level * 3;
    if (s.spiritStones < cost) { this.addLog('灵石不足！修炼需要 ' + cost + ' 灵石。', 'combat'); return; }
    if (s.daoxin < 5) { this.addLog('道心涣散，无法专注修炼。', 'combat'); return; }
    s.spiritStones -= cost;
    s.daoxin = Math.max(0, s.daoxin - 5);
    const expGain = 10 + Math.floor(Math.random() * 20);
    s.skills[skillId].exp += expGain;
    const needExp = s.skills[skillId].level * 50;
    if (s.skills[skillId].exp >= needExp) {
      s.skills[skillId].exp -= needExp;
      s.skills[skillId].level++;
      this.addLog('🌟 「' + sk.name + '」突破至 Lv.' + s.skills[skillId].level + '！', 'breakthrough');
    } else {
      this.addLog('🧘 修炼「' + sk.name + '」EXP+' + expGain + '（' + Math.floor(s.skills[skillId].exp) + '/' + needExp + '）消耗 ' + cost + ' 灵石', 'info');
    }
    if (['sword','blade','cuff','strike','finger','staff','whip','claw','spear','hammer'].includes(sk.type)) {
      s.equippedSkill = skillId;
    }
    this.renderer.updateUI();
  }

  equipSkill(skillId) {
    if (!this.state.skills[skillId]) { this.addLog('尚未习得此武学。', 'system'); return; }
    this.state.equippedSkill = skillId;
    this.addLog('⚔ 装配「' + this.getSkillName(skillId) + '」为战斗主修武学。', 'info');
    this.renderer.updateUI();
  }

  unequipSkill() {
    this.state.equippedSkill = null;
    this.addLog('卸下装配武学。', 'info');
    this.renderer.updateUI();
  }

  // ============ 拜师系统 ============

  isAtFactionHQ(locationName, factionName) {
    const hqMap = {
      '梵网寺': ['忘尘峰'],
      '紫霞山': ['赤霞峰·观星台'],
      '剑巢': ['锈剑冢·地窟'],
      '蚁网': ['丝狱·盘丝窟', '汴河地下暗渠', '樊楼后院', '御街古井'],
      '焰心教': ['光明顶·焰心殿'],
      '逍遥驿': ['逍遥驿·车马院'],
      '毒巢': ['鼓楼西·地下丹房'],
      '血镰': ['血禅寺'],
      '斗转阁': ['镜阁·万镜堂', '樊楼·镜室'],
      '影墓': ['归墟洞', '大明宫废墟'],
      '药王谷': ['青囊庐', '紫禁城旧药房'],
      '机巧岛': ['鼓楼望气塔', '紫禁城实验室']
    };
    const hqs = hqMap[factionName] || [];
    return hqs.includes(locationName);
  }

  learnFromTeacher(teacherName) {
    const s = this.state;
    if (s.faction === '散修') { this.addLog('散修无师自通，自行研习即可。', 'system'); return; }
    const faction = this.FACTIONS[s.faction];
    if (!faction) return;
    const teacher = (faction.teachers || []).find(t => t.name === teacherName);
    if (!teacher) { this.addLog('此人不在本帮。', 'system'); return; }

    const teaches = Array.isArray(teacher.teaches) ? teacher.teaches : [];
    const teachableSkills = [];
    teaches.forEach(skillNameId => {
      const sk = faction.skills.find(sk => sk.name === skillNameId);
      if (sk && !s.skills[sk.id]) teachableSkills.push(sk);
    });

    if (teachableSkills.length === 0) {
      this.addLog(teacherName + '：「你所会已不在我之下，去找更高层的师傅吧。」', 'npc');
      return;
    }

    const teacherTier = faction.teachers.indexOf(teacher);
    const costs = [20, 80, 200];
    const cost = costs[Math.min(teacherTier, 2)] || 80;

    if (s.spiritStones < cost) {
      this.addLog(teacherName + '：「束脩不足。' + cost + '灵石，这是规矩。」', 'npc');
      return;
    }

    s.spiritStones -= cost;
    s.factionRep += 10;
    teachableSkills.forEach(sk => {
      s.skills[sk.id] = { level: 1, exp: 0 };
      this.addLog('📖 向' + teacherName + '习得「' + sk.name + '」！', 'special');
    });
    this.addLog('💰 支付束脩 ' + cost + ' 灵石。', 'item');
    this.renderer.updateUI();
  }

  // ============ 战斗系统 ============

  triggerEncounter(loc) {
    const name = pickEnemy(loc.danger);
    const data = this.ENEMIES ? this.ENEMIES[name] : getData().ENEMIES[name];
    if (!data) return;
    const dl = data.desc.length > 80 ? data.desc.substring(0, 80) + '…' : data.desc;
    this.addLog('⚔ 遭遇 <b style="color:#c05555;">' + name + '</b> —— ' + dl, 'combat');
    this.startCombat(name, data);
  }

  startCombat(name, data) {
    this.state.roundCount = 0;
    this.state.performCooldowns = {};
    this.state.combat = {
      enemyName: name, enemyHp: data.hp, enemyMaxHp: data.hp,
      enemyAtk: data.atk, enemyDef: data.def, enemyData: data
    };
    document.getElementById('combat-modal').classList.add('active');
    this.renderer.updateCombatUI();
  }

  combatAction(action) {
    if (!this.state.combat) return;
    const c = this.state.combat, s = this.state;
    switch (action) {
      case 'attack': {
        let skillBonus = 0;
        if (s.equippedSkill && s.skills[s.equippedSkill]) {
          skillBonus = s.skills[s.equippedSkill].level * 2;
        }
        const dmg = Math.max(1, s.attack + (s.equipment.weapon ? s.equipment.weapon.atk : 0) + skillBonus + Math.floor(Math.random() * 10) + s.realm * 2 - c.enemyDef);
        c.enemyHp -= dmg;
        this.addLog('⚔ 你挥出一击，造成 ' + dmg + ' 点伤害！' + (skillBonus > 0 ? '（武学加成+' + skillBonus + '）' : ''), 'combat');
        break;
      }
      case 'skill': {
        this.showPerforms();
        return;
      }
      case 'defend': {
        let defBonus = 0;
        if (s.equippedSkill && s.skills[s.equippedSkill]) {
          const skData = this.getSkillData(s.equippedSkill);
          if (skData && skData.defenseBonus) defBonus = Math.floor(skData.defenseBonus * s.skills[s.equippedSkill].level / 100);
        }
        s.hp = Math.min(s.maxHp, s.hp + Math.floor(s.maxHp * 0.1) + defBonus);
        this.addLog('🛡 凝神守势，稳固体魄，恢复少量生命。' + (defBonus > 0 ? '（武学防御+' + defBonus + '）' : ''), 'combat');
        break;
      }
      case 'flee': {
        let dodgeBonus = 0;
        for (const [skId, skState] of Object.entries(s.skills)) {
          const skData = this.getSkillData(skId);
          if (skData && skData.type === 'dodge') {
            dodgeBonus = Math.max(dodgeBonus, skState.level * 0.03);
          }
        }
        if (Math.random() < 0.4 + s.realm * 0.05 + dodgeBonus) {
          this.addLog('🏃 抓住间隙，成功脱身！' + (dodgeBonus > 0 ? '（轻功+成）' : ''), 'info');
          this.endCombat(false);
          return;
        } else {
          this.addLog('🏃 遁走失败！', 'combat');
        }
        break;
      }
    }
    if (c.enemyHp <= 0) {
      s.roundCount++;
      const exp = c.enemyData.exp + (c.enemyData.boss ? 50 : 0);
      const gold = c.enemyData.gold;
      s.cultivation += exp;
      s.spiritStones += gold;
      s.killCount++;
      this.addLog('💀 <b>' + c.enemyName + '</b> 毙于你手！', 'breakthrough');
      this.addLog('   得 ' + exp + ' 修为，' + gold + ' 灵石', 'item');
      if (c.enemyData.boss && c.enemyData.special) {
        this.addLog('🏆 ' + c.enemyData.special, 'special');
      }
      this.checkQuestProgress('kill', c.enemyName);
      this.endCombat(true);
      return;
    }
    s.roundCount++;
    const eDmg = Math.max(1, c.enemyAtk + Math.floor(Math.random() * 8) - s.defense - (s.equipment.armor ? s.equipment.armor.def : 0));
    s.hp -= eDmg;
    this.addLog('👊 ' + c.enemyName + ' 反击，造成 ' + eDmg + ' 点伤害！', 'combat');
    if (s.hp <= 0) { s.hp = 0; this.gameOver('力战不敌，殒命于此'); return; }
    this.renderer.updateCombatUI();
  }

  showPerforms() {
    const s = this.state;
    const c = s.combat;
    if (!c) return;
    const list = document.getElementById('perform-list');
    if (!list) return;

    const available = [];
    const allFactions = { ...this.FACTIONS };
    if (this.ROGUE_SKILLS) allFactions['散修'] = this.ROGUE_SKILLS;

    for (const [skillId, skillState] of Object.entries(s.skills)) {
      const sk = this.getSkillData(skillId);
      if (!sk || !sk.performs) continue;
      sk.performs.forEach(p => {
        const minLvl = p.requirements ? parseInt((String(p.requirements).match(/(\d+)/) || ['0'])[0]) || 0 : 0;
        if (skillState.level >= minLvl) {
          available.push({ perform: p, skillName: sk.name, skillId, level: skillState.level });
        }
      });
    }

    if (available.length === 0) {
      list.innerHTML = '<div style="color:#6e5c50;text-align:center;padding:8px">尚无可用绝招。修炼武学以解锁绝招。</div>';
    } else {
      const morale = Math.floor(s.daoxin / 2);
      let html = '<div style="font-size:10px;color:#6e5c50;margin-bottom:4px">气势：' + morale + '（道心）| 回合：' + (s.roundCount || 1) + '</div>';
      available.forEach(({perform, skillName, skillId, level}) => {
        const cd = s.performCooldowns[perform.id];
        const cdLeft = cd ? Math.max(0, perform.cooldown - (s.roundCount - cd)) : 0;
        const onCd = cdLeft > 0;
        const moraleCost = perform.moraleCost || perform.qiCost || 25;
        html += '<div class="perform-item' + (onCd ? ' on-cd' : '') + '" data-perform="' + perform.id + '"><div class="pname">' + perform.name + ' <span style="font-size:10px;color:#5a4a68">(' + skillName + ' Lv.' + level + ')</span></div><div class="pdesc">' + (perform.description || '').substring(0, 60) + '</div><div class="pcost">气势 ' + moraleCost + ' | CD ' + perform.cooldown + '回合' + (onCd ? ' | ⏳冷却中(' + cdLeft + '回合)' : '') + '</div></div>';
      });
      list.innerHTML = html;

      // 绑定点击
      list.querySelectorAll('[data-perform]').forEach(el => {
        if (!el.classList.contains('on-cd')) {
          el.addEventListener('click', () => this.usePerform(el.dataset.perform));
        }
      });
    }

    document.getElementById('perform-area').style.display = 'block';
    document.querySelector('#combat-modal .combat-actions').style.display = 'none';
  }

  hidePerforms() {
    document.getElementById('perform-area').style.display = 'none';
    document.querySelector('#combat-modal .combat-actions').style.display = 'grid';
  }

  usePerform(performId) {
    if (!this.state.combat) return;
    const s = this.state, c = s.combat;

    const allFactions = { ...this.FACTIONS };
    if (this.ROGUE_SKILLS) allFactions['散修'] = this.ROGUE_SKILLS;
    let performData = null, skillData = null;
    for (const [fname, fdata] of Object.entries(allFactions)) {
      if (!fdata.skills) continue;
      for (const sk of fdata.skills) {
        if (!sk.performs) continue;
        const p = sk.performs.find(p => p.id === performId);
        if (p) { performData = p; skillData = sk; break; }
      }
      if (performData) break;
    }
    if (!performData) return;

    const moraleCost = performData.moraleCost || performData.qiCost || 25;
    const morale = Math.floor(s.daoxin / 2);
    if (morale < moraleCost) {
      this.addLog('气势不足！（需要 ' + moraleCost + '，当前 ' + morale + '）', 'combat');
      return;
    }

    const lastUsed = s.performCooldowns[performId];
    if (lastUsed && s.roundCount - lastUsed < (performData.cooldown || 4)) {
      this.addLog('绝招冷却中…', 'combat');
      return;
    }

    s.performCooldowns[performId] = s.roundCount;
    s.daoxin = Math.max(0, s.daoxin - Math.floor(moraleCost / 2));

    const skillLvl = s.skills[skillData.id] ? s.skills[skillData.id].level : 1;
    const baseDmg = s.attack + (s.equipment.weapon ? s.equipment.weapon.atk : 0) + skillLvl * 2;
    const dmgMultiplier = 1.2 + skillLvl * 0.02;
    const dmg = Math.max(1, Math.floor(baseDmg * dmgMultiplier) + Math.floor(Math.random() * 20) + s.realm * 3 - c.enemyDef);
    c.enemyHp -= dmg;

    this.addLog('🔥 施展「' + performData.name + '」！造成 ' + dmg + ' 点伤害！', 'combat');
    if (performData.effects) this.addLog('   ' + performData.effects, 'event');

    if (c.enemyHp <= 0) {
      s.roundCount++;
      const exp = c.enemyData.exp + (c.enemyData.boss ? 50 : 0);
      const gold = c.enemyData.gold;
      s.cultivation += exp;
      s.spiritStones += gold;
      s.killCount++;
      this.addLog('💀 <b>' + c.enemyName + '</b> 毙于你手！', 'breakthrough');
      this.addLog('   得 ' + exp + ' 修为，' + gold + ' 灵石', 'item');
      this.checkQuestProgress('kill', c.enemyName);
      this.endCombat(true);
      return;
    }

    this.enemyTurn();
    this.hidePerforms();
    this.renderer.updateCombatUI();
  }

  enemyTurn() {
    const s = this.state, c = s.combat;
    if (!c) return;
    const eDmg = Math.max(1, c.enemyAtk + Math.floor(Math.random() * 8) - s.defense - (s.equipment.armor ? s.equipment.armor.def : 0));
    s.hp -= eDmg;
    s.roundCount++;
    this.addLog('👊 ' + c.enemyName + ' 反击，造成 ' + eDmg + ' 点伤害！', 'combat');
    if (s.hp <= 0) { s.hp = 0; this.gameOver('力战不敌，殒命于此'); return; }
  }

  endCombat(victory) {
    this.state.combat = null;
    document.getElementById('combat-modal').classList.remove('active');
    this.renderer.updateUI();
    if (victory) this.checkBreakthrough();
  }

  applyReward(rewardStr) {
    const s = this.state;
    const parts = rewardStr.split(';');
    for (const part of parts) {
      const [key, val] = part.split(':');
      if (key === 'gain_gold') s.spiritStones += parseInt(val);
      else if (key === 'gain_cultivation') s.cultivation += parseInt(val);
      else if (key === 'daoxin') s.daoxin = Math.min(s.maxDaoXin, s.daoxin + parseInt(val));
      else if (key === 'heal' || key === 'hp') s.hp = Math.min(s.maxHp, s.hp + (parseInt(val) || 30));
      else if (key === 'random_item') {
        const it = this.ITEMS[Math.floor(Math.random() * this.ITEMS.length)];
        s.inventory.push({ ...it });
        this.addLog('📦 获得：<b>' + it.name + '</b>', 'item');
      } else if (key === 'random_technique') {
        const techItems = this.ITEMS.filter(it => it.type === 'technique');
        if (techItems.length > 0) {
          const ti = techItems[Math.floor(Math.random() * techItems.length)];
          s.inventory.push({ ...ti });
          this.addLog('📖 获得功法：<b>' + ti.name + '</b>', 'special');
        }
      }
    }
  }

  // ============ 搜索系统 ============

  searchArea() {
    if (this.state.combat || this.state.npcEncounter) { this.addLog('当前无法搜寻！', 'system'); return; }
    const room = this.state.location;
    const data = this.ROOM_SEARCH[room];
    if (!data) { this.addLog('🔍 四下搜寻了一番，未发现特别之物。', 'system'); return; }

    if (Math.random() > data.searchChance) {
      this.addLog('🔍 四下搜寻了一番，未发现特别之物。', 'system');
      this.renderer.updateUI();
      return;
    }

    const pool = data.results.filter(r => r.chance < 1.0 || r.type === 'nothing');
    const totalWeight = pool.reduce((sum, r) => sum + (r.chance || 1), 0);
    let rand = Math.random() * totalWeight;
    let picked = pool[pool.length - 1];

    for (const r of pool) {
      rand -= (r.chance || 1);
      if (rand <= 0) { picked = r; break; }
    }

    const s = this.state;

    if (picked.type === 'money') {
      const [min, max] = picked.amount.split('-').map(Number);
      const amt = min + Math.floor(Math.random() * (max - min + 1));
      s.spiritStones += amt;
      this.addLog('💰 ' + picked.desc + '（+' + amt + ' 灵石）', 'item');
    } else if (picked.type === 'daoxin') {
      s.daoxin = Math.min(s.maxDaoXin, s.daoxin + (picked.amount || 10));
      this.addLog('🧘 ' + picked.desc, 'info');
    } else if (picked.type === 'hp') {
      s.hp = Math.min(s.maxHp, s.hp + (picked.amount || 15));
      this.addLog('💊 ' + picked.desc, 'item');
    } else if (picked.type === 'cultivation') {
      s.cultivation += (picked.amount || 10);
      this.addLog('✨ ' + picked.desc, 'info');
    } else if (picked.type === 'find_type') {
      const it = this.pickItemByType(picked.itemType);
      if (it) {
        s.inventory.push({ ...it });
        this.addLog('📦 ' + picked.desc.replace('了点东西', '：<b>' + it.name + '</b>').replace('了', '了：<b>' + it.name + '</b>'), 'item');
      } else {
        this.addLog('🔍 ' + picked.desc, 'system');
      }
    } else {
      this.addLog('🔍 ' + picked.desc, 'system');
    }

    this.checkQuestProgress('find', null);
    this.renderer.updateUI();
  }

  pickItemByType(type) {
    if (type === 'random') return this.ITEMS[Math.floor(Math.random() * this.ITEMS.length)];
    const pool = this.ITEMS.filter(i => i.type === type);
    if (pool.length === 0) return this.ITEMS[Math.floor(Math.random() * this.ITEMS.length)];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ============ 任务系统 ============

  startQuest(questId) {
    const s = this.state;
    if (s.activeQuests.includes(questId) || s.completedQuests.includes(questId)) return;
    s.activeQuests.push(questId);
    s.questStages[questId] = 0;
    const q = this.QUESTS.find(q => q.id === questId);
    if (q) {
      this.addLog('📜 接受任务：<b>' + q.name + '</b>', 'quest');
      this.addLog('   ' + q.desc, 'quest');
      this.addLog('   阶段 1/' + q.stages.length + '：' + q.stages[0].desc, 'quest');
    }
    this.renderer.updateUI();
  }

  checkQuestProgress(type, target) {
    const s = this.state;
    for (const qId of s.activeQuests) {
      const q = this.QUESTS.find(q => q.id === qId);
      if (!q) continue;
      const stage = s.questStages[qId] || 0;
      if (stage >= q.stages.length) continue;
      const curStage = q.stages[stage];

      let advance = false;
      if (curStage.type === 'go' && type === 'go') advance = true;
      else if (curStage.type === 'kill' && type === 'kill') advance = true;
      else if (curStage.type === 'encounter' && type === 'kill') advance = true;
      else if (curStage.type === 'find' && type === 'find') advance = true;
      else if (curStage.type === 'collect' && type === 'find') advance = true;
      else if (curStage.type === 'investigate' && type === 'go') advance = true;
      else if (curStage.type === 'return' && type === 'go') advance = true;
      else if (curStage.type === 'talk' && type === 'go') advance = true;
      else if ((curStage.type === 'dialogue' || curStage.type === 'deliver' || curStage.type === 'find_clue') && type === 'go') advance = true;
      else if (curStage.type === 'choice' && type === 'go') advance = true;
      else if (curStage.type === 'escort' && type === 'go') advance = true;

      if (advance || (curStage.repeat && type === 'kill')) {
        s.questStages[qId] = stage + 1;
        if (stage + 1 < q.stages.length) {
          this.addLog('📜 任务「' + q.name + '」更新：' + q.stages[stage + 1].desc, 'quest');
        } else {
          this.completeQuest(qId);
        }
      }
    }
  }

  completeQuest(questId) {
    const s = this.state;
    const q = this.QUESTS.find(q => q.id === questId);
    if (!q) return;

    this.addLog('🏆 任务完成：<b>' + q.name + '</b>！', 'breakthrough');

    if (q.rewards.spiritStones) { s.spiritStones += q.rewards.spiritStones; this.addLog('   获得 ' + q.rewards.spiritStones + ' 灵石', 'item'); }
    if (q.rewards.cultivation) { s.cultivation += q.rewards.cultivation; this.addLog('   获得 ' + q.rewards.cultivation + ' 修为', 'item'); }
    if (q.rewards.technique) { if (!s.techniques.includes(q.rewards.technique)) { s.techniques.push(q.rewards.technique); this.addLog('   习得功法：' + q.rewards.technique, 'special'); } }
    if (q.rewards.equipment) { s.inventory.push({ name: q.rewards.equipment, type: 'equipment', desc: '任务奖励', slot: 'weapon', atk: 10 }); this.addLog('   获得装备：' + q.rewards.equipment, 'special'); }
    if (q.rewards.item) { s.inventory.push({ name: q.rewards.item, type: 'special', desc: '任务奖励' }); this.addLog('   获得：' + q.rewards.item, 'item'); }
    if (q.rewards.faction) this.joinFaction(q.rewards.faction);
    if (q.rewards.factionRep) { s.factionRep += q.rewards.factionRep; this.addLog('   门忠 +' + q.rewards.factionRep, 'info'); }

    s.activeQuests = s.activeQuests.filter(id => id !== questId);
    s.completedQuests.push(questId);
    this.checkBreakthrough();
    this.renderer.updateUI();
  }

  // ============ 地图 ============

  toggleMap() {
    this.mapOpen = !this.mapOpen;
    const mc = document.getElementById('map-card');
    if (this.mapOpen) {
      mc.classList.add('visible');
      this.renderer.renderMap();
      setTimeout(() => {
        const pos = this.MAP_POS[this.state.location];
        if (pos) {
          const cont = document.getElementById('map-container');
          cont.scrollLeft = pos.x * 10 - cont.clientWidth / 2;
          cont.scrollTop = pos.y * 10 - cont.clientHeight / 2;
        }
      }, 100);
    } else {
      mc.classList.remove('visible');
    }
  }

  // ============ 日常动作 ============

  switchTab(tab) {
    this.currentTab = tab;
    this.tabManager.switchTo(tab);
  }

  meditate() {
    if (this.state.combat || this.state.npcEncounter) { this.addLog('当前无法打坐！', 'combat'); return; }
    const s = this.state;
    const base = 10 + s.realm * 3;
    s.cultivation += base;
    s.daoxin = Math.min(s.maxDaoXin, s.daoxin + 3);
    this.addLog('🧘 静心打坐，获得 ' + base + ' 点修为，道心稍安。', 'info');
    this.checkBreakthrough();
    this.renderer.updateUI();
  }

  rest() {
    if (this.state.combat || this.state.npcEncounter) { this.addLog('当前无法休憩！', 'combat'); return; }
    const s = this.state;
    s.isResting = !s.isResting;
    this.addLog(s.isResting ? '💤 你寻了一处角落蜷起身子…' : '🔔 休憩结束，继续前行。', 'info');
    this.renderer.updateUI();
  }

  talk() {
    if (this.state.combat || this.state.npcEncounter) { this.addLog('当前无法与人交谈！', 'combat'); return; }
    const s = this.state;
    const loc = this.LOCATIONS[s.location];
    if (loc.danger >= 5) { this.addLog('此地凶险万分，不是闲谈之所。趁未被发觉，速离为妙。', 'system'); return; }
    this.addLog('💬 你环顾四周，上前搭话…', 'info');
    this.triggerNPCEncounter(true);
  }

  askAround() {
    if (this.state.combat || this.state.npcEncounter) { this.addLog('当前无法打听！', 'combat'); return; }
    const s = this.state;
    const loc = this.LOCATIONS[s.location];
    if (!loc) return;
    if (loc.danger >= 5) { this.addLog('此地无人可问，只有死亡的寂静。', 'system'); return; }

    const nearby = loc.connections ? Object.entries(loc.connections).filter(e => this.LOCATIONS[e[1]]).map(e => ({dir: e[0], name: e[1], loc: this.LOCATIONS[e[1]]})) : [];
    const rumors = [];

    if (nearby.length > 0) {
      const n1 = nearby[Math.floor(Math.random() * nearby.length)];
      rumors.push('「往' + this.dirName(n1.dir) + '走，能到<b>' + n1.name + '</b>。」一个路人给你指了指路。');
      if (n1.loc.danger >= 5) rumors.push('「' + n1.name + '那边最近不太平，听说了没？好几个江湖客进去就没回来。」路人压低声音说道。');
    }

    if (s.activeQuests.length > 0) {
      const q = this.QUESTS.find(q => q.id === s.activeQuests[0]);
      if (q) {
        const stage = s.questStages[q.id] || 0;
        if (stage < q.stages.length) rumors.push('你在打听中想起了手头的任务：<b>' + q.name + '</b>——' + q.stages[Math.min(stage, q.stages.length - 1)].desc);
      }
    }

    rumors.push('「听说顺天府鬼市里有个卦师，什么消息都能算出来——只要出得起价。」');
    rumors.push('「忘尘宗的山门就在城外的某座山上。但没人找得到——据说要道心足够稳才能看见。」');
    rumors.push('「最近城里的灵脉波动很不对劲。路边的野猫都跑了。晚上别走小巷。」');
    rumors.push('「城外废墟里埋着不少好东西。但也在那些东西的视线里。别独自去。」');
    rumors.push('「血禅寺和丝狱最近在抢地盘。暗街一带最好绕道走——那不是给人走的街。」');

    const encPool = this.NPC_ENCOUNTERS[s.location];
    if (encPool && encPool.length > 0) {
      const questEnc = encPool.filter(e => e.questTrigger || (e.results && e.results.some(r => r.questStart)));
      if (questEnc.length > 0) rumors.push('「此地似乎有人能给你些活计。跟人<b>交谈</b>看看？」');
    }

    this.addLog('👂 ' + rumors[Math.floor(Math.random() * rumors.length)], 'info');
    this.renderer.updateUI();
  }

  pushup() {
    if (this.state.combat || this.state.npcEncounter) { this.addLog('当前无法练功！', 'combat'); return; }
    const s = this.state;
    const gain = Math.max(1, Math.floor(5 + s.realm * 1.5));
    s.cultivation += gain;
    s.daoxin = Math.max(0, s.daoxin - 2);
    this.addLog('💪 你寻了一处空地站桩练功，浑身发热。修为+' + gain + '（道心-2）', 'info');
    s.hp = Math.max(0, s.hp - 3);
    if (s.hp <= 0) { s.hp = 0; this.gameOver('练功走火入魔，力竭而亡'); return; }
    this.checkBreakthrough();
    this.renderer.updateUI();
  }

  peek() {
    if (this.state.combat || this.state.npcEncounter) { this.addLog('当前无法窥探！', 'combat'); return; }
    const s = this.state;
    const loc = this.LOCATIONS[s.location];
    if (!loc) { this.addLog('眼前一片虚无…', 'system'); return; }

    const obs = [];
    const dangerDesc = loc.danger <= 1 ? '街巷安宁，偶有路人经过。' :
      loc.danger <= 2 ? '隐约有些江湖人在街边低声交谈。' :
      loc.danger <= 3 ? '暗处有几双眼睛在打量你。' :
      loc.danger <= 4 ? '空气凝重，远处传来不寻常的动静。' :
      '此地杀气弥漫，处处危机。';
    obs.push(dangerDesc);

    if (loc.connections) {
      const dirs = Object.entries(loc.connections);
      if (dirs.length > 0) obs.push('可见通路：' + dirs.map(d => '<b>' + d[1] + '</b>（' + this.dirName(d[0]) + '）').join('、'));
    }

    if (loc.boss) obs.push('⚠ 远处强大的气息…有一名高手盘踞此地。');
    if (this.ROOM_SEARCH[s.location]) obs.push('搜索此处约有<b>' + Math.floor(this.ROOM_SEARCH[s.location].searchChance * 100) + '%</b>概率有所发现。');
    if (this.NPC_ENCOUNTERS[s.location] && this.NPC_ENCOUNTERS[s.location].length > 0) obs.push('附近有<b>' + this.NPC_ENCOUNTERS[s.location].length + '</b>种可能的奇遇。输入「交谈」试试。');
    if (s.faction && s.faction !== '散修' && this.isAtFactionHQ(s.location, s.faction)) obs.push('🏫 你正在本帮据点——可向师傅<b>拜师</b>学习新武学！');

    this.addLog('👀 你凝神观察四周…', 'system');
    obs.forEach(o => this.addLog('   ' + o, 'info'));
    this.renderer.updateUI();
  }

  practiceMenu() {
    if (this.state.combat || this.state.npcEncounter) { this.addLog('当前无法练武！', 'combat'); return; }
    const s = this.state;
    const learned = Object.keys(s.skills);
    if (learned.length === 0) { this.addLog('你尚未掌握任何武学。先拜入帮派习得入门武学吧。', 'system'); return; }
    this.addLog('📖 可修炼武学：', 'info');
    learned.forEach(sid => {
      const sn = this.getSkillName(sid);
      const lv = s.skills[sid].level;
      const exp = s.skills[sid].exp;
      const need = lv * 50;
      const cost = 10 + lv * 3;
      this.addLog('  「' + sn + '」Lv.' + lv + ' EXP:' + Math.floor(exp) + '/' + need + ' 修炼消耗:' + cost + '灵石', 'info');
    });
    this.addLog('💡 在「武学」面板中点击技能进行修炼。', 'system');
  }

  askTeacher() {
    if (this.state.combat || this.state.npcEncounter) { this.addLog('当前无法拜师！', 'combat'); return; }
    const s = this.state;
    if (s.faction === '散修') { this.addLog('散修无师自通——自行研习便是。', 'system'); return; }
    if (!this.isAtFactionHQ(s.location, s.faction)) { this.addLog('此处非本帮据点，无法拜师。去帮派总部看看吧。', 'system'); return; }
    const faction = this.FACTIONS[s.faction];
    if (!faction || !faction.teachers) { this.addLog('宗派名录异常。', 'system'); return; }
    this.addLog('🏫 ' + s.faction + '师傅列表：', 'info');
    faction.teachers.forEach(t => {
      const teaches = Array.isArray(t.teaches) ? t.teaches.length + '项武学' : '多项';
      this.addLog('  「' + t.name + '」—— ' + t.title + ' （授' + teaches + '）', 'info');
    });
    this.addLog('💡 在「武学」面板中点击师傅名字旁的「拜师」按钮。', 'system');
    this.switchTab('wuxue');
  }

  // ============ 物品系统 ============

  useItem(index) {
    const s = this.state;
    if (s.combat) { this.addLog('交战中无法使用物品！', 'combat'); return; }
    if (index >= s.inventory.length) return;
    const item = s.inventory[index];

    if (item.type === 'consumable') {
      if (item.effect === 'daoxin') s.daoxin = Math.min(s.maxDaoXin, s.daoxin + (item.value || 20));
      else if (item.effect === 'hp') s.hp = Math.min(s.maxHp, s.hp + (item.value || 30));
      else if (item.effect === 'cultivation') s.cultivation += (item.value || 30);
      else if (item.effect === 'breakthrough') s.cultivation += this.REALMS[Math.min(s.realm + 1, this.REALMS.length - 1)].cost * 0.4;
      else s.hp = Math.min(s.maxHp, s.hp + 20);
      this.addLog('💊 使用 ' + item.name + '。', 'item');
      s.inventory.splice(index, 1);
    } else if (item.type === 'equip' || item.type === 'equipment') {
      if (item.slot === 'weapon') {
        if (s.equipment.weapon) s.inventory.push(s.equipment.weapon);
        s.equipment.weapon = item;
      } else if (item.slot === 'armor') {
        if (s.equipment.armor) s.inventory.push(s.equipment.armor);
        s.equipment.armor = item;
      }
      s.inventory.splice(index, 1);
      this.addLog('⚡ 装备 ' + item.name + '！', 'special');
    } else if (item.type === 'technique') {
      if (!s.techniques.includes(item.name)) {
        s.techniques.push(item.name);
        this.addLog('📖 研习 ' + item.name + '！', 'special');
      }
      s.inventory.splice(index, 1);
    } else if (item.type === 'stone') {
      s.spiritStones += (item.value || 5);
      s.inventory.splice(index, 1);
      this.addLog('💰 汲取 ' + item.name + '，获得 ' + (item.value || 5) + ' 灵石。', 'item');
    } else if (item.type === 'special') {
      this.addLog('📿 ' + item.name + '——一件特殊之物，尚不知其用途。', 'special');
    }
    this.renderer.updateUI();
    this.checkBreakthrough();
  }

  // ============ 游戏结束 ============

  gameOver(reason) {
    this.timer.stop();
    this.state.combat = null;
    this.state.npcEncounter = null;
    document.getElementById('combat-modal').classList.remove('active');
    document.getElementById('npc-modal').classList.remove('active');

    const s = this.state;
    const t = Math.floor((Date.now() - s.gameStart) / 1000);
    const mins = Math.floor(t / 60), secs = t % 60;

    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.innerHTML = '<div class="modal-box"><h2>💀 ' + reason + '</h2>' +
      '<p>最终境界：' + this.REALMS[s.realm].name + '</p>' +
      '<p>斩杀：' + s.killCount + ' | 灵石：' + s.spiritStones + '</p>' +
      '<p>任务完成：' + s.completedQuests.length + '</p>' +
      '<p>所学：' + (s.techniques.length > 0 ? s.techniques.join('、') : '无') + '</p>' +
      '<p>修行时长：' + mins + '分' + secs + '秒 | 总修为：' + s.totalCultivation + '</p>' +
      '<p>探索区域：' + s.explored.length + ' / ' + Object.keys(this.LOCATIONS).length + '</p>' +
      '<button class="btn-restart" id="btn-restart">再入江湖</button></div>';
    document.body.appendChild(ov);

    document.getElementById('btn-restart').addEventListener('click', () => {
      this.storage.clear();
      location.reload();
    });

    this.renderer.updateUI();
  }

  // ============ 命令处理 ============

  processCommand(cmd) {
    if (['北', 'north', 'n', '向北'].includes(cmd)) this.explore('north');
    else if (['南', 'south', 's', '向南'].includes(cmd)) this.explore('south');
    else if (['东', 'east', 'e', '向东'].includes(cmd)) this.explore('east');
    else if (['西', 'west', 'w', '向西'].includes(cmd)) this.explore('west');
    else if (['打坐', '修炼', 'meditate'].includes(cmd)) this.meditate();
    else if (['搜寻', '搜索', 'search', '探索'].includes(cmd)) this.searchArea();
    else if (['休憩', '休息', 'rest'].includes(cmd)) this.rest();
    else if (['交谈', '谈话', 'talk', '聊聊', '聊天', '搭话'].includes(cmd)) this.talk();
    else if (['打听', '问询', 'ask', '消息', '问路'].includes(cmd)) this.askAround();
    else if (['练功', '锻炼', 'pushup', '站桩'].includes(cmd)) this.pushup();
    else if (['观察', '窥探', 'peek', '瞭望', 'look', '看'].includes(cmd)) this.peek();
    else if (['练武', '修炼武学', 'practice'].includes(cmd)) this.practiceMenu();
    else if (['拜师', 'teacher'].includes(cmd)) this.askTeacher();
    else if (['地图', 'map'].includes(cmd)) this.toggleMap();
    else if (['境况', '状态', 'status', 'stats'].includes(cmd)) this.switchTab('status');
    else if (['行囊', '背包', '包裹', 'inventory', 'inv', 'bag'].includes(cmd)) this.switchTab('bag');
    else if (['任务', 'quest', 'quests', 'mission'].includes(cmd)) this.switchTab('quest');
    else if (['人物', 'char'].includes(cmd)) this.switchTab('char');
    else if (['武学', 'wuxue', 'skill', 'skills'].includes(cmd)) this.switchTab('wuxue');
    else if (['位置', 'location', 'loc'].includes(cmd)) {
      const loc = this.LOCATIONS[this.state.location];
      this.addLog('📍 当前位置：<b>' + this.state.location + '</b>', 'info');
      if (loc) { this.addLog('   ' + this.getDesc(loc), 'info'); this.addLog('   危险：' + '★'.repeat(loc.danger || 0), 'info'); }
    } else if (['帮助', 'help', '?', '？', 'h'].includes(cmd)) {
      this.addLog('┏━━ 江 湖 须 知 ━━┓', 'system');
      this.addLog('┃ 🧭 移动：北/南/东/西', 'system');
      this.addLog('┃ 🧘 打坐 · 🔍 搜索 · 💤 休憩', 'system');
      this.addLog('┃ 💬 交谈 · 👂 打听 · 💪 练功 · 👀 窥探', 'system');
      this.addLog('┃ 🙇 拜师 · 📖 练武 · 🏯 武学', 'system');
      this.addLog('┃ 🗺 地图 · 📋 境况 · 📦 包裹', 'system');
      this.addLog('┃ 👤 人物 · 📜 任务：查看修为/任务', 'system');
      this.addLog('┃ 📖 探索：' + this.state.explored.length + '/' + Object.keys(this.LOCATIONS).length + ' 间', 'system');
      this.addLog('┃ 💡 在城里「交谈」遇奇遇、「打听」得情报', 'system');
      this.addLog('┃ 💡 「搜索」有概率得金银器物', 'system');
      this.addLog('┗━━━━━━━━━━━━━━━━┛', 'system');
    } else {
      this.addLog('不明指令：' + cmd + '。输入"帮助"查看可用命令。', 'system');
    }
    this.renderer.updateUI();
  }

  // ============ 日志 ============

  addLog(text, type) {
    this.renderer.addLog(text, type);
  }
}
