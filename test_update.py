import urllib.request
import urllib.parse
import urllib.error
import json

url = 'http://127.0.0.1:8000/api/members/14/'
data = {
    'admissionNo': '9999',
    'status': 'Active',
    'name': 'Rushda Aha h',
    'email': 'rushdaahhhh@gmail.com',
    'contactNumber': '1234567890',
    'address': 'Test',
    'city': 'Test',
    'state': 'Test',
    'bloodGroup': 'A+',
    'gender': 'Female',
    'dateOfBirth': '2000-01-01'
}

# The frontend uses multipart/form-data, but since we are not sending files here, 
# let's try with application/json first to see if it's a validation error.
req = urllib.request.Request(url, method='PATCH', data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()}")
except Exception as e:
    print("Error:", e)
