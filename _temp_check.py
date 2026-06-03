import os, re

base = r'C:\Users\tabe\Desktop\GameFi\GameCard\GameGard'

# 1. Check .tscn files and what script they reference
print("=== TSCN Script References ===")
for root,d,fnames in os.walk(base):
    for fn in fnames:
        if fn.endswith('.tscn'):
            fp = os.path.join(root,fn)
            with open(fp,'rb') as f:
                raw = f.read()
            enc = 'utf-8' if raw[:3]==b'\xef\xbb\xbf' else None
            text = raw[3:].decode('utf-8') if enc else raw.decode('utf-8','replace')
            for line in text.split('\n'):
                if 'ext_resource' in line and 'Script' in line:
                    print(f'{fn} -> {line.strip()}')

# 2. Find all BattleManager.XXX() or EventBus.XXX() static calls (not via BM/EB)
print("\n=== Static Call Issues ===")
pat = re.compile(r'\b(BattleManager|EventBus)\s*\.\s*(\w+)\s*\(')
for root,d,fnames in os.walk(base):
    for fn in fnames:
        if fn.endswith('.gd'):
            fp = os.path.join(root,fn)
            with open(fp,'rb') as f:
                raw = f.read()
            enc = 'utf-8' if raw[:3]==b'\xef\xbb\xbf' else None  
            text = raw[3:].decode('utf-8') if enc else raw.decode('utf-8','replace')
            for i,l in enumerate(text.split('\n'),1):
                m = pat.search(l)
                if m:
                    # skip comments
                    comment_pos = l.find('#')
                    call_pos = l.find(m.group())
                    if comment_pos == -1 or call_pos < comment_pos:
                        print(f'{fn}:{i} {l.strip()}')
