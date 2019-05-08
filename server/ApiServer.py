import time
import json
import bottle
from bottle import request, response
from pymongo import MongoClient
import hashlib
from bson.objectid import ObjectId
import secrets
import time

# Token setup
TOKEN_EXPIRATION_SECONDS = 7200

# MongoDB connection setup
client = MongoClient('localhost', 27017)
db = client.ascm
users = db.users
clusters = db.clusters

#import OpenstackDriver as osdriver

# Server setup
HOST_NAME = 'localhost'
PORT_NUMBER = 9000

# Class EnableCors will send correct headers when CORS is needed
class EnableCors(object):
    name = 'enable_cors'
    api = 2

    def apply(self, fn, context):
        def _enable_cors(*args, **kwargs):
            # set CORS headers
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

            if request.method != 'OPTIONS':
                # actual request; reply with the actual response
                return fn(*args, **kwargs)

        return _enable_cors


# This app will manage all the requests
app = bottle.app()

# Cryptography for passwords
def _hashstring(stringa):
    return hashlib.md5(stringa.encode('utf-8')).digest()


@app.route('/api/login', method=['OPTIONS', 'POST'])
def process():
    try:
        parameters = json.load(request.body)
    except json.decoder.JSONDecodeError as error:
        response.status = 401
        return "Malformed JSON"
    
    if 'username' not in parameters or 'password' not in parameters:
        response.status = 401
        return "Missing username or password"

    parameters['password'] = _hashstring(parameters['password'])

    res = users.find_one({
        'username': parameters['username'],
        'password': parameters['password']
    })

    if res is not None:
        token = secrets.token_urlsafe(20)
        users.update_one({
            'username': parameters['username'],
            'password': parameters['password']
        }, {'$set': {'token': token, 'token_time': int(time.time())}})

        return {
            'token': token
        }
    else:
        response.status = 401
        return "Wrong username or password"



# Authentication function for all the protected operations
def require_api_token(func):
    def check_token(*args, **kwargs):

        parameters = json.load(request.body)
        # Check to see if it's in their session
        if 'token' not in parameters:
            # Token was not inserted in the request
            response.status = 401
            return "Missing token"

        if len(parameters['token']) == 0:
            # Token is empty
            response.status = 401
            return "Empty token"

        user = users.find_one({'token': parameters['token']})
        print(user)
        if user is None:
            # Token is not valid
            response.status = 401
            return "Wrong token"

        elif time.time() - user['token_time'] > TOKEN_EXPIRATION_SECONDS:
            # Token has expired
            response.status = 401
            return "token has expired, please log in again"

        else:
            # Otherwise just send them where they wanted to go
            return func(*args, **kwargs)

    return check_token


@app.route('/api', method=['OPTIONS', 'POST'])
@require_api_token
def process():
    parameters = json.load(request.body)

    user = users.find_one({'token': parameters['token']})

    return "it worked!"


# Enable CORS on this app
app.install(EnableCors())

if __name__ == '__main__':
    
    print(time.asctime(), 'Server Starts - %s:%s' % (HOST_NAME, PORT_NUMBER))
    try:
        app.run(host=HOST_NAME, port=PORT_NUMBER, reloader=True)
    except KeyboardInterrupt:
        pass

    print(time.asctime(), 'Server Stops - %s:%s' % (HOST_NAME, PORT_NUMBER))
