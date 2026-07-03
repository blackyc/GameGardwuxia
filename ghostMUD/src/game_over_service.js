/**
 * game_over_service.js — 游戏结束/命令处理服务层
 *
 * 从 game.js 拆出的方法：
 * - gameOver：游戏结束界面（统计 + 重启按钮）
 * - processCommand：命令行解析（路由到各服务方法）
 *
 * 设计原则：
 * - GameOverService 持有 game 引用
 * - Game 保留一行代理方法
 */

export class GameOverService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  gameOver(reason) {
    const g = this.game;
    g.timer.stop();
    g.state.combat = null;
    g.state.npcEncounter = null;
    document.getElementById('combat-modal').classList.remove('active');
    document.getElementById('npc-modal').classList.remove('active');

    const s = g.state;
    const t = Math.floor((Date.now() - s.gameStart) / 1000);
    const mins = Math.floor(t / 60), secs = t % 60;

    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.innerHTML = '<div class="modal-box"><h2>💀 ' + reason + '</h2>' +
      '<p>最终境界：' + g.getRealms()[s.realm].name + '</p>' +
      '<p>斩杀：' + s.killCount + ' | ' + g.getMoneyName() + '：' + g.formatMoney() + '</p>' +
      '<p>任务完成：' + s.completedQuests.length + '</p>' +
      '<p>所学：' + (s.techniques.length > 0 ? s.techniques.join('、') : '无') + '</p>' +
      '<p>修行时长：' + mins + '分' + secs + '秒 | 总修为：' + s.totalCultivation + '</p>' +
      '<p>探索区域：' + s.explored.length + ' / ' + Object.keys(g.LOCATIONS).length + '</p>' +
      '<button class="btn-restart" id="btn-restart">再入江湖</button></div>';
    document.body.appendChild(ov);

    document.getElementById('btn-restart').addEventListener('click', () => {
      g.storage.clear();
      location.reload();
    });

    g.renderer.updateUI();
  }

  processCommand(cmd) {
    const g = this.game;
    cmd = cmd.trim().toLowerCase();
    if (['北', 'north', 'n', '向北'].includes(cmd)) g.explore('north');
    else if (['南', 'south', 's', '向南'].includes(cmd)) g.explore('south');
    else if (['东', 'east', 'e', '向东'].includes(cmd)) g.explore('east');
    else if (['西', 'west', 'w', '向西'].includes(cmd)) g.explore('west');
    else if (['修炼', '修行', '打坐', 'meditate', 'cultivate'].includes(cmd)) g.cultivate();
    else if (['练功', '练拳', 'pushup', 'train', '站桩'].includes(cmd)) g.train();
    else if (['搜寻', '搜索', 'search', '探索'].includes(cmd)) g.searchArea();
    else if (['休憩', '休息', 'rest'].includes(cmd)) g.rest();
    else if (['交谈', '谈话', 'talk', '聊聊', '聊天', '搭话'].includes(cmd)) g.talk();
    else if (['打听', '问询', 'ask', '消息', '问路'].includes(cmd)) g.askAround();
    else if (['观察', '窥探', 'peek', '瞭望', 'look', '看'].includes(cmd)) g.peek();
    else if (['练武', '修炼武学', 'practice'].includes(cmd)) g.practiceMenu();
    else if (['拜师', 'teacher'].includes(cmd)) g.askTeacher();
    else if (['地图', 'map'].includes(cmd)) g.toggleMap();
    else if (['境况', '状态', 'status', 'stats'].includes(cmd)) g.switchTab('status');
    else if (['行囊', '背包', '包裹', 'inventory', 'inv', 'bag'].includes(cmd)) g.switchTab('bag');
    else if (['任务', 'quest', 'quests', 'mission'].includes(cmd)) g.switchTab('quest');
    else if (['人物', 'char'].includes(cmd)) g.switchTab('char');
    else if (['武学', 'wuxue', 'skill', 'skills'].includes(cmd)) g.switchTab('wuxue');
    else if (['位置', 'location', 'loc'].includes(cmd)) {
      const loc = g.LOCATIONS[g.state.location];
      g.addLog('📍 当前位置：<b>' + g.state.location + '</b>', 'info');
      if (loc) { g.addLog('   ' + g.getDesc(loc), 'info'); g.addLog('   危险：' + '★'.repeat(loc.danger || 0), 'info'); }
    } else if (['帮助', 'help', '?', '？', 'h'].includes(cmd)) {
      g.addLog('┏━━ 江 湖 须 知 ━━┓', 'system');
      g.addLog('┃ 🧭 移动：北/南/东/西', 'system');
      g.addLog('┃ 🧘 修炼 · 💪 练功 · 🔍 搜索 · 💤 休憩 · 💬 交谈 · 👂 打听 · 👀 窥探', 'system');
      g.addLog('┃ 🙇 拜师 · 📖 练武 · 🏯 武学', 'system');
      g.addLog('┃ 🗺 地图 · 📋 境况 · 📦 包裹', 'system');
      g.addLog('┃ 👤 人物 · 📜 任务：查看修为/任务', 'system');
      g.addLog('┃ 📖 探索：' + g.state.explored.length + '/' + Object.keys(g.LOCATIONS).length + ' 间', 'system');
      g.addLog('┃ 💡 在城里「交谈」遇奇遇、「打听」得情报', 'system');
      g.addLog('┃ 💡 「搜索」有概率得金银器物', 'system');
      g.addLog('┗━━━━━━━━━━━━━━┛', 'system');
    } else {
      g.addLog('不明指令：' + cmd + '。输入"帮助"查看可用命令。', 'system');
    }
    g.renderer.updateUI();
  }
}

export default GameOverService;
