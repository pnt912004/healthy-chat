import requests
import sys

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"

def test():
    # 1. Health check
    res = requests.get(f"{BASE_URL}/health")
    print("Health:", res.status_code, res.json())
    
    # 2. Register
    user_data = {
        "email": "testdb@example.com",
        "username": "testdb",
        "password": "password123",
        "first_name": "Test",
        "last_name": "User"
    }
    res = requests.post(f"{API_URL}/auth/register", json=user_data)
    print("Register:", res.status_code, res.json())
    
    # 3. Login
    login_data = {
        "username": "testdb",
        "password": "password123"
    }
    res = requests.post(f"{API_URL}/auth/login", json=login_data)
    print("Login:", res.status_code, res.json())
    
    if res.status_code != 200:
        sys.exit(1)
        
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 4. Get Profile
    res = requests.get(f"{API_URL}/users/me", headers=headers)
    print("Profile:", res.status_code, res.json())
    
    print("All tests passed.")

if __name__ == "__main__":
    test()
