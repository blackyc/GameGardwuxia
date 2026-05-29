import json, urllib.request

# Simple test
payload = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
        "name": "execute_editor_script",
        "arguments": {"code": 'print("hello from editor script")'}
    }
}

req = urllib.request.Request('http://localhost:9080/mcp',
    data=json.dumps(payload).encode(),
    headers={'Content-Type': 'application/json'})
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
print(json.dumps(result, indent=2, ensure_ascii=False))
