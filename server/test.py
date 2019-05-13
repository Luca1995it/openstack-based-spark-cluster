import OpenstackDriver

d = OpenstackDriver.OpenstackDriver()
clus = d._create_cluster("test", "")

clus = d._add_slave(clus)

print(clus.master_id, clus.network_id, clus.subnet_id, clus.router_id)