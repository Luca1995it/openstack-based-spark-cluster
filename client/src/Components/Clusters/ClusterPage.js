import React, { Component } from 'react';
import { Header, Loader, Divider, Table, Button, Label, Icon, Popup, Segment, Container } from 'semantic-ui-react';
import './Clusters.css';
import axios from 'axios';
import ClusterPageAdd from './ClusterPageAdd';

class ClusterPage extends Component {

    state = {
        isLoadingMaster: false,
        isLoadingSlaves: false,
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
        this.refresh();
    }

    componentDidUpdate(oldProps){
        const newProps = this.props;
        if(oldProps.cluster.slaves_ids.length !== newProps.cluster.slaves_ids.length) this.refresh();
    }

    refresh(){
        this.setState({
            ...this.state,
            isLoadingMaster: true,
            isLoadingSlaves: true,
            isLoading: false,
        });
        axios.get(`/api/instance/${this.props.cluster.master_id}`).then(res => {
            this.setState({
                ...this.state,
                master: res.data.instance,
                isLoadingMaster: false,
                errorMessage: ""
            });
        }).catch(err => {
            console.log(err);
            this.setState({
                ...this.state,
                isLoadingMaster: false,
                errorMessage: "There was a problem loading the master, try refreshing the page"
            });
        });

        let requests = this.props.cluster.slaves_ids.map(id => axios.get(`/api/instance/${id}`));
        axios.all(requests).then(res => {        
            this.setState({
                ...this.state,
                slaves: res.map(r => r.data.instance),
                isLoadingSlaves: false,
                errorMessage: ""
            });
        }).catch(err => {
            console.log(err);
            this.setState({
                ...this.state,
                isLoadingSlaves: false,
                errorMessage: "There was a problem loading the nodes, try refreshing the page"
            });
        });
    }

    start(id){
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => {
                axios.put(`/api/instance/${id}`, {
                    action: "start"
                }).then(this.refresh).catch(err => {
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
            axios.put(`/api/instance/${id}`, {
                action: "restart"
            }).then(res => {
                console.log(res);
                this.refresh();
            }).catch(err => {
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
                axios.put(`/api/instance/${id}`, {
                    action: "shutdown"
                }).then(this.refresh).catch(err => {
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
                // axios delete needs a particular way to declare data
                axios.delete(`/api/instance/${id}`, {
                    data: {
                        cluster_id: this.props.cluster.id
                    }
                }).then(res => {
                console.log(res);
                this.props.refresh();
            }).catch(err => {
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
                <Button circular onClick={this.props.back}>
                    <Icon name='backward'/>
                    Back to clusters
                </Button>
                <Header size='medium'>
                    Manage cluster "{this.props.cluster.name}"
                </Header>
                {this.state.errorMessage ? <Label color="red">{this.state.errorMessage}</Label> : null}
                <Button circular onClick={this.refresh}>
                    <Icon name='refresh'/>
                    Refresh
                </Button>
                <Divider />
                <Header size='small'>
                    Master 
                    <br/>
                    {this.state.master && (this.state.master.spark_status === 'ALIVE') && (this.state.master.public_ips.length > 0) ?
                        <a href={`http://${this.state.master.public_ips[0]}:8080`}
                            target="_blank" rel="noopener noreferrer">Spark Master Web UI</a>
                    : null}
                </Header>
                {this.state.isLoadingMaster ? <Loader active inline='centered' /> :
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell rowSpan='2'>Name</Table.HeaderCell>
                            <Table.HeaderCell rowSpan='1'>vCPUs</Table.HeaderCell>
                            <Table.HeaderCell rowSpan='1'>RAM</Table.HeaderCell>
                            <Table.HeaderCell rowSpan='1'>Disk</Table.HeaderCell>
                            <Table.HeaderCell rowSpan='1'>Swap</Table.HeaderCell>
                            <Table.HeaderCell rowSpan='2'>Status</Table.HeaderCell>
                            <Table.HeaderCell rowSpan='2'>Spark Status</Table.HeaderCell>
                            <Table.HeaderCell rowSpan='1'>Running jobs</Table.HeaderCell>
                            <Table.HeaderCell rowSpan='2'>IP(s)</Table.HeaderCell>
                            <Table.HeaderCell rowSpan='3'>Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.state.master ? <Table.Row key={this.state.master.id}>
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
                                <Popup content='Start' trigger={<Button circular icon='angle up' color='green'
                                    onClick={() => this.start(this.state.master.id)}
                                    disabled={!['SHUTOFF', 'STOPPED', 'SUSPENDED', 'PAUSED'].includes(this.state.master.status)}
                                />} />
                                <Popup content='Restart' trigger={<Button circular icon='redo' color='yellow'
                                    onClick={() => this.restart(this.state.master.id)}
                                    disabled={!['ACTIVE', 'ERROR', 'UNKNOWN'].includes(this.state.master.status)}
                                />} />
                                <Popup content='Restart Spark' trigger={<Button circular icon='redo' color='orange'
                                    onClick={() => this.restart_spark(this.state.master.id)}
                                    disabled={['ALIVE'].includes(this.state.master.spark_status) || !this.state.master.status === 'ACTIVE'}
                                />} />
                                <Popup content='Shutdown' trigger={<Button circular icon='angle down' color='red'
                                    onClick={() => this.shutdown(this.state.master.id)}
                                    disabled={!['ACTIVE', 'ERROR', 'UNKNOWN'].includes(this.state.master.status)}
                                />} />
                            </Table.Cell>
                        </Table.Row> : null}
                    </Table.Body>
                </Table>}
                <Header size='small'>Slaves</Header>
                <ClusterPageAdd
                    cluster={this.props.cluster}
                    refresh={this.refresh} disabled={this.state.slaves.length >= 2}
                    setErrorMessage={(msg) => this.setState({ ...this.state, errorMessage: msg })} />
                <Divider />
                {this.state.isLoadingSlaves ? <Loader active inline='centered' /> :
                    <div>
                        {this.state.slaves.length > 0 ?
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell rowSpan='2'>Name</Table.HeaderCell>
                                    <Table.HeaderCell rowSpan='1'>vCPUs</Table.HeaderCell>
                                    <Table.HeaderCell rowSpan='1'>RAM</Table.HeaderCell>
                                    <Table.HeaderCell rowSpan='1'>Disk</Table.HeaderCell>
                                    <Table.HeaderCell rowSpan='1'>Swap</Table.HeaderCell>
                                    <Table.HeaderCell rowSpan='2'>Status</Table.HeaderCell>
                                    <Table.HeaderCell rowSpan='2'>Spark Status</Table.HeaderCell>
                                    <Table.HeaderCell rowSpan='1'>Running jobs</Table.HeaderCell>
                                    <Table.HeaderCell rowSpan='2'>IP(s)</Table.HeaderCell>
                                    <Table.HeaderCell rowSpan='3'>Actions</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {this.state.slaves.map(slave => 
                                    <Table.Row key={slave.id}>
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
                                            <Popup content='Start' trigger={<Button circular icon='angle up' color='green'
                                                onClick={() => this.start(slave.id)}
                                                disabled={!['SHUTOFF', 'STOPPED', 'SUSPENDED', 'PAUSED'].includes(slave.status)}
                                            />} />
                                            <Popup content='Restart' trigger={<Button circular icon='redo' color='yellow'
                                                onClick={() => this.restart(slave.id)}
                                                disabled={!['ACTIVE', 'ERROR', 'UNKNOWN'].includes(slave.status)}
                                            />} />
                                            <Popup content='Restart Spark' trigger={<Button circular icon='redo' color='orange'
                                                onClick={() => this.restart_spark(slave.id)}
                                                disabled={['ALIVE'].includes(this.state.master.spark_status) || !this.state.master.status === 'ACTIVE'}
                                            />} />
                                            <Popup content='Shutdown' trigger={<Button circular icon='angle down' color='red'
                                                onClick={() => this.shutdown(slave.id)}
                                                disabled={!['ACTIVE', 'ERROR', 'UNKNOWN'].includes(slave.status)}
                                            />} />
                                            <Popup content='Delete' trigger={<Button circular icon='close' color='black'
                                                onClick={() => this.delete(slave.id)}
                                            />} />
                                        </Table.Cell>
                                    </Table.Row>)}
                                </Table.Body>
                            </Table> : <Header size="tiny">There are no slaves in this cluster</Header>}
                        </div>
                }
                <Divider />
                <Header size='medium'>What to do now ?</Header>
                <Segment fluid className="cluster-description">
                    If the status of <code>Spark</code> on the Master node is <code>ALIVE</code>, you can use your
                    ssh key to log into the <code>Master</code> instance and launch your <code>Spark</code> jobs.
                    You can see the state of Jobs and of <code>Spark</code> clicking the link that 
                    will appear in the <code>Master</code> section. At the moment, only
                    script written in <code>Java</code> or <code>Python</code> can be launched with <code>Spark</code>.
                </Segment>
            </div>
        </div>
    }
}

export default ClusterPage;