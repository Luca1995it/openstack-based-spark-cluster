import OpenstackDriver

d = OpenstackDriver.OpenstackDriver()
clus = d._create_cluster("test", "", ["small-spark-node", "medium-spark-node"])

print(clus)