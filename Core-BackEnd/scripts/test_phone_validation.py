import requests

API_URL = "http://192.168.1.15:5235/api/Auth/sign-up"

# Test the problematic phone number
payload = {
    "phoneNumber": "+2001022322292",
    "password": "P@ssw0rd",
    "firstName": "Shady",
    "lastName": "Ismael",
    "firebaseUid": "OymuOTRuOsYZpNRiMMGmiCFmExR2"
}

try:
    resp = requests.post(API_URL, json=payload)
    print(f"Status Code: {resp.status_code}")
    print(f"Response: {resp.json()}")
except Exception as e:
    print(f"Error: {e}")