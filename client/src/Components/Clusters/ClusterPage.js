import React, { Component } from 'react'
import { Header, Loader, Divider, Table, Button, Label } from 'semantic-ui-react'
import './Clusters.css';
import axios from 'axios';


class ClusterPage extends Component {

    state = {
        errorMessage: "",
    }

    render(){
        return <div className='homeContainer'>
            <div className="homeSubContainer">
                <Header size='medium'>Manage cluster {this.props.cluster.name}</Header>
                {this.state.errorMessage ? <Label color="red">{this.state.errorMessage}</Label> : null}
                <ClusterPageAdd refresh={this.refresh} /*disabled={this.state.clusters.length >= 2}*/ setErrorMessage={(msg) => this.setState({ ...this.state, errorMessage: msg })} />
                <Divider />
            </div>
        </div>
    }

}

export default ClusterPage;

{
    this.state.clusters.length > 0 ?
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
    </Table> : <Label>No clusters available, click add to create a new one</Label>
}




<Header content='Slave nodes' size='small' />
    <Form>
        <Table celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>vCPUs</Table.HeaderCell>
                    <Table.HeaderCell>RAM</Table.HeaderCell>
                    <Table.HeaderCell>Disk</Table.HeaderCell>
                    <Table.HeaderCell>Swap</Table.HeaderCell>
                    <Table.HeaderCell>Quantity</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {this.state.cluster.flavors.filter(obj => !obj.name.startsWith('master')).map(f =>
                    <Table.Row key={f.id}>
                        <Table.Cell>{f.name}</Table.Cell>
                        <Table.Cell>{f.vcpus}</Table.Cell>
                        <Table.Cell>{`${f.ram} MB`}</Table.Cell>
                        <Table.Cell>{`${f.disk} GB`}</Table.Cell>
                        <Table.Cell>{`${f.swap} GB`}</Table.Cell>
                        <Table.Cell><Form.Input
                            type='number'
                            min="0" max="3"
                            value={f.quantity}
                            onChange={
                                (e) => {
                                    this.setState({
                                        ...this.state,
                                        cluster: {
                                            ...this.state.cluster,
                                            flavors: this.state.cluster.flavors.map(obj => {
                                                if (obj.id !== f.id) return obj;
                                                let res = parseInt(e.target.value);
                                                if (res > 3) res = 3;
                                                if (res < 0) res = 0;
                                                return { ...obj, quantity: res };
                                            })
                                        }
                                    });
                                }
                            } >
                        </Form.Input></Table.Cell>
                    </Table.Row>)}
            </Table.Body>
        </Table>
    </Form>