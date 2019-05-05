# openstack-based-spark-cluster
## Manage Spark clusters with OpenStack

Client folder contains the `Javascript` `React` web-app that is send to the client. It will allow to create, manage and destroy clusters. It requires a user to be logged in.

Server folder containts the `python` server that will respond to the requests of the client app. Moreover, it will communicate with the openstack instance through the `openstacksdk` to apply changes. Data about users and clusters will be saved on a `MongoDB` database.
