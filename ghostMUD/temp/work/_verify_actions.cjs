const http = require('http');
http.get('http://127.0.0.1:3001/', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const jhStart = d.indexOf('data-page="jianghu"');
    const jhEnd = d.indexOf('</section>', jhStart);
    const jh = d.slice(jhStart, jhEnd);
    
    console.log('=== 江湖页行动框验证 ===');
    console.log('✅ 北/南方向键已删除:', !jh.includes('data-dir="north"') && !jh.includes('data-dir="south"'));
    console.log('✅ 上/下方向键已删除:', !jh.includes('data-dir="up"') && !jh.includes('data-dir="down"'));
    console.log('✅ 打听已从行动框删除:', !jh.includes('data-action="askAround"'));
    console.log('✅ 练武已从行动框删除:', !jh.includes('practiceMenu'));
    console.log('✅ 拜师已从行动框删除:', !jh.includes('data-action="askTeacher"'));
    console.log('✅ 交谈已从行动框删除:', !jh.includes('data-action="talk"'));
    console.log('✅ 武学/人物/舆图跳转已删除:', !jh.includes('switchPage'));
    console.log('');
    console.log('=== 新增元素验证 ===');
    console.log('✅ 感知菱形徽章:', jh.includes('data-action="perceive"'));
    console.log('✅ 修行菱形徽章:', jh.includes('data-action="cultivate-menu"'));
    console.log('✅ 休憩菱形徽章:', jh.includes('data-action="rest"'));
    console.log('✅ 修行子选项(入定):', jh.includes('data-action="meditate"'));
    console.log('✅ 修行子选项(练功):', jh.includes('data-action="pushup"'));
    console.log('✅ 感知面板:', jh.includes('perception-panel'));
    console.log('');
    console.log('=== 底部导航 ===');
    console.log('✅ 底部导航存在:', d.includes('bottom-nav'));
    
    // 武学页检查 practiceMenu
    const wxStart = d.indexOf('data-page="wuxue"');
    const wxEnd = d.indexOf('</section>', wxStart);
    const wx = d.slice(wxStart, wxEnd);
    console.log('✅ 练武在武学页:', wx.includes('practiceMenu'));
  });
});
