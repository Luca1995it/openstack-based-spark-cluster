import OpenstackDriver
import time

d = OpenstackDriver.OpenstackDriver()
clus = d._create_cluster("test", "")

time.sleep(20)

clus = d._add_slave(clus)

print("Flavors: ", d._get_flavors())

print(clus["master_id"], clus["network_id"], clus["subnet_id"], clus["router_id"])
