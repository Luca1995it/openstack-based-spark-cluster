import openstack

# I created a cloud entry in the file on the server at /etc/openstack/cloud.yaml to speed up the connection
# otherwise one should specify all the parameters like username, psw, region, endpoint_url, ...
conn = openstack.connect(cloud='apachesparkclustermanager')

for server in conn.compute.servers():
    print(server)

for image in conn.compute.images():
    print(image)

for flavor in conn.compute.flavors():
    print(flavor)

for network in conn.network.networks():
    print(network)
