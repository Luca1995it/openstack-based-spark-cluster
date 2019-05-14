import React, { Component } from 'react'
import { Header, Loader, Divider, Table, Button, Label, Icon, Segment } from 'semantic-ui-react'
import './Clusters.css';
import axios from 'axios';
import ClusterPageAdd from './ClusterPageAdd';

class ClusterPage extends Component {

    state = {
        isLoading: false,
        errorMessage: "",
        master: undefined,
        slaves: []
    }

    constructor(props){
        super(props);
        this.refresh = this.refresh.bind(this);
        this.start = this.start.bind(this);
        this.restart = this.restart.bind(this);
        this.shutdown = this.shutdown.bind(this);
        this.delete = this.delete.bind(this);
    }

    componentDidMount(){
        this.refresh()
    }

    refresh(){
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => {
            let requests = [axios.get(`/api/instance/${this.props.cluster.master_id}`)];
            //requests += this.props.cluster.slaves_ids.map(id => axios.get(`/api/instance/${id}`));
            console.log(requests, typeof(requests));
            
            axios.all(requests).then(res => {
                console.log(res);
                
                this.setState({
                    ...this.state,
                    master: res[0].data.instance,
                    slaves: res.slice(1).map(r => r.data.instance),
                    isLoading: false,
                    errorMessage: ""
                });
            }).catch(err => {
                console.log(err);
                this.setState({
                    ...this.state,
                    clusters: [],
                    isLoading: false,
                    errorMessage: "There was a problem loading the nodes, try refreshing the page"
                });
            })
        });
    }

    start(id){
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => {
            axios.put(`/api/instance/start/${id}`).then(this.refresh).catch(err => {
                console.log(err);
                this.setState({
                    ...this.state,
                    isLoading: false,
                    errorMessage: "There was a problem starting the instance, try refreshing the page"
                });
            });
        });
    }

    restart(id){
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => {
            axios.put(`/api/instance/restart/${id}`).then(this.refresh).catch(err => {
                console.log(err);
                this.setState({
                    ...this.state,
                    isLoading: false,
                    errorMessage: "There was a problem restarting the instance, try refreshing the page"
                });
            });
        });
    }

    shutdown(id){
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => {
            axios.put(`/api/instance/shutdown/${id}`).then(this.refresh).catch(err => {
                console.log(err);
                this.setState({
                    ...this.state,
                    isLoading: false,
                    errorMessage: "There was a problem shutting down the instance, try refreshing the page"
                });
            });
        });
    }

    delete(id){
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => {
            axios.delete(`/api/instance/${id}`).then(this.refresh).catch(err => {
                console.log(err);
                this.setState({
                    ...this.state,
                    isLoading: false,
                    errorMessage: "There was a problem restarting the instance, try refreshing the page"
                });
            });
        });
    }

    render(){
        if (this.state.isLoading) return <Loader active inline='centered' />
        return <div className='homeContainer'>
            <div className="homeSubContainer">
                <Header size='medium'>Manage cluster "{this.props.cluster.name}"</Header>
                {this.state.errorMessage ? <Label color="red">{this.state.errorMessage}</Label> : null}
                <Button circular onClick={this.refresh}>
                    <Icon name='refresh'/>
                    Refresh
                </Button>
                <Divider />
                <Header size='small'>Master</Header>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>vCPUs</Table.HeaderCell>
                            <Table.HeaderCell>RAM</Table.HeaderCell>
                            <Table.HeaderCell>Disk</Table.HeaderCell>
                            <Table.HeaderCell>Swap</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Spark Status</Table.HeaderCell>
                            <Table.HeaderCell>Running jobs</Table.HeaderCell>
                            <Table.HeaderCell>IP(s)</Table.HeaderCell>
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.state.master ? <Table.Row>
                            <Table.Cell>{this.state.master.name}</Table.Cell>
                            <Table.Cell>{this.state.master.flavor.vcpus}</Table.Cell>
                            <Table.Cell>{`${this.state.master.flavor.ram} MB`}</Table.Cell>
                            <Table.Cell>{`${this.state.master.flavor.disk} GB`}</Table.Cell>
                            <Table.Cell>{`${this.state.master.flavor.swap} MB`}</Table.Cell>
                            <Table.Cell>{`${this.state.master.status}`}</Table.Cell>
                            <Table.Cell>{`${this.state.master.spark_status}`}</Table.Cell>
                            <Table.Cell>{`${this.state.master.number_running_app}`}</Table.Cell>
                            <Table.Cell>{`[${this.state.master.public_ips.join(", ")}]`}</Table.Cell>
                            <Table.Cell>
                                <Button circular color='green'
                                    onClick={() => this.restart(this.state.master.id)}
                                    disabled={this.state.master.status !== 'STOPPED'}
                                >
                                    Start
                                </Button>
                                <Button circular color='yellow'
                                    onClick={() => this.restart(this.state.master.id)}
                                    disabled={this.state.master.status !== 'ACTIVE'}
                                >
                                    Restart
                                </Button>
                                <Button circular color='red'
                                    onClick={() => this.restart(this.state.master.id)}
                                    disabled={this.state.master.status !== 'ACTIVE'}
                                >
                                    Shutdown
                                </Button>
                            </Table.Cell>
                        </Table.Row> : null}
                    </Table.Body>
                </Table>
                <Header size='small'>Slaves</Header>
                <ClusterPageAdd
                    cluster={this.props.cluster}
                    refresh={this.refresh} /*disabled={this.state.clusters.length >= 2}*/
                    setErrorMessage={(msg) => this.setState({ ...this.state, errorMessage: msg })} />
                {this.state.slaves.length > 0 ?
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>vCPUs</Table.HeaderCell>
                            <Table.HeaderCell>RAM</Table.HeaderCell>
                            <Table.HeaderCell>Disk</Table.HeaderCell>
                            <Table.HeaderCell>Swap</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Spark Status</Table.HeaderCell>
                            <Table.HeaderCell>Running jobs</Table.HeaderCell>
                            <Table.HeaderCell>IP(s)</Table.HeaderCell>
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    {this.state.slaves.map(slave => 
                        <Table.Row>
                            <Table.Cell>{slave.name}</Table.Cell>
                            <Table.Cell>{slave.flavor.vcpus}</Table.Cell>
                            <Table.Cell>{`${slave.flavor.ram} MB`}</Table.Cell>
                            <Table.Cell>{`${slave.flavor.disk} GB`}</Table.Cell>
                            <Table.Cell>{`${slave.flavor.swap} MB`}</Table.Cell>
                            <Table.Cell>{`${slave.status}`}</Table.Cell>
                            <Table.Cell>{`${slave.spark_status}`}</Table.Cell>
                            <Table.Cell>{`${slave.number_running_app}`}</Table.Cell>
                            <Table.Cell>{`[${slave.public_ips.join(", ")}]`}</Table.Cell>
                            <Table.Cell>
                                <Button circular color='green'
                                    onClick={() => this.restart(slave.id)}
                                    disabled={slave.status !== 'STOPPED'}
                                >
                                    Start
                                </Button>
                                <Button circular color='yellow'
                                    onClick={() => this.restart(slave.id)}
                                    disabled={slave.status !== 'ACTIVE'}
                                >
                                    Restart
                                </Button>
                                <Button circular color='red'
                                    onClick={() => this.restart(slave.id)}
                                    disabled={slave.status !== 'ACTIVE'}
                                >
                                    Shutdown
                                </Button>
                                <Button circular color='white' inverted
                                    onClick={() => this.delete(slave.id)}
                                >
                                    Delete
                            </Button>
                            </Table.Cell>
                        </Table.Row>
                        
                    )}
                </Table> : <Segment>There are no slaves in this cluster</Segment>}
            </div>
        </div>
    }

}

export default ClusterPage;