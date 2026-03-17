import urllib.request
import json

url = 'http://127.0.0.1:8000/api/members/'
req = urllib.request.Request(url, method='GET')
try:
    with urllib.request.urlopen(req) as response:
        members = json.loads(response.read().decode())
        if not members:
            # check results?
            print("No members")
            if 'results' in members:
                members = members['results']
        for m in members:
            print(f"ID: {m['id']}, AdmissionNo: {m.get('admissionNo', m.get('admission_no'))}, Email: {m['email']}")
except Exception as e:
    print("Error formatting GET:", e)
