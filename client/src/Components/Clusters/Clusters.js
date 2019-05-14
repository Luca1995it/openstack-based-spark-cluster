import React, { Component } from 'react'
import { Header, Loader, Divider, Table, Button, Label, Icon } from 'semantic-ui-react'
import CreateCluster from './CreateCluster';
import './Clusters.css';
import axios from 'axios';
import ClusterPage from './ClusterPage';

class Clusters extends Component {

    state = {
        isLoading: false,
        clusters: [],
        errorMessage: "",
        status: undefined
    }

    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.delete = this.delete.bind(this);
    }

    componentDidMount(){
        this.setState({
            ...this.state,
        }, this.refresh);
    }

    refresh() {
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => {
            axios.get('/api/cluster').then(res => {
                this.setState({
                    ...this.state,
                    clusters: res.data.cluster,
                    isLoading: false,
                    errorMessage: ""
                });
            }).catch(err => {
                console.log(err);
                this.setState({
                    ...this.state,
                    clusters: [],
                    isLoading: false,
                    errorMessage: "There was a problem loading the clusters, try refreshing the page"
                });
            })
        });
    }

    delete(id) {
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => {
            axios.delete(`/api/cluster/${id}`).then(this.refresh).catch(err => {
                console.log(err);
                this.setState({
                    ...this.state,
                    isLoading: false,
                    errorMessage: "There was a problem deleting the cluster, try refreshing the page"
                });
            });
        });
    }

    edit(cluster){
        this.setState({
            ...this.state,
            status: cluster
        });
    }

    back(){
        this.setState({
            ...this.state,
            status: undefined
        }, this.refresh);
    }

    render() {
        if (this.state.isLoading) return <Loader active inline='centered' />
        if (this.state.status) return <ClusterPage back={this.back} cluster={this.state.status} />
        return (
            <div className='homeContainer'>
                <div className="homeSubContainer">
                    <Header size='medium'>Manage your clusters</Header>
                    {this.state.errorMessage ? <Label color="red">{this.state.errorMessage}</Label> : null}
                    <CreateCluster refresh={this.refresh} disabled={this.state.clusters.length >= 2} setErrorMessage={(msg) => this.setState({ ...this.state, errorMessage: msg})}/>
                    <Divider />
                    <Button circular onClick={this.refresh} >
                        <Icon name='refresh' />
                        Refresh
                    </Button>
                    <Divider />
                    <div className='homeAdvices'>
                        {`There are ${this.state.clusters.length}/2 clusters running!`}
                    </div>
                    <Divider />
                    {this.state.clusters.length > 0 ?
                        <Table celled structured>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell rowSpan='6'>Name</Table.HeaderCell>
                                    <Table.HeaderCell rowSpan='4'>Number of nodes</Table.HeaderCell>
                                    <Table.HeaderCell rowSpan='6'>Actions</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {this.state.clusters.map(clus =>
                                    <Table.Row key={clus.id}>
                                        <Table.Cell>{clus.name}</Table.Cell>
                                        <Table.Cell>
                                            {clus.slaves_ids.length}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Button icon='edit' onClick={() => this.edit(clus)} circular />
                                            <Button icon='delete' onClick={() => this.delete(clus.id)} circular />
                                        </Table.Cell>
                                    </Table.Row>)}
                            </Table.Body>
                        </Table> : <Label>No clusters available, click add to create a new one</Label>}

                </div>
            </div>
        )
    }
}

export default Clusters;