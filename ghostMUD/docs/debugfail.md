IntroScene 黑屏修复 + CDP测试Skill
目标
修复 IntroScene 开场引导文字不可见（用户看到纯黑屏），并将 CDP 端到端测试方法沉淀为 Skill。

根因分析
writing-mode: vertical-rl + text-orientation: upright 在用户浏览器环境下导致 .intro-narrative 的 offsetHeight: 0——文字存在于 DOM 中但渲染面积为零。

修复
从 src/styles/intro.css 中移除 writing-mode: vertical-rl 和 text-orientation: upright，文字改为横向显示。

验证结果（CDP 远程检查）
修复失败，问题未解决，依旧无法显示打印文字，严重BUG待解决！！！
