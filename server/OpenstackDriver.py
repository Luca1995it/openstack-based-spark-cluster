import openstack

class OpenstackDriver:
    # I created a cloud entry in the file on the server at /etc/openstack/cloud.yaml to speed up the connection
    # otherwise one should specify all the parameters like username, psw, region, endpoint_url, ...
    def __init__(self, cloud='apachesparkclustermanager'):
        self.base_cloud = cloud
        self.conn = openstack.connect(cloud=cloud)

    def _reset_flavors(self):
        # momentarily change the privileges of the connection using the admin user
        self.conn = openstack.connect(cloud='devstack-admin')
        # delete useless flavors
        for f in conn.compute.flavors():
            conn.compute.delete_flavor(f.id, ignore_missing=True)
        
        # create the new ones
        conn.compute.create_flavor(
            name='small_spark_node', ram=2048, vcpus=1, disk=4)
        conn.compute.create_flavor(
            name='medium_spark_node', ram=3078, vcpus=2, disk=6)
        conn.compute.create_flavor(
            name='master_spark_node', ram=1024, vcpus=1, disk=4)

        self.conn = openstack.connect(cloud=self.base_cloud)

    def _get_images(self):
        return list(conn.compute.images())

    def _get_flavors(self):
        return list(conn.compute.flavors())

    def _get_networks(self):
        return list(conn.network.networks())

    def _get_subnets(self):
        return list(conn.network.subnets())

    # main function
    def _create_cluster(self, name, flavors_list=[]):
        pass
