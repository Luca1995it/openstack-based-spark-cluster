import React, { Component } from 'react'
import { Header, Loader, Divider, Table, Button, Label } from 'semantic-ui-react'
import CreateCluster from './CreateCluster';
import './Clusters.css';
import axios from 'axios';


class Clusters extends Component {

    state = {
        isLoading: false,
        clusters: [],
        flavors: []
    }

    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.delete = this.delete.bind(this);
    }

    componentDidMount(){
        this.refresh()
    }

    refresh() {
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => {
            let requests = [axios.get('/api/clusters'), axios.get('/api/flavors')]
            axios.all(requests).then(res => {
                this.setState({
                    ...this.state,
                    clusters: res[0].data.clusters,
                    flavors: res[1].data.flavors,
                    isLoading: false,
                });
            }).catch(err => {
                console.log(err);
                this.setState({
                    ...this.state,
                    clusters: [],
                    flavors: [],
                    isLoading: false,
                });
            })
        });
    }

    delete(id) {
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => {
            axios.delete(`/api/clusters/${id}`).then(this.refresh).catch(err => console.log(err));
        });
    }

    render() {
        if (this.state.isLoading) return <Loader active inline='centered' />
        
        return (
            <div className='homeContainer'>
                <div className="homeSubContainer">
                    <Header size='medium'>Manage your clusters</Header>
                    <CreateCluster refresh={this.refresh} />
                    <br></br><Button circular icon='refresh' onClick={this.refresh}/>
                    <Divider />

                    {this.state.clusters.length > 0 ?
                        <Table celled structured>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell rowSpan='2'>Name</Table.HeaderCell>
                                    <Table.HeaderCell colSpan={this.state.flavors.length}>Flavors</Table.HeaderCell>
                                    <Table.HeaderCell rowSpan='2'>Actions</Table.HeaderCell>
                                </Table.Row>
                                <Table.Row>
                                    {this.state.flavors.map(flav => <Table.HeaderCell>{flav.name}</Table.HeaderCell>)}
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {this.state.clusters.map(clus =>
                                    <Table.Row>
                                        <Table.Cell>{clus.name}</Table.Cell>
                                        {this.state.flavors.map(
                                            flav => <Table.Cell>
                                                {clus.flavors.find(fl => fl.id === flav.id) ? clus.flavors.find(fl => fl.id === flav.id).quantity : 0}
                                            </Table.Cell>)
                                        }
                                        <Table.Cell>
                                            <Button icon='delete' onClick={() => this.delete(clus.id)} circular />
                                        </Table.Cell>
                                    </Table.Row>)}
                            </Table.Body>
                        </Table> : <Label>No clusters available, click add to create a new one</Label>}

                    <div className='homeAdvices'>
                        {'There are 4 clusters running!'}
                    </div>
                </div>
            </div>
        )
    }
}

export default Clusters;