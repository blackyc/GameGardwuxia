/**
 * ghostMUD · 行功战斗系统 v3.0 — 装备数据库
 * 
 * 8种武器类型 × 5品质 = 40个武器模板
 * 12种饰品 × 5品质 = 60个饰品模板
 * 8种铭文定义
 * 
 * 品质：凡品(mortal) / 良品(refined) / 上品(rare) / 极品(epic) / 仙器(legendary)
 * 
 * @author  Agent T13.1
 * @date    2026-06-26
 */

var COMBAT_EQUIPMENT_V3 = {

  // ════════════════════════════════════════════════════════════
  //  武器库（8种 × 5品质 = 40）
  // ════════════════════════════════════════════════════════════
  weapons: [

    // ── 游龙剑（问剑峰）──────────────────────────────
    { id: 'w1001', type: 'weapon', subtype: 'light_blade', name: '游龙剑', faction: '问剑峰', quality: 'mortal',
      atk: 2, spd: 1, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'combo_hit', desc: '每3次出招，下次技能额外结算一次伤害',
        trigger: { every_n_hits: 3 }, effect: { extra_damage: 1.0 } },
      inscriptionSlots: 0,
      desc: '问剑峰入门剑。剑身薄如蝉翼，弯如新月。出剑时嗡嗡作响——不是风声，是剑里封着的那一念在跟你说话。'
    },
    { id: 'w1002', type: 'weapon', subtype: 'light_blade', name: '游龙剑', faction: '问剑峰', quality: 'refined',
      atk: 4, spd: 2, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'combo_hit', desc: '每3次出招，下次技能额外结算一次伤害',
        trigger: { every_n_hits: 3 }, effect: { extra_damage: 1.0 } },
      inscriptionSlots: 1,
      desc: '匠师用心锻过，入了品流。剑身薄如蝉翼，弯如新月。'
    },
    { id: 'w1003', type: 'weapon', subtype: 'light_blade', name: '游龙剑', faction: '问剑峰', quality: 'rare',
      atk: 8, spd: 3, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'combo_hit', desc: '每3次出招，下次技能额外结算一次伤害',
        trigger: { every_n_hits: 3 }, effect: { extra_damage: 1.0 } },
      inscriptionSlots: 2,
      desc: '附了灵气，有了自己的脾气。用久了会认主——别人拿不动。'
    },
    { id: 'w1004', type: 'weapon', subtype: 'light_blade', name: '游龙剑', faction: '问剑峰', quality: 'epic',
      atk: 15, spd: 5, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'combo_hit', desc: '每3次出招，下次技能额外结算一次伤害',
        trigger: { every_n_hits: 3 }, effect: { extra_damage: 1.0 } },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。夜深人静时，偶尔自鸣。'
    },
    { id: 'w1005', type: 'weapon', subtype: 'light_blade', name: '游龙·破念', faction: '问剑峰', quality: 'legendary',
      atk: 30, spd: 8, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'combo_hit', desc: '每3次出招，下次技能额外结算一次伤害',
        trigger: { every_n_hits: 3 }, effect: { extra_damage: 1.5 } },
      inscriptionSlots: 4,
      desc: '剑冢底层三千剑中唯一没有锈的。据说它不是没锈过，是锈了又被擦掉了——擦了三千年。擦剑的人不在了。剑还在等。'
    },

    // ── 玄铁重剑（问剑峰·深层）──────────────────────
    { id: 'w1101', type: 'weapon', subtype: 'heavy_blade', name: '玄铁重剑', faction: '问剑峰', quality: 'mortal',
      atk: 4, spd: 0, hp: 0, mp: 0, def: 1,
      amplifier: { type: 'burst_threshold', desc: '单次伤害超过目标最大气血15%时，额外结算一次',
        trigger: { dmg_threshold_pct: 15 }, effect: { extra_damage: 0.8 } },
      inscriptionSlots: 0,
      desc: '通体玄铁，不知几斤几两。拿起来费劲，挥出去更费劲——但挥出去之后，对面也不太费劲了。'
    },
    { id: 'w1102', type: 'weapon', subtype: 'heavy_blade', name: '玄铁重剑', faction: '问剑峰', quality: 'refined',
      atk: 8, spd: 0, hp: 0, mp: 0, def: 2,
      amplifier: { type: 'burst_threshold', desc: '单次伤害超过目标最大气血15%时，额外结算一次',
        trigger: { dmg_threshold_pct: 15 }, effect: { extra_damage: 0.8 } },
      inscriptionSlots: 1,
      desc: '匠师用心锻过，入了品流。重剑不是用来砍的，是用来判的。'
    },
    { id: 'w1103', type: 'weapon', subtype: 'heavy_blade', name: '玄铁重剑', faction: '问剑峰', quality: 'rare',
      atk: 15, spd: 0, hp: 0, mp: 0, def: 4,
      amplifier: { type: 'burst_threshold', desc: '单次伤害超过目标最大气血15%时，额外结算一次',
        trigger: { dmg_threshold_pct: 15 }, effect: { extra_damage: 0.8 } },
      inscriptionSlots: 2,
      desc: '附了灵气，有了自己的脾气。用久了会认主。'
    },
    { id: 'w1104', type: 'weapon', subtype: 'heavy_blade', name: '玄铁重剑', faction: '问剑峰', quality: 'epic',
      atk: 28, spd: 0, hp: 0, mp: 0, def: 8,
      amplifier: { type: 'burst_threshold', desc: '单次伤害超过目标最大气血15%时，额外结算一次',
        trigger: { dmg_threshold_pct: 15 }, effect: { extra_damage: 0.8 } },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。夜深人静时，偶尔自鸣。'
    },
    { id: 'w1105', type: 'weapon', subtype: 'heavy_blade', name: '玄铁·镇冢', faction: '问剑峰', quality: 'legendary',
      atk: 50, spd: 0, hp: 0, mp: 0, def: 15,
      amplifier: { type: 'burst_threshold', desc: '单次伤害超过目标最大气血15%时，额外结算一次',
        trigger: { dmg_threshold_pct: 15 }, effect: { extra_damage: 1.0 } },
      inscriptionSlots: 4,
      desc: '剑冢底层的镇冢之剑。没人拿得起来。不是重——是它不让你拿。据说上一个拿起来的人，用它劈开了一座山。然后山合上了。人也没出来。'
    },

    // ── 破阵枪（逍遥驿）──────────────────────────────
    { id: 'w1201', type: 'weapon', subtype: 'spear', name: '破阵枪', faction: '逍遥驿', quality: 'mortal',
      atk: 3, spd: 1, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'cd_compress', desc: '相邻槽位技能CD-0.3s',
        trigger: { passive: true }, effect: { adjacent_cd_reduce: 0.3 } },
      inscriptionSlots: 0,
      desc: '枪长一丈二，杆是白蜡木的——不是穷，是白蜡木有韧性。弯了能弹回来。'
    },
    { id: 'w1202', type: 'weapon', subtype: 'spear', name: '破阵枪', faction: '逍遥驿', quality: 'refined',
      atk: 6, spd: 2, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'cd_compress', desc: '相邻槽位技能CD-0.4s',
        trigger: { passive: true }, effect: { adjacent_cd_reduce: 0.4 } },
      inscriptionSlots: 1,
      desc: '匠师用心锻过，入了品流。枪法不是刺，是穿。'
    },
    { id: 'w1203', type: 'weapon', subtype: 'spear', name: '破阵枪', faction: '逍遥驿', quality: 'rare',
      atk: 10, spd: 3, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'cd_compress', desc: '相邻槽位技能CD-0.5s',
        trigger: { passive: true }, effect: { adjacent_cd_reduce: 0.5 } },
      inscriptionSlots: 2,
      desc: '附了灵气，有了自己的脾气。枪出之时，前后左右皆通途。'
    },
    { id: 'w1204', type: 'weapon', subtype: 'spear', name: '破阵枪', faction: '逍遥驿', quality: 'epic',
      atk: 20, spd: 5, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'cd_compress', desc: '相邻槽位技能CD-0.6s',
        trigger: { passive: true }, effect: { adjacent_cd_reduce: 0.6 } },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。夜深人静时，偶尔自鸣。'
    },
    { id: 'w1205', type: 'weapon', subtype: 'spear', name: '破阵·无归', faction: '逍遥驿', quality: 'legendary',
      atk: 35, spd: 8, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'cd_compress', desc: '相邻槽位技能CD-0.8s',
        trigger: { passive: true }, effect: { adjacent_cd_reduce: 0.8 } },
      inscriptionSlots: 4,
      desc: '逍遥驿1号房床底下插着的一杆枪。枪身上刻了两个字：无归。驿长说这是留给那位客人的。客人没来。枪等得太久，自己学会了出门。'
    },

    // ── 五毒匕（药王谷）──────────────────────────────
    { id: 'w1301', type: 'weapon', subtype: 'dagger', name: '五毒匕', faction: '药王谷', quality: 'mortal',
      atk: 1, spd: 2, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'poison_double', desc: '尸蛊层数翻倍，直接伤害-30%',
        trigger: { passive: true }, effect: { shigu_double: true, dmg_reduce: 0.3 } },
      inscriptionSlots: 0,
      desc: '匕首不大，三寸有余。刃上泛着青紫色的光——泡在药王谷的血苔汁里浸了七七四十九天。'
    },
    { id: 'w1302', type: 'weapon', subtype: 'dagger', name: '五毒匕', faction: '药王谷', quality: 'refined',
      atk: 3, spd: 3, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'poison_double', desc: '尸蛊层数翻倍，直接伤害-30%',
        trigger: { passive: true }, effect: { shigu_double: true, dmg_reduce: 0.3 } },
      inscriptionSlots: 1,
      desc: '匠师用心锻过，入了品流。刺进去不疼。甚至有点凉。但你会开始发痒。'
    },
    { id: 'w1303', type: 'weapon', subtype: 'dagger', name: '五毒匕', faction: '药王谷', quality: 'rare',
      atk: 6, spd: 5, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'poison_double', desc: '尸蛊层数翻倍，直接伤害-30%',
        trigger: { passive: true }, effect: { shigu_double: true, dmg_reduce: 0.3 } },
      inscriptionSlots: 2,
      desc: '附了灵气，有了自己的脾气。药王谷的人说那不是痒，是尸蛊在找路。'
    },
    { id: 'w1304', type: 'weapon', subtype: 'dagger', name: '五毒匕', faction: '药王谷', quality: 'epic',
      atk: 12, spd: 8, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'poison_double', desc: '尸蛊层数翻倍，直接伤害-30%',
        trigger: { passive: true }, effect: { shigu_double: true, dmg_reduce: 0.3 } },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。夜深人静时，偶尔自鸣。'
    },
    { id: 'w1305', type: 'weapon', subtype: 'dagger', name: '五毒·蚀骨', faction: '药王谷', quality: 'legendary',
      atk: 22, spd: 12, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'poison_double', desc: '尸蛊层数翻倍，直接伤害-30%',
        trigger: { passive: true }, effect: { shigu_double: true, dmg_reduce: 0.3 } },
      inscriptionSlots: 4,
      desc: '药王谷百草婆婆年轻时的本命匕。她说这把匕首杀过一个人。那个人死了七天才倒下。倒下的时候，骨头是软的。'
    },

    // ── 业火扇（焰心教）──────────────────────────────
    { id: 'w1401', type: 'weapon', subtype: 'fan', name: '业火扇', faction: '焰心教', quality: 'mortal',
      atk: 2, spd: 1, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'fire_enhance', desc: '业火层数+2，火系技能伤害+10%',
        trigger: { passive: true }, effect: { yehuo_add: 2, fire_dmg_bonus: 0.1 } },
      inscriptionSlots: 0,
      desc: '扇骨是某种烧不毁的木料。扇面是绢，展开时上面的图案不是画的，是烧上去的。'
    },
    { id: 'w1402', type: 'weapon', subtype: 'fan', name: '业火扇', faction: '焰心教', quality: 'refined',
      atk: 4, spd: 2, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'fire_enhance', desc: '业火层数+2，火系技能伤害+15%',
        trigger: { passive: true }, effect: { yehuo_add: 2, fire_dmg_bonus: 0.15 } },
      inscriptionSlots: 1,
      desc: '匠师用心锻过，入了品流。每一道烧痕都是一个人的名字。'
    },
    { id: 'w1403', type: 'weapon', subtype: 'fan', name: '业火扇', faction: '焰心教', quality: 'rare',
      atk: 8, spd: 3, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'fire_enhance', desc: '业火层数+2，火系技能伤害+20%',
        trigger: { passive: true }, effect: { yehuo_add: 2, fire_dmg_bonus: 0.2 } },
      inscriptionSlots: 2,
      desc: '附了灵气，有了自己的脾气。扇一开，热浪扑面，业火缠身。'
    },
    { id: 'w1404', type: 'weapon', subtype: 'fan', name: '业火扇', faction: '焰心教', quality: 'epic',
      atk: 15, spd: 5, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'fire_enhance', desc: '业火层数+2，火系技能伤害+25%',
        trigger: { passive: true }, effect: { yehuo_add: 2, fire_dmg_bonus: 0.25 } },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。夜深人静时，偶尔自鸣。'
    },
    { id: 'w1405', type: 'weapon', subtype: 'fan', name: '业火·焚心', faction: '焰心教', quality: 'legendary',
      atk: 25, spd: 8, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'fire_enhance', desc: '业火层数+2，火系技能伤害+30%',
        trigger: { passive: true }, effect: { yehuo_add: 2, fire_dmg_bonus: 0.3 } },
      inscriptionSlots: 4,
      desc: '焰心教圣火旁供着的一把扇。扇面已尽，无字可烧。焰骨真人说它烧完了三千年的债。但扇骨还是热的。他说：债还没烧完。是你的。'
    },

    // ── 寒渊刺（归墟）──────────────────────────────
    { id: 'w1501', type: 'weapon', subtype: 'needle', name: '寒渊刺', faction: '归墟', quality: 'mortal',
      atk: 1, spd: 2, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'ice_burst', desc: '凝渊层数+2，触发蒸发时额外造成冰伤',
        trigger: { passive: true }, effect: { ningyuan_add: 2, evaporate_bonus: 0.8 } },
      inscriptionSlots: 0,
      desc: '比针粗一点，比刺细一点。归墟的守墓人从墓道墙壁里拔出来的——不是铁打的，是冰凝的。'
    },
    { id: 'w1502', type: 'weapon', subtype: 'needle', name: '寒渊刺', faction: '归墟', quality: 'refined',
      atk: 3, spd: 4, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'ice_burst', desc: '凝渊层数+2，触发蒸发时额外造成冰伤',
        trigger: { passive: true }, effect: { ningyuan_add: 2, evaporate_bonus: 1.0 } },
      inscriptionSlots: 1,
      desc: '匠师用心锻过，入了品流。握在手里，指头先是麻，然后白，然后没感觉了。'
    },
    { id: 'w1503', type: 'weapon', subtype: 'needle', name: '寒渊刺', faction: '归墟', quality: 'rare',
      atk: 6, spd: 6, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'ice_burst', desc: '凝渊层数+2，触发蒸发时额外造成冰伤',
        trigger: { passive: true }, effect: { ningyuan_add: 2, evaporate_bonus: 1.2 } },
      inscriptionSlots: 2,
      desc: '附了灵气，有了自己的脾气。刺入人体时没有血溅出来——血在伤口处冻住了。'
    },
    { id: 'w1504', type: 'weapon', subtype: 'needle', name: '寒渊刺', faction: '归墟', quality: 'epic',
      atk: 12, spd: 10, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'ice_burst', desc: '凝渊层数+2，触发蒸发时额外造成冰伤',
        trigger: { passive: true }, effect: { ningyuan_add: 2, evaporate_bonus: 1.5 } },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。夜深人静时，偶尔自鸣。'
    },
    { id: 'w1505', type: 'weapon', subtype: 'needle', name: '寒渊·止息', faction: '归墟', quality: 'legendary',
      atk: 20, spd: 15, hp: 0, mp: 0, def: 0,
      amplifier: { type: 'ice_burst', desc: '凝渊层数+2，触发蒸发时额外造成冰伤',
        trigger: { passive: true }, effect: { ningyuan_add: 2, evaporate_bonus: 2.0 } },
      inscriptionSlots: 4,
      desc: '归墟最底层四千级台阶尽头插着的一根冰刺。守墓人说那是上一个走到这里的人留下的。那人没有回头。冰刺上有一行字，但冻得太厉害，看不清。好像是——别下来。'
    },

    // ── 血饮刀（血禅寺）──────────────────────────────
    { id: 'w1601', type: 'weapon', subtype: 'saber', name: '血饮刀', faction: '血禅寺', quality: 'mortal',
      atk: 3, spd: 0, hp: 0, mp: 0, def: 0, lifesteal: 2,
      amplifier: { type: 'bleed_enhance', desc: '裂伤伤害+30%，吸血+5%',
        trigger: { passive: true }, effect: { lieshang_dmg_bonus: 0.3, lifesteal_bonus: 0.05 } },
      inscriptionSlots: 0,
      desc: '刀身弯如新月，刃口不快——不快才好。快的刀切口整齐，血流畅；不快的刀撕开伤口，血往外涌。'
    },
    { id: 'w1602', type: 'weapon', subtype: 'saber', name: '血饮刀', faction: '血禅寺', quality: 'refined',
      atk: 6, spd: 0, hp: 0, mp: 0, def: 0, lifesteal: 3,
      amplifier: { type: 'bleed_enhance', desc: '裂伤伤害+40%，吸血+5%',
        trigger: { passive: true }, effect: { lieshang_dmg_bonus: 0.4, lifesteal_bonus: 0.05 } },
      inscriptionSlots: 1,
      desc: '匠师用心锻过，入了品流。血禅寺的僧人说，刀不是凶器，是镜子。'
    },
    { id: 'w1603', type: 'weapon', subtype: 'saber', name: '血饮刀', faction: '血禅寺', quality: 'rare',
      atk: 10, spd: 0, hp: 0, mp: 0, def: 0, lifesteal: 5,
      amplifier: { type: 'bleed_enhance', desc: '裂伤伤害+50%，吸血+5%',
        trigger: { passive: true }, effect: { lieshang_dmg_bonus: 0.5, lifesteal_bonus: 0.05 } },
      inscriptionSlots: 2,
      desc: '附了灵气，有了自己的脾气。裂伤之处，血如泉涌，刀吸了去，你便轻了。'
    },
    { id: 'w1604', type: 'weapon', subtype: 'saber', name: '血饮刀', faction: '血禅寺', quality: 'epic',
      atk: 18, spd: 0, hp: 0, mp: 0, def: 0, lifesteal: 8,
      amplifier: { type: 'bleed_enhance', desc: '裂伤伤害+60%，吸血+5%',
        trigger: { passive: true }, effect: { lieshang_dmg_bonus: 0.6, lifesteal_bonus: 0.05 } },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。夜深人静时，偶尔自鸣。'
    },
    { id: 'w1605', type: 'weapon', subtype: 'saber', name: '血饮·照魂', faction: '血禅寺', quality: 'legendary',
      atk: 32, spd: 0, hp: 0, mp: 0, def: 0, lifesteal: 12,
      amplifier: { type: 'bleed_enhance', desc: '裂伤伤害+80%，吸血+5%',
        trigger: { passive: true }, effect: { lieshang_dmg_bonus: 0.8, lifesteal_bonus: 0.05 } },
      inscriptionSlots: 4,
      desc: '血禅寺黑镜前供着的一把刀。刀面比镜子还亮。你照它，看见的不是自己——是上一个人。他还在流血。刀也还在喝。'
    },

    // ── 镇魂符（青囊庐）──────────────────────────────
    { id: 'w1701', type: 'weapon', subtype: 'talisman', name: '镇魂符', faction: '青囊庐', quality: 'mortal',
      atk: 0, spd: 0, hp: 0, mp: 10, def: 1,
      amplifier: { type: 'mp_efficiency', desc: '真元消耗-10%，伤害-5%',
        trigger: { passive: true }, effect: { mp_cost_reduce: 0.1, dmg_reduce: 0.05 } },
      inscriptionSlots: 0,
      desc: '一张黄纸，朱砂手书。笔迹工整得不像人写的——因为不是人写的。贴在身上，真元流转慢了三分，出招也钝了三分——但你稳了。'
    },
    { id: 'w1702', type: 'weapon', subtype: 'talisman', name: '镇魂符', faction: '青囊庐', quality: 'refined',
      atk: 0, spd: 0, hp: 0, mp: 20, def: 2,
      amplifier: { type: 'mp_efficiency', desc: '真元消耗-12%，伤害-8%',
        trigger: { passive: true }, effect: { mp_cost_reduce: 0.12, dmg_reduce: 0.08 } },
      inscriptionSlots: 1,
      desc: '匠师用心锻过，入了品流。青囊庐的药不医祖师留下的方子，按方画符。'
    },
    { id: 'w1703', type: 'weapon', subtype: 'talisman', name: '镇魂符', faction: '青囊庐', quality: 'rare',
      atk: 0, spd: 0, hp: 0, mp: 40, def: 4,
      amplifier: { type: 'mp_efficiency', desc: '真元消耗-15%，伤害-10%',
        trigger: { passive: true }, effect: { mp_cost_reduce: 0.15, dmg_reduce: 0.1 } },
      inscriptionSlots: 2,
      desc: '附了灵气，有了自己的脾气。符成时纸上的字会自己动一下，像活过来。'
    },
    { id: 'w1704', type: 'weapon', subtype: 'talisman', name: '镇魂符', faction: '青囊庐', quality: 'epic',
      atk: 0, spd: 0, hp: 0, mp: 80, def: 7,
      amplifier: { type: 'mp_efficiency', desc: '真元消耗-18%，伤害-12%',
        trigger: { passive: true }, effect: { mp_cost_reduce: 0.18, dmg_reduce: 0.12 } },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。夜深人静时，偶尔自鸣。'
    },
    { id: 'w1705', type: 'weapon', subtype: 'talisman', name: '镇魂·药方', faction: '青囊庐', quality: 'legendary',
      atk: 0, spd: 0, hp: 0, mp: 150, def: 12,
      amplifier: { type: 'mp_efficiency', desc: '真元消耗-20%，伤害-15%',
        trigger: { passive: true }, effect: { mp_cost_reduce: 0.2, dmg_reduce: 0.15 } },
      inscriptionSlots: 4,
      desc: '青囊庐药炉里炼出来的一张符。不是丹。药不医的方子开出来的最后一味药。符上写着你的名字。你还没死，但符已经写好了。'
    }
  ], // end weapons

  // ════════════════════════════════════════════════════════════
  //  饰品库（12种 × 5品质 = 60）
  // ════════════════════════════════════════════════════════════
  accessories: [

    // ── 追风逐月（逍遥驿）──────────────────────────
    { id: 'a1001', type: 'accessory', subtype: 'scroll', name: '追风逐月', faction: '逍遥驿', quality: 'mortal',
      atk: 1, spd: 1, hp: 0, mp: 0, def: 0,
      effect: { type: 'attack_counter', desc: '每5次攻击后施展拳风，造成攻击力×150%伤害',
        trigger: { every_n_attacks: 5 }, value: 1.5 },
      inscriptionSlots: 0,
      desc: '半页拳谱，纸黄了，字还看得清。写的是追风逐月——逍遥驿失传的轻功拳法。'
    },
    { id: 'a1002', type: 'accessory', subtype: 'scroll', name: '追风逐月', faction: '逍遥驿', quality: 'refined',
      atk: 2, spd: 2, hp: 0, mp: 0, def: 0,
      effect: { type: 'attack_counter', desc: '每4次攻击后施展拳风，造成攻击力×160%伤害',
        trigger: { every_n_attacks: 4 }, value: 1.6 },
      inscriptionSlots: 1,
      desc: '半页拳谱，纸黄了，字还看得清。打得多了，拳风自己会出来。'
    },
    { id: 'a1003', type: 'accessory', subtype: 'scroll', name: '追风逐月', faction: '逍遥驿', quality: 'rare',
      atk: 4, spd: 3, hp: 0, mp: 0, def: 0,
      effect: { type: 'attack_counter', desc: '每4次攻击后施展拳风，造成攻击力×170%伤害',
        trigger: { every_n_attacks: 4 }, value: 1.7 },
      inscriptionSlots: 2,
      desc: '附了灵气，有了自己的脾气。不是你在打，是风在帮你打。'
    },
    { id: 'a1004', type: 'accessory', subtype: 'scroll', name: '追风逐月', faction: '逍遥驿', quality: 'epic',
      atk: 8, spd: 5, hp: 0, mp: 0, def: 0,
      effect: { type: 'attack_counter', desc: '每3次攻击后施展拳风，造成攻击力×180%伤害',
        trigger: { every_n_attacks: 3 }, value: 1.8 },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。驿长年轻时用的。驿长不年轻了，拳谱也只剩半页。'
    },
    { id: 'a1005', type: 'accessory', subtype: 'scroll', name: '追风逐月', faction: '逍遥驿', quality: 'legendary',
      atk: 15, spd: 8, hp: 0, mp: 0, def: 0,
      effect: { type: 'attack_counter', desc: '每3次攻击后施展拳风，造成攻击力×200%伤害',
        trigger: { every_n_attacks: 3 }, value: 2.0 },
      inscriptionSlots: 4,
      desc: '半页拳谱，纸黄了，字还看得清。但半页够用。打得多了，拳风自己会出来——不是你在打，是风在帮你打。'
    },

    // ── 太合无极（古老传承）──────────────────────────
    { id: 'a1101', type: 'accessory', subtype: 'manuscript', name: '太合无极', faction: '无', quality: 'mortal',
      atk: 0, spd: 0, hp: 0, mp: 0, def: 0, critProb: 10, critRate: 5,
      effect: { type: 'crit_boost', desc: '暴击概率+10%，暴击时5%概率伤害翻倍',
        trigger: { on_crit: true }, value: 2.0, crit_prob_bonus: 0.1 },
      inscriptionSlots: 0,
      desc: '一卷竹简，浸在油里保存了不知多少年。简上的字不是刻的——是长的。'
    },
    { id: 'a1102', type: 'accessory', subtype: 'manuscript', name: '太合无极', faction: '无', quality: 'refined',
      atk: 0, spd: 0, hp: 0, mp: 0, def: 0, critProb: 15, critRate: 8,
      effect: { type: 'crit_boost', desc: '暴击概率+15%，暴击时5%概率伤害翻倍',
        trigger: { on_crit: true }, value: 2.0, crit_prob_bonus: 0.15 },
      inscriptionSlots: 1,
      desc: '一卷竹简。字会变。你第一次读阴阳相济，第二次读阴阳相蚀。'
    },
    { id: 'a1103', type: 'accessory', subtype: 'manuscript', name: '太合无极', faction: '无', quality: 'rare',
      atk: 0, spd: 0, hp: 0, mp: 0, def: 0, critProb: 25, critRate: 10,
      effect: { type: 'crit_boost', desc: '暴击概率+25%，暴击时5%概率伤害翻倍',
        trigger: { on_crit: true }, value: 2.0, crit_prob_bonus: 0.25 },
      inscriptionSlots: 2,
      desc: '附了灵气。太合者，万物归一。无极者，一也不剩。'
    },
    { id: 'a1104', type: 'accessory', subtype: 'manuscript', name: '太合无极', faction: '无', quality: 'epic',
      atk: 0, spd: 0, hp: 0, mp: 0, def: 0, critProb: 35, critRate: 15,
      effect: { type: 'crit_boost', desc: '暴击概率+35%，暴击时5%概率伤害翻倍',
        trigger: { on_crit: true }, value: 2.0, crit_prob_bonus: 0.35 },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。第三次读时，竹简自己合上了。'
    },
    { id: 'a1105', type: 'accessory', subtype: 'manuscript', name: '太合无极', faction: '无', quality: 'legendary',
      atk: 0, spd: 0, hp: 0, mp: 0, def: 0, critProb: 40, critRate: 20,
      effect: { type: 'crit_boost', desc: '暴击概率+40%，暴击时5%概率伤害翻倍',
        trigger: { on_crit: true }, value: 2.0, crit_prob_bonus: 0.4 },
      inscriptionSlots: 4,
      desc: '一卷竹简，浸在油里保存了不知多少年。简上的字不是刻的——是长的。竹子自己长出来的字。读的时候要注意：字会变。你第一次读阴阳相济，第二次读阴阳相蚀，第三次——没有第三次。竹简自己合上了。太合者，万物归一。无极者，一也不剩。'
    },

    // ── 灵兔三窟（逍遥驿）──────────────────────────
    { id: 'a1201', type: 'accessory', subtype: 'parchment', name: '灵兔三窟', faction: '逍遥驿', quality: 'mortal',
      atk: 0, spd: 1, hp: 0, mp: 0, def: 0, dodge: 3,
      effect: { type: 'dodge_heal', desc: '闪避+3%，闪避后回气血上限×2%',
        trigger: { on_dodge: true }, heal_pct: 0.02 },
      inscriptionSlots: 0,
      desc: '一张羊皮纸，上面画了三只兔子。三只兔子共用三只耳朵——画法古怪，但看久了觉得合理。'
    },
    { id: 'a1202', type: 'accessory', subtype: 'parchment', name: '灵兔三窟', faction: '逍遥驿', quality: 'refined',
      atk: 0, spd: 2, hp: 0, mp: 0, def: 0, dodge: 4,
      effect: { type: 'dodge_heal', desc: '闪避+4%，闪避后回气血上限×3%',
        trigger: { on_dodge: true }, heal_pct: 0.03 },
      inscriptionSlots: 1,
      desc: '一张羊皮纸。逍遥驿的老江湖说，打不过就跑。跑不掉就闪。'
    },
    { id: 'a1203', type: 'accessory', subtype: 'parchment', name: '灵兔三窟', faction: '逍遥驿', quality: 'rare',
      atk: 0, spd: 3, hp: 0, mp: 0, def: 0, dodge: 6,
      effect: { type: 'dodge_heal', desc: '闪避+6%，闪避后回气血上限×4%',
        trigger: { on_dodge: true }, heal_pct: 0.04 },
      inscriptionSlots: 2,
      desc: '附了灵气，有了自己的脾气。窟窟都是退路。'
    },
    { id: 'a1204', type: 'accessory', subtype: 'parchment', name: '灵兔三窟', faction: '逍遥驿', quality: 'epic',
      atk: 0, spd: 5, hp: 0, mp: 0, def: 0, dodge: 10,
      effect: { type: 'dodge_heal', desc: '闪避+10%，闪避后回气血上限×5%',
        trigger: { on_dodge: true }, heal_pct: 0.05 },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。活着比赢重要。'
    },
    { id: 'a1205', type: 'accessory', subtype: 'parchment', name: '灵兔三窟', faction: '逍遥驿', quality: 'legendary',
      atk: 0, spd: 8, hp: 0, mp: 0, def: 0, dodge: 15,
      effect: { type: 'dodge_heal', desc: '闪避+15%，闪避后回气血上限×8%',
        trigger: { on_dodge: true }, heal_pct: 0.08 },
      inscriptionSlots: 4,
      desc: '一张羊皮纸，上面画了三只兔子。三只兔子共用三只耳朵——画法古怪，但看久了觉得合理。逍遥驿的老江湖说，打不过就跑。跑不掉就闪。闪开了就喘口气。活着比赢重要。灵兔三窟，窟窟都是退路。'
    },

    // ── 燎原之势（焰心教）──────────────────────────
    { id: 'a1301', type: 'accessory', subtype: 'fire_scroll', name: '燎原之势', faction: '焰心教', quality: 'mortal',
      atk: 1, spd: 0, hp: 0, mp: 0, def: 0, fireAtk: 1,
      effect: { type: 'attack_burn', desc: '每5次招式后附加1层业火',
        trigger: { every_n_attacks: 5 }, yehuo_add: 1 },
      inscriptionSlots: 0,
      desc: '一片烧焦的绢帛。字迹被火烤得发卷，但还认得出。'
    },
    { id: 'a1302', type: 'accessory', subtype: 'fire_scroll', name: '燎原之势', faction: '焰心教', quality: 'refined',
      atk: 2, spd: 0, hp: 0, mp: 0, def: 0, fireAtk: 2,
      effect: { type: 'attack_burn', desc: '每4次招式后附加1层业火',
        trigger: { every_n_attacks: 4 }, yehuo_add: 1 },
      inscriptionSlots: 1,
      desc: '一片烧焦的绢帛。火不在大，在续。一薪一薪投进去。'
    },
    { id: 'a1303', type: 'accessory', subtype: 'fire_scroll', name: '燎原之势', faction: '焰心教', quality: 'rare',
      atk: 3, spd: 0, hp: 0, mp: 0, def: 0, fireAtk: 3,
      effect: { type: 'attack_burn', desc: '每4次招式后附加2层业火',
        trigger: { every_n_attacks: 4 }, yehuo_add: 2 },
      inscriptionSlots: 2,
      desc: '附了灵气。读的时候手指发烫。不是纸的问题，是你体内的火在应。'
    },
    { id: 'a1304', type: 'accessory', subtype: 'fire_scroll', name: '燎原之势', faction: '焰心教', quality: 'epic',
      atk: 5, spd: 0, hp: 0, mp: 0, def: 0, fireAtk: 5,
      effect: { type: 'attack_burn', desc: '每3次招式后附加2层业火',
        trigger: { every_n_attacks: 3 }, yehuo_add: 2 },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。总有一天，原上草木皆燃。'
    },
    { id: 'a1305', type: 'accessory', subtype: 'fire_scroll', name: '燎原之势', faction: '焰心教', quality: 'legendary',
      atk: 8, spd: 0, hp: 0, mp: 0, def: 0, fireAtk: 8,
      effect: { type: 'attack_burn', desc: '每3次招式后附加3层业火',
        trigger: { every_n_attacks: 3 }, yehuo_add: 3 },
      inscriptionSlots: 4,
      desc: '一片烧焦的绢帛，焰心教圣火旁抄录的残篇。字迹被火烤得发卷，但还认得出——写的不是功法，是心得。火不在大，在续。一薪一薪投进去，总有一天，原上草木皆燃。读的时候手指发烫。不是纸的问题，是你体内的火在应。'
    },

    // ── 御火真诀（焰心教）──────────────────────────
    { id: 'a1401', type: 'accessory', subtype: 'fire_scroll', name: '御火真诀', faction: '焰心教', quality: 'mortal',
      atk: 2, spd: 0, hp: 0, mp: 0, def: 0, fireAtk: 2,
      effect: { type: 'fire_chase', desc: '火系攻击后30%概率发射火球，造成攻击力×120%伤害',
        trigger: { after_fire_attack: true }, prob: 0.3, value: 1.2 },
      inscriptionSlots: 0,
      desc: '半个卷轴，焰心教内门残卷。卷轴本身是温的——不是余温，是火在里面睡。'
    },
    { id: 'a1402', type: 'accessory', subtype: 'fire_scroll', name: '御火真诀', faction: '焰心教', quality: 'refined',
      atk: 3, spd: 0, hp: 0, mp: 0, def: 0, fireAtk: 3,
      effect: { type: 'fire_chase', desc: '火系攻击后35%概率发射火球，造成攻击力×130%伤害',
        trigger: { after_fire_attack: true }, prob: 0.35, value: 1.3 },
      inscriptionSlots: 1,
      desc: '半个卷轴。展开时，火醒了。火球不是你发的，是火想发的。'
    },
    { id: 'a1403', type: 'accessory', subtype: 'fire_scroll', name: '御火真诀', faction: '焰心教', quality: 'rare',
      atk: 5, spd: 0, hp: 0, mp: 0, def: 0, fireAtk: 5,
      effect: { type: 'fire_chase', desc: '火系攻击后40%概率发射火球，造成攻击力×140%伤害',
        trigger: { after_fire_attack: true }, prob: 0.4, value: 1.4 },
      inscriptionSlots: 2,
      desc: '附了灵气。御火者，不是你控火，是火认你。'
    },
    { id: 'a1404', type: 'accessory', subtype: 'fire_scroll', name: '御火真诀', faction: '焰心教', quality: 'epic',
      atk: 8, spd: 0, hp: 0, mp: 0, def: 0, fireAtk: 8,
      effect: { type: 'fire_chase', desc: '火系攻击后45%概率发射火球，造成攻击力×150%伤害',
        trigger: { after_fire_attack: true }, prob: 0.45, value: 1.5 },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。你打出一掌火，火觉得不够——它自己又追了一步。'
    },
    { id: 'a1405', type: 'accessory', subtype: 'fire_scroll', name: '御火真诀', faction: '焰心教', quality: 'legendary',
      atk: 12, spd: 0, hp: 0, mp: 0, def: 0, fireAtk: 12,
      effect: { type: 'fire_chase', desc: '火系攻击后50%概率发射火球，造成攻击力×180%伤害',
        trigger: { after_fire_attack: true }, prob: 0.5, value: 1.8 },
      inscriptionSlots: 4,
      desc: '半个卷轴，焰心教内门残卷。卷轴本身是温的——不是余温，是火在里面睡。展开时，火醒了。御火者，不是你控火，是火认你。你打出一掌火，火觉得不够——它自己又追了一步。那一步就是火球。火球不是你发的，是火想发的。'
    },

    // ── 冰蛊双修（药王谷×归墟）──────────────────────────
    { id: 'a1501', type: 'accessory', subtype: 'forbidden_book', name: '冰蛊双修', faction: '药王谷', quality: 'mortal',
      atk: 1, spd: 1, hp: 0, mp: 0, def: 0,
      effect: { type: 'cross_trigger', desc: '施加尸蛊后20%概率使随机冰系技能CD-1s',
        trigger: { after_shigu: true }, prob: 0.2, value: 1 },
      inscriptionSlots: 0,
      desc: '一册被虫蛀过的禁术手札。药王谷和归墟都不承认它的存在——但两家的藏书阁里都偷偷留了一本。'
    },
    { id: 'a1502', type: 'accessory', subtype: 'forbidden_book', name: '冰蛊双修', faction: '药王谷', quality: 'refined',
      atk: 2, spd: 2, hp: 0, mp: 0, def: 0,
      effect: { type: 'cross_trigger', desc: '施加尸蛊后25%概率使随机冰系技能CD-1s',
        trigger: { after_shigu: true }, prob: 0.25, value: 1 },
      inscriptionSlots: 1,
      desc: '一册被虫蛀过的禁术手札。尸蛊是药王谷的毒，凝渊是归墟的寒。两样东西不该放在一起。'
    },
    { id: 'a1503', type: 'accessory', subtype: 'forbidden_book', name: '冰蛊双修', faction: '药王谷', quality: 'rare',
      atk: 4, spd: 3, hp: 0, mp: 0, def: 0,
      effect: { type: 'cross_trigger', desc: '施加尸蛊后30%概率使随机冰系技能CD-1s',
        trigger: { after_shigu: true }, prob: 0.3, value: 1 },
      inscriptionSlots: 2,
      desc: '附了灵气。蛊入骨时，冰也会跑。跑得比人快。'
    },
    { id: 'a1504', type: 'accessory', subtype: 'forbidden_book', name: '冰蛊双修', faction: '药王谷', quality: 'epic',
      atk: 6, spd: 4, hp: 0, mp: 0, def: 0,
      effect: { type: 'cross_trigger', desc: '施加尸蛊后35%概率使随机冰系技能CD-1s',
        trigger: { after_shigu: true }, prob: 0.35, value: 1 },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。放在一起的人，要么是天才，要么是疯子。'
    },
    { id: 'a1505', type: 'accessory', subtype: 'forbidden_book', name: '冰蛊双修', faction: '药王谷', quality: 'legendary',
      atk: 10, spd: 6, hp: 0, mp: 0, def: 0,
      effect: { type: 'cross_trigger', desc: '施加尸蛊后40%概率使随机冰系技能CD-1s',
        trigger: { after_shigu: true }, prob: 0.4, value: 1 },
      inscriptionSlots: 4,
      desc: '一册被虫蛀过的禁术手札。药王谷和归墟都不承认它的存在——但两家的藏书阁里都偷偷留了一本。尸蛊是药王谷的毒，凝渊是归墟的寒。两样东西不该放在一起——放在一起的人，要么是天才，要么是疯子。药王谷说天才。归墟说疯子。手札上写的最后一行字是：蛊入骨时，冰也会跑。跑得比人快。'
    },

    // ── 以柔克刚（武当遗风）──────────────────────────
    { id: 'a1601', type: 'accessory', subtype: 'box_note', name: '以柔克刚', faction: '无', quality: 'mortal',
      atk: 1, spd: 0, hp: 0, mp: 0, def: 0, dodge: 1,
      effect: { type: 'dodge_counter', desc: '闪避后30%概率追击，造成攻击力×100%伤害',
        trigger: { on_dodge: true }, prob: 0.3, value: 1.0 },
      inscriptionSlots: 0,
      desc: '一页泛黄的拳谱，从某座废弃道观的墙缝里抠出来的。字是行书，写的人性子慢。'
    },
    { id: 'a1602', type: 'accessory', subtype: 'box_note', name: '以柔克刚', faction: '无', quality: 'refined',
      atk: 2, spd: 0, hp: 0, mp: 0, def: 0, dodge: 2,
      effect: { type: 'dodge_counter', desc: '闪避后35%概率追击，造成攻击力×120%伤害',
        trigger: { on_dodge: true }, prob: 0.35, value: 1.2 },
      inscriptionSlots: 1,
      desc: '一页泛黄的拳谱。别人打你，你让；让完了，你打回去。'
    },
    { id: 'a1603', type: 'accessory', subtype: 'box_note', name: '以柔克刚', faction: '无', quality: 'rare',
      atk: 4, spd: 0, hp: 0, mp: 0, def: 0, dodge: 3,
      effect: { type: 'dodge_counter', desc: '闪避后40%概率追击，造成攻击力×140%伤害',
        trigger: { on_dodge: true }, prob: 0.4, value: 1.4 },
      inscriptionSlots: 2,
      desc: '附了灵气。打空了的人最脆弱。这叫借力打力。'
    },
    { id: 'a1604', type: 'accessory', subtype: 'box_note', name: '以柔克刚', faction: '无', quality: 'epic',
      atk: 6, spd: 0, hp: 0, mp: 0, def: 0, dodge: 5,
      effect: { type: 'dodge_counter', desc: '闪避后45%概率追击，造成攻击力×160%伤害',
        trigger: { on_dodge: true }, prob: 0.45, value: 1.6 },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。不是柔克刚，是你比他活得久。'
    },
    { id: 'a1605', type: 'accessory', subtype: 'box_note', name: '以柔克刚', faction: '无', quality: 'legendary',
      atk: 10, spd: 0, hp: 0, mp: 0, def: 0, dodge: 8,
      effect: { type: 'dodge_counter', desc: '闪避后50%概率追击，造成攻击力×200%伤害',
        trigger: { on_dodge: true }, prob: 0.5, value: 2.0 },
      inscriptionSlots: 4,
      desc: '一页泛黄的拳谱，从某座废弃道观的墙缝里抠出来的。字是行书，写的人性子慢——一笔一划都不急。拳谱讲的也不急：别人打你，你让；让完了，你打回去。不是同一招——是别人打空了你再打。打空了的人最脆弱。这叫借力打力，也叫以柔克刚。但真正练到家的老道说：不是柔克刚，是你比他活得久。'
    },

    // ── 金钟罩残篇（少林遗踪）──────────────────────────
    { id: 'a1701', type: 'accessory', subtype: 'sutra', name: '金钟罩残篇', faction: '无', quality: 'mortal',
      atk: 0, spd: 0, hp: 10, mp: 0, def: 2,
      effect: { type: 'round_shield', desc: '回合开始时获得最大气血10%的护甲',
        trigger: { on_round_start: true }, shield_pct: 0.1 },
      inscriptionSlots: 0,
      desc: '一卷残破经文，从不知名古寺佛像肚子里发现的。寺早塌了，佛像也碎了，但经文完好。'
    },
    { id: 'a1702', type: 'accessory', subtype: 'sutra', name: '金钟罩残篇', faction: '无', quality: 'refined',
      atk: 0, spd: 0, hp: 20, mp: 0, def: 4,
      effect: { type: 'round_shield', desc: '回合开始时获得最大气血12%的护甲',
        trigger: { on_round_start: true }, shield_pct: 0.12 },
      inscriptionSlots: 1,
      desc: '一卷残破经文。写的不是经——是功法。金钟罩，外功硬气功的顶峰。'
    },
    { id: 'a1703', type: 'accessory', subtype: 'sutra', name: '金钟罩残篇', faction: '无', quality: 'rare',
      atk: 0, spd: 0, hp: 30, mp: 0, def: 6,
      effect: { type: 'round_shield', desc: '回合开始时获得最大气血15%的护甲',
        trigger: { on_round_start: true }, shield_pct: 0.15 },
      inscriptionSlots: 2,
      desc: '附了灵气。练成之后，体表如铜浇铁铸。'
    },
    { id: 'a1704', type: 'accessory', subtype: 'sutra', name: '金钟罩残篇', faction: '无', quality: 'epic',
      atk: 0, spd: 0, hp: 50, mp: 0, def: 10,
      effect: { type: 'round_shield', desc: '回合开始时获得最大气血15%的护甲',
        trigger: { on_round_start: true }, shield_pct: 0.15 },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。但残篇只有上半卷——下半卷据说在佛像的手心里。手没了。'
    },
    { id: 'a1705', type: 'accessory', subtype: 'sutra', name: '金钟罩残篇', faction: '无', quality: 'legendary',
      atk: 0, spd: 0, hp: 80, mp: 0, def: 15,
      effect: { type: 'round_shield', desc: '回合开始时获得最大气血20%的护甲',
        trigger: { on_round_start: true }, shield_pct: 0.2 },
      inscriptionSlots: 4,
      desc: '一卷残破经文，夹在某个不知名古寺佛像肚子里发现的。寺早塌了，佛像也碎了，但经文完好。写的不是经——是功法。金钟罩，外功硬气功的顶峰。练成之后，体表如铜浇铁铸。但残篇只有上半卷——下半卷据说在佛像的手心里。手没了。可能是砸碎了，可能是自己走的。'
    },

    // ── 铁布衫要诀（江湖外功）──────────────────────────
    { id: 'a1801', type: 'accessory', subtype: 'manual', name: '铁布衫要诀', faction: '无', quality: 'mortal',
      atk: 0, spd: 0, hp: 5, mp: 0, def: 1,
      effect: { type: 'attack_shield', desc: '每4次招式后获得最大气血3%的护甲',
        trigger: { every_n_attacks: 4 }, shield_pct: 0.03 },
      inscriptionSlots: 0,
      desc: '一张羊皮，写满了口诀。铁布衫不是穿铁衣——是练到一定火候，皮肉比铁硬。'
    },
    { id: 'a1802', type: 'accessory', subtype: 'manual', name: '铁布衫要诀', faction: '无', quality: 'refined',
      atk: 0, spd: 0, hp: 10, mp: 0, def: 2,
      effect: { type: 'attack_shield', desc: '每4次招式后获得最大气血4%的护甲',
        trigger: { every_n_attacks: 4 }, shield_pct: 0.04 },
      inscriptionSlots: 1,
      desc: '一张羊皮。得出招。每出三四招，气走一遍，皮肉就硬一层。'
    },
    { id: 'a1803', type: 'accessory', subtype: 'manual', name: '铁布衫要诀', faction: '无', quality: 'rare',
      atk: 0, spd: 0, hp: 20, mp: 0, def: 4,
      effect: { type: 'attack_shield', desc: '每3次招式后获得最大气血5%的护甲',
        trigger: { every_n_attacks: 3 }, shield_pct: 0.05 },
      inscriptionSlots: 2,
      desc: '附了灵气。打得越多越硬。'
    },
    { id: 'a1804', type: 'accessory', subtype: 'manual', name: '铁布衫要诀', faction: '无', quality: 'epic',
      atk: 0, spd: 0, hp: 35, mp: 0, def: 6,
      effect: { type: 'attack_shield', desc: '每3次招式后获得最大气血6%的护甲',
        trigger: { every_n_attacks: 3 }, shield_pct: 0.06 },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。你问他疼不疼——他不说。'
    },
    { id: 'a1805', type: 'accessory', subtype: 'manual', name: '铁布衫要诀', faction: '无', quality: 'legendary',
      atk: 0, spd: 0, hp: 60, mp: 0, def: 10,
      effect: { type: 'attack_shield', desc: '每3次招式后获得最大气血8%的护甲',
        trigger: { every_n_attacks: 3 }, shield_pct: 0.08 },
      inscriptionSlots: 4,
      desc: '一张羊皮，写满了口诀。铁布衫不是穿铁衣——是练到一定火候，皮肉比铁硬。但这东西得动起来才成——站着挨打不行，得出招。每出三四招，气走一遍，皮肉就硬一层。打得越多越硬。老江湖说，铁布衫练到家的，打架跟穿了一层铁似的。但你问他疼不疼——他不说。'
    },

    // ── 黄铜古镜（镜阁）──────────────────────────
    { id: 'a1901', type: 'accessory', subtype: 'mirror', name: '黄铜古镜', faction: '镜阁', quality: 'mortal',
      atk: 0, spd: 0, hp: 0, mp: 0, def: 1, dodge: 2,
      effect: { type: 'damage_reflect', desc: '受伤害时10%概率反射30%伤害',
        trigger: { on_hit: true }, prob: 0.1, reflect_pct: 0.3 },
      inscriptionSlots: 0,
      desc: '巴掌大的铜镜，绿锈斑驳。但镜面亮得不像铜——像水。照人，清楚；照鬼，更清楚。'
    },
    { id: 'a1902', type: 'accessory', subtype: 'mirror', name: '黄铜古镜', faction: '镜阁', quality: 'refined',
      atk: 0, spd: 0, hp: 0, mp: 0, def: 2, dodge: 3,
      effect: { type: 'damage_reflect', desc: '受伤害时12%概率反射40%伤害',
        trigger: { on_hit: true }, prob: 0.12, reflect_pct: 0.4 },
      inscriptionSlots: 1,
      desc: '巴掌大的铜镜。镜阁的人说，这镜子不是照你用的——是照你身后的那个东西用的。'
    },
    { id: 'a1903', type: 'accessory', subtype: 'mirror', name: '黄铜古镜', faction: '镜阁', quality: 'rare',
      atk: 0, spd: 0, hp: 0, mp: 0, def: 3, dodge: 5,
      effect: { type: 'damage_reflect', desc: '受伤害时15%概率反射50%伤害',
        trigger: { on_hit: true }, prob: 0.15, reflect_pct: 0.5 },
      inscriptionSlots: 2,
      desc: '附了灵气。你被打的时候，镜子帮你看一眼打你的人。看一眼就够了——他也疼。'
    },
    { id: 'a1904', type: 'accessory', subtype: 'mirror', name: '黄铜古镜', faction: '镜阁', quality: 'epic',
      atk: 0, spd: 0, hp: 0, mp: 0, def: 5, dodge: 8,
      effect: { type: 'damage_reflect', desc: '受伤害时18%概率反射60%伤害',
        trigger: { on_hit: true }, prob: 0.18, reflect_pct: 0.6 },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。不是镜子的力，是他看见了自己。'
    },
    { id: 'a1905', type: 'accessory', subtype: 'mirror', name: '黄铜古镜', faction: '镜阁', quality: 'legendary',
      atk: 0, spd: 0, hp: 0, mp: 0, def: 8, dodge: 12,
      effect: { type: 'damage_reflect', desc: '受伤害时25%概率反射80%伤害',
        trigger: { on_hit: true }, prob: 0.25, reflect_pct: 0.8 },
      inscriptionSlots: 4,
      desc: '巴掌大的铜镜，绿锈斑驳。但镜面亮得不像铜——像水。照人，清楚；照鬼，更清楚。镜阁的人说，这镜子不是照你用的——是照你身后的那个东西用的。你被打的时候，镜子帮你看一眼打你的人。看一眼就够了——他也疼。不是镜子的力，是他看见了自己。'
    },

    // ── 血肉念珠（肉慈斋）──────────────────────────
    { id: 'a2001', type: 'accessory', subtype: 'beads', name: '血肉念珠', faction: '肉慈斋', quality: 'mortal',
      atk: 0, spd: 0, hp: 15, mp: 0, def: 0, lifesteal: 1,
      effect: { type: 'low_hp_burst', desc: '气血低于30%时攻击+20%，吸血+5%',
        trigger: { hp_below: 0.3 }, atk_bonus: 0.2, lifesteal_bonus: 0.05 },
      inscriptionSlots: 0,
      desc: '一串念珠，十八颗。材质不明。不是木头，不是骨头——摸上去是温的，有弹性。像皮肤。'
    },
    { id: 'a2002', type: 'accessory', subtype: 'beads', name: '血肉念珠', faction: '肉慈斋', quality: 'refined',
      atk: 0, spd: 0, hp: 30, mp: 0, def: 0, lifesteal: 2,
      effect: { type: 'low_hp_burst', desc: '气血低于30%时攻击+30%，吸血+5%',
        trigger: { hp_below: 0.3 }, atk_bonus: 0.3, lifesteal_bonus: 0.05 },
      inscriptionSlots: 1,
      desc: '一串念珠。捻的时候有节奏，像心跳。你的心跳会跟着它走。'
    },
    { id: 'a2003', type: 'accessory', subtype: 'beads', name: '血肉念珠', faction: '肉慈斋', quality: 'rare',
      atk: 0, spd: 0, hp: 50, mp: 0, def: 0, lifesteal: 3,
      effect: { type: 'low_hp_burst', desc: '气血低于30%时攻击+40%，吸血+5%',
        trigger: { hp_below: 0.3 }, atk_bonus: 0.4, lifesteal_bonus: 0.05 },
      inscriptionSlots: 2,
      desc: '附了灵气。快了，它快；慢了，它慢。血少的时候，它跳得最快。'
    },
    { id: 'a2004', type: 'accessory', subtype: 'beads', name: '血肉念珠', faction: '肉慈斋', quality: 'epic',
      atk: 0, spd: 0, hp: 80, mp: 0, def: 0, lifesteal: 5,
      effect: { type: 'low_hp_burst', desc: '气血低于30%时攻击+50%，吸血+5%',
        trigger: { hp_below: 0.3 }, atk_bonus: 0.5, lifesteal_bonus: 0.05 },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。肉慈斋的僧人说这是历代祖师的遗物——不是死的遗物，是活的时候蜕下来的。'
    },
    { id: 'a2005', type: 'accessory', subtype: 'beads', name: '血肉念珠', faction: '肉慈斋', quality: 'legendary',
      atk: 0, spd: 0, hp: 150, mp: 0, def: 0, lifesteal: 8,
      effect: { type: 'low_hp_burst', desc: '气血低于30%时攻击+70%，吸血+5%',
        trigger: { hp_below: 0.3 }, atk_bonus: 0.7, lifesteal_bonus: 0.05 },
      inscriptionSlots: 4,
      desc: '一串念珠，十八颗。材质不明。不是木头，不是骨头——摸上去是温的，有弹性。像皮肤。肉慈斋的僧人说这是历代祖师的遗物——不是死的遗物，是活的时候蜕下来的。捻的时候有节奏，像心跳。你的心跳会跟着它走。快了，它快；慢了，它慢。血少的时候，它跳得最快——快到你浑身发烫，刀刀见血。'
    },

    // ── 活力（民间养生）──────────────────────────
    { id: 'a2101', type: 'accessory', subtype: 'note', name: '活力', faction: '无', quality: 'mortal',
      atk: 0, spd: 0, hp: 5, mp: 0, def: 0, hpReg: 1,
      effect: { type: 'attack_heal', desc: '每4次招式后回气血上限×1%',
        trigger: { every_n_attacks: 4 }, heal_pct: 0.01 },
      inscriptionSlots: 0,
      desc: '一张泛黄的纸条，写了几行养生口诀。不是什么高深功法——村里老头都会。'
    },
    { id: 'a2102', type: 'accessory', subtype: 'note', name: '活力', faction: '无', quality: 'refined',
      atk: 0, spd: 0, hp: 10, mp: 0, def: 0, hpReg: 2,
      effect: { type: 'attack_heal', desc: '每4次招式后回气血上限×2%',
        trigger: { every_n_attacks: 4 }, heal_pct: 0.02 },
      inscriptionSlots: 1,
      desc: '一张泛黄的纸条。早睡早起，少动怒，多喝热水。'
    },
    { id: 'a2103', type: 'accessory', subtype: 'note', name: '活力', faction: '无', quality: 'rare',
      atk: 0, spd: 0, hp: 20, mp: 0, def: 0, hpReg: 3,
      effect: { type: 'attack_heal', desc: '每3次招式后回气血上限×3%',
        trigger: { every_n_attacks: 3 }, heal_pct: 0.03 },
      inscriptionSlots: 2,
      desc: '附了灵气。打一架看一眼的人，活得比不带的久。'
    },
    { id: 'a2104', type: 'accessory', subtype: 'note', name: '活力', faction: '无', quality: 'epic',
      atk: 0, spd: 0, hp: 35, mp: 0, def: 0, hpReg: 5,
      effect: { type: 'attack_heal', desc: '每3次招式后回气血上限×4%',
        trigger: { every_n_attacks: 3 }, heal_pct: 0.04 },
      inscriptionSlots: 3,
      desc: '蕴了一缕执念在内。打得多，养得多。养生诀要，不要命。'
    },
    { id: 'a2105', type: 'accessory', subtype: 'note', name: '活力', faction: '无', quality: 'legendary',
      atk: 0, spd: 0, hp: 60, mp: 0, def: 0, hpReg: 8,
      effect: { type: 'attack_heal', desc: '每3次招式后回气血上限×5%',
        trigger: { every_n_attacks: 3 }, heal_pct: 0.05 },
      inscriptionSlots: 4,
      desc: '一张泛黄的纸条，写了几行养生口诀。不是什么高深功法——村里老头都会。早睡早起，少动怒，多喝热水。但写在纸条上、随身带着、打一架看一眼的人，活得比不带的久。打得多，养得多。养生诀要，不要命。'
    }
  ], // end accessories

  // ════════════════════════════════════════════════════════════
  //  铭文库（8种 + 8种仙器铭文）
  // ════════════════════════════════════════════════════════════
  inscriptions: [
    { id: 'ins01', name: '破坚', type: 'normal', stat: 'atk', range: [1, 3], weight: 70,
      desc: '锋刃开了，破甲如纸。'
    },
    { id: 'ins02', name: '碎骨', type: 'normal', stat: 'critRate', range: [0.1, 0.2], weight: 20,
      desc: '一击入骨，碎裂有声。'
    },
    { id: 'ins03', name: '凝神', type: 'normal', stat: 'critProb', range: [0.05, 0.1], weight: 10,
      desc: '凝神定气，一击必中。'
    },
    { id: 'ins04', name: '真火', type: 'normal', stat: 'fireAtk', range: [1, 3], weight: 40,
      desc: '刃上带火，非人所点。'
    },
    { id: 'ins05', name: '金身', type: 'normal', stat: 'meleeDef', range: [2, 4], weight: 25,
      desc: '体若金身，刀枪难入。'
    },
    { id: 'ins06', name: '生生', type: 'normal', stat: 'healBonus', range: [1, 3], weight: 20,
      desc: '生生不息，气血自涌。'
    },
    { id: 'ins07', name: '踏雪', type: 'normal', stat: 'dodge', range: [0.03, 0.08], weight: 15,
      desc: '踏雪无痕，寻隙而遁。'
    },
    { id: 'ins08', name: '磐石', type: 'normal', stat: 'maxHp', range: [10, 20], weight: 30,
      desc: '磐石之躯，岿然不动。'
    },
    // 仙器专属铭文
    { id: 'ins09', name: '破坚·极', type: 'legendary', stat: 'atk', value: 5,
      desc: '锋芒已通灵，斩铁如泥。'
    },
    { id: 'ins10', name: '碎骨·极', type: 'legendary', stat: 'critRate', value: 0.3,
      desc: '骨碎声如冰裂，不可复原。'
    },
    { id: 'ins11', name: '凝神·极', type: 'legendary', stat: 'critProb', value: 0.15,
      desc: '神凝如止水，万物皆靶。'
    },
    { id: 'ins12', name: '真火·极', type: 'legendary', stat: 'fireAtk', value: 5,
      desc: '火非人间火，焚物亦焚魂。'
    },
    { id: 'ins13', name: '金身·极', type: 'legendary', stat: 'meleeDef', value: 6,
      desc: '金刚不坏，邪魔退散。'
    },
    { id: 'ins14', name: '生生·极', type: 'legendary', stat: 'healBonus', value: 5,
      desc: '生机不绝，如春回大地。'
    },
    { id: 'ins15', name: '踏雪·极', type: 'legendary', stat: 'dodge', value: 0.12,
      desc: '踏雪无痕，影随风逝。'
    },
    { id: 'ins16', name: '磐石·极', type: 'legendary', stat: 'maxHp', value: 35,
      desc: '磐石之上，万物不可动。'
    }
  ], // end inscriptions

  // ════════════════════════════════════════════════════════════
  //  品质配置
  // ════════════════════════════════════════════════════════════
  qualityConfig: {
    mortal:     { name: '凡品', color: 'gray',    inscriptionSlots: 0, statMultiplier: 1.0, dropWeight: 50 },
    refined:    { name: '良品', color: 'white',   inscriptionSlots: 1, statMultiplier: 1.2, dropWeight: 30 },
    rare:       { name: '上品', color: 'blue',    inscriptionSlots: 2, statMultiplier: 1.5, dropWeight: 15 },
    epic:       { name: '极品', color: 'gold',    inscriptionSlots: 3, statMultiplier: 2.0, dropWeight: 4  },
    legendary:  { name: '仙器', color: 'purple',  inscriptionSlots: 4, statMultiplier: 3.0, dropWeight: 1  }
  },

  // ════════════════════════════════════════════════════════════
  //  词缀库（鉴定时随机）
  // ════════════════════════════════════════════════════════════
  affixes: [
    { id: 'aff01', name: '锐',   desc: '伤害+5%',              stat: { dmgBonus: 0.05 } },
    { id: 'aff02', name: '沉',   desc: '气耗+10%，伤害+20%',    stat: { mpCostBonus: 0.1, dmgBonus: 0.2 } },
    { id: 'aff03', name: '淬毒', desc: '承式附加3回合尸蛊',     stat: { shiguOnHit: 3, shiguRounds: 3 } },
    { id: 'aff04', name: '断刃', desc: '归式伤害+40%，起/承-5%', stat: { slotD_bonus: 0.4, slotAB_penalty: 0.05 } },
    { id: 'aff05', name: '克星', desc: '对畸变敌人伤害+25%',    stat: { corruptDmgBonus: 0.25 } },
    { id: 'aff06', name: '残锋', desc: '起式连续释放两次，第二次-30%', stat: { slotA_double: true, slotA_second_dmg: 0.7 } },
    { id: 'aff07', name: '轻身', desc: '所有招式气耗-8%',       stat: { mpCostBonus: -0.08 } },
    { id: 'aff08', name: '开锋', desc: '归式无视护甲',          stat: { slotD_ignoreDef: true } }
  ]

}; // end COMBAT_EQUIPMENT_V3

// 挂载到 window（桥接层用）
if (typeof window !== 'undefined') window.COMBAT_EQUIPMENT_V3 = COMBAT_EQUIPMENT_V3;
