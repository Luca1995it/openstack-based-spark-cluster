import time
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pymongo import MongoClient
import cgi
import hashlib
from urllib.parse import parse_qs, urlparse
from bson.objectid import ObjectId

import secrets
import time

TOKEN_EXPIRATION_SECONDS = 7200

# set up connection with MongoDB
client = MongoClient('localhost', 27017)
db = client.ascm

users = db.users
clusters = db.clusters

#import OpenstackDriver as osdriver

HOST_NAME = 'localhost'
PORT_NUMBER = 9000

class MyHandler(BaseHTTPRequestHandler):

    def get_POST_parameters(self):
        ctype, pdict = cgi.parse_header(self.headers.get('content-type'))
        if ctype == 'multipart/form-data':
            postvars = cgi.parse_multipart(self.rfile, pdict)
        elif ctype == 'application/x-www-form-urlencoded':
            length = int(self.headers.get('content-length'))
            postvars = parse_qs(self.rfile.read(length).decode())
        else:
            postvars = {}
        return postvars

    def get_GET_parameters(self):
        return urlparse.parse_qs(self.path).query

    def do_POST(self):
        parameters = self.get_POST_parameters()

        if self.path == '/login':

            if 'username' in parameters and 'password' in parameters:
                username = parameters['username'][0]
                password = parameters['password'][0]

                res = users.find_one({
                    'username': username,
                    'password': self.__hashstring(password)
                })
                if res is not None:
                    print(res)
                    token = secrets.token_urlsafe(20)
                    users.update_one({
                        'username': username,
                        'password': self.__hashstring(password)
                    }, {'$set': {'token': token, 'token_time': int(time.time())}})
                    status = 200
                    content = {
                        'token': token
                    }
                else:
                    status = 401
                    content = {
                        'message': "Wrong username or password"
                    }
            else:
                status = 401
                content = {
                    'message': "Missing username or password fields"
                }

        elif self.path.startswith('/api'):
            # authentication
            user = users.find_one({'token': parameters['token']})
            if user is not None and time.time() - user.token_time < TOKEN_EXPIRATION_SECONDS:
                pass

            else:
                status = 401
                content = {
                    'message': "token has expired, please log in again"
                }

        else:
            status = 404
            content = {
                'message': 'resource not found on this server'
            }

        self._send_response(status, content)


    def __hashstring(self, stringa):
        return hashlib.md5(stringa.encode('utf-8')).digest()


    def do_GET(self):

        if self.path.startswith('/api'):

            parameters = self.get_GET_parameters()

            user = users.find_one({'token': parameters['token']})
            if user is not None and time.time() - user.token_time < TOKEN_EXPIRATION_SECONDS:
                
                if self.path == '/api/clusters':
                    results = list(clusters.find({
                        '_id': user['_id']
                    }))
                    
                    status = 200
                    content = [
                        {
                            'name': "cluster1"
                        },
                        {
                            'name': "cluster2"
                        }
                    ]
                elif self.path == '/flavors':
                    status = 200
                    content = [
                        {
                            'name': "flavor1"
                        },
                        {
                            'name': "flavor2"
                        },
                        {
                            'name': "flavor3"
                        }
                    ]
                else:
                    status = 404
                    content = []
        
        self._send_response(status, content)


    def _send_response(self, status, content):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        self.wfile.write(bytes(json.dumps(content), 'UTF-8'))


if __name__ == '__main__':
    server_class = HTTPServer
    httpd = server_class((HOST_NAME, PORT_NUMBER), MyHandler)
    print(time.asctime(), 'Server Starts - %s:%s' % (HOST_NAME, PORT_NUMBER))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print(time.asctime(), 'Server Stops - %s:%s' % (HOST_NAME, PORT_NUMBER))
