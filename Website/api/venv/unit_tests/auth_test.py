import pytest
from main import setup  
from model import db, User  
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

app = setup("test")

@pytest.fixture
def client():
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["TESTING"] = True
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        
        with app.app_context():
            db.drop_all()

def test_register_user_success(client):
    response = client.post("/register", json={
        "phone_number": "1234567890",
        "first_name": "Test",
        "last_name": "Test",
        "email": "test@test.com",
        "password": "testpassword"
    })
    
    assert response.status_code == 200
    data = response.get_json()
    assert "id" in data
    assert data["email"] == "test@test.com"