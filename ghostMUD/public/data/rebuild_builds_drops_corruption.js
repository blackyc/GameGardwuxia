/*
 * rebuild_builds_drops_corruption.js
 * 鬼MUD 武林諸派Build原型 · 奇物掉落表 · 畸變系統
 * 全局變量：BUILDS / MERIDIAN_DROPS / CORRUPTION
 * 加載方式：<script> 標籤引入，其他腳本通過 typeof 檢測
 */

/* =================================================================
 * Part 1: 流派Build原型 (6武修 + 3靈修 = 9大流派)
 * ================================================================= */
const BUILDS = {

  /* ---- 武修·劍宗流 ---- */
  "劍宗流": {
    id: "sword_saint",
    type: "武修",
    style: "高速暴擊刺客",
    coreMeridians: ["天眼脈", "追風脈", "百骸脈"],
    coreTechniques: {
      "天眼脈": "紫微斗數推演",   // per+6, 預讀敵方行動
      "追風脈": "神行百變",       // spd+9, 閃避30%觸發額外行動
      "百骸脈": "萬兵歸宗"        // 全兵器熟練+15
    },
    recommendedTiers: {
      "天眼脈": { wuxiu: "珍品·三重", lingxiu: null },
      "追風脈": { wuxiu: "仙品·四重", lingxiu: null },
      "百骸脈": { wuxiu: "仙品·四重", lingxiu: null }
    },
    auxiliaryMeridians: ["命源脈", "靈台脈"],
    auxiliaryTechniques: {
      "命源脈": "小周天功",       // 精元+40
      "靈台脈": "清心普善咒"     // 神識+30, 抵抗心神攻擊
    },
    recommendedSeals: ["ys_01", "ys_05"],
    sealNotes: "隱龍訣(破隱雙倍·2.0x) + 須臾(額外回合)",
    weapons: ["輕劍", "短匕"],
    weaponNotes: "主輕劍(速度優先) + 副破甲短匕",
    gameplayLoop: "隱龍訣潛行 → 破隱一擊(x2.0) → 須臾額外回合 → 普攻 → 閃避觸發神行百變 → 再行動",
    keySynergy: "追風脈四重(神行百變) + 百骸脈四重(萬兵歸宗) = 閃避即進攻的正反饋循環",
    counters: {
      "拳禪流": "破甲穿透,無視護盾直取要害",
      "槍陣流": "繳械克制,長兵未及身已近",
      "蟲巢流": "逐個擊破,不給蟲群滾雪球"
    },
    counteredBy: {
      "虛空流": "神識看穿潛行,隱龍訣無效",
      "暗殺流": "先手決定勝負,誰快誰贏"
    }
  },

  /* ---- 武修·拳禪流 ---- */
  "拳禪流": {
    id: "fist_zen",
    type: "武修",
    style: "陣地坦克·金剛不壞",
    coreMeridians: ["龍象脈", "金剛脈", "命源脈"],
    coreTechniques: {
      "龍象脈": "龍象般若功",     // str+8
      "金剛脈": "九陽護體",       // 護甲+22
      "命源脈": "先天一氣"        // 精元上限+100
    },
    recommendedTiers: {
      "龍象脈": { wuxiu: "仙品·四重", lingxiu: null },
      "金剛脈": { wuxiu: "仙品·三重", lingxiu: null },
      "命源脈": { wuxiu: "珍品·四重", lingxiu: null }
    },
    auxiliaryMeridians: ["追風脈", "靈台脈"],
    auxiliaryTechniques: {
      "追風脈": "梯雲縱",         // spd+4, 輕身
      "靈台脈": "靜心訣"          // 心神防護
    },
    recommendedSeals: ["ys_02", "ys_06"],
    sealNotes: "金剛罩(護盾200) + 天雷破(範圍清場)",
    weapons: ["拳套"],
    weaponNotes: "重拳 + 格擋,貼身硬撼",
    gameplayLoop: "金剛罩護盾吸收傷害 → 拳掌近身反擊 → 先天一氣自回精元 → 金剛不壞持續站場",
    keySynergy: "龍象脈四重(龍象般若功) + 金剛脈三重(九陽護體) + 命源脈四重(先天一氣) = 金剛不壞站場循環",
    counters: {
      "槍陣流": "近身格擋化解長兵優勢"
    },
    counteredBy: {
      "劍宗流": "破甲穿透,無視護盾直取要害",
      "蟲巢流": "人多勢眾,耗盡金剛罩護盾",
      "虛空流": "神識穿透護甲,護盾形同虛設"
    }
  },

  /* ---- 武修·槍陣流 ---- */
  "槍陣流": {
    id: "spear_formation",
    type: "武修",
    style: "長兵控場·陣地壓制",
    coreMeridians: ["百骸脈", "龍象脈", "命源脈"],
    coreTechniques: {
      "百骸脈": "兵器大師",       // 三槽連攜
      "龍象脈": "大力金剛掌",     // str+6
      "命源脈": "大周天功"        // 戰鬥中持續回復精元
    },
    recommendedTiers: {
      "百骸脈": { wuxiu: "仙品·四重", lingxiu: null },
      "龍象脈": { wuxiu: "珍品·三重", lingxiu: null },
      "命源脈": { wuxiu: "珍品·四重", lingxiu: null }
    },
    auxiliaryMeridians: ["追風脈", "金剛脈"],
    auxiliaryTechniques: {
      "追風脈": "凌波微步",       // 身法
      "金剛脈": "金鐘罩"          // 護體
    },
    recommendedSeals: ["ys_03", "ys_09"],
    sealNotes: "破軍(混亂控場) + 天罡·金剛力(str+8)",
    weapons: ["長槍", "短刀", "陣旗"],
    weaponNotes: "主長槍(範圍壓制) + 副短刀 + 陣旗(控場)",
    gameplayLoop: "長兵器先手範圍壓制 → 破軍混亂敵陣 → 百骸三槽連攜刀劍槍 → 大周天功戰鬥回元",
    keySynergy: "百骸脈四重(兵器大師·三槽連攜) + 龍象脈三重(大力金剛掌) = 長兵壓制與控場雙重保障",
    counters: {
      "蟲巢流": "長槍範圍壓制,一掃一片",
      "拳禪流": "長兵剋短拳,距離決勝"
    },
    counteredBy: {
      "劍宗流": "繳械克制,長槍被卸則無戰力",
      "暗殺流": "潛行近身,長兵未及施展"
    }
  },

  /* ---- 武修·暗殺流 ---- */
  "暗殺流": {
    id: "shadow_assassin",
    type: "武修",
    style: "潛行一擊·雙匕奪命",
    coreMeridians: ["追風脈", "天眼脈", "百骸脈"],
    coreTechniques: {
      "追風脈": "神行百變",       // 速度+潛行
      "天眼脈": "紫微斗數推演",   // 預讀行動
      "百骸脈": "左右互搏入門"    // 雙持武器
    },
    recommendedTiers: {
      "追風脈": { wuxiu: "仙品·四重", lingxiu: null },
      "天眼脈": { wuxiu: "珍品·三重", lingxiu: null },
      "百骸脈": { wuxiu: "良品·四重", lingxiu: null }
    },
    auxiliaryMeridians: ["靈台脈", "命源脈"],
    auxiliaryTechniques: {
      "靈台脈": "冰心訣",         // 隱匿氣息
      "命源脈": "吐納術"          // 等待冷卻時恢復
    },
    recommendedSeals: ["ys_01", "ys_07"],
    sealNotes: "隱龍訣(破隱雙倍) + 鏡花水月(假身誘敵)",
    weapons: ["雙短匕"],
    weaponNotes: "雙持短匕,速度+暴擊,一擊不中遠遁千里",
    gameplayLoop: "潛行 → 天眼預讀敵方行動 → 破隱雙倍暴擊 → 鏡花水月假身掩護撤退 → 等冷卻再循環",
    keySynergy: "追風脈四重(神行百變) + 天眼脈三重(紫微斗數推演) = 預讀破隱·雙倍暴擊的暗殺正反饋",
    counters: {
      "血肉流": "先手破甲,不給血肉流自殘增傷的機會",
      "輔助流": "定點刺殺後排,輔助無前排保護則亡"
    },
    counteredBy: {
      "虛空流": "神識看穿潛行,隱龍訣無效",
      "劍宗流": "先手決定勝負,誰快誰贏"
    }
  },

  /* ---- 武修·輔助流 ---- */
  "輔助流": {
    id: "support",
    type: "武修",
    style: "多刻印團隊支援",
    coreMeridians: ["靈台脈", "命源脈", "金剛脈"],
    coreTechniques: {
      "靈台脈": "太上忘情",       // 刻印槽+5, 刻印冷卻-30%
      "命源脈": "天人合一",       // 精元不滅, 持續支援
      "金剛脈": "金剛不壞身"      // 自身防禦
    },
    recommendedTiers: {
      "靈台脈": { wuxiu: "仙品·四重", lingxiu: null },
      "命源脈": { wuxiu: "珍品·四重", lingxiu: null },
      "金剛脈": { wuxiu: "珍品·三重", lingxiu: null }
    },
    auxiliaryMeridians: ["天眼脈", "追風脈"],
    auxiliaryTechniques: {
      "天眼脈": "天罡望氣術",     // 讀取隊友狀態
      "追風脈": "草上飛"          // 機動,快速切位
    },
    recommendedSeals: ["ys_04", "ys_08", "ys_10"],
    sealNotes: "甘露(團隊回血) + 回春(全恢復) + 金湯·長城(群體防禦)",
    weapons: ["拂塵", "短杖"],
    weaponNotes: "不主攻,以拂塵/短杖施放刻印",
    gameplayLoop: "站後排 → 甘露持續回血 → 天罡望氣監控隊友狀態 → 回春救急 → 多刻印槽快速切換 → 金湯·長城群體防禦",
    keySynergy: "靈台脈四重(太上忘情·刻印槽+5 + 冷卻-30%) = 多刻印快速切換團隊不間斷支援",
    counters: {},
    counteredBy: {
      "暗殺流": "後排刺殺,輔助缺乏自保手段",
      "蟲巢流": "蟲群圍攻,甘露回不過來"
    }
  },

  /* ---- 武修·宗師流 ---- */
  "宗師流": {
    id: "grandmaster",
    type: "武修",
    style: "均衡大師·無短板",
    coreMeridians: ["天眼脈", "追風脈", "龍象脈", "金剛脈", "命源脈", "靈台脈", "百骸脈"],
    coreTechniques: {},
    recommendedTiers: {
      "天眼脈": { wuxiu: "良品·三重", lingxiu: null },
      "追風脈": { wuxiu: "良品·三重", lingxiu: null },
      "龍象脈": { wuxiu: "良品·三重", lingxiu: null },
      "金剛脈": { wuxiu: "良品·三重", lingxiu: null },
      "命源脈": { wuxiu: "良品·三重", lingxiu: null },
      "靈台脈": { wuxiu: "良品·三重", lingxiu: null },
      "百骸脈": { wuxiu: "良品·三重", lingxiu: null }
    },
    auxiliaryMeridians: [],
    auxiliaryTechniques: {},
    recommendedSeals: [],
    sealNotes: "任意刻印組合,靠經驗與武學深度致勝",
    weapons: ["任意"],
    weaponNotes: "視敵方流派切換兵器,什麼局面都能打",
    gameplayLoop: "觀敵 → 擇器 → 以深厚武學底蘊見招拆招 → 不依賴固定套路",
    keySynergy: "全脈均衡·每脈至少良品 = 無短板,以深厚武學底蘊應對一切局面",
    counters: {
      "虛空流": "神識防線深厚,虛空難以穿透"
    },
    counteredBy: {}
  },

  /* ---- 靈修·蟲巢流 (歸墟專屬) ---- */
  "蟲巢流": {
    id: "hive",
    type: "靈修",
    style: "蟲群召喚·滾雪球",
    sect: "歸墟",
    coreMeridians: ["丹田異核", "命源脈", "龍象脈"],
    coreTechniques: {
      "丹田異核": "孵化核心",     // 每七日孵化一隻妖蟲
      "命源脈": "吞噬心",         // 食屍回復精元
      "龍象脈": "臂生二關節"      // 肢體異化,操控蟲群
    },
    recommendedTiers: {
      "丹田異核": { wuxiu: null, lingxiu: "仙品·四重" },
      "命源脈": { wuxiu: null, lingxiu: "珍品·三重" },
      "龍象脈": { wuxiu: null, lingxiu: "良品·二重" }
    },
    auxiliaryMeridians: ["靈台脈", "金剛脈"],
    auxiliaryTechniques: {
      "靈台脈": "顱骨第二腦",     // 擴充精神容量,操控更多蟲群
      "金剛脈": "皮膚角質化"      // 蟲巢護甲
    },
    recommendedSeals: ["ys_06", "ys_03"],
    sealNotes: "天雷破(蟲群清場) + 破軍(控場)",
    weapons: ["妖蟲群"],
    weaponNotes: "以孵化妖蟲為主要輸出手段,自身不持兵器",
    gameplayLoop: "孵化妖蟲群 → 蟲群消耗敵人 → 天雷破清場 → 吞噬回元 → 繼續孵化 → 蟲群滾雪球",
    keySynergy: "丹田異核四重(孵化核心) + 命源脈三重(吞噬心) = 蟲群生產·回收·再生產的滾雪球正反饋",
    riskNote: "妖蟲數量超過二十 → 觸發「蟲巢反噬」事件,蟲群可能失控",
    counters: {
      "拳禪流": "人多勢眾,耗盡金剛罩護盾"
    },
    counteredBy: {
      "槍陣流": "長槍範圍壓制,一掃一片蟲群",
      "虛空流": "蟲子無心,神識威壓對蟲群無效但直擊宿主"
    }
  },

  /* ---- 靈修·血肉流 ---- */
  "血肉流": {
    id: "blood_flesh",
    type: "靈修",
    style: "自身武器化·瀕死狂戰",
    coreMeridians: ["龍象脈", "金剛脈", "百骸脈"],
    coreTechniques: {
      "龍象脈": "臂骨化龍骨",     // 肢體異化為武器
      "金剛脈": "骨骼外翻成甲",   // 自體裝甲
      "百骸脈": "血液武器化"      // 以血化兵
    },
    recommendedTiers: {
      "龍象脈": { wuxiu: null, lingxiu: "仙品·四重" },
      "金剛脈": { wuxiu: null, lingxiu: "珍品·三重" },
      "百骸脈": { wuxiu: null, lingxiu: "珍品·三重" }
    },
    auxiliaryMeridians: ["命源脈", "追風脈"],
    auxiliaryTechniques: {
      "命源脈": "蚊蚋心",         // 心跳加速,極限狀態下維持生命
      "追風脈": "關節反曲"        // 非常規移動方式
    },
    recommendedSeals: ["ys_11", "ys_12"],
    sealNotes: "修羅道(狂戰雙倍) + 修羅道·極(終極爆發)",
    weapons: ["自身血肉"],
    weaponNotes: "以血化兵,每回合消耗5HP,失血愈多傷害愈高",
    gameplayLoop: "以血化兵 → 每回合耗血 → 失血愈多傷害愈高 → 修羅道雙倍傷害 → 瀕死時修羅道·極終極爆發",
    keySynergy: "龍象脈四重(臂骨化龍骨) + 百骸脈三重(血液武器化) = 失血愈多傷害愈高的狂戰正反饋循環",
    riskNote: "HP低於20%時可能失控攻擊隊友,需靈台脈或隊友輔助壓制",
    counters: {
      "劍宗流": "血肉破甲穿透,無視劍宗輕甲"
    },
    counteredBy: {
      "暗殺流": "先手暴擊不給自殘增傷的窗口",
      "虛空流": "神識克制血肉,直擊心神無視肉體強度"
    }
  },

  /* ---- 靈修·虛空流 ---- */
  "虛空流": {
    id: "void",
    type: "靈修",
    style: "神識殺人·視線即武器",
    coreMeridians: ["天眼脈", "靈台脈", "追風脈"],
    coreTechniques: {
      "天眼脈": "眼眶虛空",       // 視線即武器,持續傷害
      "靈台脈": "腦內第三眼",     // 刻印槽+8,靈視常駐
      "追風脈": "虛影腿"          // 物理攻擊穿透,不受護甲影響
    },
    recommendedTiers: {
      "天眼脈": { wuxiu: null, lingxiu: "仙品·四重" },
      "靈台脈": { wuxiu: null, lingxiu: "仙品·四重" },
      "追風脈": { wuxiu: null, lingxiu: "珍品·二重" }
    },
    auxiliaryMeridians: ["命源脈", "丹田異核"],
    auxiliaryTechniques: {
      "命源脈": "虛空心",         // 心跳化為虛弱光環,被動削弱周圍敵人
      "丹田異核": "舊神碎片"      // 隨機觸發不可名狀效果
    },
    recommendedSeals: ["ys_05", "ys_13"],
    sealNotes: "須臾(額外回合) + 封天印(封印敵方刻印)",
    weapons: ["視線", "神識"],
    weaponNotes: "以眼眶虛空凝視為武器,遠程神識鎖定",
    gameplayLoop: "靈視常駐 → 以神識鎖定目標 → 眼眶虛空視線持續傷害 → 虛空心被動虛弱周圍 → 舊神碎片隨機觸發不可名狀效果 → 封天印封印敵方刻印",
    keySynergy: "天眼脈四重(眼眶虛空) + 靈台脈四重(腦內第三眼) = 視線即武器·常駐靈視壓制的神識戰場",
    riskNote: "每次注視不可名狀之物,畸變+5;畸變五級後祂開始直接對你說話",
    counters: {
      "暗殺流": "神識看穿潛行,隱龍訣無效",
      "蟲巢流": "蟲子無心,神識穿透護盾直擊宿主"
    },
    counteredBy: {
      "劍宗流": "神識防禦最低,視線鎖定速度不及劍速",
      "宗師流": "神識防線深厚,虛空難以穿透"
    }
  }
};


/* =================================================================
 * Part 2: 奇物掉落表 MERIDIAN_DROPS
 * ================================================================= */
const MERIDIAN_DROPS = {

  /* ---- 按敵人類型區分的掉落規則 ---- */
  byEnemyType: {
    "妖": {
      label: "妖物",
      primaryMeridians: ["龍象脈", "百骸脈"],
      secondaryMeridians: ["命源脈"],
      qualityDistribution: {
        "凡品": 70,
        "良品": 25,
        "珍品": 5,
        "仙品": 0,
        "先天品": 0
      },
      dropRate: 0.15,
      sealChance: 0.05,
      flavorText: "妖死後肉身消散,偶遺一鱗半爪,可煉化為奇物"
    },
    "鬼": {
      label: "鬼物",
      primaryMeridians: ["天眼脈", "靈台脈"],
      secondaryMeridians: ["丹田異核"],
      qualityDistribution: {
        "凡品": 60,
        "良品": 30,
        "珍品": 8,
        "仙品": 2,
        "先天品": 0
      },
      dropRate: 0.12,
      sealChance: 0.05,
      flavorText: "鬼物消散後或有殘留——一縷未散的執念,一顆不肯瞑目的眼珠"
    },
    "邪修": {
      label: "邪修",
      primaryMeridians: ["神魂刻印"],
      secondaryMeridians: ["靈台脈", "命源脈"],
      qualityDistribution: {
        "凡品": 50,
        "良品": 35,
        "珍品": 12,
        "仙品": 3,
        "先天品": 0
      },
      dropRate: 0.20,
      sealChance: 1.0,
      flavorText: "邪修隕落後,體內封印的刻印隨之剝落——那些扭曲的符文仍渴望新的宿主"
    },
    "怪": {
      label: "怪物",
      primaryMeridians: ["金剛脈", "命源脈"],
      secondaryMeridians: ["龍象脈"],
      qualityDistribution: {
        "凡品": 55,
        "良品": 30,
        "珍品": 10,
        "仙品": 5,
        "先天品": 0
      },
      dropRate: 0.18,
      sealChance: 0.10,
      flavorText: "怪物身軀龐大,可拆解之物甚多——甲殼、內丹、奇骨"
    },
    "精魅": {
      label: "精魅",
      primaryMeridians: ["追風脈", "靈台脈"],
      secondaryMeridians: ["天眼脈"],
      qualityDistribution: {
        "凡品": 0,
        "良品": 45,
        "珍品": 35,
        "仙品": 15,
        "先天品": 5
      },
      dropRate: 0.10,
      sealChance: 0.30,
      flavorText: "精魅不存凡骨,所遺皆天地靈氣所凝——但牠們慣於留下幻象,真假難辨"
    },
    "BOSS": {
      label: "妖主·鬼王·宗主",
      primaryMeridians: ["隨機"],
      secondaryMeridians: [],
      qualityDistribution: {
        "凡品": 0,
        "良品": 0,
        "珍品": 50,
        "仙品": 35,
        "先天品": 15
      },
      dropRate: 1.0,
      sealChance: 1.0,
      flavorText: "必掉落,且有其專屬奇物池——有些東西,只有殺死祂才會現世"
    }
  },

  /* ---- 鑑定系統 ---- */
  identification: {
    // 剛獲得奇物時的初始狀態
    initial: {
      description: "剛獲得時只知模糊形態(如「一枚溫熱的鱗片」)和大致適配脈位",
      knownInfo: ["模糊名稱", "適配脈位(大致)", "品階不明"],
      unknownInfo: ["真實效果", "確切品階", "畸變風險", "是否被汙染"]
    },
    // 武修低境界 (0-2)
    wuxiu_low: {
      maxRealm: 2,
      maxQuality: "良品",
      highQualityHint: "一股若有若無的能量在流動,你讀不懂",
      canIdentify: "凡品、良品的真實效果與品階",
      cannotIdentify: "珍品及以上——只知是好東西,不知究竟多好",
      flavorText: "習武之人的眼力,只能看透尋常之物。超出見識的,讀不懂。"
    },
    // 武修高境界 (3-4)
    wuxiu_high: {
      minRealm: 3,
      maxQuality: "珍品",
      highQualityHint: "這已經不是凡間之物",
      canIdentify: "凡品、良品、珍品的真實效果與品階",
      cannotIdentify: "仙品及以上——能感知其非凡,卻看不穿本質",
      flavorText: "浸淫武道數十載,見多了奇物,但有些東西,不該是人間之物。"
    },
    // 靈修鑑定 (1-5層)
    lingxiu: {
      notes: "靈視愈深看得愈清,但看到的不一定是真的——可能是祂想讓你看到的",
      layer1: "靈視初開,能感應奇物中的異質存在,但模糊難辨",
      layer2: "可鑑定至珍品,對仙品有微弱感知",
      layer3: "可鑑定至仙品,先天品仍如霧裡看花",
      layer4: "可鑑定至先天品,但——偶爾會看到不該存在的東西",
      layer5: "萬物清晰,然一切清晰之物皆可疑——祂讓你看到的,未必是真相",
      flavorText: "靈修之道,看得愈清,愈分不清哪一個『清』是真的。"
    }
  },

  /* ---- 刻印掉落規則 ---- */
  sealDrops: {
    // 按敵人類型區分的刻印掉落
    byCategory: {
      "邪修": {
        categories: ["異術刻印", "神識刻印", "護身刻印"],
        rate: 1.0,
        note: "邪修必掉刻印,因刻印寄生於其神魂,宿主死則刻印脫落"
      },
      "精魅": {
        categories: ["異術刻印", "增益刻印"],
        rate: 0.30,
        note: "精魅身上的刻印多為魅惑/增益類,偶有異術"
      },
      "BOSS": {
        categories: ["異術刻印", "破境刻印"],
        rate: 1.0,
        minQuality: "仙品",
        note: "妖主鬼王之刻印,品階至少仙品,世間罕有"
      }
    },
    // 刻印歸類目錄
    categoryDefinitions: {
      "異術刻印": {
        description: "改變戰鬥規則、扭曲因果的奇術刻印",
        examples: ["隱龍訣", "破軍", "須臾", "鏡花水月", "封天印"]
      },
      "神識刻印": {
        description: "增強神識、威壓或精神攻擊的刻印",
        examples: []
      },
      "護身刻印": {
        description: "防禦、護盾、反傷類刻印",
        examples: ["金剛罩", "金湯·長城"]
      },
      "增益刻印": {
        description: "回復、增強屬性的輔助刻印",
        examples: ["甘露", "回春", "天罡·金剛力"]
      },
      "破境刻印": {
        description: "極稀有的突破性刻印,可改變角色上限",
        examples: ["天雷破", "修羅道", "修羅道·極"]
      }
    }
  },

  /* ---- 刻印名冊 (全局索引) ---- */
  sealRegistry: {
    "ys_01": { name: "隱龍訣", type: "異術刻印", rarity: "珍品", effect: "潛行後破隱一擊傷害×2.0" },
    "ys_02": { name: "金剛罩", type: "護身刻印", rarity: "良品", effect: "生成護盾,吸收200傷害" },
    "ys_03": { name: "破軍", type: "異術刻印", rarity: "珍品", effect: "範圍混亂控場,打亂敵方陣型" },
    "ys_04": { name: "甘露", type: "增益刻印", rarity: "良品", effect: "團隊持續回血" },
    "ys_05": { name: "須臾", type: "異術刻印", rarity: "仙品", effect: "獲得一個額外回合" },
    "ys_06": { name: "天雷破", type: "破境刻印", rarity: "仙品", effect: "範圍清場,對群體敵人造成大量傷害" },
    "ys_07": { name: "鏡花水月", type: "異術刻印", rarity: "珍品", effect: "製造假身,誘敵攻擊" },
    "ys_08": { name: "回春", type: "增益刻印", rarity: "珍品", effect: "單體全恢復" },
    "ys_09": { name: "天罡·金剛力", type: "增益刻印", rarity: "珍品", effect: "力量+8" },
    "ys_10": { name: "金湯·長城", type: "護身刻印", rarity: "珍品", effect: "群體防禦提升" },
    "ys_11": { name: "修羅道", type: "破境刻印", rarity: "仙品", effect: "進入狂戰狀態,傷害×2.0" },
    "ys_12": { name: "修羅道·極", type: "破境刻印", rarity: "先天品", effect: "終極爆發,瀕死時全屬性大幅提升" },
    "ys_13": { name: "封天印", type: "異術刻印", rarity: "仙品", effect: "封印敵方一個刻印" }
  },

  /* ---- 危險度與品階概率修正 ---- */
  dangerModifiers: {
    "低微": { qualityShift: 0, dropRateMultiplier: 0.5, note: "尋常妖物,掉落機率減半" },
    "尋常": { qualityShift: 0, dropRateMultiplier: 1.0, note: "標準掉落率" },
    "兇險": { qualityShift: 1, dropRateMultiplier: 1.2, note: "品階向上一檔的概率+20%" },
    "大凶": { qualityShift: 2, dropRateMultiplier: 1.5, note: "品階向上兩檔的概率+50%" },
    "絕境": { qualityShift: 3, dropRateMultiplier: 2.0, note: "品階大幅提升,掉落率翻倍" }
  }
};


/* =================================================================
 * Part 3: 畸變系統 CORRUPTION
 * ================================================================= */
const CORRUPTION = {

  /* ---- 畸變計算公式 ---- */
  formula: {
    base: "畸變值 = Σ(各脈靈修異化的畸變風險值 × 異化深度係數)",
    description: "畸變值是靈修之路不可逆的代價。每植入一件奇物,便在凡胎上刻下一道裂痕——裂痕多了,裡面的東西就會漏出來。",
    depthMultipliers: {
      "凡品": 1,
      "良品": 1.5,
      "珍品": 2,
      "仙品": 3,
      "先天品": 5
    },
    example: {
      scenario: "靈修植入三件奇物: 良品龍象脈(風險3)×1.5 + 珍品天眼脈(風險4)×2 + 仙品靈台脈(風險6)×3",
      calculation: "3×1.5 + 4×2 + 6×3 = 4.5 + 8 + 18 = 30.5",
      result: "畸變值≈31,進入第二級『異化外顯』"
    }
  },

  /* ---- 畸變六級體系 ---- */
  levels: [
    {
      level: 0,
      range: [0, 15],
      name: "常人之軀",
      appearance: "外表正常,與凡俗無異",
      positive: "無",
      negative: "無",
      npcReaction: "凡人視你為同類,宗門視你為可造之材",
      flavorText: "你還是一個人。至少,看起來還是。"
    },
    {
      level: 1,
      range: [16, 30],
      name: "初顯異相",
      appearance: "瞳孔偶爾豎裂,指甲在月光下反光,皮膚下似有東西在蠕動——但一眨眼又不見了",
      positive: "靈視初開,獲得免費「desc_percept」感知能力",
      negative: "武修同門開始懷疑;凡人偶爾覺得你『不太對勁』",
      npcReaction: "同門竊竊私語,凡人下意識避開視線",
      flavorText: "旁人開始注意到你的不對勁。你開始注意到旁人注意不到的東西。"
    },
    {
      level: 2,
      range: [31, 50],
      name: "異化外顯",
      appearance: "鱗片、蹼膜、角質皮膚——已無法完全隱藏。穿長袖、戴兜帽或許遮得住,但風一吹就露餡",
      positive: "對妖/鬼類產生10%威懾",
      negative: "凡人城鎮商人拒絕與你交易;鐵匠鋪、藥鋪、酒館的掌櫃見你便冷臉",
      npcReaction: "凡人避之不及,商販拒賣,孩童哭喊『怪物』",
      flavorText: "你的皮囊正在出賣你。每次照鏡子,鏡中人都在變——只是變得還不夠快,你還認識自己。"
    },
    {
      level: 3,
      range: [51, 75],
      name: "半人半鬼",
      appearance: "雙套關節彎曲時發出喀喀聲,外骨骼從皮膚下刺出,額頭裂開——露出第三隻眼",
      positive: "威懾效果提升至30%;靈修傷害+15%",
      negative: "武修宗門可能將你驅逐;凡人城鎮衛兵主動盤查,見你便拔刀",
      npcReaction: "衛兵盤查→驅逐→攻擊;宗門師長神色凝重地找你談話",
      flavorText: "你還能說人話,還記得自己是誰。但你的身體已經不聽話了——它在往另一個方向長。"
    },
    {
      level: 4,
      range: [76, 100],
      name: "人皮之下",
      appearance: "外表尚可維持——只要你不出汗、不流血、不大笑——但『底下』已經完全是別的東西",
      positive: "威懾效果提升至50%;靈修刻印冷卻時間-20%",
      negative: "除靈修宗門外,所有NPC對你產生恐懼;武修見你視為敵人",
      npcReaction: "凡人見你就跑;武修『除魔衛道』;只有靈修同門不會躲開——但他們看你的眼神也變了",
      flavorText: "你學會了維持人皮。但人皮只是人皮——底下那個東西,愈來愈不願意藏了。"
    },
    {
      level: 5,
      range: [101, 999],
      name: "不可名狀",
      appearance: "面目已不可用人類標準描述。看過你的人,都無法用語言說出他們看到了什麼",
      positive: "道心鎖定,不再下跌;解鎖『不可名狀之力』——一項隨外神而異的終極能力",
      negative: "結局鎖定為飛升線;自我意識開始溶解——你愈來愈分不清哪個念頭是你的,哪個是祂的",
      npcReaction: "無人敢直視。凡人見到直接失去理智。武修宗門聯合圍剿。靈修宗門沉默——他們知道,這是每條靈修之路的終點。",
      flavorText: "你已不可名狀。語言在你身上失效。那些還在看你的,自己也在變了。"
    }
  ],

  /* ---- 畸變加速機制 ---- */
  acceleration: {
    legendaryPenalty: {
      rule: "每植入一件先天品奇物 → 畸變門檻永久-5",
      description: "先天品不是人間之物。每植入一件,你的身體就更接近祂的世界——門檻降低意味著後續畸變來得更快",
      maxPenalty: "最多-25(五件先天品後不再疊加——因為已經沒有意義了)"
    },
    daoxinDrop: {
      rule: "每累計道心下跌3點 → 畸變風險永久+2%",
      description: "道心是你與凡塵的最後一根線。線斷一次,你就往祂的方向漂一點。"
    },
    dantianAccel: {
      rule: "丹田異核品階每提升一重 → 其他脈位畸變速度+10%",
      description: "異核是『祂的種子』——它在滋養你,也在改造你。它長得愈好,你變得愈快。"
    }
  },

  /* ---- 靈修六宗門 × 克蘇魯五外神映射 ---- */
  sectGodMappings: {
    "忘塵": {
      god: "奈亞拉托提普",
      domain: "混沌·千面之神",
      essence: "無常——祂沒有固定形態,正如忘塵宗不信奉任何固定之道",
      corruptionTendency: "心智溶解型畸變——弟子最終可能變成祂的面具之一",
      level5Power: "千面:可在戰鬥中切換形態,每個形態擁有獨立技能組"
    },
    "紫霞山": {
      god: "猶格·索托斯",
      domain: "時空·萬物歸一",
      essence: "全知——紫霞山追求的終極悟道,與猶格的時空全視暗合",
      corruptionTendency: "時空錯亂型畸變——弟子可能同時存在於多個時間點",
      level5Power: "歸一:窺見時間線,可選擇一個回合『重來』"
    },
    "歸墟": {
      god: "克蘇魯",
      domain: "深海·夢魘之主",
      essence: "沉睡與覺醒——歸墟的蟲巢孵化,正是克蘇魯的微縮投影",
      corruptionTendency: "肉體異化型畸變——弟子逐漸變為海洋般的異形聚合體",
      level5Power: "夢魘召喚:可在戰鬥中召喚克蘇魯的夢境投影"
    },
    "鏡閣": {
      god: "哈斯塔",
      domain: "黃衣·不可言說",
      essence: "鏡像——鏡閣以鏡為道,哈斯塔以黃衣之王的形象映照人心",
      corruptionTendency: "身份消解型畸變——弟子可能忘記自己原本是誰",
      level5Power: "黃衣降臨:以自身為鏡,折射敵人的攻擊回敬其身"
    },
    "肉慈齋": {
      god: "莎布·尼古拉絲",
      domain: "繁衍·黑山羊母",
      essence: "生命與吞噬——肉慈齋追求血肉極致,正是莎布的黑暗生育之道",
      corruptionTendency: "血肉增生型畸變——弟子可能無限增生,最終化為一團活肉",
      level5Power: "黑山羊之乳:每回合自動回復大量精元,但每次回復都從你身上長出新的東西"
    },
    "青囊廬": {
      god: "莫爾迪基安",
      domain: "亡者·食屍之王",
      essence: "生死界限——青囊廬行醫卻遊走陰陽,與食屍鬼之王的領域重合",
      corruptionTendency: "亡者化型畸變——弟子逐漸失去體溫、心跳、最後是活著的感覺",
      level5Power: "陰司禁術:可將一個剛死之人(含自己)暫時拉回現世"
    }
  },

  /* ---- 道心·畸變博弈實例 ---- */
  decisionExample: {
    item: "一枚溫熱的鱗片",
    meridian: "龍象脈",
    wuxiuUse: "碾碎淬煉拳套: str+1, 無畸變——安全,但收益低微",
    lingxiuUse: "植入前臂: str+4, 畸變+5, 進階至整臂鱗化——高風險,高回報",
    quandary: "你已經畸變三級了……再往前一步就是『人皮之下』。但前面那個妖主,以你現在的實力打不過",
    decisionPaths: [
      "武修之路: 碾碎它,穩健變強,不碰畸變。但終點——武修的終點,你很清楚。",
      "靈修之路: 植入它,變強——然後變異。你還能回來嗎?你分得清回來之後的『你』還是你嗎?",
      "第三條路: 不碾也不植,將鱗片獻給宗門換取庇護。安全,體面,但從此欠一條命。"
    ]
  },

  /* ---- 各Build的畸變聯動 ---- */
  buildEffects: {
    "蟲巢流": {
      corruptionAccel: "妖蟲數量超過十隻後,每多一隻 → 畸變+1/週",
      criticalEvent: "妖蟲超過二十 → 觸發『蟲巢反噬』事件,蟲群可能反噬宿主",
      flavorText: "你養的東西愈來愈多。牠們在吃你的血肉,也在吃你的『人味』——總有一天,牠們會分不清你和其他食物。"
    },
    "血肉流": {
      corruptionAccel: "每次血液武器化 → 畸變+2",
      criticalEvent: "HP低於20%時 → 可能失控,無差別攻擊隊友",
      flavorText: "以血化兵——你的血已經不是血了。它開始有自己的想法,渴望更多血肉。"
    },
    "虛空流": {
      corruptionAccel: "每次注視不可名狀之物 → 畸變+5",
      criticalEvent: "畸變五級後 → 祂開始直接對你說話(每日觸發對話事件,可能影響道心)",
      flavorText: "你看祂——祂也看你。祂的目光在你身上留下刻痕,一道一道,愈來愈深。直到你看任何東西,都從那些刻痕裡看出去。"
    }
  },

  /* ---- 結局路線 ---- */
  endpoints: {
    wuxiu: {
      daoxinFloor: 40,
      description: "武修道心下限四十。一旦道心歸零,強制觸發退隱結局或發瘋結局",
      fates: [
        "道心歸零·退隱: 放下兵器,歸隱山林,從此不過問江湖事",
        "道心歸零·發瘋: 心魔吞噬,成為下一個被剿滅的『邪修』"
      ]
    },
    lingxiu: {
      description: "靈修沒有道心底線——但有畸變天花板。結局視畸變等級與關鍵選擇而定",
      fates: [
        {
          name: "飛升·被同化",
          condition: "畸變五級 + 丹田異核『門』開啟十次",
          outcome: "你穿過了那扇門。門那邊——你不再是『你』。你融入了祂,或者說,祂終於收回了祂散落在人間的一部分。",
          isGoodEnd: false,
          isTrueEnd: true
        },
        {
          name: "封刀歸隱",
          condition: "畸變三級以下 + 主線完成 + 選擇退隱",
          outcome: "你在徹底異化之前懸崖勒馬。餘生守著一座小院,夜裡偶爾會覺得——有什麼東西在門外找你。",
          isGoodEnd: true,
          isTrueEnd: false
        },
        {
          name: "各自歸零",
          condition: "畸變四至五級 + 拒絕開門 + 自毀丹田",
          outcome: "你在最後一刻選擇了玉石俱焚。異核碎裂的聲音像一聲嘆息——不知道是你的,還是祂的。",
          isGoodEnd: false,
          isTrueEnd: false
        },
        {
          name: "新神降臨",
          condition: "畸變五級 + 道心歸零 + 拒絕開門",
          outcome: "你留在了這一側——但你已經不是人了。新的外神誕生於凡間。不是因為你贏了,而是因為祂需要一個看門的。",
          isGoodEnd: false,
          isTrueEnd: true
        }
      ]
    }
  },

  /* ---- 畸變治癒可能性 ---- */
  purification: {
    isPossible: true,
    cost: "極高——需要至少一位道心圓滿的宗師以自身修為為引,配合先天品清心奇物",
    successRate: "畸變三級以下有30%成功可能;三級以上……理論上可能,但從未有人做到過",
    consequence: "即使成功,被清除的畸變會在丹田留下永久性裂痕——此生不能再走靈修之路",
    flavorText: "能洗掉的只是鱗片和蹼。那些在夢裡對你說話的聲音——洗不掉。"
  }
};

// === DATA MANIFEST REGISTRY (auto-generated, do not edit) ===
window.__DATA_REGISTRY = window.__DATA_REGISTRY || {};
try { if (typeof BUILDS !== 'undefined') window.__DATA_REGISTRY['BUILDS'] = BUILDS; } catch(e) { console.warn('[Registry] BUILDS not registered:', e.message); }
try { if (typeof MERIDIAN_DROPS !== 'undefined') window.__DATA_REGISTRY['MERIDIAN_DROPS'] = MERIDIAN_DROPS; } catch(e) { console.warn('[Registry] MERIDIAN_DROPS not registered:', e.message); }
try { if (typeof CORRUPTION !== 'undefined') window.__DATA_REGISTRY['CORRUPTION'] = CORRUPTION; } catch(e) { console.warn('[Registry] CORRUPTION not registered:', e.message); }
