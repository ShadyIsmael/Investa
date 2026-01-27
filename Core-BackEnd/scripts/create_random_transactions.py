#!/usr/bin/env python3
"""Create random credit and score transactions via the running API.

Usage:
  python scripts/create_random_transactions.py

Adjust `BASE_URL`, `PHONE` and `PASSWORD` as needed.
"""
import random
import time
import uuid
import requests

BASE_URL = "http://DESKTOP-DIH7CQH:5235"
PHONE = "01022322292"
PASSWORD = "P@ssw0rd"

def login(phone, password):
    url = f"{BASE_URL}/api/auth/login"
    payload = {"phoneNumber": phone, "password": password}
    r = requests.post(url, json=payload)
    r.raise_for_status()
    j = r.json()
    token = None
    # Response shape: { success: true, data: { token: "..." } }
    if isinstance(j, dict):
        data = j.get("data") or j.get("Data")
        if data:
            token = data.get("token") or data.get("Token")
    if not token:
        raise RuntimeError(f"Failed to extract token from login response: {j}")
    return token

def get_client_by_phone(phone, token):
    url = f"{BASE_URL}/api/clients/by-phone/{phone}"
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    return r.json()

def create_credit(user_id, amount, tx_type, description, token, reference_id=None):
    url = f"{BASE_URL}/api/credits"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "userId": user_id,
        "amount": amount,
        "type": tx_type,
        "description": description,
        "referenceId": reference_id
    }
    r = requests.post(url, json=payload, headers=headers)
    r.raise_for_status()
    return r.json()

def create_score(user_id, score, transaction_type_id, reviewer_id, token):
    url = f"{BASE_URL}/api/v1/score-transactions"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "userId": user_id,
        "score": score,
        "transactionTypeId": transaction_type_id,
        "reviewerId": reviewer_id
    }
    r = requests.post(url, json=payload, headers=headers)
    r.raise_for_status()
    return r.json()

def main():
    print(f"Logging in {PHONE} -> {BASE_URL}")
    token = login(PHONE, PASSWORD)
    print("Got token, fetching client by phone...")
    client = get_client_by_phone(PHONE, token)
    # client expected to include userId
    user_id = None
    if isinstance(client, dict):
        user_id = client.get("userId") or client.get("UserId")
    if not user_id:
        raise RuntimeError(f"Failed to obtain userId for {PHONE}: {client}")

    print(f"Creating transactions for user {user_id}")

    credit_results = []
    score_results = []

    # Create 10 credit transactions
    for i in range(10):
        amount = round(random.uniform(5, 500), 2)
        tx_type = random.choice(["Earn", "Spend", "Adjustment"]) if random.random() > 0.2 else "Earn"
        desc = f"Auto-generated credit tx #{i+1}"
        try:
            res = create_credit(user_id, amount, tx_type, desc, token, reference_id=random.randint(1, 9999))
            credit_results.append(res)
            print(f"Credit {i+1}: amount={amount} -> ok")
        except Exception as e:
            print(f"Credit {i+1} failed: {e}")
        time.sleep(0.15)

    # Create 10 score transactions (use seeded lookup ids 200-202)
    for i in range(10):
        score = round(random.uniform(1, 20), 2)
        tx_type_id = random.choice([200, 201, 202])
        reviewer_id = None
        if random.random() < 0.3:
            reviewer_id = str(uuid.uuid4())
        try:
            res = create_score(user_id, score, tx_type_id, reviewer_id, token)
            score_results.append(res)
            print(f"Score {i+1}: score={score} type={tx_type_id} -> ok")
        except Exception as e:
            print(f"Score {i+1} failed: {e}")
        time.sleep(0.15)

    print("Done. Created:", len(credit_results), "credit txs and", len(score_results), "score txs")
    print("Note: the API sets CreatedAt to current time; cannot backdate via API.")

if __name__ == "__main__":
    main()
