// Wenjianfeng curated NPC dialogue data.
// V1.5 adds NPC relationship memory effects:
// - choices may carry relationship/npcMemory metadata.
// - visible prose follows aidoc/archive_20260707/docs/narrative_writing_rules.md.

var WENJIANFENG_NPC_DIALOGUES = {
  "schemaVersion": 2,
  "version": "v1.5",
  "source": "wenjianfeng_tutorial_golden3",
  "rules": "narrative_writing_rules",
  "entries": [
    {
      "room": "问剑峰·山门",
      "id": "wenjianfeng_zhixing",
      "lines": [
        {
          "speaker": "值星弟子",
          "text": "「口令！」值星弟子把剑横在身前，声音绷得比剑还直。"
        },
        {
          "speaker": "值星弟子",
          "text": "他认出你，耳根红了一点：「哦，是新来的。今天的口令是『残月』，别在山上喊错。」"
        },
        {
          "speaker": "值星弟子",
          "text": "「问剑峰不拦肯问路的人，但会拦乱闯的人。上山先去剑坪，别直接往后山钻。」"
        }
      ],
      "choices": [
        {
          "choice": "报上口令「残月」",
          "log": "你向值星弟子报出口令「残月」。",
          "nextLines": [
            {
              "speaker": "值星弟子",
              "text": "「对。记住了就好。」他把剑往旁边一收，给你让出石阶。"
            },
            {
              "speaker": "值星弟子",
              "text": "「上去吧。苏小棠要是又带人走错路，你就说是我让你先去剑坪的。」"
            }
          ],
          "relationship": {
            "affinity": 0,
            "flags": [
              "shanmen_greeted",
              "choice_0"
            ],
            "note": "值星弟子记得你守过山门规矩。"
          }
        },
        {
          "choice": "问山上规矩",
          "log": "你向值星弟子打听问剑峰规矩。",
          "nextLines": [
            {
              "speaker": "值星弟子",
              "text": "「第一，剑坪听师叔的。第二，伙房听老蔡的。第三，剑冢少说话。」"
            },
            {
              "speaker": "值星弟子",
              "text": "他想了想，又补了一句：「第四，苏小棠说自己认路的时候，你最好再问一次别人。」"
            }
          ],
          "relationship": {
            "affinity": 0,
            "flags": [
              "shanmen_greeted",
              "choice_1"
            ],
            "note": "值星弟子记得你守过山门规矩。"
          }
        },
        {
          "choice": "问苏小棠去了哪里",
          "log": "你问起苏小棠的去向。",
          "nextLines": [
            {
              "speaker": "值星弟子",
              "text": "「她？刚才还在第十三级台阶上坐着，后来往剑坪跑了。」"
            },
            {
              "speaker": "值星弟子",
              "text": "「你要是听见有人边跑边喊『快了真的快了』，那多半就是她。」"
            }
          ],
          "relationship": {
            "affinity": 0,
            "flags": [
              "shanmen_greeted",
              "choice_2"
            ],
            "note": "值星弟子记得你守过山门规矩。"
          }
        }
      ],
      "dialogueTier": "story",
      "variants": [
        {
          "id": "zhixing_ch1_tour",
          "when": {
            "tutorialPhase": "ch1_tour"
          },
          "lines": [
            {
              "speaker": "值星弟子",
              "text": "值星弟子看见苏小棠，剑尖往旁边让了半寸。"
            },
            {
              "speaker": "值星弟子",
              "text": "「小棠姐，今日口令？」"
            },
            {
              "speaker": "值星弟子",
              "text": "他看向你，脸上绷得很正：「新来的，跟紧些。山门不是练胆子的地方。」"
            }
          ],
          "choices": [
            {
              "choice": "报出口令",
              "log": "你照苏小棠提醒报出口令。",
              "nextLines": [
                {
                  "speaker": "值星弟子",
                  "text": "「残月。对。」他点头，把路让开。"
                },
                {
                  "speaker": "值星弟子",
                  "text": "「上去吧，别在第十三级台阶坐太久。那是小棠姐的地方。」"
                }
              ],
              "relationship": {
                "affinity": 0,
                "flags": [
                  "shanmen_greeted",
                  "choice_0"
                ],
                "note": "值星弟子记得你守过山门规矩。"
              }
            }
          ]
        },
        {
          "id": "zhixing_ch1_free",
          "when": {
            "tutorialPhase": "ch1_free"
          },
          "lines": [
            {
              "speaker": "值星弟子",
              "text": "值星弟子正把令牌换到另一侧腰间。"
            },
            {
              "speaker": "值星弟子",
              "text": "「自由走动可以，出山门不行。新弟子第一日，山上认全再说。」"
            },
            {
              "speaker": "值星弟子",
              "text": "他压低声音：「苏小棠说能带你下山，也不算。」"
            }
          ],
          "choices": [
            {
              "choice": "问何处能去",
              "log": "你向值星弟子确认可去之处。",
              "nextLines": [
                {
                  "speaker": "值星弟子",
                  "text": "「剑坪、伙房、洗剑池、剑阶。」他一口气说完。"
                },
                {
                  "speaker": "值星弟子",
                  "text": "「再远的地方，明日有人带。」"
                }
              ],
              "relationship": {
                "affinity": 0,
                "flags": [
                  "shanmen_greeted",
                  "choice_0"
                ],
                "note": "值星弟子记得你守过山门规矩。"
              }
            }
          ]
        }
      ],
      "memoryKey": "wenjianfeng_zhixing"
    },
    {
      "room": "问剑峰·剑坪",
      "id": "wenjianfeng_suxiaotang",
      "ensure": {
        "id": "wenjianfeng_suxiaotang",
        "name": "苏小棠",
        "desc": "一个眼睛很亮的少女，坐不住，话也停不住。腰间挂着一把保养得很认真的短剑。"
      },
      "lines": [
        {
          "speaker": "苏小棠",
          "text": "「新来的！」苏小棠从石凳上跳下来，像早就等着你开口。"
        },
        {
          "speaker": "苏小棠",
          "text": "「我叫苏小棠，来了一年半。暂时还打不过周碛——但是快了，真的快了。」"
        },
        {
          "speaker": "苏小棠",
          "text": "她压低声音：「你要是迷路，可以问我。虽然我偶尔也迷路，但我迷得比较有经验。」"
        }
      ],
      "choices": [
        {
          "choice": "请她再讲一遍路线",
          "log": "你请苏小棠再讲一遍问剑峰路线。",
          "nextLines": [
            {
              "speaker": "苏小棠",
              "text": "「山门上来是剑阶，剑阶上来是剑坪。左边伙房，右边藏剑阁，上面洗剑池，再往上竹林和剑冢。」"
            },
            {
              "speaker": "苏小棠",
              "text": "她掰着手指数完，满意地点头：「你看，很简单。只要别问我东南西北。」"
            }
          ],
          "relationship": {
            "affinity": 1,
            "flags": [
              "suxiaotang_guided",
              "choice_0"
            ],
            "note": "苏小棠记得你认真听她说路。"
          }
        },
        {
          "choice": "问残剑师姐",
          "log": "你向苏小棠打听残剑师姐。",
          "nextLines": [
            {
              "speaker": "苏小棠",
              "text": "「她不爱说话，但不是凶。你别怕她。」"
            },
            {
              "speaker": "苏小棠",
              "text": "她顿了顿，小声说：「她要是对你点头，那说明她觉得你站得还行。她都没怎么对我点过头。」"
            }
          ],
          "relationship": {
            "affinity": 1,
            "flags": [
              "suxiaotang_guided",
              "choice_1"
            ],
            "note": "苏小棠记得你认真听她说路。"
          }
        },
        {
          "choice": "问晚饭",
          "log": "你问苏小棠晚饭的事。",
          "nextLines": [
            {
              "speaker": "苏小棠",
              "text": "「老蔡今天炖肉。你要是分到大块的，记得分我一半。」"
            },
            {
              "speaker": "苏小棠",
              "text": "她立刻补充：「这不是抢，这是同门之间的互相照应。」"
            }
          ],
          "relationship": {
            "affinity": 1,
            "flags": [
              "suxiaotang_guided",
              "choice_2"
            ],
            "note": "苏小棠记得你认真听她说路。"
          }
        }
      ],
      "dialogueTier": "story",
      "variants": [
        {
          "id": "suxiaotang_ch1_tour",
          "when": {
            "tutorialPhase": "ch1_tour"
          },
          "lines": [
            {
              "speaker": "苏小棠",
              "text": "苏小棠倒着走在前头，鞋跟一点一点蹭着石阶。"
            },
            {
              "speaker": "苏小棠",
              "text": "「别走散。山上路不多，可我第一次来的时候照样绕了三圈。」"
            },
            {
              "speaker": "苏小棠",
              "text": "她回头看你一眼：「口令记着没？残月。别让值星笑话你。」"
            }
          ],
          "choices": [
            {
              "choice": "请她慢些走",
              "log": "你请苏小棠慢些带路。",
              "nextLines": [
                {
                  "speaker": "苏小棠",
                  "text": "「哦。」她立刻放慢两步，又忍不住往前蹦了一下。"
                },
                {
                  "speaker": "苏小棠",
                  "text": "「我已经很慢了。真的。」"
                }
              ],
              "relationship": {
                "affinity": 1,
                "flags": [
                  "suxiaotang_guided",
                  "choice_0"
                ],
                "note": "苏小棠记得你认真听她说路。"
              }
            },
            {
              "choice": "问下一处去哪",
              "log": "你问苏小棠下一处要往哪里走。",
              "nextLines": [
                {
                  "speaker": "苏小棠",
                  "text": "她伸手往上指：「先到剑坪。那地方最大，迷了路也能被人看见。」"
                },
                {
                  "speaker": "苏小棠",
                  "text": "「看见以后再笑你。」"
                }
              ],
              "relationship": {
                "affinity": 1,
                "flags": [
                  "suxiaotang_guided",
                  "choice_1"
                ],
                "note": "苏小棠记得你认真听她说路。"
              }
            }
          ]
        },
        {
          "id": "suxiaotang_ch1_free",
          "when": {
            "tutorialPhase": "ch1_free"
          },
          "lines": [
            {
              "speaker": "苏小棠",
              "text": "苏小棠蹲在石凳边，用树枝在地上画问剑峰的路。"
            },
            {
              "speaker": "苏小棠",
              "text": "「你可以自己逛了。剑坪、伙房、洗剑池、剑阶，都能去。」"
            },
            {
              "speaker": "苏小棠",
              "text": "她把树枝一丢：「藏剑阁和剑冢先别硬闯。被骂了我可不认。」"
            }
          ],
          "choices": [
            {
              "choice": "请她再画一遍路",
              "log": "你请苏小棠再画一遍问剑峰路线。",
              "nextLines": [
                {
                  "speaker": "苏小棠",
                  "text": "她皱着眉把线重新画了一遍。"
                },
                {
                  "speaker": "苏小棠",
                  "text": "「这里是剑坪。左边吃饭，右边看书，上边洗剑。简单得很。」"
                }
              ],
              "relationship": {
                "affinity": 1,
                "flags": [
                  "suxiaotang_guided",
                  "choice_0"
                ],
                "note": "苏小棠记得你认真听她说路。"
              }
            },
            {
              "choice": "问晚饭何时开",
              "log": "你向苏小棠打听晚饭。",
              "nextLines": [
                {
                  "speaker": "苏小棠",
                  "text": "「半个时辰吧。」她声音低了些。"
                },
                {
                  "speaker": "苏小棠",
                  "text": "「老蔡要是给你加肉，你别当场吃完。」"
                }
              ],
              "relationship": {
                "affinity": 1,
                "flags": [
                  "suxiaotang_guided",
                  "choice_1"
                ],
                "note": "苏小棠记得你认真听她说路。"
              }
            },
            {
              "choice": "问该先见谁",
              "log": "你问苏小棠此时该先找谁。",
              "nextLines": [
                {
                  "speaker": "苏小棠",
                  "text": "「想吃就找老蔡。想被吓一跳就去洗剑池。」"
                },
                {
                  "speaker": "苏小棠",
                  "text": "她想了想：「想安静，就别找我。」"
                }
              ],
              "relationship": {
                "affinity": 1,
                "flags": [
                  "suxiaotang_guided",
                  "choice_2"
                ],
                "note": "苏小棠记得你认真听她说路。"
              }
            }
          ]
        },
        {
          "id": "suxiaotang_ch1_done",
          "when": {
            "tutorialPhase": "ch1_done"
          },
          "lines": [
            {
              "speaker": "苏小棠",
              "text": "苏小棠抱着空碗靠在门边，眼睛还亮着。"
            },
            {
              "speaker": "苏小棠",
              "text": "「今天算你入门。明早别睡过头，萧师叔最烦人迟到。」"
            },
            {
              "speaker": "苏小棠",
              "text": "她把碗往怀里一收：「还有，肉的事你别跟周碛说。」"
            }
          ],
          "choices": [
            {
              "choice": "问明日晨练",
              "log": "你向苏小棠打听明日晨练。",
              "nextLines": [
                {
                  "speaker": "苏小棠",
                  "text": "「先站，再看，再照着做。」她说得一本正经。"
                },
                {
                  "speaker": "苏小棠",
                  "text": "「然后周碛会挑刺。你别理他，理了他更来劲。」"
                }
              ],
              "relationship": {
                "affinity": 1,
                "flags": [
                  "suxiaotang_guided",
                  "choice_0"
                ],
                "note": "苏小棠记得你认真听她说路。"
              }
            },
            {
              "choice": "问周碛",
              "log": "你向苏小棠打听周碛。",
              "nextLines": [
                {
                  "speaker": "苏小棠",
                  "text": "「他嘴坏，剑还行。」她把碗边擦了擦。"
                },
                {
                  "speaker": "苏小棠",
                  "text": "「等我再练半个月，他就只剩嘴坏了。」"
                }
              ],
              "relationship": {
                "affinity": 1,
                "flags": [
                  "suxiaotang_guided",
                  "choice_1"
                ],
                "note": "苏小棠记得你认真听她说路。"
              }
            }
          ]
        }
      ],
      "memoryKey": "wenjianfeng_suxiaotang"
    },
    {
      "room": "问剑峰·剑坪",
      "id": "wenjianfeng_canjian",
      "lines": [
        {
          "speaker": "narrator",
          "text": "残剑师姐站在剑坪中央，剑未出鞘。风从她袖口穿过去，像没有吹动她。"
        },
        {
          "speaker": "残剑师姐",
          "text": "她看了你一眼。很短，短到像是错觉。"
        },
        {
          "speaker": "残剑师姐",
          "text": "然后她微微点头。"
        }
      ],
      "choices": [
        {
          "choice": "郑重行礼",
          "log": "你向残剑师姐郑重行礼。",
          "nextLines": [
            {
              "speaker": "残剑师姐",
              "text": "她没有回礼，只把视线落在你的脚跟。"
            },
            {
              "speaker": "残剑师姐",
              "text": "「脚下虚。」她说。两个字像剑尖点在石板上。"
            }
          ]
        },
        {
          "choice": "请教站桩",
          "log": "你向残剑师姐请教站桩。",
          "nextLines": [
            {
              "speaker": "残剑师姐",
              "text": "她把一片落叶踢到你脚边。"
            },
            {
              "speaker": "残剑师姐",
              "text": "「叶不动，人不动。叶动，人也不动。」"
            },
            {
              "speaker": "narrator",
              "text": "你忽然明白，这大概不是一句禅语，而是真的要你站到风停。"
            }
          ]
        }
      ],
      "dialogueTier": "story",
      "memoryKey": "wenjianfeng_canjian"
    },
    {
      "room": "问剑峰·剑坪",
      "id": "wenjianfeng_liushishu",
      "lines": [
        {
          "speaker": "柳师叔",
          "text": "柳师叔面前摆着一盘棋。黑白两边都是他自己在下。"
        },
        {
          "speaker": "柳师叔",
          "text": "他没有抬头：「你站在那里，正好挡住了我一条活路。」"
        },
        {
          "speaker": "柳师叔",
          "text": "你挪开一步，他落下一子：「嗯，将死了。多谢。」"
        }
      ],
      "choices": [
        {
          "choice": "请问今日该做什么",
          "log": "你向柳师叔请教今日安排。",
          "nextLines": [
            {
              "speaker": "柳师叔",
              "text": "「先认路，再吃饭，再睡觉。练剑不急。」"
            },
            {
              "speaker": "柳师叔",
              "text": "他把棋子推回原处：「人没站稳，剑先急了，最容易伤自己。」"
            }
          ]
        },
        {
          "choice": "问这盘棋谁会赢",
          "log": "你问柳师叔棋局胜负。",
          "nextLines": [
            {
              "speaker": "柳师叔",
              "text": "「黑棋输。」"
            },
            {
              "speaker": "柳师叔",
              "text": "他又落下一颗黑子：「白棋也输。」"
            }
          ]
        }
      ],
      "dialogueTier": "story",
      "memoryKey": "wenjianfeng_liushishu"
    },
    {
      "room": "问剑峰·伙房",
      "id": "wenjianfeng_laocai",
      "lines": [
        {
          "speaker": "老蔡",
          "text": "老蔡一手锅铲一手菜刀，正对着灶台发号施令。"
        },
        {
          "speaker": "老蔡",
          "text": "「新来的？多吃点，练剑费力气。」"
        },
        {
          "speaker": "老蔡",
          "text": "他忽然压低声音：「上次周碛饿晕在剑坪上——别跟他说是我说的。」"
        }
      ],
      "choices": [
        {
          "choice": "讨一碗热粥",
          "log": "你向老蔡讨了一碗热粥。",
          "nextLines": [
            {
              "speaker": "老蔡",
              "text": "「自己盛。」他把碗推过来。"
            },
            {
              "speaker": "老蔡",
              "text": "「吃完把碗洗了。问剑峰没有白吃的饭，只有洗慢了被骂的碗。」"
            }
          ],
          "relationship": {
            "affinity": 1,
            "flags": [
              "laocai_spoke",
              "choice_0"
            ],
            "note": "老蔡记得你肯听他念叨饭菜。"
          }
        },
        {
          "choice": "问苏小棠爱吃什么",
          "log": "你向老蔡打听苏小棠。",
          "nextLines": [
            {
              "speaker": "老蔡",
              "text": "「她什么都爱吃，尤其爱吃别人碗里的。」"
            },
            {
              "speaker": "老蔡",
              "text": "他瞥你一眼：「你要是刚来就被她分走半碗饭，那算入门礼。」"
            }
          ],
          "relationship": {
            "affinity": 1,
            "flags": [
              "laocai_spoke",
              "choice_1"
            ],
            "note": "老蔡记得你肯听他念叨饭菜。"
          }
        }
      ],
      "dialogueTier": "story",
      "variants": [
        {
          "id": "laocai_ch1_free",
          "when": {
            "tutorialPhase": "ch1_free"
          },
          "lines": [
            {
              "speaker": "老蔡",
              "text": "老蔡把锅盖掀开一线，热气一下顶到眉毛上。"
            },
            {
              "speaker": "老蔡",
              "text": "「新来的，别杵着。要看就看火，别看锅。」"
            },
            {
              "speaker": "老蔡",
              "text": "他把一只空碗推过来：「待会儿排队，端稳些。」"
            }
          ],
          "choices": [
            {
              "choice": "问能否帮忙",
              "log": "你问老蔡是否需要帮忙。",
              "nextLines": [
                {
                  "speaker": "老蔡",
                  "text": "「能。」他把一篮菜塞过来。"
                },
                {
                  "speaker": "老蔡",
                  "text": "「择干净。择不干净，今晚你自己吃那一碗。」"
                }
              ],
              "relationship": {
                "affinity": 1,
                "flags": [
                  "laocai_spoke",
                  "choice_0"
                ],
                "note": "老蔡记得你肯听他念叨饭菜。"
              }
            },
            {
              "choice": "问苏小棠那一半",
              "log": "你向老蔡问起苏小棠分饭的事。",
              "nextLines": [
                {
                  "speaker": "老蔡",
                  "text": "老蔡哼了一声：「她嘴快，手也快。」"
                },
                {
                  "speaker": "老蔡",
                  "text": "「你要护食，就把碗端高些。」"
                }
              ],
              "relationship": {
                "affinity": 1,
                "flags": [
                  "laocai_spoke",
                  "choice_1"
                ],
                "note": "老蔡记得你肯听他念叨饭菜。"
              }
            }
          ]
        },
        {
          "id": "laocai_ch1_done",
          "when": {
            "tutorialPhase": "ch1_done"
          },
          "lines": [
            {
              "speaker": "老蔡",
              "text": "老蔡一个人洗碗，水声一下接一下。"
            },
            {
              "speaker": "老蔡",
              "text": "「今日吃饱了，明日就别喊累。」"
            },
            {
              "speaker": "老蔡",
              "text": "他没回头：「问剑峰的饭，都是拿汗换的。」"
            }
          ],
          "choices": [
            {
              "choice": "谢过晚饭",
              "log": "你向老蔡谢过晚饭。",
              "nextLines": [
                {
                  "speaker": "老蔡",
                  "text": "「谢我做什么。锅谢了没有？」"
                },
                {
                  "speaker": "老蔡",
                  "text": "他把洗好的碗扣下：「去歇着，明早别赖床。」"
                }
              ],
              "relationship": {
                "affinity": 1,
                "flags": [
                  "laocai_spoke",
                  "choice_0"
                ],
                "note": "老蔡记得你肯听他念叨饭菜。"
              }
            }
          ]
        }
      ],
      "memoryKey": "wenjianfeng_laocai"
    },
    {
      "room": "问剑峰·伙房",
      "id": "wenjianfeng_xiaohe",
      "lines": [
        {
          "speaker": "小荷",
          "text": "小荷满手面粉，正把一团面揉得啪啪作响。"
        },
        {
          "speaker": "小荷",
          "text": "「老蔡说再揉两年就能出师了。」她看着面团，神情认真。"
        },
        {
          "speaker": "小荷",
          "text": "「你觉得他在骗我吗？算了，你别说，我不敢听。」"
        }
      ],
      "choices": [
        {
          "choice": "夸她揉得很好",
          "log": "你夸小荷揉面手法利落。",
          "nextLines": [
            {
              "speaker": "小荷",
              "text": "她眼睛一亮，又立刻板住脸：「我知道。老蔡也知道，只是他不承认。」"
            },
            {
              "speaker": "小荷",
              "text": "面团在她掌下转了一圈，像被很小的一套掌法拍服了。"
            }
          ]
        }
      ],
      "dialogueTier": "story",
      "memoryKey": "wenjianfeng_xiaohe"
    },
    {
      "room": "问剑峰·伙房",
      "id": "wenjianfeng_tieniu",
      "lines": [
        {
          "speaker": "narrator",
          "text": "铁牛扛着一袋米走进来，脚步沉得像石鼓。"
        },
        {
          "speaker": "铁牛",
          "text": "他看了你一眼，点点头，把米袋放到墙角。"
        },
        {
          "speaker": "narrator",
          "text": "整个伙房震了一下。老蔡头也不回：「轻点！」"
        }
      ],
      "choices": [
        {
          "choice": "帮他扶米袋",
          "log": "你帮铁牛扶住米袋。",
          "nextLines": [
            {
              "speaker": "铁牛",
              "text": "铁牛又点了一下头。"
            },
            {
              "speaker": "narrator",
              "text": "他没有说话，但把下一袋米放得轻了一点。大概算谢过。"
            }
          ]
        }
      ],
      "dialogueTier": "story",
      "memoryKey": "wenjianfeng_tieniu"
    },
    {
      "room": "问剑峰·洗剑池",
      "id": "wenjianfeng_laoyu",
      "lines": [
        {
          "speaker": "盲眼老妪",
          "text": "盲眼老妪坐在洗剑池边，脸朝着水面。她的眼窝深陷，却像早已看见你。"
        },
        {
          "speaker": "盲眼老妪",
          "text": "「你的剑鞘没擦干净。第三次了。」"
        },
        {
          "speaker": "盲眼老妪",
          "text": "水面上没有风，却起了一圈很细的涟漪。"
        }
      ],
      "choices": [
        {
          "choice": "问她怎么知道",
          "log": "你问盲眼老妪如何知道剑鞘未净。",
          "nextLines": [
            {
              "speaker": "盲眼老妪",
              "text": "「闻得到。」"
            },
            {
              "speaker": "盲眼老妪",
              "text": "她抬手指向池底断剑：「铁锈、手汗、旧血、心浮气躁，都有味道。」"
            }
          ],
          "relationship": {
            "affinity": 0,
            "flags": [
              "laoyu_spoke",
              "choice_0"
            ],
            "note": "盲眼老妪记下你问过池底断剑。"
          }
        },
        {
          "choice": "低头擦净剑鞘",
          "log": "你低头把剑鞘仔细擦净。",
          "nextLines": [
            {
              "speaker": "盲眼老妪",
              "text": "「这次像样些。」"
            },
            {
              "speaker": "盲眼老妪",
              "text": "她停了很久，像在听池水：「别碰池底的断剑。它们不喜欢新手。」"
            }
          ],
          "relationship": {
            "affinity": 0,
            "flags": [
              "laoyu_spoke",
              "choice_1"
            ],
            "note": "盲眼老妪记下你问过池底断剑。"
          }
        }
      ],
      "dialogueTier": "uncanny",
      "variants": [
        {
          "id": "laoyu_ch1_free",
          "when": {
            "tutorialPhase": "ch1_free"
          },
          "lines": [
            {
              "speaker": "盲眼老妪",
              "text": "盲眼老妪坐在池边，手指轻轻敲着膝盖。"
            },
            {
              "speaker": "盲眼老妪",
              "text": "「新来的，走路声浅。不是轻，是怕。」"
            },
            {
              "speaker": "盲眼老妪",
              "text": "池水晃了一下，又像从没动过。"
            }
          ],
          "choices": [
            {
              "choice": "问她听见什么",
              "log": "你问盲眼老妪听见了什么。",
              "nextLines": [
                {
                  "speaker": "盲眼老妪",
                  "text": "「鞋底、剑鞘、半口气。」她抬了抬手。"
                },
                {
                  "speaker": "盲眼老妪",
                  "text": "「还有一个人催你快些走。小棠那丫头，脚步藏不住。」"
                }
              ],
              "relationship": {
                "affinity": 0,
                "flags": [
                  "laoyu_spoke",
                  "choice_0"
                ],
                "note": "盲眼老妪记下你问过池底断剑。"
              }
            }
          ]
        }
      ],
      "memoryKey": "wenjianfeng_laoyu"
    },
    {
      "room": "问剑峰·竹林",
      "id": "wenjianfeng_laoshu",
      "lines": [
        {
          "speaker": "劳叔",
          "text": "劳叔坐在竹棚下削竹丝，刀光很快，快得像没有抬起过。"
        },
        {
          "speaker": "劳叔",
          "text": "「新来的。你走偏了。」"
        },
        {
          "speaker": "劳叔",
          "text": "「左脚往左三寸——那根竹子我留着做剑鞘的。」"
        }
      ],
      "choices": [
        {
          "choice": "照他说的挪开",
          "log": "你照劳叔的话挪开脚步。",
          "nextLines": [
            {
              "speaker": "劳叔",
              "text": "他没有抬头，只把削好的竹丝放到一旁。"
            },
            {
              "speaker": "劳叔",
              "text": "「能听劝，比能出剑要紧。」"
            }
          ],
          "relationship": {
            "affinity": 1,
            "flags": [
              "laoshu_spoke",
              "choice_0"
            ],
            "note": "老舒记得你问过剑鞘竹丝。"
          }
        },
        {
          "choice": "问竹林深处",
          "log": "你向劳叔打听竹林深处。",
          "nextLines": [
            {
              "speaker": "劳叔",
              "text": "刀声停了一瞬。"
            },
            {
              "speaker": "劳叔",
              "text": "「白天别进。夜里更别进。」"
            },
            {
              "speaker": "劳叔",
              "text": "他继续削竹，像刚才什么都没说。"
            }
          ],
          "relationship": {
            "affinity": 1,
            "flags": [
              "laoshu_spoke",
              "choice_1"
            ],
            "note": "老舒记得你问过剑鞘竹丝。"
          }
        }
      ],
      "dialogueTier": "story",
      "variants": [
        {
          "id": "laoshu_ch1_free",
          "when": {
            "tutorialPhase": "ch1_free"
          },
          "lines": [
            {
              "speaker": "劳叔",
              "text": "劳叔削竹丝的手没有停。竹屑落在脚边，薄得像纸。"
            },
            {
              "speaker": "劳叔",
              "text": "「自由走动，不是自由乱走。」"
            },
            {
              "speaker": "劳叔",
              "text": "他刀尖往林深处偏了一下：「那边，今日别去。」"
            }
          ],
          "choices": [
            {
              "choice": "问为何不能去",
              "log": "你问劳叔为何不能进竹林深处。",
              "nextLines": [
                {
                  "speaker": "劳叔",
                  "text": "刀声停了一息。"
                },
                {
                  "speaker": "劳叔",
                  "text": "「路还没认全，就别学路自己拐弯。」"
                }
              ],
              "relationship": {
                "affinity": 1,
                "flags": [
                  "laoshu_spoke",
                  "choice_0"
                ],
                "note": "老舒记得你问过剑鞘竹丝。"
              }
            },
            {
              "choice": "看他削竹",
              "log": "你站在一旁看劳叔削竹丝。",
              "nextLines": [
                {
                  "speaker": "劳叔",
                  "text": "「看手，不看刀。」他说。"
                },
                {
                  "speaker": "劳叔",
                  "text": "你照他说的看，才发现竹丝是被顺出来的，不是削断的。"
                }
              ],
              "relationship": {
                "affinity": 1,
                "flags": [
                  "laoshu_spoke",
                  "choice_1"
                ],
                "note": "老舒记得你问过剑鞘竹丝。"
              }
            }
          ]
        }
      ],
      "memoryKey": "wenjianfeng_laoshu"
    },
    {
      "room": "问剑峰·竹林",
      "id": "wenjianfeng_shitou",
      "lines": [
        {
          "speaker": "narrator",
          "text": "石头光着膀子在劈柴。一斧下去，木桩裂成两半。"
        },
        {
          "speaker": "石头",
          "text": "他看了你一眼，咧嘴笑了笑。"
        },
        {
          "speaker": "narrator",
          "text": "他不会说话，但他的笑很宽厚，像一扇没有闩上的门。"
        }
      ],
      "choices": [
        {
          "choice": "向他点头",
          "log": "你向石头点头致意。",
          "nextLines": [
            {
              "speaker": "石头",
              "text": "石头也点头，顺手把一截柴递给你。"
            },
            {
              "speaker": "narrator",
              "text": "那截柴很轻。或者说，他递得很稳。"
            }
          ]
        }
      ],
      "dialogueTier": "story",
      "memoryKey": "wenjianfeng_shitou"
    },
    {
      "room": "问剑峰·药圃",
      "id": "wenjianfeng_aqing",
      "lines": [
        {
          "speaker": "阿青",
          "text": "阿青蹲在药圃边，拿树枝戳一条蛇。蛇不走，她也不走。"
        },
        {
          "speaker": "阿青",
          "text": "「你认识蛇胆草吗？」她问得很认真。"
        },
        {
          "speaker": "阿青",
          "text": "她没等你回答，自己摇头：「不是这种。上次我采错了，师兄拉了一天肚子。」"
        }
      ],
      "choices": [
        {
          "choice": "提醒她别再戳蛇",
          "log": "你提醒阿青别再戳蛇。",
          "nextLines": [
            {
              "speaker": "阿青",
              "text": "「它也没走啊。」阿青想了想，终于把树枝收回来。"
            },
            {
              "speaker": "阿青",
              "text": "蛇慢慢钻进草丛。她小声说：「好吧，今天它赢了。」"
            }
          ]
        },
        {
          "choice": "问药圃木牌",
          "log": "你向阿青询问药圃木牌。",
          "nextLines": [
            {
              "speaker": "阿青",
              "text": "「写错的不要看。划掉两次的更不要看。」"
            },
            {
              "speaker": "阿青",
              "text": "她指着一块木牌：「这个现在叫蛇胆草，明天也许不是。」"
            }
          ]
        }
      ],
      "dialogueTier": "story",
      "memoryKey": "wenjianfeng_aqing"
    },
    {
      "room": "问剑峰·剑冢",
      "id": "wenjianfeng_jianweng",
      "lines": [
        {
          "speaker": "narrator",
          "text": "剑冢风很冷。断剑插满地面，像一群沉默的旧人。"
        },
        {
          "speaker": "剑翁",
          "text": "剑翁抬头看了你一眼，又看了一眼你身后空处。"
        },
        {
          "speaker": "剑翁",
          "text": "「多了。」"
        }
      ],
      "choices": [
        {
          "choice": "问哪里多了",
          "log": "你问剑翁哪里多了。",
          "nextLines": [
            {
              "speaker": "剑翁",
              "text": "「脚步。」"
            },
            {
              "speaker": "剑翁",
              "text": "他低头继续扫落叶：「你一个人来，却有两道脚步。回去的时候注意脚下。」"
            }
          ],
          "relationship": {
            "affinity": 0,
            "flags": [
              "jianweng_seen",
              "choice_0"
            ],
            "note": "残剑翁记下你来过剑冢。"
          }
        },
        {
          "choice": "安静退后",
          "log": "你没有多问，只安静退后。",
          "nextLines": [
            {
              "speaker": "剑翁",
              "text": "剑翁点了点头，像是赞许。"
            },
            {
              "speaker": "剑翁",
              "text": "「会退，比会问难。」"
            }
          ],
          "relationship": {
            "affinity": 0,
            "flags": [
              "jianweng_seen",
              "choice_1"
            ],
            "note": "残剑翁记下你来过剑冢。"
          }
        }
      ],
      "dialogueTier": "uncanny",
      "variants": [
        {
          "id": "jianweng_ch1_done",
          "when": {
            "tutorialPhase": "ch1_done"
          },
          "lines": [
            {
              "speaker": "剑翁",
              "text": "剑翁坐在最大的断剑后面，碗里的肉少了一半。"
            },
            {
              "speaker": "剑翁",
              "text": "「老蔡今日舍得放油。」"
            },
            {
              "speaker": "剑翁",
              "text": "他看了你一眼，又看向你脚边：「第一日，能回到这里，算不错。」"
            }
          ],
          "choices": [
            {
              "choice": "问他为何看脚边",
              "log": "你问剑翁为何总看你脚边。",
              "nextLines": [
                {
                  "speaker": "剑翁",
                  "text": "「脚会先知道人要去哪。」"
                },
                {
                  "speaker": "剑翁",
                  "text": "他把碗放稳：「你的脚今日还没拿定主意。」"
                }
              ],
              "relationship": {
                "affinity": 0,
                "flags": [
                  "jianweng_seen",
                  "choice_0"
                ],
                "note": "残剑翁记下你来过剑冢。"
              }
            }
          ]
        }
      ],
      "memoryKey": "wenjianfeng_jianweng"
    },
    {
      "room": "问剑峰·藏剑阁",
      "id": "wenjianfeng_gelao",
      "lines": [
        {
          "speaker": "藏剑阁老",
          "text": "藏剑阁老坐在门口竹椅上打盹，头一点一点。"
        },
        {
          "speaker": "藏剑阁老",
          "text": "你刚把视线移到右边第三排书架，他忽然开口：「不是那边。」"
        },
        {
          "speaker": "藏剑阁老",
          "text": "他眼睛没有睁。"
        }
      ],
      "choices": [
        {
          "choice": "问该看哪边",
          "log": "你问藏剑阁老该看哪边。",
          "nextLines": [
            {
              "speaker": "藏剑阁老",
              "text": "「先看门槛。」"
            },
            {
              "speaker": "藏剑阁老",
              "text": "「能不能进，比进去看什么要紧。」"
            }
          ]
        },
        {
          "choice": "问右边第三排",
          "log": "你追问右边第三排书架。",
          "nextLines": [
            {
              "speaker": "藏剑阁老",
              "text": "「少了一格。」"
            },
            {
              "speaker": "藏剑阁老",
              "text": "他打了个呵欠：「少的东西，先别急着补。急着补，容易补错。」"
            }
          ]
        }
      ],
      "dialogueTier": "story",
      "memoryKey": "wenjianfeng_gelao"
    },
    {
      "room": "问剑峰·藏剑阁",
      "id": "wenjianfeng_muxiansheng",
      "lines": [
        {
          "speaker": "穆先生",
          "text": "穆先生坐在窗边读书，面色苍白，指尖压着书页。"
        },
        {
          "speaker": "穆先生",
          "text": "他咳了一声，把书合上：「山下？三年前的事了。不太记得了。」"
        },
        {
          "speaker": "穆先生",
          "text": "「你问这些做什么？」"
        }
      ],
      "choices": [
        {
          "choice": "说只是好奇",
          "log": "你说自己只是好奇山下旧事。",
          "nextLines": [
            {
              "speaker": "穆先生",
              "text": "「好奇是好事。」穆先生看向窗外。"
            },
            {
              "speaker": "穆先生",
              "text": "「但问剑峰上，有些人是为了忘记山下才来的。」"
            }
          ]
        },
        {
          "choice": "问他读的书",
          "log": "你问穆先生正在读什么书。",
          "nextLines": [
            {
              "speaker": "穆先生",
              "text": "他把书脊侧过来，又很快收回。"
            },
            {
              "speaker": "穆先生",
              "text": "「旧谱。缺了一式。缺的东西，总比写着的东西更像答案。」"
            }
          ]
        }
      ],
      "dialogueTier": "story",
      "memoryKey": "wenjianfeng_muxiansheng"
    }
  ],
  "variantRule": "First matching variants[].when wins; base lines/choices remain fallback.",
  "memoryRule": "Choices may carry relationship metadata; runtime stores it in state.npcMemory."
};

if (typeof window !== 'undefined') window.WENJIANFENG_NPC_DIALOGUES = WENJIANFENG_NPC_DIALOGUES;
if (typeof module !== 'undefined') module.exports = WENJIANFENG_NPC_DIALOGUES;

window.__DATA_REGISTRY = window.__DATA_REGISTRY || {};
try { if (typeof WENJIANFENG_NPC_DIALOGUES !== 'undefined') window.__DATA_REGISTRY['WENJIANFENG_NPC_DIALOGUES'] = WENJIANFENG_NPC_DIALOGUES; } catch(e) { console.warn('[Registry] WENJIANFENG_NPC_DIALOGUES not registered:', e.message); }
