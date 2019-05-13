import OpenstackDriver

d = OpenstackDriver.OpenstackDriver()
clus = d._create_cluster("test", "")

print(clus.master_id, clus.network_id, clus.subnet_id, clus.router_id)