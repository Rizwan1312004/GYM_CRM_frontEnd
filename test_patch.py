import urllib.request
import urllib.parse
import json

url = 'http://127.0.0.1:8000/api/members/9/'
data = {'admissionNo': '1235'}
req = urllib.request.Request(url, method='PATCH', data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print('Success')
except urllib.error.HTTPError as e:
    with open('error.html', 'w', encoding='utf-8') as f:
        f.write(e.read().decode())
