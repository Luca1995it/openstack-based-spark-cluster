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
            flavors: [],
            isLoading: true
        }, () => {
            axios.get('/api/flavor').then(res => {
                this.setState({
                    ...this.state,
                    flavors: res.data.flavor,
                    isLoading: false
                });
            }).catch(err => {
                console.log(err);
                this.setState({
                    ...this.state,
                    flavors: [],
                    isLoading: false
                });
            })
        });
    }

    render() {
        if (this.state.isLoading) return <Loader active inline='centered' />
        return (
            <div className='homeContainer'>
                <div className="homeSubContainer">
                    <Header size='medium'>Available Configurations for slave nodes</Header>
                    <Divider />

                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Name</Table.HeaderCell>
                                <Table.HeaderCell>vCPUs</Table.HeaderCell>
                                <Table.HeaderCell>RAM</Table.HeaderCell>
                                <Table.HeaderCell>Disk</Table.HeaderCell>
                                <Table.HeaderCell>Swap</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {this.state.flavors.map(flavor =>
                                <Table.Row key={flavor.id}>
                                    <Table.Cell>{flavor.name}</Table.Cell>
                                    <Table.Cell>{flavor.vcpus}</Table.Cell>
                                    <Table.Cell>{`${flavor.ram} MB`}</Table.Cell>
                                    <Table.Cell>{`${flavor.disk} GB`}</Table.Cell>
                                    <Table.Cell>{`${flavor.swap} GB`}</Table.Cell>
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