import openstack

DEFAULT_PROJECT = 'apache-spark-cluster-manager'
DEFAULT_CLOUD = 'apache-spark-cluster-manager-cloud'
DEFAULT_GROUPNAME = 'apache-spark-cluster-manager-group'

class OpenstackDriver:
    # I created a cloud entry in the file on the server at /etc/openstack/cloud.yaml to speed up the connection
    # otherwise one should specify all the parameters like username, psw, region, endpoint_url, ...
    def __init__(self, cloud=DEFAULT_CLOUD, project=DEFAULT_PROJECT):
        self.default_cloud = cloud
        self.default_project = project
        self.conn = openstack.connect(cloud=cloud)
        
    def _completely_reset_project(self):
        # this function will cancel and re-create all the projects, flavors, instances, groups and users
        self._init_flavors()
        self._init_group()
        self._init_instances()
        self._init_users()
        self._init_project()

    def _init_flavors(self):
        # delete useless flavors
        for f in conn.compute.flavors():
            self.conn.compute.delete_flavor(f.id, ignore_missing=True)
        
        # create the new ones
        conn.compute.create_flavor(
            name='small_spark_node', ram=2048, vcpus=1, disk=4)
        conn.compute.create_flavor(
            name='medium_spark_node', ram=3078, vcpus=2, disk=6)
        conn.compute.create_flavor(
            name='master_spark_node', ram=1024, vcpus=1, disk=4)

    def _init_group(self):
        group = conn.identity.find_group(DEFAULT_GROUPNAME)
        if group:
            conn.identity.delete_group(group.id)
            conn.identity.create_group(name=DEFAULT_GROUPNAME, description="Default group for the Apache Spark Cluster Manager project")

    def _init_instances(self):
        proj_id = self._get_project_id()
        for instance in conn.compute.servers():
            if instance.default_project_id == proj_id:
                # check that this works
                conn.compute.delete_instance(instance.id)

    def _init_project(self):
        proj = conn.identity.find_project(self.default_project)
        if proj:
            conn.identity.delete_project(proj.id)
            conn.identity.create_project(name=DEFAULT_PROJECT, description="Apache Spark Cluster Manager default project", is_enabled=True)

    def _init_users(self):
        proj_id = self._get_project_id()
        for user in conn.identity.users():
            if user.default_project_id == proj_id:
                # check that this works
                conn.compute.delete_instance(user.id)

    def _get_images(self):
        return list(conn.compute.images())

    def _create_image(self, filename, image_name, disk_format='qcow2', container_format='bare', visibility='public'):
        data = open(filename, 'rb').read()
        image_attrs = {
            'name': image_name,
            'data': data,
            'disk_format': disk_format,
            'container_format': container_format,
            'visibility': visibility,
        }
        self.conn.image.upload_image(**image_attrs)

    def _get_project_id(self):
        return conn.identity.find_project(self.default_project).id

    def _create_user(self, name, password, default_project_id="", email="", is_enabled=True, password_expires_at=None):
        if not default_project_id:
            default_project_id = self._get_project_id()
        
        return conn.identity.create_user(
            default_project_id=default_project_id,
            name=name, 
            password=password, 
            is_enabled=is_enabled,
            description="")

    def _get_flavors(self):
        return list(conn.compute.flavors())

    def _get_networks(self):
        return list(conn.network.networks())

    def _get_subnets(self):
        return list(conn.network.subnets())

    # main function
    def _create_cluster(self, name, flavors_list=[]):
        pass




