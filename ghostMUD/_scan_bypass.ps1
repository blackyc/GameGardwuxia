$files = Get-ChildItem 'D:\MUD\ghostMUD\src' -Recurse -Filter '*.js'
foreach ($f in $files) {
    $matches = Select-String -Path $f.FullName -Pattern 'window\.(COMBAT_SKILLS_V3|XINGGONG|ATB_SYSTEM|CORRUPTION|MERIDIANS|SEALS|BUILDS)'
    if ($matches.Count -gt 0) {
        Write-Host "$($f.Name): $($matches.Count) hits"
        foreach ($m in $matches) {
            Write-Host "  L$($m.LineNumber): $($m.Line.Trim())"
        }
    }
}
