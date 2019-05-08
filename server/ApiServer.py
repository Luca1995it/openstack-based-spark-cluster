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

'''
import OpenstackDriver as osdriver
openstackdriver = osdriver.OpenstackDriver()
'''

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
        return {
            'status': "MALFORMED_JSON",
            'message': "Malformed JSON body in request"
        }
    
    if 'username' not in parameters or 'password' not in parameters:
        return {
            'status': "MISSING_AUTH_PARAMS",
            'message': 'username or password missing'
        }

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
            'status': "OK",
            'message': "OK",
            'token': token
        }
    else:
        return {
            'status': 'WRONG_AUTH_PARAMS',
            'message': "Wrong username or password"
        }


# Authentication function for all the protected operations
def require_api_token(func):
    def check_token(*args, **kwargs):

        parameters = json.load(request.body)
        # Check to see if it's in their session
        if 'token' not in parameters:
            # Token was not inserted in the request
            return {
                'status': "MISSING_TOKEN",
                'message': "Token is missing"
            }

        user = users.find_one({'token': parameters['token']})

        if user is None:
            # Token is not valid
            return {
                'status': "INVALID_TOKEN",
                'message': "The token does not correspond to a user"
            }

        elif time.time() - user['token_time'] > TOKEN_EXPIRATION_SECONDS:
            # Token has expired
            return {
                'status': "TOKEN_EXPIRED",
                'message': "Token has expired, please log in again"
            }

        else:
            # Otherwise just send them where they wanted to go
            return func(*args, **kwargs)

    return check_token


# Get list of flavors 

# Get list of clusters of the user with actual token
@app.route('/api/clusters', method=['OPTIONS', 'GET'])
@require_api_token
def process():
    parameters = json.load(request.body)
    user = users.find_one({'token': parameters['token']})

    clus = clusters.find({'user_id': user['_id']})
    results = []
    for c in clus:
        results.append(osdriver.)

# Enable CORS on this app
app.install(EnableCors())

# Actually start the API server
if __name__ == '__main__':
    
    print(time.asctime(), 'Server Starts - %s:%s' % (HOST_NAME, PORT_NUMBER))
    try:
        app.run(host=HOST_NAME, port=PORT_NUMBER, reloader=True)
    except KeyboardInterrupt:
        pass

    print(time.asctime(), 'Server Stops - %s:%s' % (HOST_NAME, PORT_NUMBER))
