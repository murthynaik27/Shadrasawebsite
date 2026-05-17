import requests

url = "https://shadrasawebsite.onrender.com/api/auth/login"
payload = {
    "email": "admin@shadrasa.com",
    "password": "admin123"
}

try:
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.text)
except Exception as e:
    print("Error:", e)
