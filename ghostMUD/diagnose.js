// 诊断脚本：检查卷宗加载和核心模块
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    console.log('=== ghostMUD Diagnostic ===');
    console.log('window.LOCATIONS:', typeof window.LOCATIONS, Object.keys(window.LOCATIONS || {}).length);
    console.log('window.REALMS:', typeof window.REALMS, (window.REALMS || []).length);
    console.log('window.ENEMIES:', typeof window.ENEMIES, Object.keys(window.ENEMIES || {}).length);
    console.log('window.FACTIONS:', typeof window.FACTIONS, Object.keys(window.FACTIONS || {}).length);
    console.log('window.NPC_ENCOUNTERS:', typeof window.NPC_ENCOUNTERS, Object.keys(window.NPC_ENCOUNTERS || {}).length);
    console.log('window.FACTION_RECRUITER_ENCOUNTERS:', typeof window.FACTION_RECRUITER_ENCOUNTERS);
    console.log('window.getDesc:', typeof window.getDesc);
    console.log('window.game:', typeof window.game);
    if (window.game) {
      console.log('game.state:', window.game.state);
      console.log('game.REALMS:', (window.game.REALMS || []).length);
      console.log('game.LOCATIONS:', Object.keys(window.game.LOCATIONS || {}).length);
      console.log('game.timer:', window.game.timer);
      console.log('game.timer._intervals:', window.game.timer._intervals);
    }
  }, 1000);
});