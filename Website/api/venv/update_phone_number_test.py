import pytest
from model import db, User
from uuid import uuid4
from flask_bcrypt import Bcrypt
from main import setup


bcrypt = Bcrypt()

app = setup("test")

@pytest.fixture
def client():

    with app.test_client() as client:
        with app.app_context():
            db.create_all()

            test_user = User(
                id = uuid4().hex,
                phone_number = '1234567890',
                first_name = 'test',
                last_name = 'test',
                email = 'test@test',
                password = bcrypt.generate_password_hash('Testtesttest1').decode('utf-8'),
                account_type = 'user'
            )

            db.session.add(test_user)
            db.session.commit()
            db.session.refresh(test_user)

        yield client
        with app.app_context():
            db.drop_all()

def test_update_phone_number(client):
    with app.app_context():
        test_user = User.query.filter_by(email = 'test@test').first()
        test_user_id = test_user.id

    with client.session_transaction() as sess:
        sess['user_id'] = test_user_id

    response = client.post('/update_phone_number', json={
        "phone_number": "0987654321"
    })
    assert response.status_code == 200
    data = response.json
    assert data["message"] == "Phone number updated successfully"
    assert User.query.filter_by(email="test@test").first().phone_number == "0987654321"