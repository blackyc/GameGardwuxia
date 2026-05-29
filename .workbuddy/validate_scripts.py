import json, urllib.request

files = [
    "res://src/resources/card_data.gd",
    "res://src/autoloads/event_bus.gd",
    "res://src/autoloads/battle_manager.gd",
    "res://src/systems/card_effect.gd",
    "res://scenes/cards/battle_card.gd",
    "res://scenes/combat/hand_area.gd",
    "res://scenes/combat/enemy.gd",
    "res://scenes/combat/battle_scene.gd",
]

for fpath in files:
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "validate_script",
            "arguments": {"script_path": fpath}
        }
    }
    req = urllib.request.Request('http://localhost:9080/mcp',
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json'})
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    try:
        content = json.loads(result['result']['content'][0]['text'])
        errors = content.get('errors', [])
        warnings = content.get('warnings', [])
        valid = content.get('valid', '?')
        fname = fpath.replace('res://', '')
        if errors or warnings:
            print(f"--- {fname} ---")
            print(f"  Valid: {valid}, Errors: {len(errors)}, Warnings: {len(warnings)}")
            for e in errors:
                print(f"  ERROR: {e}")
            for w in warnings:
                print(f"  WARNING: {w}")
        else:
            print(f"OK: {fname}")
    except Exception as e:
        print(f"FAIL: {fpath} -> {e}")
        print(result)
