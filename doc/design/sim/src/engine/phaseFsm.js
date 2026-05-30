// Phase FSM — 阶段枚举 + 转换验证
// 配合 constants.json 使用

var Phase = Object.freeze({
  PREPARATION:      'preparation',
  CHOOSE_JUDGMENT:  'chooseJudgment',
  JUDGMENT:         'judgment',
  ACTION:           'action',
  PHASE_A:          'phaseA',
  PHASE_A_DONE:     'phaseA_done',
  RESOLUTION:       'resolution',
  NEXT_ROUND:       'nextRound',
  RESPONSE:         'response',
  NEW_ROUND:        'newRound',
  DANTIAN_SELECT:   'dantian_select'
});

// 合法状态转换表
var VALID_TRANSITIONS = {};
VALID_TRANSITIONS[Phase.PREPARATION]      = [Phase.CHOOSE_JUDGMENT];
VALID_TRANSITIONS[Phase.CHOOSE_JUDGMENT]  = [Phase.JUDGMENT];
VALID_TRANSITIONS[Phase.JUDGMENT]         = [Phase.ACTION];
VALID_TRANSITIONS[Phase.ACTION]           = [Phase.PHASE_A, Phase.RESPONSE, Phase.RESOLUTION, Phase.NEXT_ROUND, Phase.NEW_ROUND, Phase.DANTIAN_SELECT];
VALID_TRANSITIONS[Phase.PHASE_A]          = [Phase.PHASE_A_DONE];
VALID_TRANSITIONS[Phase.PHASE_A_DONE]     = [Phase.ACTION, Phase.RESOLUTION];
VALID_TRANSITIONS[Phase.RESOLUTION]       = [Phase.NEW_ROUND, Phase.NEXT_ROUND];
VALID_TRANSITIONS[Phase.NEXT_ROUND]       = [Phase.NEW_ROUND];
VALID_TRANSITIONS[Phase.NEW_ROUND]        = [Phase.PREPARATION];
VALID_TRANSITIONS[Phase.RESPONSE]         = [Phase.ACTION, Phase.PHASE_A];
VALID_TRANSITIONS[Phase.DANTIAN_SELECT]   = [Phase.ACTION];

// 验证并执行状态转换
function setPhase(state, newPhase) {
  // 同相允许（准备阶段循环、重复进入同一阶段）
  if (state.phase === newPhase) return state.phase;
  var allowed = VALID_TRANSITIONS[state.phase];
  if (allowed && allowed.indexOf(newPhase) < 0) {
    var err = 'FSM: 非法转换 ' + state.phase + ' → ' + newPhase + ' (允许: ' + allowed.join(',') + ')';
    if (state.log) state.log.push('[FSM ERR] ' + err);
    else console.error(err);
    // 仍执行转换（宽松模式，避免崩溃），但记录错误
  }
  state.phase = newPhase;
  return state.phase;
}

module.exports = {
  Phase: Phase,
  setPhase: setPhase,
  VALID_TRANSITIONS: VALID_TRANSITIONS
};
