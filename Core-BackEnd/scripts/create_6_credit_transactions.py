#!/usr/bin/env python3
"""Create 6 random credit transactions for a given phone using the running API.

Usage:
  python scripts/create_6_credit_transactions.py
"""
import random
import time
import requests

# Update this to the running backend URL
BASE_URL = "http://localhost:5000"
PHONE = "+2001022322292"
PASSWORD = "P@ssw0rd"

def login(phone, password):
    url = f"{BASE_URL}/api/auth/login"
    payload = {"phoneNumber": phone, "password": password}
    r = requests.post(url, json=payload, timeout=30)
    r.raise_for_status()
    j = r.json()
    data = j.get("data") or j.get("Data")
    token = None
    if data:
        token = data.get("token") or data.get("Token")
    if not token:
        raise RuntimeError(f"Failed to extract token from login response: {j}")
    return token, data


def get_client_by_phone(phone, token):
    url = f"{BASE_URL}/api/clients/by-phone/{phone}"
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(url, headers=headers, timeout=30)
    r.raise_for_status()
    return r.json()


def create_credit(user_id, amount, tx_type, description, token):
    url = f"{BASE_URL}/api/credits"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "userId": user_id,
        "amount": amount,
        "type": tx_type,
        "description": description
    }
    r = requests.post(url, json=payload, headers=headers, timeout=30)
    r.raise_for_status()
    return r.json()


def main():
    print(f"Logging in {PHONE} -> {BASE_URL}")
    token, login_data = login(PHONE, PASSWORD)
    print("Got token")

    # Attempt to get user id from login data, otherwise call client endpoint
    user_id = None
    if isinstance(login_data, dict):
        user_id = login_data.get("userId") or login_data.get("userId") or login_data.get("UserId") or login_data.get("id")
    if not user_id:
        client = get_client_by_phone(PHONE, token)
        if isinstance(client, dict):
            user_id = client.get("userId") or client.get("UserId") or client.get("id")
    if not user_id:
        raise RuntimeError(f"Failed to obtain userId for {PHONE}")

    print(f"Creating 6 credit transactions for user {user_id}")

    descriptions = [
        "Auto credit - bonus",
        "Auto credit - referral",
        "Auto credit - adjustment",
        "Auto credit - cashback",
        "Auto credit - promo",
        "Auto credit - system"
    ]

    created = 0
    for i in range(6):
        amount = round(random.uniform(10, 500), 2)
        tx_type = "Earn"
        desc = descriptions[i % len(descriptions)]
        try:
            res = create_credit(user_id, amount, tx_type, desc, token)
            created += 1
            print(f"[{i+1}] Created credit: amount={amount}, id={res.get('id') if isinstance(res, dict) else 'unknown'}")
        except Exception as e:
            print(f"[{i+1}] Failed to create credit: {e}")
        time.sleep(0.1)

    print(f"Done. Created {created}/6 credit transactions")

if __name__ == "__main__":
    main()
