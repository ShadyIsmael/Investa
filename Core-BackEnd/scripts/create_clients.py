import requests

API_URL = "http://localhost:5000/api/Auth/sign-up"
PASSWORD = "P@ssw0rd"

clients = [
    {"firstName": "Ahmed", "lastName": "Hassan", "phoneNumber": "+201000000001"},
    {"firstName": "Sara", "lastName": "Ali", "phoneNumber": "+201000000002"},
    {"firstName": "Mohamed", "lastName": "Youssef", "phoneNumber": "+201000000003"},
    {"firstName": "Mona", "lastName": "Ibrahim", "phoneNumber": "+201000000004"},
    {"firstName": "Omar", "lastName": "Saeed", "phoneNumber": "+201000000005"},
    {"firstName": "Fatma", "lastName": "Khaled", "phoneNumber": "+201000000006"},
    {"firstName": "Yara", "lastName": "Mahmoud", "phoneNumber": "+201000000007"},
    {"firstName": "Mostafa", "lastName": "Fathy", "phoneNumber": "+201000000008"},
    {"firstName": "Nour", "lastName": "Samir", "phoneNumber": "+201000000009"},
    {"firstName": "Hana", "lastName": "Gamal", "phoneNumber": "+201000000010"},
]

for client in clients:
    payload = {
        "phoneNumber": client["phoneNumber"],
        "password": PASSWORD,
        "firstName": client["firstName"],
        "lastName": client["lastName"]
    }
    try:
        resp = requests.post(API_URL, json=payload)
        print(f"{client['firstName']} {client['lastName']} ({client['phoneNumber']}): {resp.status_code} {resp.json()}")
    except Exception as e:
        print(f"Error for {client['phoneNumber']}: {e}")
