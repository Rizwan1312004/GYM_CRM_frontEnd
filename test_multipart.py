import urllib.request
import urllib.parse
import json
import uuid

url = 'http://127.0.0.1:8000/api/members/14/'
data = {
    'admissionNo': '1239',
    'admission_no': '1238',  
    'name': 'Rushda',
    'status': 'Active',
    'email': 'rushdaahhhh@gmail.com',
    'contactNumber': '1234567890',
    'bloodGroup': 'A+',
    'dateOfBirth': '2000-01-01',
    'gender': 'Female',
    'address': 'Test',
    'city': 'Test',
    'state': 'Test'
}

boundary = uuid.uuid4().hex
headers = {'Content-Type': f'multipart/form-data; boundary={boundary}'}

body = []
for key, value in data.items():
    body.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n')
body.append(f'--{boundary}--\r\n')
body_str = ''.join(body).encode('utf-8')

req = urllib.request.Request(url, method='PATCH', data=body_str, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        print("Success:", resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"Error {e.code}: {e.read().decode()}")

