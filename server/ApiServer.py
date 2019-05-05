import time
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
#import OpenstackDriver as osdriver

HOST_NAME = 'localhost'
PORT_NUMBER = 9000

class MyHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        print("do_GET")

        if self.path == '/clusters':
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
