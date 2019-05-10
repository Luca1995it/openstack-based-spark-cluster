import openstack

DEFAULT_PROJECT = 'apache-spark-cluster-manager'
DEFAULT_CLOUD = 'apache-spark-cluster-manager-cloud'
DEFAULT_GROUPNAME = 'apache-spark-cluster-manager-group'

class NetAddr:

    def __init__(self,o1=192,o2=168,o3=1,o4=0,mask=24):
        self.curr_o1 = o1
        self.curr_o2 = o2
        self.curr_o3 = o3
        self.curr_o4 = o4
        self.next_o3 = o3 + 1
        self.mask = mask

    def get_available_subnet(self):
        res = f"{self.curr_o1}.{self.curr_o2}.{self.curr_o3}.{self.curr_o4}/{self.mask}"
        return res

    def get_first_address(self):
        return f"{self.curr_o1}.{self.curr_o2}.{self.curr_o3}.1"

    def next(self):
        self.curr_o3 = self.next_o3
        self.next_o3 += 1

class OpenstackDriver:
    # I created a cloud entry in the file on the server at /etc/openstack/cloud.yaml to speed up the connection
    # otherwise one should specify all the parameters like username, psw, region, endpoint_url, ...
    def __init__(self, cloud=DEFAULT_CLOUD, project=DEFAULT_PROJECT):
        self.default_cloud = cloud
        self.default_project = project
        self.conn = openstack.connect(cloud=cloud)

        #works if default params aren't changed
        self.address_pool = NetAddr()
        
    def _completely_reset_project(self):
        # this function will cancel and re-create all the projects, flavors, instances, groups and users
        self._init_flavors()
        self._init_group()
        self._init_instances()
        self._init_users()
        self._init_project()

    def _init_flavors(self):
        # delete useless flavors
        for f in self.conn.compute.flavors():
            self.conn.compute.delete_flavor(f.id, ignore_missing=True)
        
        # create the new ones
        self.conn.compute.create_flavor(
            name='small_spark_node', ram=2048, vcpus=1, disk=4)
        self.conn.compute.create_flavor(
            name='medium_spark_node', ram=3078, vcpus=2, disk=6)
        self.conn.compute.create_flavor(
            name='master_spark_node', ram=1024, vcpus=1, disk=4)

    def _init_group(self):
        group = self.conn.identity.find_group(DEFAULT_GROUPNAME)
        if group:
            self.conn.identity.delete_group(group.id)
            self.conn.identity.create_group(name=DEFAULT_GROUPNAME, description="Default group for the Apache Spark Cluster Manager project")

    def _init_instances(self):
        proj_id = self._get_project_id()
        for instance in self.conn.compute.servers():
            if instance.default_project_id == proj_id:
                # check that this works
                self.conn.compute.delete_instance(instance.id)

    def _init_project(self):
        proj = self.conn.identity.find_project(self.default_project)
        if proj:
            self.conn.identity.delete_project(proj.id)
            self.conn.identity.create_project(name=DEFAULT_PROJECT, description="Apache Spark Cluster Manager default project", is_enabled=True)

    def _init_users(self):
        proj_id = self._get_project_id()
        for user in conn.identity.users():
            if user.default_project_id == proj_id:
                # check that this works
                self.conn.compute.delete_instance(user.id)

    def _get_images(self):
        return list(self.conn.compute.images())

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
        return self.conn.identity.find_project(self.default_project).id

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
        return list(self.conn.compute.flavors())

    def _get_networks(self):
        return list(self.conn.network.networks())

    def _get_subnets(self):
        return list(self.conn.network.subnets())


    def _create_network(self,name=""):
        net = self.conn.network.create_network(name=f"{name}_network")
        subnet = self.conn.network.create_subnet(name=f"{name}_subnet",
                                                     network_id=net.id,
                                                     ip_version="4",
                                                     cidr=self.address_pool.get_available_subnet())#,gateway_ip=self.address_pool.get_first_address()
        return net,subnet

    def _create_instance(self,name,flavor='small_spark_node',image='xenial-server-cloud-16.04',network='public',wait=False):
        #todo add keypair
        img = self.conn.compute.find_image(image)
        flv = self.conn.compute.find_flavor(flavor)
        net = self.conn.network.find_network(network)

        server = self.conn.compute.create_server(name=name,
                                                 image_id=img.id,
                                                 flavor_id=flv.id,
                                                 networks=[{'uuid':net.id}])

        if wait:
            server=self.conn.compute.wait_for_server(server)
        return server

    # main function
    def _create_cluster(self, name, flavors_list=[]):
        '''
        - network
        - router private-public
        - master + slaves + keys (for spark cluster and user access to master)
        - associate floating ip to master
        - 
        '''
        print("creating network")
        net,subnet = self._create_network(name=name)
        #create router for interconnection
        print("creating router")
        router = self.conn.network.create_router(name=f"{name}_router")
        public_subnet = self.conn.network.find_subnet(name_or_id="public-subnet")
        self.conn.network.add_interface_to_router(router,subnet_id=subnet.id)
        self.conn.network.add_interface_to_router(router,subnet_id=public_subnet.id)

        print("launching master")
        self._create_instance(f'{name}_master',flavor='master_spark_node',network=net.name,wait=True)

        i = 0
        for f in flavors_list:
            print(f"launching slave {i+1}/{len(flavors_list)}")
            self._create_instance(f'{name}_slave{i}',flavor=f,network=net.name,wait=True)
            i+=1




        




