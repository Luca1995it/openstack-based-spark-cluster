import React, { Component } from 'react'
import { Header, Loader, Divider, Table, Segment } from 'semantic-ui-react'
import axios from 'axios';

import './Pricing.css';

class Pricing extends Component {

    state = {
        isLoading: false,
        flavors: []
    }

    constructor(props) {
        super(props);
    }

    componentDidMount(){
        this.setState({
            ...this.state,
            flavors: []
        }, () => {
            axios.get('/api/flavors').then(res => {
                this.setState({
                    ...this.state,
                    flavors: res.data.flavors
                });
            }).catch(err => {
                console.log(err);
                this.setState({
                    ...this.state,
                    flavors: []
                });
            })
        });
    }

    render() {
        if (this.state.isLoading) return <Loader active inline='centered' />

        return (
            <div className='homeContainer'>
                <div className="homeSubContainer">
                    <Header size='medium'>Available Slave Nodes</Header>
                    <Divider />

                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Name</Table.HeaderCell>
                                <Table.HeaderCell>vCPUs</Table.HeaderCell>
                                <Table.HeaderCell>RAM</Table.HeaderCell>
                                <Table.HeaderCell>Disk</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {this.state.flavors.map(f =>
                                <Table.Row key={f.id}>
                                    <Table.Cell>{f.name}</Table.Cell>
                                    <Table.Cell>{f.vcpus}</Table.Cell>
                                    <Table.Cell>{`${f.ram} MB`}</Table.Cell>
                                    <Table.Cell>{`${f.disk} GB`}</Table.Cell>
                                </Table.Row>)}
                        </Table.Body>
                    </Table>
                    <Segment>
                        Contact us to have more info about pricing. The master node will always be automatically added to a new cluster.
                    </Segment>
                </div>
            </div>
        )
    }
}

export default Pricing;