import React, { Component } from 'react';
import { Header, Loader, Divider, Table, Button, Label } from 'semantic-ui-react';
import SshPairsAdd from './SshPairsAdd';

import './SshPairs.css';
import axios from 'axios';

class Pricing extends Component {

    state = {
        isLoading: false,
        sshpairs: []
    }

    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
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
            axios.get('/api/sshpair').then(res => {
                this.setState({
                    ...this.state,
                    sshpairs: res.data.sshpair,
                    isLoading: false
                });
            }).catch(err => {
                console.log(err);
                this.setState({
                    ...this.state,
                    sshpairs: [],
                    isLoading: false
                });
            })
        });
    }

    delete(id) {
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => {
            axios.delete(`/api/sshpair/${id}`).then(this.refresh).catch(err => console.log(err));
        });
    }

    render() {
        if (this.state.isLoading) return <Loader active inline='centered' />

        return (
            <div className='homeContainer'>
                <div className="homeSubContainer">
                    <Header size='medium'>Your ssh keys</Header>
                    <SshPairsAdd refresh={this.refresh}/>
                    <Divider />
                    {this.state.sshpairs.length > 0 ?
                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Name</Table.HeaderCell>
                                <Table.HeaderCell>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {this.state.sshpairs.map(f =>
                                <Table.Row key={f.id}>
                                    <Table.Cell>{f.name}</Table.Cell>
                                    <Table.Cell><Button icon='delete' onClick={() => this.delete(f.id)} circular/></Table.Cell>
                                </Table.Row>)}
                        </Table.Body>
                    </Table> : <Label>No key available, click add to add a new one</Label>}
                    <div className='homeAdvices'>
                        {'There are 4 clusters running!'}
                    </div>
                </div>
            </div>
        )
    }
}

export default Pricing;