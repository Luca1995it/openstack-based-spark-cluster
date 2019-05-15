import time
import json
import bottle
from bottle import request, response
from pymongo import MongoClient
import hashlib
from bson.objectid import ObjectId
import secrets
import time
import threading

# Token setup
TOKEN_EXPIRATION_SECONDS = 7200

# MongoDB connection setup
client = MongoClient('localhost', 27017)
db = client.ascm

import OpenstackDriver as osdriver
openstackdriver = osdriver.OpenstackDriver()


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
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
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


@app.route("/<url:re:.+>", method=['OPTIONS'])
def process():
    pass


############################### LOGIN #########################################
@app.route('/api/login', method=['POST'])
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
            'status': "MISSING_PARAMS",
            'message': 'username or password missing'
        }
    parameters['password'] = _hashstring(parameters['password'])
    res = db.users.find_one({
        'username': parameters['username'],
        'password': parameters['password']
    })
    if res is not None:
        token = secrets.token_urlsafe(20)
        db.users.update_one({
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


############################### REGISTRATION ##################################
@app.route('/api/register', method=['POST'])
def process():
    try:
        parameters = json.load(request.body)
    except json.decoder.JSONDecodeError as error:
        return {
            'status': "MALFORMED_JSON",
            'message': "Malformed JSON body in request"
        }
    if 'username' not in parameters or 'password' not in parameters or 'email' not in parameters:
        return {
            'status': "MISSING_PARAMS",
            'message': 'username, email or password missing'
        }
    parameters['password'] = _hashstring(parameters['password'])
    res = db.users.insert_one({
        'username': parameters['username'],
        'password': parameters['password'],
        'email': parameters['email']
    })
    return {
        'status': "OK",
        'message': "OK",
    }


############################ AUTHENTICATION ###################################
# Authentication function for all the protected operations
def require_api_token(func):
    def check_token(*args, **kwargs):
        token = request.get_header('X-CSRF-Token')
        # print(request, token)
        # Check to see if it's in their session
        if not 'token':
            # Token was not inserted in the request
            return {
                'status': "MISSING_TOKEN",
                'message': "Token is missing"
            }
        user = db.users.find_one({'token': token})
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


########################## SSH PAIRS ##########################################
# Get list of ssh keys of the current user
@app.route('/api/sshpair', method=['GET'])
@require_api_token
def process():
    token = request.get_header('X-CSRF-Token')
    user = db.users.find_one({'token': token})
    sshp = db.sshpairs.find({'user_id': user['_id']})
    results = [{'name': s['name'], 'id': str(s['_id'])} for s in sshp]
    return {
        'sshpair': results
    }

# Insert a new key for the current user
@app.route('/api/sshpair', method=['POST'])
@require_api_token
def process():
    token = request.get_header('X-CSRF-Token')
    user = db.users.find_one({'token': token})
    try:
        parameters = json.load(request.body)
    except json.decoder.JSONDecodeError as error:
        return {
            'status': "MALFORMED_JSON",
            'message': "Malformed JSON body in request"
        }
    if 'name' not in parameters or 'key' not in parameters:
        return {
            'status': "MISSING_PARAMS",
            'message': 'name or key missing'
        }
    
    db.sshpairs.insert_one({'user_id': user['_id'], 'name': parameters['name'], 'key': parameters['key']})
    return "ok"

# Delete a key for the current user
@app.route('/api/sshpair/<id>', method=['DELETE'])
@require_api_token
def process(id):
    token = request.get_header('X-CSRF-Token')
    user = db.users.find_one({'token': token})
    if id:
        db.sshpairs.delete_one({'user_id': user['_id'], '_id': ObjectId(id)})
        return "ok"
    else:
        return {
            'status': "MISSING_PARAMS",
            'message': 'id not specified'
        }



############################### FLAVORS #######################################
# Get list of flavor
@app.route('/api/flavor', method=['GET'])
@require_api_token
def process():
    return {
        'flavor': openstackdriver._get_flavors()
    }


############################### CLUSTERS ######################################
# Get single / list of clusters of the user with actual token
@app.route('/api/cluster/<id>', method=['GET'])
@require_api_token
def process(id):
    token = request.get_header('X-CSRF-Token')
    user = db.users.find_one({'token': token})
    # get single cluster
    result = db.clusters.find_one({'user_id': user['_id'], '_id': ObjectId(id)})['cluster']
    result['id'] = id
    return {
        'cluster': result
    }

# get list of all clusters (simplified entries not to overload openstack)
@app.route('/api/cluster', method=['GET'])
@require_api_token
def process():
    token = request.get_header('X-CSRF-Token')
    user = db.users.find_one({'token': token})
    # get all clusters of this user
    result = []
    for clus in db.clusters.find({'user_id': user['_id']}):
        res = clus['cluster']
        res['id'] = str(clus['_id'])
        result.append(res)
    return {
        'cluster': result
    }

# TODO: Cluster names collision!!!
# Create a new cluster with the given parameters
@app.route('/api/cluster', method=['POST'])
@require_api_token
def process():
    try:
        parameters = json.load(request.body)
    except json.decoder.JSONDecodeError as error:
        return {
            'status': "MALFORMED_JSON",
            'message': "Malformed JSON body in request"
        }
    token = request.get_header('X-CSRF-Token')
    user = db.users.find_one({'token': token})

    if 'name' not in parameters or 'key_id' not in parameters:
        return {
            'status': "MISSING_PARAMS",
            'message': 'name or key missing'
        }
    # get ssh key selected by the user
    key = db.sshpairs.find_one({'user_id': user['_id'], '_id': ObjectId(parameters['key_id'])})
    cluster = openstackdriver._create_cluster(parameters['name'], key['key'])
    # add cluster to database
    cluster['key_id'] = str(key['_id'])
    db.clusters.insert_one({'user_id': user['_id'], 'cluster': cluster})

    return "OK"

# Delete a cluster given the id
@app.route('/api/cluster/<id>', method=['DELETE'])
@require_api_token
def process(id):
    token = request.get_header('X-CSRF-Token')
    user = db.users.find_one({'token': token})
    # find the cluster to be deleted
    result = db.clusters.find_one({'user_id': user['_id'], '_id': ObjectId(id)})
    # destroy the cluster on openstack
    openstackdriver._delete_cluster(result['cluster'])
    # remove the entry from the database
    db.clusters.delete_one({'user_id': user['_id'], '_id': ObjectId(id)})

    return "OK"


############################### INSTANCE ######################################
# Get a single instance of the user with actual token
@app.route('/api/instance/<id>', method=['GET'])
@require_api_token
def process(id):
    res =  openstackdriver._get_instance_info(id)
    return {
        'instance': res
    }
    

@app.route('/api/instance', method=['POST'])
@require_api_token
def process():
    try:
        parameters = json.load(request.body)
    except json.decoder.JSONDecodeError as error:
        return {
            'status': "MALFORMED_JSON",
            'message': "Malformed JSON body in request"
        }
    token = request.get_header('X-CSRF-Token')
    user = db.users.find_one({'token': token})

    if 'flavor_name' not in parameters or 'quantity' not in parameters or 'cluster_id' not in parameters:
        return {
            'status': "MISSING_PARAMS",
            'message': 'flavor_name or quantity or cluster_id missing'
        }
    cluster_id = parameters['cluster_id']
    result = db.clusters.find_one({'user_id': user['_id'], '_id': ObjectId(cluster_id)})
    cluster = result['cluster']
    for i in range(parameters['quantity']):
        cluster = openstackdriver._add_slave(cluster, flavor_name=parameters['flavor_name'])
    db.clusters.update_one({'user_id': user['_id'], '_id': ObjectId(cluster_id)},
                           {'$set': {'cluster': cluster}})
    return "OK"


@app.route('/api/instance/<id>', method=['PUT'])
@require_api_token
def process(id):
    try:
        parameters = json.load(request.body)
    except json.decoder.JSONDecodeError as error:
        return {
            'status': "MALFORMED_JSON",
            'message': "Malformed JSON body in request"
        }
    token = request.get_header('X-CSRF-Token')
    user = db.users.find_one({'token': token})

    print("/API/INSTANCE/...", parameters['action'], id)

    if 'action' not in parameters or parameters['action'] not in ['start', 'restart', 'shutdown'] or id is None:
        return {
            'status': "MISSING_PARAMS",
            'message': 'action should be one of "start", "restart" or "shutdown" or id missing'
        }
    action = parameters['action']
    if action == 'start':
        openstackdriver._start_server(id)
    elif action == 'restart':
        openstackdriver._reboot_server(id)
    else:
        openstackdriver._stop_server(id)
    return "OK"


@app.route('/api/instance/<id>', method=['DELETE'])
@require_api_token
def process(id):
    print("DELETE instance body: ", request.body.read())
    try:
        parameters = json.load(request.body)
    except json.decoder.JSONDecodeError as error:
        return {
            'status': "MALFORMED_JSON",
            'message': "Malformed JSON body in request"
        }
    token = request.get_header('X-CSRF-Token')
    user = db.users.find_one({'token': token})

    print("Deleting instance", id, "of cluster", parameters['cluster_id'])

    if id is None or 'cluster_id' not in parameters:
        return {
            'status': "MISSING_PARAMS",
            'message': 'id or cluster_id missing'
        }
    cluster_id = parameters['cluster_id']
    result = db.clusters.find_one(
        {'user_id': user['_id'], '_id': ObjectId(cluster_id)})
    cluster = result['cluster']
    cluster = openstackdriver._remove_slave(cluster, id)
    db.clusters.update_one({'user_id': user['_id'], '_id': ObjectId(cluster_id)},
                           {'$set': {'cluster': cluster}})
    return "OK"

############################ START THE API SERVER #############################

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
