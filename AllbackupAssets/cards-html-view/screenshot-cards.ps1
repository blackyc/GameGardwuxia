# 批量截图卡牌
# 需要 xbrowser 已配置完成（xb config reset 已执行）

$xb = "node `"C:\Program Files\QClaw\v0.2.22.518\resources\openclaw\config\skills\xbrowser\scripts\xb.cjs`""
$outDir = "C:\Users\tabe\Desktop\GameFi\GameCard\GameGard\AllbackupAssets\card-pngs"
$htmlPath = "file:///C:/Users/tabe/Desktop/GameFi/GameCard/GameGard/AllbackupAssets/cards-html-view/cards-gallery.html"

# 卡牌名称列表（与 HTML 中 CARDS 顺序一致）
$cardNames = @(
  "魔门基础心法", "修罗饮血功", "血刀大法", "祭血连环斩", "狂骨碎岩拳",
  "血海魔录", "魔刀·泣血", "天魔解体", "修罗化血阵",
  "纯阳心法诀", "武当基础心法", "两仪桩功", "武当基础剑", "太极剑·三环套月",
  "太极掌·绕指柔云", "梯云纵", "真武密录", "真武七截剑", "纯阳无极剑", "九阳神功",
  "隐堂基础内功", "毒瘴功", "千机图谱", "鬼影迷踪", "阎王帖",
  "含沙射影", "无影毒砂", "子母追魂胆", "血滴子", "暴雨梨花针", "佛怒唐莲", "万蛊噬心",
  "餐风饮露功", "聚气诀", "舍身撞", "透骨钉", "踏雪无痕", "血蛭镖", "阳光普照"
)

$total = $cardNames.Count
Write-Host "共 $total 张卡，开始截图..." -ForegroundColor Cyan

for ($i = 0; $i -lt $total; $i++) {
  $name = $cardNames[$i]
  $safeName = $name -replace '[\\/:*?"<>|]', '_'
  $url = "$htmlPath`?card=$i"

  Write-Host "[$i/$total] 截图: $name" -ForegroundColor Yellow

  # 打开指定卡
  $open = & node "C:\Program Files\QClaw\v0.2.22.518\resources\openclaw\config\skills\xbrowser\scripts\xb.cjs" run --browser default -- open $url 2>&1
  Start-Sleep -Milliseconds 800

  # 截图
  $result = & node "C:\Program Files\QClaw\v0.2.22.518\resources\openclaw\config\skills\xbrowser\scripts\xb.cjs" run --browser default -- screenshot 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue

  if ($result.ok -and $result.data.result.success) {
    $src = $result.data.result.data.path
    $dst = Join-Path $outDir "$safeName.png"
    Copy-Item $src $dst -Force
    Write-Host "  ✓ 已保存: $dst" -ForegroundColor Green
  } else {
    Write-Host "  ✗ 截图失败" -ForegroundColor Red
    Write-Host ($result | Out-String)
  }
}

Write-Host "`n全部完成！输出目录: $outDir" -ForegroundColor Cyan
