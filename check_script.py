#!/usr/bin/env python3
# -*- coding: utf-8 -*-
path = r'C:\Users\tabe\Desktop\GameFi\GameCard\GameGard\scenes\combat\battle_scene_v2.gd'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

print(f'Total lines: {len(lines)}')

# Check triple quotes
triple_count = content.count('"""')
print(f'Triple quote count: {triple_count}')
if triple_count % 2 != 0:
    print('WARNING: Odd number of triple quotes!')
else:
    print('OK: Triple quotes are paired')

# Check for indentation issues
indent_issues = []
for i, line in enumerate(lines, 1):
    if line.strip() == '' and line != '' and not line.isspace():
        indent_issues.append(i)

if indent_issues:
    print(f'Indentation issues: {len(indent_issues)} lines')
    for line_num in indent_issues[:5]:
        print(f'  Line {line_num}')
else:
    print('OK: No indentation issues')
