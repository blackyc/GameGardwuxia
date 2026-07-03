/**
 * teacher_service.js — 拜师系统服务层
 *
 * 从 game.js 拆出的拜师相关方法：
 * - isAtFactionHQ：判断当前位置是否为指定帮派的 HQ
 * - learnFromTeacher：向师傅学习武学（消耗束脩 + 获得技能）
 * - askTeacher：展示师傅列表（命令入口）
 *
 * 设计原则：
 * - TeacherService 持有 game 引用，通过 game.state / game.renderer / game.addLog() 访问宿主
 * - Game 保留一行代理方法
 */

export class TeacherService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  /**
   * 判断当前位置是否为指定帮派的 HQ
   * @param {string} locationName - 当前位置
   * @param {string} factionName - 帮派名称
   * @returns {boolean}
   */
  isAtFactionHQ(locationName, factionName) {
    const hqMap = {
      '忘尘宗': ['忘尘峰'],
      '问剑峰': ['问剑峰·剑冢'],
      '紫霞山': ['紫霞山·盘丝窟', '汴河地下暗渠', '樊楼后院', '御街古井'],
      '焰心教': ['光明顶·焰心殿'],
      '逍遥驿': ['逍遥驿·车马院'],
      '药王谷': ['鼓楼西·地下丹房'],
      '血禅寺': ['血禅寺'],
      '镜阁': ['镜阁·万镜堂', '樊楼·镜室'],
      '归墟': ['归墟洞', '未命名'],
      '青囊庐': ['青囊庐', '未命名'],
      '傀坊': ['傀坊', '未命名']
    };
    const hqs = hqMap[factionName] || [];
    return hqs.includes(locationName);
  }

  /**
   * 向师傅学习武学
   * @param {string} teacherName - 师傅名称
   */
  learnFromTeacher(teacherName) {
    const g = this.game;
    const s = g.state;
    if (s.faction === '散修') { g.addLog('散修无师自通，自行研习即可。', 'system'); return; }
    const faction = g.FACTIONS[s.faction];
    if (!faction) return;
    const teacher = (faction.teachers || []).find(t => t.name === teacherName);
    if (!teacher) { g.addLog('此人不在本帮。', 'system'); return; }

    const teaches = Array.isArray(teacher.teaches) ? teacher.teaches : [];
    const teachableSkills = [];
    teaches.forEach(skillNameId => {
      const sk = faction.skills.find(sk => sk.name === skillNameId);
      if (sk && !s.skills[sk.id]) teachableSkills.push(sk);
    });

    if (teachableSkills.length === 0) {
      g.addLog(teacherName + '：「你所会已不在我之下，去找更高层的师傅吧。」', 'npc');
      return;
    }

    const teacherTier = faction.teachers.indexOf(teacher);
    const costs = [20, 80, 200];
    const cost = costs[Math.min(teacherTier, 2)] || 80;

    if (g.getMoney() < cost) {
      g.addLog(teacherName + '：「束脩不足。' + cost + g.getMoneyName() + '，这是规矩。」', 'npc');
      return;
    }

    g.spendMoney(cost);
    s.factionRep += 10;
    teachableSkills.forEach(sk => {
      s.skills[sk.id] = { level: 1, exp: 0 };
      g.addLog('📖 向' + teacherName + '习得「' + sk.name + '」！', 'special');
    });
    g.addLog('💰 支付束脩 ' + cost + ' ' + g.getMoneyName() + '。', 'item');
    g.renderer.updateUI(['char', 'status', 'wuxue']);
  }

  /**
   * 展示师傅列表（命令入口）
   */
  askTeacher() {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) { g.addLog('当前无法拜师！', 'combat'); return; }
    const s = g.state;
    if (s.faction === '散修') { g.addLog('散修无师自通——自行研习便是。', 'system'); return; }
    if (!this.isAtFactionHQ(s.location, s.faction)) { g.addLog('此处非本帮据点，无法拜师。去帮派总部看看吧。', 'system'); return; }
    const faction = g.FACTIONS[s.faction];
    if (!faction || !faction.teachers) { g.addLog('宗派名录异常。', 'system'); return; }
    g.addLog('🏫 ' + s.faction + '师傅列表：', 'info');
    faction.teachers.forEach(t => {
      const teaches = Array.isArray(t.teaches) ? t.teaches.length + '项武学' : '多项';
      g.addLog('  「' + t.name + '」—— ' + t.title + ' （授' + teaches + '）', 'info');
    });
    g.addLog('💡 在「武学」面板中点击师傅名字旁的「拜师」按钮。', 'system');
    g.switchTab('wuxue');
  }
}

export default TeacherService;
