from pymongo import MongoClient
import OpenstackDriver

d = OpenstackDriver.OpenstackDriver()

print("Deleting instances")
d._init_instances()

print("Deleting floating ips")
d._init_floating_ips()

print("Deleting networks")
d._init_networks()

print("Resetting database")
client = MongoClient('localhost', 27017)
client.drop_database('ascm')
