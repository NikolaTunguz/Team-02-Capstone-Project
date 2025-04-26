import pytest
from main import setup  
from model import db, User  
from uuid import uuid4
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os

bcrypt = Bcrypt()
load_dotenv()
admin_pass = os.getenv("ADMIN_PASSWORD")
app = setup("test")

@pytest.fixture
def client():

    with app.test_client() as client:
        with app.app_context():
            db.create_all()

            #creating a test admin 
            test_user = User(
                id = uuid4().hex, 
                phone_number = '0000000000',
                first_name = 'Test',
                last_name = 'Admin',
                email = 'test@admin',
                password = bcrypt.generate_password_hash(admin_pass).decode('utf-8'), 
                account_type = 'admin'
            )

            db.session.add(test_user)
            db.session.commit()
            db.session.refresh(test_user)

        yield client
        with app.app_context():
            db.drop_all()

#testing that the admin can access the get users page and get the info from the page
def test_admin_get_users(client):
    #getting test_user id
    with app.app_context():
        test_user = User.query.filter_by(email = 'test@admin').first() 
        test_user_id = test_user.id 

    #session with test user
    with client.session_transaction() as sess:
        sess['user_id'] = test_user_id  

    #test authorized access
    response = client.get('/get_users')
    assert response.status_code == 200
    data = response.json

    #test data return is valid
    assert 'users' in data
    assert len(data['users']) >= 1  #at least one person in the return (test admin)
