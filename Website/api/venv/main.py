from flask import Flask
from flask_cors import CORS
from flask import Flask, send_from_directory

app = Flask(__name__)
cors = CORS(app, origins='*')

# @app.route("/api/testing", methods=['GET'])

# def testing(): 
#     return "hello world!"

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/account')
def account():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/dashboard')
def dashboard():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/notifications')
def notifications():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(debug=True, port=8080)