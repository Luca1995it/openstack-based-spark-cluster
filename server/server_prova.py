import bottle
from bottle import response
import json

class EnableCors(object):
    name = 'enable_cors'
    api = 2

    def apply(self, fn, context):
        def _enable_cors(*args, **kwargs):
            # set CORS headers
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

            if bottle.request.method != 'OPTIONS':
                # actual request; reply with the actual response
                return fn(*args, **kwargs)

        return _enable_cors


app = bottle.app()

@app.route('/api/login', method=['OPTIONS', 'POST'])
def process():
    data = json.load(bottle.request.body)
    print(data)
    name = data['username']
    occupation = data['password']
    return "Your username is {0} and your pass is {1}".format(name, occupation)

app.install(EnableCors())

app.run(port=9000)


