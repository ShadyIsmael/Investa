import requests
import urllib3
import json

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE = "https://DESKTOP-DIH7CQH:7292"
TOKEN_PATH = "/api/Auth/token"
ADMIN_CLIENTS = "/api/v1/admin/clients"

emails_to_try = [
    "admin.investa.com",
    "admin@investa.com",
    "admin@investa.local"
]

session = requests.Session()
session.verify = False
headers = {"Content-Type": "application/json"}

for email in emails_to_try:
    print(f"Trying /api/Auth/token with email: {email}")
    try:
        r = session.post(BASE + TOKEN_PATH, json={"Email": email}, headers=headers, timeout=60)
    except Exception as e:
        print(f"Request error: {e}")
        continue

    print(f"Status: {r.status_code}")
    print("Response body:")
    print(r.text)

    if r.status_code == 200:
        token = r.text.strip().strip('"')
        print("\nObtained token. Calling admin clients endpoint...\n")
        auth_headers = {"Authorization": f"Bearer {token}"}
        try:
            cr = session.get(BASE + ADMIN_CLIENTS, headers=auth_headers, timeout=60)
            print(f"Admin clients status: {cr.status_code}")
            try:
                print(json.dumps(cr.json(), indent=2))
            except Exception:
                print(cr.text)
        except Exception as e:
            print(f"Admin request error: {e}")
        break
    else:
        print("Token endpoint did not return 200. Trying next email if any.")

print('\nDone.')
