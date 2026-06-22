// Room Contextual Search Data for Cyber Ming MUD
// Each room has a searchChance and an array of possible search results
const ROOM_SEARCH = {
  "应天暗巷": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "秦淮河畔": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "玄武渡口": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "鼓楼": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "鸡鸣寺": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "聚宝门": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "午门": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "奉天殿": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "天坛": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "紫禁城内殿": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "鼓楼西鬼市": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "地坛旧货摊": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "樊楼": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "hp",
        "amount": 15,
        "desc": "掌柜送了你一份小菜——味道一般，但能填肚子。",
        "chance": 0.4
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "问剑峰·观星台": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "锈剑冢·地窟": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "血禅山": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "逍遥驿车队": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "光明顶·焰心殿": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "文华殿": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "武英殿": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "乾清宫·偏殿": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "御花园·卷宗生态区": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "城南贫民窟·废码区": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "城东工匠坊·万象义体街": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "城西商贾区·聚宝金融街": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "贡院·科举卷宗考": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "应天驿站": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "应天西门": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "应天东门": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "应天南门": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "雨花台·讯号墓地": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "莫愁湖·沉浸幻境": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "明孝陵·前朝遗迹": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "清凉寺·旧时代避难所": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "应天北门": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "秦淮西岸·废弃义体堆场": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "金陵机器局旧地": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "燕子矶·鬼市讯号灯塔": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "太和殿·主脑机房": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "中和殿·卷宗仲裁庭": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "保和殿·序列晋升所": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "什刹海·冷冻卷宗湖": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "天坛·神经再造场": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "地坛·意识旧货摊": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "日坛·太阳能采集阵": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "月坛·鬼市共振器": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "琉璃厂·古董符修街": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "王府井·义体奢侈品街": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "国子监·儒序书院": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "钟鼓楼·时辰广播塔": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "德胜门·出城检查站": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "顺天驿站": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "龙亭·地下鬼市交易所": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "包公祠·卷宗审判所": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "延庆观·神经修复院": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "铁塔·讯号放大器": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "开封驿站": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "hp",
        "amount": 15,
        "desc": "掌柜送了你一份小菜——味道一般，但能填肚子。",
        "chance": 0.4
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "繁塔·废弃卷宗墓园": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "开封鼓楼·鬼市钟声": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "州桥·月下暗渠渡口": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "开封北门·鬼市哨卡": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "清明上河·沉浸式骗局": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "hp",
        "amount": 15,
        "desc": "掌柜送了你一份小菜——味道一般，但能填肚子。",
        "chance": 0.4
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "汴河暗渠北口·卷宗泄洪道": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "雁塔地宫·藏经处": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "小雁塔·藏经阁": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "钟楼·破损广播站": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "鼓楼·加密中继站": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "华清池·义体温泉疗养": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "未央宫遗迹·旧世卷宗坟场": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "碑林·卷宗铭文馆": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "阿房宫废土·拾荒者营地": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "长安驿站": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "长安西门": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "终南山·废弃缆车站": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "大明宫废墟·野义体交易所": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "长安北门·荒原入口": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "忘尘宗·藏经阁": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "紫霞山·炼丹洞": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "剑巢·暗杀指令台": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "血镰·悬赏结算所": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "逍遥驿·改装工坊": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "光明顶·圣火母体室": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "蚁网·地下蚁穴核心": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "蚁网·情报交易所": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "hp",
        "amount": 15,
        "desc": "掌柜送了你一份小菜——味道一般，但能填肚子。",
        "chance": 0.4
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "毒巢·星宿毒沼": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "毒巢·炼毒工坊": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "斗转阁·还施水阁": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "斗转阁·姑苏情报院": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "money",
        "amount": "5-30",
        "desc": "你在铺子门前的石缝里捡到了几块碎灵石。",
        "chance": 0.35
      },
      {
        "type": "money",
        "amount": "10-50",
        "desc": "地上有一只遗落的旧布袋，里面有几块碎灵石！",
        "chance": 0.1
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "hp",
        "amount": 15,
        "desc": "掌柜送了你一份小菜——味道一般，但能填肚子。",
        "chance": 0.4
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "影墓·终南地下迷宫": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "影墓·寂静之殿": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "青囊庐·药庐": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "technique",
        "desc": "你在佛像暗格后找到了一份用梵文写的功法残页——旁边还有机器翻译的注释。",
        "chance": 0.15
      },
      {
        "type": "sanity",
        "amount": 10,
        "desc": "佛前的檀香让你的心神感到一阵宁静。",
        "chance": 0.3
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "青囊庐·丹房": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在草丛中找到了几株珍稀药草。",
        "chance": 0.3
      },
      {
        "type": "cultivation",
        "amount": 10,
        "desc": "山间的天地灵气让你感到经络微微发热。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "机巧岛·蜂群指挥中心": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  },
  "机巧岛·无人机生产线": {
    "searchChance": 0.4,
    "results": [
      {
        "type": "find_type",
        "itemType": "consumable",
        "desc": "你在旧香案下旁找到了一枚还能用的灵石残片。",
        "chance": 0.25
      },
      {
        "type": "find_type",
        "itemType": "stone",
        "desc": "一块废弃的残破灵石中残留着残留灵气。",
        "chance": 0.2
      },
      {
        "type": "find_type",
        "itemType": "equipment",
        "desc": "你在废墟的瓦砾下发现了一件蒙尘的法器——虽然破旧，但依然能用。",
        "chance": 0.18
      },
      {
        "type": "find_type",
        "itemType": "random",
        "desc": "你寻了半晌，在不起眼的角落里摸到了点东西。",
        "chance": 0.12
      },
      {
        "type": "nothing",
        "desc": "翻找了许久，只摸到一手灰。下次再说吧。",
        "chance": 1
      }
    ]
  }
};