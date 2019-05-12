import OpenstackDriver

d = OpenstackDriver.OpenstackDriver()
d._create_cluster("test", "", ["small-spark-node", "medium-spark-node"])
