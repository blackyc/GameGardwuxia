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
import { ROOM_ID_MIGRATION } from './data/room_id_migration.js';
import { Timer } from './core/timer.js';
import { TabManager } from './core/tabmanager.js';
import { ResourcePool } from './core/respool.js';
import { Storage } from './core/storage.js';
import { InputManager } from './ui/input.js';
import { Renderer } from './ui/renderer.js';
// 战斗门面层（从 Game 拆出，代理 startCombat/combatAction/skill 等）
import { CombatFacade } from './combat_facade.js';
// 任务服务层（从 Game 拆出，代理 startQuest/checkQuestProgress/completeQuest/applyReward）
import { QuestService } from './quest_service.js';
// 移动服务层（从 Game 拆出，代理 explore/dirName/quickTravel）
import { MovementService } from './movement_service.js';
// NPC 服务层（从 Game 拆出，代理 triggerNPCEncounter/speakToNpc/npcChoice/closeNPC）
import { NpcService } from './npc_service.js';
// 搜索服务层（从 Game 拆出，代理 searchArea/pickItemByType）
import { SearchService } from './search_service.js';
// 帮派服务层（从 Game 拆出，代理 joinFaction）
import { FactionService } from './faction_service.js';
// 拜师服务层（从 Game 拆出，代理 isAtFactionHQ/learnFromTeacher/askTeacher）
import { TeacherService } from './teacher_service.js';
// 感知服务层（从 Game 拆出，代理 peek/getRoomPerception/openPerception/closePerception）
import { PerceptionService } from './perception_service.js';
// 日常动作服务层（从 Game 拆出，代理 switchTab/cultivate/train/rest/talk/askAround/practiceMenu）
import { ActionService } from './action_service.js';
// 物品服务层（从 Game 拆出，代理 useItem）
import { ItemService } from './item_service.js';
// 游戏结束/命令处理服务层
import { GameOverService } from './game_over_service.js';
// 开场 cinematic（批次H · T7.1/T7.2）
import { IntroScene } from './ui/intro_scene.js';
import { rollIdentities, applyIdentity } from './data/identity_data.js';
import audio from './audio/AudioManager.js';
import { getNpcMemory, describeNpcRelation } from './npc_memory.js';

// 时辰名映射
const TIME_NAMES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

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

    // 卷宗
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

    // 解构常用卷宗
    const { REALMS, LOCATIONS, NPC_ENCOUNTERS, FACTIONS, ROGUE_SKILLS, QUESTS, ITEMS, ROOM_SEARCH, MAP_POS, MAP_CONN, getDesc } = this.data;
    this.REALMS = REALMS; // 兼容别名，指向当前路径的境界表（通过 getRealms() 动态切换）
    this.LOCATIONS = LOCATIONS;
    this.NPC_ENCOUNTERS = NPC_ENCOUNTERS;
    this.FACTIONS = FACTIONS;
    this.ROGUE_SKILLS = ROGUE_SKILLS;
    this.QUESTS = QUESTS;
    this.ITEMS = ITEMS;
    this.ROOM_SEARCH = ROOM_SEARCH;
    this.MAP_POS = MAP_POS;
    this.MAP_CONN = MAP_CONN;
    // 双境界体系：WU_REALMS / LING_REALMS 引用
    this.WU_REALMS = this.data.WU_REALMS || [];
    this.LING_REALMS = this.data.LING_REALMS || [];
    // getDesc：使用三层描述系统，fallback 到原始 getDesc（处理特殊对象）
    this._rawGetDesc = getDesc || ((obj) => obj?.desc || '');
    this.getDesc = (obj) => {
      const desc = this.getDescByPath(obj);
      return desc || this._rawGetDesc(obj);
    };

    // UI 状态
    this.currentTab = null;
    this.mapOpen = false;

    // 战斗门面（代理所有战斗相关方法）
    this.combat = new CombatFacade(this);
    // 任务服务（代理所有任务相关方法）
    this.quests = new QuestService(this);
    // 移动服务（代理所有移动相关方法）
    this.movement = new MovementService(this);
    // NPC 服务（代理所有 NPC 遭遇相关方法）
    this.npc = new NpcService(this);
    // 搜索服务（代理所有搜索相关方法）
    this.search = new SearchService(this);
    // 帮派服务（代理帮派相关方法）
    this.faction = new FactionService(this);
    // 拜师服务（代理拜师相关方法）
    this.teacher = new TeacherService(this);
    // 感知服务（代理感知相关方法）
    this.perception = new PerceptionService(this);
    // 日常动作服务（代理日常动作相关方法）
    this.action = new ActionService(this);
    // 物品服务（代理物品使用）
    this.item = new ItemService(this);
    // 游戏结束/命令处理服务
    this.gameOverSvc = new GameOverService(this);

    // 游戏状态
    const r0 = (this.WU_REALMS.length > 0 ? this.WU_REALMS : REALMS)[0]; // 默认武修路径
    this.state = {
      path: 'wu', // 修行路径：'wu'（武修）| 'ling'（灵修）
      realm: 0,
      cultivation: 0,
      daoxin: 100, maxDaoXin: 100,
      hp: r0.hp, maxHp: r0.hp,
      lifespan: 80,
      spiritStones: 0,    // 灵石（灵修主货币 / 武修在鉴定任务后解锁）
      copperCoins: 0,     // 铜钱（武修主货币 / 灵修辅货币），100文=1两银，10两银=1两金
      knowsSpiritStones: false, // 武修灵石认知开关（完成鉴定任务链后true）
      attack: r0.atk, defense: r0.def,
      mp: 80, maxMp: 80, // 真气/内力（武修）/灵力（灵修），战斗系统资源
      location: '应天府·十字街口',
      inventory: [],
      equipment: { weapon: null, armor: null },
      techniques: [],
      killCount: 0,
      totalCultivation: 0,
      isResting: false,
      isCultivating: false,
      trainCounter: 0, // 练功点击计数器，每10次扣道心
      daoxinDecayCounter: 0, // 灵修道心衰减计数器
      gameStart: Date.now(),
      combat: null,
      npcEncounter: null,
      explored: ['应天府·十字街口'],
      activeQuests: [],
      completedQuests: [],
      questStages: {},
      npcMemory: {},
      // 教程/引路状态
      tutorialPhase: null,
      tutorialStep: 0,
      guideCompanion: null,
      tutorialSeenRooms: {},
      wenjianfengDinnerDone: false,
      // 帮派/技能系统
      faction: '散修',
      skills: {},
      equippedSkill: null,
      factionRep: 0,
      performCooldowns: {},
      roundCount: 0,
      // 行功战斗系统 v3.0
      chart: null,           // 当前战诀
      presetCharts: [],      // 预设战诀列表
      corruptionLevel: 0,    // 畸变等级
      // 时间系统
      gameTime: 0,           // 0-11，0=子时，1=丑时，...11=亥时
      realTimeAccumulator: 0 // 真实毫秒累计，满300000ms推进1时辰
    };

    // 尝试加载存档
    const saved = this.storage.load();
    if (saved) {
      // H3 Migration: migrate old bare room IDs to namespaced IDs
      if (saved.location && ROOM_ID_MIGRATION[saved.location]) {
        console.log('[H3 Migration] Migrating location:', saved.location, '→', ROOM_ID_MIGRATION[saved.location]);
        saved.location = ROOM_ID_MIGRATION[saved.location];
      }
      // Also migrate any location references in quest stages
      // P1-3 修复：Storage 已将 questProgress 重命名为 questStages，这里检查 questStages
      if (saved.questStages) {
        for (const qid in saved.questStages) {
          const qs = saved.questStages[qid];
          if (qs && typeof qs === 'object' && qs.location && ROOM_ID_MIGRATION[qs.location]) {
            qs.location = ROOM_ID_MIGRATION[qs.location];
          }
          // questStages 可能是嵌套结构，递归检查 location 字段
          if (qs && typeof qs === 'object') {
            for (const stageKey in qs) {
              const stage = qs[stageKey];
              if (stage && typeof stage === 'object' && stage.location && ROOM_ID_MIGRATION[stage.location]) {
                stage.location = ROOM_ID_MIGRATION[stage.location];
              }
            }
          }
        }
      }
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
    this._setupPageManager();

    // P1-1 修复：页面离开时立即保存
    window.addEventListener('beforeunload', () => {
      this.flushSave();
    });

    // P1-1 修复：定期自动保存（每 30 秒）
    setInterval(() => {
      if (this._dirty) {
        const ok = this.saveGame();
        if (ok) this._dirty = false;
      }
    }, 30000);

    // 开场判断：有存档且已看过开场且有身世 → 直接进主循环；否则跳过 IntroScene
    // TODO: IntroScene 暂时跳过，后续 UI 完善后恢复
    if (this.state.introSeen && this.state.innateName) {
      this.startGameAfterStartup();
    } else {
      // 首次进入或旧存档无身世：自动 roll 身世 + 选问剑峰，跳过开场动画
      this._skipIntroDirect();
    }
    console.log('[Game] init() completed. Timer intervals:', this.timer._intervals.size);
  }

  /**
   * 跳过 IntroScene，直接应用随机身世 + 问剑峰门派，进入主循环
   * TODO: 后续 IntroScene UI 完善后恢复开场动画
   */
  _skipIntroDirect() {
    console.log('[Game] 跳过 IntroScene，直接进入游戏');
    const s = this.state;

    // 随机 roll 1 个身世并应用
    try {
      const rolled = rollIdentities(1);
      if (rolled.length > 0) {
        applyIdentity(this, rolled[0].id);
        console.log('[Game] 自动身世:', rolled[0].name);
      }
    } catch (e) {
      console.warn('[Game] 身世应用失败，使用默认', e);
    }

    // 自动选问剑峰
    try {
      this.joinFaction('问剑峰');
      console.log('[Game] 自动门派: 问剑峰');
    } catch (e) {
      console.warn('[Game] joinFaction 失败', e);
    }

    // 标记已看过开场
    s.introSeen = true;
    try { this.saveGame(); } catch (e) { console.warn('[Game] 存档失败', e); }

    // 进入主循环（含新手引导）
    this.onIntroComplete();
  }

  /**
   * IntroScene 完成后的回调（由 intro_scene.js → _finish() 调用）
   * 身世和门派已由 IntroScene 应用到 state，此处只需进主循环
   */
  onIntroComplete() {
    console.log('[Game] Intro complete, entering main loop');
    const s = this.state;
    // 若 IntroScene 中选了门派，joinFaction 已被调用；
    // 若跳过未选门派，保持散修起点
    // 门派新手引导触发
    if (s.faction && s.faction !== '散修') {
      this.startFactionTutorial(s.faction);
    }
    this.startGameAfterStartup();
  }

  /**
   * 启动门派新手引导
   * 目前只实现问剑峰黄金三章，其他门派暂跳过
   */
  startFactionTutorial(faction) {
    const dl = getData();
    if (faction === '问剑峰' && dl.WENJIANFENG_TUTORIAL_CH1) {
      // 调用第一章教程脚本
      dl.WENJIANFENG_TUTORIAL_CH1.start(this);
    }
    // 其他门派暂无新手引导，直接进入自由游戏
  }

  // ============ 双境界体系 ============

  /**
   * 根据当前修行路径返回对应的境界表
   * state.path === 'wu' → WU_REALMS（5级）
   * state.path === 'ling' → LING_REALMS（6级）
   * 同时刷新 this.REALMS 别名缓存
   */
  getRealms() {
    const realms = this.state.path === 'ling' ? this.LING_REALMS : this.WU_REALMS;
    if (realms && realms.length > 0) {
      this.REALMS = realms; // 保持别名同步
    }
    return this.REALMS;
  }

  /**
   * 术语双轨制：根据 state.path 返回当前路径对应的术语
   * T8.3 — 武修用武学术语（内力/招式/剑法），灵修用修真术语（灵力/术法/剑诀）
   * @param {string} key — 术语键名：power/energy/action/defense/attack/move/body/train/identity/money
   * @returns {string} 当前路径对应的中文术语
   */
  getTerm(key) {
    const tm = this.data.TERM_MAP;
    if (!tm || !tm[this.state.path] || !tm[this.state.path][key]) return key;
    return tm[this.state.path][key];
  }

  /**
   * 获取当前路径的货币名称（武修=铜钱，灵修=灵石）
   */
  getMoneyName() { return this.getTerm('money'); }

  /**
   * 获取当前路径主货币值
   * 武修主货币=铜钱，灵修主货币=灵石
   */
  getMoney() { return this.state.path === 'ling' ? this.state.spiritStones : this.state.copperCoins; }

  /**
   * 增加主货币（按路径分发）
   */
  addMoney(amt) {
    if (this.state.path === 'ling') this.state.spiritStones += amt;
    else this.state.copperCoins += amt;
  }

  /**
   * 消耗主货币（按路径分发，不足返回false）
   */
  spendMoney(amt) {
    if (this.state.path === 'ling') {
      if (this.state.spiritStones < amt) return false;
      this.state.spiritStones -= amt;
      return true;
    } else {
      if (this.state.copperCoins < amt) return false;
      this.state.copperCoins -= amt;
      return true;
    }
  }

  /**
   * 增加灵石（智能分发：灵修直接加spiritStones，武修未鉴定时进背包成「不知名的石头」，已鉴定直接加spiritStones）
   */
  addSpiritStones(amt) {
    const s = this.state;
    if (s.path === 'ling') {
      s.spiritStones += amt;
    } else if (s.knowsSpiritStones) {
      s.spiritStones += amt;
    } else {
      // 武修不知灵石：进背包成「不知名的石头」
      const existing = s.inventory.findIndex(it => it.name === '不知名的石头' && it.type === 'stone');
      if (existing >= 0) {
        s.inventory[existing].value = (s.inventory[existing].value || 0) + amt;
      } else {
        s.inventory.push({ name: '不知名的石头', type: 'stone', value: amt, desc: '一块温润的石头，触手微凉。说不清是什么材质。' });
      }
    }
  }

  /**
   * 灵石鉴定任务完成 — 武修认知开关开启，背包中的「不知名的石头」转化为灵石
   */
  identifySpiritStones() {
    const s = this.state;
    if (s.knowsSpiritStones) return; // 已鉴定
    s.knowsSpiritStones = true;
    // 将背包中的「不知名的石头」转为灵石
    let total = 0;
    for (let i = s.inventory.length - 1; i >= 0; i--) {
      if (s.inventory[i].name === '不知名的石头' && s.inventory[i].type === 'stone') {
        total += s.inventory[i].value || 0;
        s.inventory.splice(i, 1);
      }
    }
    if (total > 0) {
      s.spiritStones += total;
      this.addLog('?? 鉴定完成——「不知名的石头」竟是灵石！获得 ' + total + ' 灵石。', 'special');
    } else {
      this.addLog('?? 你终于认出了灵石——这种修行者使用的货币。', 'special');
    }
    this.renderer.updateUI(['char', 'status', 'bag']);
  }

  /**
   * 格式化货币显示
   * 灵修：显示「X灵石 · 铜钱」双栏
   * 武修已鉴定：显示「X灵石 · 铜钱」双栏
   * 武修未鉴定：只显示铜钱「X两金·Y两银·Z文」
   */
  formatMoney() {
    const s = this.state;
    const parts = [];
    // 灵石栏（灵修始终显示 / 武修鉴定后显示）
    if (s.path === 'ling' || s.knowsSpiritStones) {
      if (s.spiritStones > 0 || s.path === 'ling') {
        parts.push(s.spiritStones + '灵石');
      }
    }
    // 铜钱栏（始终显示）
    const total = s.copperCoins;
    const gold = Math.floor(total / 1000);
    const silver = Math.floor((total % 1000) / 100);
    const copper = total % 100;
    const copperParts = [];
    if (gold > 0) copperParts.push(gold + '两金');
    if (silver > 0) copperParts.push(silver + '两银');
    if (copper > 0 || copperParts.length === 0) copperParts.push(copper + '文');
    parts.push(copperParts.join('·'));
    return parts.join(' · ');
  }

  /**
   * 获取当前路径的真气/灵力名称（MP术语）
   */
  getMpName() { return this.getTerm('power'); }

  /**
   * 获取当前路径的修炼术语（武修=练武，灵修=修炼）
   */
  getTrainName() { return this.getTerm('train'); }

  /**
   * 切换修行路径（武修 ↔ 灵修）
   * 目前仅支持 'wu'，'ling' 暂未开放
   * // T8.7 双路径转职实现
   */
  switchPath(newPath) {
    if (newPath !== 'wu' && newPath !== 'ling') {
      this.addLog('未知的修行路径。', 'system');
      return;
    }
    if (newPath === 'ling') {
      // T8.7 双路径转职实现
      this.addLog('灵修路径尚未开放，敬请期待。', 'system');
      return;
    }
    const oldPath = this.state.path;
    if (oldPath === newPath) {
      this.addLog('你已在当前路径上。', 'system');
      return;
    }
    this.state.path = newPath;
    this.getRealms(); // 刷新 REALMS 别名
    this.addLog('修行路径已切换至：' + (newPath === 'wu' ? '武修' : '灵修'), 'system');
    this.renderer.updateUI();
    this.markDirty();
  }

  /**
   * 三层描述系统：根据修行路径和境界选择房间/NPC描述
   * 武修凡人~练家子(0-1) → desc_vague（模糊感知）
   * 武修武师以上(2+) → desc_percept（清晰感知，看到"不对劲"的线索）
   * 灵修(任意境界) → desc_awakened（觉醒视角，看到真相）
   * fallback → desc（现有默认描述）
   */
  getDescByPath(obj) {
    if (!obj) return '';
    const s = this.state;
    if (s.path === 'ling') {
      // 灵修：觉醒视角
      if (obj.desc_awakened) return obj.desc_awakened;
    } else {
      // 武修：根据境界分层
      if (s.realm <= 1) {
        // 凡人~练家子：模糊感知
        if (obj.desc_vague) return obj.desc_vague;
      } else {
        // 武师以上：清晰感知
        if (obj.desc_percept) return obj.desc_percept;
      }
    }
    // fallback 到现有 desc 字段
    return obj.desc || '';
  }

  /**
   * 获取房间描述（按时辰变体）
   * 时辰分段：
   * - gameTime 0,1,11（子丑亥）：入夜 → desc_night
   * - gameTime 2,3,4（寅卯辰）：清晨 → desc_morning
   * - gameTime 5,6,7（巳午未）：正午 → desc_noon
   * - gameTime 8,9,10（申酉戌）：黄昏 → desc_dusk
   */
  getRoomDesc(roomId) {
    const room = this.LOCATIONS[roomId];
    if (!room) return '';

    // 竹林深处迷宫房间不按时辰变化
    if (roomId.includes('竹林深处') || roomId.includes('青竹巷·尽头竹林')) {
      return room.desc || '';
    }

    const t = this.state.gameTime;
    let descField = null;

    if (t === 0 || t === 1 || t === 11) {
      // 子丑亥 → 入夜
      descField = 'desc_night';
    } else if (t === 2 || t === 3 || t === 4) {
      // 寅卯辰 → 清晨
      descField = 'desc_morning';
    } else if (t === 5 || t === 6 || t === 7) {
      // 巳午未 → 正午
      descField = 'desc_noon';
    } else if (t === 8 || t === 9 || t === 10) {
      // 申酉戌 → 黄昏
      descField = 'desc_dusk';
    }

    // 返回对应时段描述，若无则 fallback 到默认 desc
    return (descField && room[descField]) ? room[descField] : (room.desc || '');
  }

  /**
   * 判断当前是否为子时
   */
  isZiHour() {
    return this.state.gameTime === 0;
  }

  /**
   * 获取当前时辰名称
   */
  getTimeName() {
    return TIME_NAMES[this.state.gameTime] + '时';
  }

  _registerTabs() {
    this.tabManager.init();
    this.tabManager.register('char', () => {});
    this.tabManager.register('bag', () => this.renderer.renderInventory());
    this.tabManager.register('wuxue', () => this.renderer.renderWuxue());
    this.tabManager.register('quest', () => this.renderer.renderQuests());
    this.tabManager.register('status', () => {});
  }

  _setupPageManager() {
    const pm = window.pageManager;
    if (!pm) { console.warn('[Game] PageManager not found, skipping setup'); return; }
    // 换页前渲染目标页内容
    pm.onBeforeSwitch = (pageId) => {
      if (pageId === 'wuxue') this.renderer.renderWuxue();
      else if (pageId === 'xingnang') this.renderer.renderInventory();
      else if (pageId === 'yutu') {
        // 确保 map-card 可见（main.css 默认 display:none，需 .visible 类）
        const mc = document.getElementById('map-card');
        if (mc) mc.classList.add('visible');
        this.renderer.renderMap();
      } else if (pageId === 'renwu') this.renderer.renderQuests();
    };
    // 换页后更新当前页标记
    pm.onAfterSwitch = (pageId) => {
      this.currentTab = pageId;
      this.renderer.updateUI();
    };
    // 场景切换钩子：移动时自动更新场景
    this._pageManager = pm;
  }

  _registerTimers() {
    this.timer.register('idle', () => this.idleTick(), 30000); // 每30秒一次tick
    this.timer.register('daoxin', () => this.daoxinTick(), 30000); // 同步30秒
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
    // ⚠️ 第一步：立即恢复 #app 可见性（必须最先执行，后续任何失败都不影响）
    const appEl = document.getElementById('app');
    if (appEl) appEl.style.visibility = 'visible';
    // 兑底：直接给 body 设 data-scene，以防 _pageManager 未就绪
    const loc = this.state.location || '应天府·十字街口';
    const seg = (loc.split('·')[0] || '应天府').trim();
    document.body.dataset.scene = seg;
    
    this.timer.start();
    this.renderer.updateLocationIcon();
    const s = this.state;
    // 根据是否有身世/门派决定开场白
    if (s.innateName) {
      // IntroScene 已完成，身世+门派已应用
      this.addLog(`身世：${s.innateName}。门派：${s.faction || '散修'}。`, 'system');
    } else {
      // 老存档或跳过开场，无身世信息
      this.addLog('正德年间，世有修行之人。吐纳灵气，参悟大道。然修炼一途，每破一境便近祂一分——世人却未必知晓这是在敲谁的门。', 'system');
      this.addLog('你从应天府某条暗巷中醒来——你是谁？不重要。重要的是：你还活着。', 'system');
    }
    // 如果正在新手引导，跳过通用提示
    if (s.tutorialPhase) {
      // 新手引导中，不显示通用提示
    } else {
      this.addLog('烛火摇曳。你开始了修行之路。', 'system');
      this.addLog('💡 城中探索将遇奇遇，野外险地方有敌袭。搜索可得金银器物。输入「帮助」查看命令。', 'system');
    }
    if (s.faction === '散修' || !s.faction) {
      this.addLog('⚡ 你尚未拜入任何帮派——在不同的城区探索，可能遇到各帮派的接引人。', 'system');
    }
    this.renderer.updateUI();
    // 设置初始场景配色
    if (this._pageManager) {
      const scene = this._pageManager.resolveScene(this.state.location);
      this._pageManager.setScene(scene);
    }
  }

  // ============ 游戏循环 ============

  idleTick() {
    if (this.state.combat || this.state.npcEncounter) return;
    if (this.state.combat || this.state.npcEncounter) return;
    const s = this.state;
    if (s.isResting) {
      s.hp = Math.min(s.maxHp, s.hp + 3);
      s.mp = Math.min(s.maxMp, s.mp + 5);
      s.daoxin = Math.min(s.maxDaoXin, s.daoxin + 1);
      s.cultivation += 1;
    } else if (s.isCultivating) {
      // 修炼模式：按路径差异化，持续修为增长 + 道心减扣
      if (s.path === 'ling') {
        const base = 5 + s.realm * 3;
        s.cultivation += base;
        s.daoxin = Math.max(0, s.daoxin - 3);
        if (Math.random() < 0.15) this.addLog('🌀 灵力在经脉中奔涌——深处有什么东西在回应。道心微颤。', 'event');
      } else {
        const gain = 7 + s.realm * 4;
        s.cultivation += gain;
        s.daoxin = Math.max(0, s.daoxin - 1);
        if (Math.random() < 0.15) this.addLog('💪 汗水浸湿了衣襟，练武乏了——但修为在涨。', 'event');
      }
    } else {
      const base = 2 + s.realm * 1.5;
      const equipBonus = s.equipment.weapon ? 0.5 : 0;
      const techBonus = s.techniques.length * 0.3;
      s.cultivation += Math.floor(base + equipBonus + techBonus);
      s.totalCultivation += Math.floor(base + equipBonus + techBonus);
    }
    if (Math.random() < 0.05 && !s.isResting && !s.isCultivating) this.triggerIdleEvent();
    this.checkBreakthrough();

    // 时间推进：每30秒累加，满300000ms（10次tick）推进1时辰
    s.realTimeAccumulator += 30000;
    if (s.realTimeAccumulator >= 300000) {
      s.realTimeAccumulator -= 300000;
      s.gameTime = (s.gameTime + 1) % 12;
      // 通知UI更新时辰显示
      if (this.renderer) this.renderer.updateTimeDisplay();
    }

    // 挂机循环中只有修为/道心/HP 变化，只需更新进度条和数值面板
    this.renderer.updateUI(['progress', 'char', 'status']);
    // P1 修复：挂机 tick 状态变更后标记脏
    this.markDirty();
  }

  daoxinTick() {
    if (this.state.combat || this.state.npcEncounter || this.state.isResting || this.state.isCultivating) return;
    const s = this.state;
    const loc = this.LOCATIONS[s.location];

    if (s.path === 'wu') {
      // 武修：道心不自然下跌，仅环境微扰（danger≥5 凶地扣1）
      if (loc && loc.danger >= 5) {
        s.daoxin = Math.max(0, s.daoxin - 1);
        if (Math.random() < 0.3) this.addLog('?? 此地阴气逼人，道心微颤。', 'event');
      }
    } else {
      // 灵修：道心按境界递增衰减
      // 炼气(1)/筑基(2) 每30tick -1，金丹(3)/元婴(4) 每20tick -1，化神(5) 每10tick -1
      const decayInterval = s.realm <= 2 ? 30 : s.realm <= 4 ? 20 : 10;
      s.daoxinDecayCounter = (s.daoxinDecayCounter || 0) + 1;
      if (s.daoxinDecayCounter >= decayInterval) {
        s.daoxinDecayCounter = 0;
        s.daoxin = Math.max(0, s.daoxin - 1);
        if (s.daoxin < 20 && Math.random() < 0.3) {
          this.addLog('?? 道心动摇……你低头看见自己的手指——过长了一寸。也许没有。也许一直都这么长。', 'event');
          s.cultivation += 10;
        }
      }
    }

    if (s.daoxin <= 0) {
      s.daoxin = 0;
      this.gameOver('道心崩坏——你不再是你自己了。最后的念头散成无数碎片，其中一片还记得你的名字。只是一片。');
      return;
    }
    // 道心定时扣减：只需更新进度条和数值面板
    this.renderer.updateUI(['progress', 'char', 'status']);
    // P1 修复：道心变更后标记脏
    this.markDirty();
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
    // P1 修复：idle event 修改状态后标记脏
    this.markDirty();
  }

  checkBreakthrough() {
    const s = this.state;
    const realms = this.getRealms();
    // 境界上限锁定：化神（LING_REALMS index 5）为最高可达境界
    const REALM_MAX_IDX = 5;
    if (s.realm >= REALM_MAX_IDX) {
      if (s.cultivation >= realms[REALM_MAX_IDX].cost) {
        this.addLog('🌀 你已至化神之巅，天地之间再无前路可循…', 'system');
      }
      return;
    }
    if (s.realm >= realms.length - 1) return;
    const n = realms[s.realm + 1];
    if (s.cultivation >= n.cost) {
      const ch = Math.min(0.95, 0.7 - s.realm * 0.08 + (s.daoxin / s.maxDaoXin) * 0.2);
      if (Math.random() < ch) {
        s.realm++;
        s.cultivation = 0;
        const r = realms[s.realm];
        s.attack = r.atk;
        s.defense = r.def;
        s.maxHp = r.hp;
        s.hp = r.hp;
        // 真气上限成长：武修+40/境界，灵修+30/境界（化神追平后反超）
        const mpGain = s.path === 'ling' ? (s.realm >= 5 ? 40 : 30) : 40;
        s.maxMp += mpGain;
        s.mp = s.maxMp;
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
    // P1 修复：突破检查后标记脏
    this.markDirty();
  }

  // ============ 移动代理（委托 MovementService）============
  explore(dir) { return this.movement.explore(dir); }
  dirName(d) { return this.movement.dirName(d); }
  quickTravel(loc) { return this.movement.quickTravel(loc); }

  // ============ NPC 代理（委托 NpcService）============
  triggerNPCEncounter(active) { const r = this.npc.triggerNPCEncounter(active); this.markDirty(); return r; }
  speakToNpc(npcIndex) { const r = this.npc.speakToNpc(npcIndex, arguments[1]); this.markDirty(); return r; }
  sparNpc(npcIndex, npcType) { const r = this.npc.sparNpc(npcIndex, npcType); this.markDirty(); return r; }
  _presentEncounter(enc) { return this.npc._presentEncounter(enc); }
  npcChoice(index) { return this.npc.npcChoice(index); }
  closeNPC() { return this.npc.closeNPC(); }
  getNpcMemory(encOrKey) { return getNpcMemory(this.state, encOrKey); }
  describeNpcRelation(encOrKey) { return describeNpcRelation(this.getNpcMemory(encOrKey)); }

  // ============ 帮派代理（委托 FactionService）============
  joinFaction(name) { const r = this.faction.joinFaction(name); this.markDirty(); return r; }

  // ============ 武学/战斗代理（委托 CombatFacade）============
  getSkillName(skillId) { return this.combat.getSkillName(skillId); }
  getSkillData(skillId) { return this.combat.getSkillData(skillId); }
  skillDetail(skillId) { return this.combat.skillDetail(skillId); }
  practiceSkill(skillId) { const r = this.combat.practiceSkill(skillId); this.markDirty(); return r; }
  equipSkill(skillId) { const r = this.combat.equipSkill(skillId); this.markDirty(); return r; }
  unequipSkill() { const r = this.combat.unequipSkill(); this.markDirty(); return r; }

  // ============ 拜师代理（委托 TeacherService）============
  isAtFactionHQ(locationName, factionName) { return this.teacher.isAtFactionHQ(locationName, factionName); }
  learnFromTeacher(teacherName) { const r = this.teacher.learnFromTeacher(teacherName); this.markDirty(); return r; }
  askTeacher() { const r = this.teacher.askTeacher(); this.markDirty(); return r; }

  // ============ 战斗代理（委托 CombatFacade）============
  triggerEncounter(loc) { return this.combat.triggerEncounter(loc); }
  startCombat(name, data) { const r = this.combat.startCombat(name, data); this.markDirty(); return r; }
  combatAction(action) { return this.combat.combatAction(action); }
  showPerforms() { return this.combat.showPerforms(); }
  hidePerforms() { return this.combat.hidePerforms(); }
  usePerform(performId) { return this.combat.usePerform(performId); }
  endCombat(victory) { const r = this.combat.endCombat(victory); this.markDirty(); return r; }

  applyReward(rewardStr) { return this.quests.applyReward(rewardStr); }

  // ============ 搜索代理（委托 SearchService）============
  searchArea() { return this.search.searchArea(); }
  pickItemByType(type) { const r = this.search.pickItemByType(type); this.markDirty(); return r; }

  // ============ 任务代理（委托 QuestService）============
  startQuest(questId) { const r = this.quests.startQuest(questId); this.markDirty(); return r; }
  checkQuestProgress(type, target) { const r = this.quests.checkQuestProgress(type, target); this.markDirty(); return r; }
  completeQuest(questId) { const r = this.quests.completeQuest(questId); this.markDirty(); return r; }

  // ============ 地图 ============

  toggleMap() {
    this.mapOpen = !this.mapOpen;
    const mc = document.getElementById('map-card');
    if (this.mapOpen) {
      mc.classList.add('visible');
      this.renderer.renderMap();
      // 滚动到地图卡片
      setTimeout(() => {
        mc.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } else {
      mc.classList.remove('visible');
      // 重置滚动位置
      const cont = document.getElementById('map-container');
      if (cont) { cont.scrollLeft = 0; cont.scrollTop = 0; }
    }
  }

  // ============ 日常动作 ============

  switchTab(tab) { return this.action.switchTab(tab); }

  cultivate() { return this.action.cultivate(); }

  train() { return this.action.train(); }

  rest() { return this.action.rest(); }

  talk() { return this.action.talk(); }

  askAround() { return this.action.askAround(); }

  peek() { return this.perception.peek(); }

  getRoomPerception() { return this.perception.getRoomPerception(); }

  openPerception() { return this.perception.openPerception(); }

  closePerception() { return this.perception.closePerception(); }

  practiceMenu() { return this.action.practiceMenu(); }

  // askTeacher 代理已在拜师代理区域定义

  // ============ 物品系统 ============

  useItem(index) { const r = this.item.useItem(index); this.markDirty(); return r; }

  // ============ 游戏结束 ============

  gameOver(reason) { const r = this.gameOverSvc.gameOver(reason); this.markDirty(); this.flushSave(); return r; }

  // ============ 命令处理 ============

  processCommand(cmd) { return this.gameOverSvc.processCommand(cmd); }


  // ============ 存档 ============

  /**
   * 统一保存入口
   * 所有存档操作都通过此方法，确保经过 schema 白名单和备份机制
   * @returns {boolean} 是否保存成功
   */
  saveGame() {
    return this.storage.save(this.state);
  }

  /**
   * P1-1 修复：标记状态已变更，延迟保存
   * 在关键状态变更后调用，避免每次操作都写 localStorage
   */
  _dirty = false;
  _autoSaveTimer = null;

  markDirty() {
    this._dirty = true;
    // 延迟 2 秒批量保存，避免高频操作（如练功连点）频繁写入
    if (this._autoSaveTimer) return;
    this._autoSaveTimer = setTimeout(() => {
      this._autoSaveTimer = null;
      if (this._dirty) {
        // P1 修复：仅在保存成功后清除 dirty，失败时保留以使下次重试
        const ok = this.saveGame();
        if (ok) {
          this._dirty = false;
        } else {
          console.warn('[Game] 自动保存失败，脏标记保留以待重试');
          // 安排 5 秒后重试
          if (!this._retryTimer) {
            this._retryTimer = setTimeout(() => {
              this._retryTimer = null;
              if (this._dirty) {
                const retryOk = this.saveGame();
                if (retryOk) this._dirty = false;
              }
            }, 5000);
          }
        }
      }
    }, 2000);
  }

  /**
   * P1-1 修复：立即保存并清除脏标记
   */
  flushSave() {
    if (this._autoSaveTimer) {
      clearTimeout(this._autoSaveTimer);
      this._autoSaveTimer = null;
    }
    if (this._dirty) {
      // P1 修复：仅在保存成功后清除 dirty
      const ok = this.saveGame();
      if (ok) {
        this._dirty = false;
      } else {
        console.warn('[Game] flushSave 失败，脏标记保留');
      }
    }
  }

  // ============ 日志 ============

  addLog(text, type) {
    this.renderer.addLog(text, type);
  }
}
