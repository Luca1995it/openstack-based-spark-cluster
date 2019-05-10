import OpenstackDriver

d = OpenstackDriver.OpenstackDriver()
d._create_cluster("test",["small_spark_node","medium_spark_node"])