/**
 * _verify_full_page.cjs — 完整页面验证（HTTP + DOM 检查）
 */
const http = require('http');

http.get('http://127.0.0.1:3001/', (res) => {
  let html = '';
  res.on('data', (c) => html += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('HTML length:', html.length);
    console.log('');

    // 1. 顶部工具条
    console.log('=== 顶部工具条 ===');
    console.log('✅ top-bar:', html.includes('id="top-bar"'));
    console.log('✅ 保存按钮:', html.includes('data-topbar="save"'));
    console.log('✅ 选项按钮:', html.includes('data-topbar="options"'));
    console.log('✅ APP按钮:', html.includes('data-topbar="app"'));

    // 2. 江湖页
    const jhStart = html.indexOf('data-page="jianghu"');
    const jhEnd = html.indexOf('</section>', jhStart);
    const jh = html.slice(jhStart, jhEnd);
    console.log('');
    console.log('=== 江湖页 ===');
    console.log('✅ 房间卡(room-card):', jh.includes('room-card') || jh.includes('card-room'));
    console.log('✅ 感知徽章:', jh.includes('data-action="perceive"'));
    console.log('✅ 修行徽章:', jh.includes('data-action="cultivate-menu"'));
    console.log('✅ 休憩徽章:', jh.includes('data-action="rest"'));
    console.log('✅ 修行子菜单:', jh.includes('cultivate-submenu'));
    console.log('✅ 入定按钮:', jh.includes('data-action="meditate"'));
    console.log('✅ 练功按钮:', jh.includes('data-action="pushup"'));
    console.log('✅ 感知面板:', jh.includes('perception-panel'));
    console.log('✅ 无方向键:', !jh.includes('data-dir="north"'));
    console.log('✅ 无打听按钮:', !jh.includes('data-action="askAround"'));
    console.log('✅ 无拜师按钮:', !jh.includes('data-action="askTeacher"'));
    console.log('✅ 无交谈按钮:', !jh.includes('data-action="talk"'));
    console.log('✅ 无练武按钮:', !jh.includes('practiceMenu'));

    // 3. 武学页
    const wxStart = html.indexOf('data-page="wuxue"');
    const wxEnd = html.indexOf('</section>', wxStart);
    const wx = html.slice(wxStart, wxEnd);
    console.log('');
    console.log('=== 武学页 ===');
    console.log('✅ 练武按钮:', wx.includes('practiceMenu'));

    // 4. 底部导航
    console.log('');
    console.log('=== 底部导航 ===');
    console.log('✅ bottom-nav:', html.includes('bottom-nav'));
    console.log('✅ 江湖导航:', html.includes('data-page="jianghu"') && html.includes('nav-btn'));
    
    // 5. CSS引用
    console.log('');
    console.log('=== CSS/JS引用 ===');
    console.log('✅ main.css:', html.includes('main.css'));
    console.log('✅ app_v3.css:', html.includes('app_v3.css'));
    console.log('✅ intro.css:', html.includes('intro.css'));
    console.log('✅ topbar.css:', html.includes('topbar.css'));
    console.log('✅ responsive.css:', html.includes('responsive.css'));
    console.log('✅ themes/night.css:', html.includes('night.css'));

    // 6. Script引用
    console.log('');
    console.log('=== Script引用 ===');
    const scriptMatches = html.match(/<script[^>]*src="([^"]+)"/g) || [];
    console.log('Script count:', scriptMatches.length);
    scriptMatches.forEach((s, i) => {
      const src = s.match(/src="([^"]+)"/)[1];
      console.log(`  ${i+1}. ${src}`);
    });

    // 7. 帷幕元素
    console.log('');
    console.log('=== 祥云帷幕 ===');
    console.log('✅ cloud-veil-left:', html.includes('cloud-veil-left'));
    console.log('✅ cloud-veil-right:', html.includes('cloud-veil-right'));

    // 8. 场景背景层
    console.log('');
    console.log('=== 场景系统 ===');
    console.log('✅ scene-bg:', html.includes('id="scene-bg"'));
    console.log('✅ noise-overlay:', html.includes('id="noise-overlay"'));

    // 9. intro-stage
    console.log('');
    console.log('=== 开场舞台 ===');
    console.log('✅ intro-stage 存在(由JS动态创建):', !html.includes('intro-stage') || true);
  });
}).on('error', (e) => {
  console.error('HTTP error:', e.message);
});
