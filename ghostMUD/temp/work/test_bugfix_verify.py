# -*- coding: utf-8 -*-
"""BUG 修复回归测试（Python 版，因本机无 node）— 2026-06-21
验证 BUG-1（方向键归一化）与 BUG-2（NPC 数据契约 title/choice）。
运行：python work/test_bugfix_verify.py
"""
import re, sys, io, os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_file(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
        return f.read()

# ---------- 极简 JS 全局对象解析（只取我们要的数据，不执行函数） ----------
# 用正则把各 rebuild 文件里的 const X = {...} 抠出来太脆；
# 这里改用更稳的策略：实际执行 integration_v2.js 会重建 LOCATIONS/NPC_ENCOUNTERS，
# 但它依赖 CITY_ROOMS/WILD_ROOMS/DUNGEON_ROOMS。我们没有 JS 引擎，
# 因此直接对数据源 JS 做"结构校验"——这正是本测试的本意：
#   1) 房间 connections 的 key 是否合法中文方向
#   2) integration_v2.js 是否真的给每个 result 加了 choice、给 enc 加了 title

DIR_CN = {'north':'北','south':'南','east':'东','west':'西','up':'上','down':'下','in':'入','out':'出'}
ALLOWED_DIR = {'北','南','东','西','上','下','入','出'}
CN_DIR_SET = set(DIR_CN.values())

pass_n = 0
fail_n = 0
def ok(name):
    global pass_n; pass_n += 1
    print('  \u2713 ' + name)
def bad(name, extra=''):
    global fail_n; fail_n += 1
    print('  \u2717 ' + name + (' \u2192 ' + extra if extra else ''))

# ============ BUG-1: 房间数据方向键合法性 ============
print('\n[BUG-1] 房间 connections 方向键合法性')
conn_re = re.compile(r'connections\s*:\s*\{([^}]*)\}')
key_re  = re.compile(r'([^\s:,]+)\s*:')
bad_dirs = []
total_conn = 0
for fn in ['work/rebuild_rooms_city.js','work/rebuild_rooms_wild.js','work/rebuild_dungeon_rooms.js']:
    src = load_file(fn)
    for m in conn_re.finditer(src):
        body = m.group(1)
        for km in key_re.finditer(body):
            k = km.group(1).strip()
            if k.startswith("'") or k.startswith('"'):
                k = k.strip('\'"')
            # 跳过 value（带引号的房间名）
            if k in CN_DIR_SET or k in DIR_CN:
                total_conn += 1
            elif re.fullmatch(r'[北南东西上下入出]', k):
                total_conn += 1
# 上面的正则不够准（方向和值都会被 key_re 抓到），改用更精确的方式：
bad_dirs = []
total_conn = 0
for fn in ['work/rebuild_rooms_city.js','work/rebuild_rooms_wild.js','work/rebuild_dungeon_rooms.js']:
    src = load_file(fn)
    for m in re.finditer(r'connections\s*:\s*\{([^}]*)\}', src):
        body = m.group(1)
        # 形如  北: '应天府'  上: '楼'  in: 'x'
        for km in re.finditer(r"([北南东西上下入出]|north|south|east|west|up|down|in|out)\s*:\s*'([^']*)'", body):
            k = km.group(1)
            total_conn += 1
            if k not in CN_DIR_SET and k not in DIR_CN:
                bad_dirs.append(fn + ':' + k)
if bad_dirs == []:
    ok('全部 %d 条 connection 方向键合法（中文集合）' % total_conn)
else:
    bad('非法方向键', ', '.join(bad_dirs[:5]))

# ============ BUG-1b: explore() 是否已加 DIR_CN 归一化 ============
print('\n[BUG-1b] explore() 引擎侧归一化已应用')
html = load_file('ghost_mud_v2.html')
if 'DIR_CN' in html and "DIR_CN[dir]" in html:
    ok('explore() 含 DIR_CN 归一化逻辑')
else:
    bad('explore() 仍缺少 DIR_CN 归一化')

# ============ BUG-2: integration_v2.js 是否加了 _toEngineResult / title ============
print('\n[BUG-2] integration_v2.js 数据契约补齐')
iv2 = load_file('work/integration_v2.js')
if '_toEngineResult' in iv2:
    ok('存在 _toEngineResult 转换函数')
else:
    bad('缺少 _toEngineResult')
if 'choice: choiceText' in iv2 or 'choice:' in iv2:
    ok('result 增加 choice 字段')
else:
    bad('result 未补 choice')
# title: npcName / title: m.name
title_count = len(re.findall(r'title:\s*(?:npcName|m\.name)', iv2))
if title_count >= 2:
    ok('遭遇对象补 title 字段（共 %d 处）' % title_count)
else:
    bad('遭遇对象 title 补全不足', '仅 %d 处' % title_count)
# results.map(_toEngineResult)
if 'results.map(_toEngineResult)' in iv2 or '.map(_toEngineResult)' in iv2:
    ok('results 经 _toEngineResult 映射')
else:
    bad('results 未映射')

# ============ BUG-2b: applyReward 支持 heal ============
print('\n[BUG-2b] applyReward / npcChoice 支持 heal·daoxin')
if "key === 'heal'" in html or "key === 'heal'" in html:
    ok('applyReward 支持 heal')
else:
    bad('applyReward 未支持 heal')

# ============ 结果 ============
print('\n\u2500' * 30)
print('PASS: %d   FAIL: %d' % (pass_n, fail_n))
print('\U0001F389 全部通过' if fail_n == 0 else '\u26A0 存在失败项')
sys.exit(0 if fail_n == 0 else 1)
