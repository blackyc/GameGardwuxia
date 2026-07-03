/**
 * faction_service.js — 帮派系统服务层
 *
 * 从 game.js 拆出的帮派相关方法：
 * - joinFaction：加入/切换帮派（仪式文案 + 入门技能 + HQ传送）
 *
 * 设计原则：
 * - FactionService 持有 game 引用，通过 game.state / game.renderer / game.addLog() 访问宿主
 * - Game 保留一行代理方法
 */

export class FactionService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  /**
   * 加入/切换帮派
   * @param {string} name - 帮派名称
   */
  joinFaction(name) {
    const g = this.game;
    const s = g.state;
    const oldFaction = s.faction;
    s.faction = name;
    s.skills = {};
    s.factionRep = 0;

    const ceremonies = {
      '忘尘宗': '🙏 「忘尘即是归宗。从今日起，你即忘尘宗弟子。忘我，忘尘，忘一切——连自己正在忘也一并忘记。入我忘尘，心即是空。」',
      '问剑峰': '☯ 「问剑峰上无日月，唯有霞光七色万年如一。从今日起，你的气脉即是山峰的支脉。道生一，一生二，二生三，三生万物——万物最后都会被霞光洗净。」',
      '紫霞山': '🐜 「紫霞山之中，千丝万缕皆有声息。从今日起，世间每一句话都落在你的耳中。听得越多，越难分辨——哪些是别人的话，哪些是丝的声音。」',
      '焰心教': '🔥 「焰心教的圣火已在你丹田种下。从今日起，你的血是流动的焰——烧自己，也烧敌人。圣火不灭，焚身证道。」',
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
      g.addLog('⚠ 你脱离了' + oldFaction + '，加入了' + name + '。', 'system');
    }
    g.addLog(msg, 'breakthrough');

    // 入帮自动获取入门技能
    if (name !== '散修') {
      const faction = g.FACTIONS[name];
      if (faction && faction.skills) {
        const starterSkills = faction.skills.filter(sk => sk.minLevel === 0);
        if (starterSkills.length > 0) {
          g.addLog('📖 拜入' + name + '，习得入门武学：', 'special');
          starterSkills.forEach(sk => {
            if (!s.skills[sk.id]) {
              s.skills[sk.id] = { level: 1, exp: 0 };
              g.addLog('   「' + sk.name + '」Lv.1', 'info');
            }
          });
        }
      }
    } else {
      if (g.ROGUE_SKILLS && g.ROGUE_SKILLS.skills) {
        const rSkills = g.ROGUE_SKILLS.skills.filter(sk => sk.minLevel === 0);
        if (rSkills.length > 0) {
          g.addLog('📖 自行研习基础功法：', 'special');
          rSkills.forEach(sk => {
            if (!s.skills[sk.id]) {
              s.skills[sk.id] = { level: 1, exp: 0 };
              g.addLog('   「' + sk.name + '」Lv.1', 'info');
            }
          });
        }
      }
    }

    g.renderer.updateUI(['char', 'status', 'wuxue']);
    if (g.currentTab === 'wuxue') g.renderer.renderWuxue();

    // 门派HQ传送
    const FACTION_HQ = {
      '问剑峰': '问剑峰·山门',
      '血禅寺': '血禅寺·大殿',
      '药王谷': '药王坊·义诊堂',
      '焰心教': '赤炎居·香火铺',
      '忘尘宗': '梵音堂·经书坊',
      '紫霞山': '紫微阁·星象铺',
      '逍遥驿': '逍遥馆·客栈天字房',
      '镜阁': '影壁街·纸扎铺',
      '归墟': '阴司牢·外层',
      '青囊庐': '百草堂·药铺后院',
      '傀坊': '巧工坊·木匠铺后院',
    };
    if (FACTION_HQ[name]) {
      s.location = FACTION_HQ[name];
      if (!s.explored.includes(s.location)) {
        s.explored.push(s.location);
      }
      g.addLog('你被带到了 ' + s.location.split('·').pop() + '。', 'system');
    }
  }
}

export default FactionService;
