import openstack
import os
import paramiko
from time import sleep
from Crypto.PublicKey import RSA
import threading

DEFAULT_PROJECT = 'apache-spark-cluster-manager'
DEFAULT_CLOUD = 'apache-spark-cluster-manager-cloud'
DEFAULT_GROUPNAME = 'apache-spark-cluster-manager-group'
MAX_TRIES = 100


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


class Cluster:
    def __init__(self, name, master_id, subnet_id, network_id, router_id, slaves_ids, cluster_private_key, cluster_public_key):
        self.name = name
        self.master_id = master_id
        self.slaves_ids = slaves_ids
        self.network_id = network_id
        self.router_id = router_id
        self.subnet_id = subnet_id
        self.cluster_private_key = cluster_private_key
        self.cluster_public_key = cluster_public_key


class OpenstackDriver:
    # I created a cloud entry in the file on the server at /etc/openstack/cloud.yaml to speed up the connection
    # otherwise one should specify all the parameters like username, psw, region, endpoint_url, ...
    def __init__(self, cloud=DEFAULT_CLOUD, project=DEFAULT_PROJECT, init_all=False):
        self.default_cloud = cloud
        self.default_project = project
        self.conn = openstack.connect(cloud=cloud)

        #works if default params aren't changed
        self.address_pool = NetAddr()
        self.public_subnet = self.conn.network.find_subnet(name_or_id="public-subnet")
        self.public_net = self.conn.network.find_network(name_or_id="public")
        if init_all:
            self._completely_reset_project()


    def _completely_reset_project(self):
        # this function will cancel and re-create all the projects, flavors, instances, groups and users
        self._init_flavors()
        self._init_group()
        self._init_instances()
        self._init_users()
        self._init_project()
        self._init_floating_ips()


    def _init_flavors(self):
        # delete useless flavors
        for f in self.conn.compute.flavors():
            self.conn.compute.delete_flavor(f.id, ignore_missing=True)
        
        # create the new ones
        self.conn.compute.create_flavor(
            name='small-spark-node', ram=1024, vcpus=1, disk=8, swap=4096)
        self.conn.compute.create_flavor(
            name='medium-spark-node', ram=1536, vcpus=2, disk=8, swap=4096)
        self.conn.compute.create_flavor(
            name='master-spark-node', ram=1024, vcpus=1, disk=8, swap=4096)


    def _init_group(self):
        group = self.conn.identity.find_group(DEFAULT_GROUPNAME)
        if group:
            self.conn.identity.delete_group(group.id)
        self.conn.identity.create_group(name=DEFAULT_GROUPNAME, description="Default group for the Apache Spark Cluster Manager project")


    def _init_instances(self):
        for instance in self.conn.compute.servers():
            self.conn.compute.delete_server(instance.id)


    def _init_project(self):
        proj = self.conn.identity.find_project(self.default_project)
        if proj:
            self.conn.identity.delete_project(proj.id)
            self.conn.identity.create_project(name=DEFAULT_PROJECT, description="Apache Spark Cluster Manager default project", is_enabled=True)


    def _init_users(self):
        proj_id = self._get_project_id()
        for user in self.conn.identity.users():
            if user.default_project_id == proj_id:
                # check that this works
                self.conn.compute.delete_instance(user.id)


    def _init_floating_ips(self):
        for fip in self.conn.network.ips():
            self.conn.network.delete_ip(fip)

        
    def _init_networks(self):
        # delete routers
        for router in self.conn.network.routers():
            # first remove all interfaces
            for p in self.conn.network.ports():
                if p.device_id == router.id:
                    if p.device_owner == 'network:router_interface':
                        self.conn.network.remove_interface_from_router(router, port_id=p.id)
            self.conn.network.delete_router(router)
        # delete subnetwork apart from the public one
        for sub in self.conn.network.subnets():
            if sub.name != 'public-subnet':
                self.conn.network.delete_subnet(sub.id)
        # delete subnetwork apart from the public one
        for net in self.conn.network.networks():
            if net.name != 'public':
                self.conn.network.delete_network(net.id)


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


    def _get_flavors(self):
        return list(self.conn.compute.flavors())


    def _get_networks(self):
        return list(self.conn.network.networks())


    def _get_subnets(self):
        return list(self.conn.network.subnets())


    def _create_ssh_pair(self):
        key = RSA.generate(2048, os.urandom)
        private = key.exportKey()
        public = key.publickey().exportKey()
        return private.decode(), public.decode()

    # create an instance of an ssh connection that will be used to set up the nodes of the cluster
    def _get_ssh_connection(self, host, key_file='./spark_private.key'):
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        tries = 0
        while tries < MAX_TRIES:
            try:
                print("Connection trial number ", tries)
                ssh.connect(host, key_filename=key_file, timeout=5)
                return ssh
            except Exception as e:
                print("Instance not yet ready:", e)
                tries += 1
            sleep(5)
        return None

    # network should be the network dedicated to the cluster, not the public one
    def _get_fixed_ip_instance(self, instance, network):
        if network.name in instance.addresses:
            for addr in instance.addresses[network.name]:
                if addr['OS-EXT-IPS:type'] == 'fixed':
                    return addr['addr']
        return None
    
    # network should be the network dedicated to the cluster, not the public one
    def _get_floating_ip_instance(self, instance, network):
        if network.name in instance.addresses:
            for addr in instance.addresses[network.name]:
                if addr['OS-EXT-IPS:type'] == 'floating':
                    return addr['addr']
        return None


    def _create_network(self,name=""):
        net = self.conn.network.create_network(name=f"{name}_network")
        subnet = self.conn.network.create_subnet(name=f"{name}_subnet",
                                                 network_id=net.id,
                                                 ip_version="4",
                                                 cidr=self.address_pool.get_available_subnet())#,gateway_ip=self.address_pool.get_first_address()
        return net, subnet

    # create a floating ip from the network pool
    def _create_floating_ip(self, network):
        print("Creating floating ip from network", network)
        return self.conn.network.create_ip(floating_network_id=network.id)

    # create and link a floating ip to a given instance
    def _add_floating_ip_to_instance(self, instance, network):
        floating_ip = self._create_floating_ip(network)
        print("Created floating ip", floating_ip)
        print("Adding floating ip to instance: ", instance.name)
        self.conn.compute.add_floating_ip_to_server(instance, address=floating_ip.floating_ip_address)
        return floating_ip.floating_ip_address

    # release a floating ip
    def _remove_floating_ip(self, floating_ip):
        self.conn.network.delete_ip(floating_ip)

    # unlink a floating ip with a given instance and destroy the floating ip
    def _remove_floating_ip_from_instance(self, instance, slave_floating_ip):
        floating_ip = self.conn.network.find_ip(slave_floating_ip)
        self.conn.compute.remove_floating_ip_from_server(instance, address=floating_ip.floating_ip_address)
        self._remove_floating_ip(floating_ip)


    def _create_instance(self, name, flavor_name='small-spark-node', image_name='xenial-spark-ready-image', network_name='public', security_group_name='spark-security-group'):
        #todo add keypair
        img = self.conn.compute.find_image(image_name)
        flv = self.conn.compute.find_flavor(flavor_name)
        net = self.conn.network.find_network(network_name)
        return self.conn.compute.create_server(name=name, image_id=img.id, flavor_id=flv.id, networks=[{'uuid': net.id}], security_groups=[{'name': security_group_name}])


    def _delete_instance(self, instance_id):
        self.conn.compute.delete_server(instance_id)


    def _instance_status(self, server_id):
        return self.conn.compute.find_server(server_id).status


    def _wait_instance(self, instance):
        self.conn.compute.wait_for_server(instance)


    def _create_cluster_dedicated_network(self, name):
        network, subnet = self._create_network(name=name)
        # create router for interconnection
        router = self.conn.network.create_router(name=f"{name}_router", external_gateway_info={'network_id': self.public_net.id})
        # adding two interfaces to the router to connect the public network with the cluster network
        self.conn.network.add_interface_to_router(router, subnet_id=subnet.id)
        self.conn.network.add_interface_to_router(router, subnet_id=self.public_subnet.id)
        return subnet, network, router


    def _delete_cluster_dedicated_network(self, subnet, network, router):
        # delete all interfaces (ports) associated with this router
        for p in self.conn.network.ports():
            if p.device_id == router.id:
                if p.device_owner == 'network:router_interface':
                    self.conn.network.remove_interface_from_router(router, port_id=p.id)
        # delete router
        self.conn.network.delete_router(router)
        # delete the subnet
        self.conn.network.delete_subnet(subnet)
        # delete the network
        self.conn.network.delete_network(network)


    # connect to the master and set it up. finally start a spark master instance
    def _setup_master(self, master, network, user_ssh_key, cluster_private_key):
        print("Waiting for master to be ready")
        # wait for all the nodes to be ready
        self._wait_instance(master)

        print("Adding floating ip to master")
        # add floating ip to the master
        master_floating_ip = self._add_floating_ip_to_instance(master, self.public_net)

        print("Master floating ip: ", master_floating_ip)
        print("Trying to connect to master")
        ssh = self._get_ssh_connection(master_floating_ip)
        print("Connected to master!")
        # private key to master, the public key will be copied to the slaves.
        # master must be able to access slaves with ssh and no password
        ssh.exec_command(
            f'cd ~/.ssh && echo "{cluster_private_key}" >> id_rsa')
        ssh.exec_command('cd ~/.ssh && chmod 400 id_rsa')

        # set python3 for pyspark
        ssh.exec_command('export PYSPARK_PYTHON=python3')

        # reset /etc/hosts file
        ssh.exec_command('sudo rm /etc/hosts')
        ssh.exec_command(
            f'echo -e "127.0.0.1\tlocalhost.localdomain localhost $(hostname)" | sudo tee -a /etc/hosts')

        # set SPARK_MASTER_HOST variable in the /usr/local/spark/conf/spark-env.sh config file
        ssh.exec_command(
            'cd /usr/local/spark/conf && echo "export SPARK_MASTER_HOST=$(hostname -I)" > spark-env.sh')
        # let user access the master of the cluster with his key
        ssh.exec_command(
            f'cd ~/.ssh && echo "{user_ssh_key}" >> authorized_keys')

        # start spark in master mode
        ssh.exec_command('/usr/local/spark/sbin/start-master.sh')
        print("Master set up correctly!")

    def _setup_slave(self, slave, master, network, cluster_public_key):
        print("Waiting for slave to be ready")
        # wait for all the nodes to be ready
        self._wait_instance(slave)

        print("Adding temporary floating ip to slave")
        # add floating ip to the slave
        slave_floating_ip = self._add_floating_ip_to_instance(slave, self.public_net)

        # get floating ips to be able to connect to instances
        print("Retrieving master fixed ip")
        master_fixed_ip = self._get_fixed_ip_instance(master, network)
        print("Slave ips: ", slave_floating_ip, master_fixed_ip)

        ssh = self._get_ssh_connection(slave_floating_ip)
        # reset /etc/hosts file
        ssh.exec_command('sudo rm /etc/hosts')
        ssh.exec_command(
            f'echo -e "127.0.0.1\tlocalhost.localdomain localhost $(hostname)\n{master_fixed_ip}\tmaster" | sudo tee -a /etc/hosts')

        # private key to master, the public key will be copied to the slaves.
        # master must be able to access slaves with ssh and no password
        ssh.exec_command(
            f'cd ~/.ssh && echo "{cluster_public_key}" >> id_rsa.pub')
        ssh.exec_command(
            'cd ~/.ssh && ssh-keygen -f id_rsa.pub -i -mPKCS8 >> authorized_keys && sudo rm id_rsa.pub')

        # set SPARK_MASTER_HOST variable in the /usr/local/spark/conf/spark-env.sh config file
        ssh.exec_command(
            f'cd /usr/local/spark/conf && echo "export SPARK_MASTER_HOST={master_fixed_ip}" > spark-env.sh')
        # start spark in slave mode
        starting_memory = int(self.conn.compute.find_flavor(slave.flavor['id']).ram) - 256
        ssh.exec_command(
            f"/usr/local/spark/sbin/start-slave.sh spark://master:7077 --memory {starting_memory}M")

        print("Revoking floating ip from slave instance")
        self._remove_floating_ip_from_instance(slave, slave_floating_ip)

    # main function
    def _create_cluster(self, name, user_ssh_key):
        '''
        - 1) keypair
        - 2) network + router private-public
        - 3) master
        - 4) associate floating ip to master
        - 5) set up master
        '''
        print("Create keypair")
        # create the keypair to allow the master access the slaves
        cluster_private_key, cluster_public_key = self._create_ssh_pair()
        
        print("Create network and router")
        # create the network for the cluster
        subnet, network, router = self._create_cluster_dedicated_network(name)
        print(network, router)

        print("Creating master...")
        # launch the master
        master = self._create_instance(f'{name}_master', flavor_name='master-spark-node', network_name=network.name)
        print(master)
        
        print("Starting thread")
        # instances launched, configuring them in an other thread to return asap the results to the client
        threading.Thread(target=self._setup_master, args=(master, network, user_ssh_key, cluster_private_key)).start()
        
        # return the Cluster object
        return Cluster(name, master.id, subnet.id, network.id, router.id, [], cluster_private_key, cluster_public_key)


    # add a slave to the cluster
    def _add_slave(self, cluster, flavor_name='small-spark-node'):
        print("Create slave", flavor_name)
        # retrieve the master
        master = self.conn.compute.find_server(cluster.master_id)
        network = self.conn.network.find_network(cluster.network_id)
        slave_name = f'{cluster.name}_slave{len(cluster.slaves_ids)}'
        # create the slave
        print("Creating...")
        slave = self._create_instance(slave_name, flavor_name=flavor_name, network_name=network.name)
        # start slave set up in separate thread
        threading.Thread(target=self._setup_slave, args=(slave, master, network, cluster.cluster_public_key)).start()
        # add slave id to cluster instance
        cluster.slaves_ids.append(slave.id)
        return cluster


    # destroy a slave node from the cluster
    def _remove_slave(self, cluster, slave_id):
        self._delete_instance(slave_id)
        cluster.slaves_ids.remove(slave_id)
        return cluster


    # delete a cluster given a Cluster instance
    def _delete_cluster(self, cluster):
        # first delete the instances
        for slave_id in cluster.slaves_ids:
            self._delete_instance(slave_id)
        self._delete_instance(cluster.master_id)
        # retrieve instances of nets and routers
        subnet = self.conn.network.find_subnet(cluster.subnet_id)
        network = self.conn.network.find_network(cluster.network_id)
        router = self.conn.network.find_router(cluster.router_id)
        # delete the cluster
        self._delete_cluster_dedicated_network(subnet, network, router)





