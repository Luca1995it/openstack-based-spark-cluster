import React, { Component } from 'react';
import { Modal, Button, Icon, Header, Form, Table, Radio } from 'semantic-ui-react';

import axios from 'axios';

import './ModalStyle.css';

export default class ClusterPageAdd extends Component {

    state = {
        modalOpen: false,
        isLoading: false,
        flavors: [],
        instance: {
            flavor_name: "",
            quantity: 1
        }
    }

    constructor(props) {
        super(props);
        this.addNode = this.addNode.bind(this);
        this.select = this.select.bind(this);        
    }

    handleOpen = () => {
        this.setState({
            ...this.state,
            modalOpen: true,
            instance: {
                flavor_name: "",
                quantity: 1
            }
        }, () => {
            axios.get('/api/flavor').then(res => {
                this.setState({
                    ...this.state,
                    flavors: res.data.flavor
                });
            }).catch(err => {
                console.log(err);
                this.props.setErrorMessage("there was a problem loading the flavors, try refreshing the page")
                this.setState({
                    ...this.state,
                    flavors: [],
                    modalOpen: false
                });
            })
        });
    }

    handleClose = () => this.setState({
        ...this.state,
        modalOpen: false
    })

    addNode() {
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => axios.post(`/api/instance/${this.props.cluster.id}`, this.state.instance).then(res => {
            this.setState({
                ...this.state,
                isLoading: false,
                modalOpen: false
            }, () => setTimeout(() => this.props.refresh(), 500));
        }).catch(err => {
            console.log(err);
            this.props.setErrorMessage("there was a problem adding the node to the cluster, try refreshing the page")
            this.setState({
                ...this.state,
                isLoading: false,
                modalOpen: false
            });
        }));
    }

    select(flavor_name){
        this.setState({
            ...this.state,
            instance: {
                ...this.state.instance,
                flavor_name: flavor_name
            }
        });
    }

    render() {
        return (
            <Modal
                trigger={<Button size='small' floated='right' onClick={this.handleOpen} className="topBtns newDocument"><Icon name='add' />Create a new node</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}
            >
                <Modal.Content>
                    <Header content={'New computing node'} />
                    <Form>
                        <Form.Group>
                            <Table celled>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Selected</Table.HeaderCell>
                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                        <Table.HeaderCell>vCPUs</Table.HeaderCell>
                                        <Table.HeaderCell>RAM</Table.HeaderCell>
                                        <Table.HeaderCell>Disk</Table.HeaderCell>
                                        <Table.HeaderCell>Swap</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header> 
                                <Table.Body>
                                    {this.state.flavors.filter(obj => !obj.name.startsWith('master')).map(flavor =>
                                        <Table.Row key={flavor.id}>
                                            <Table.Cell>
                                                <Radio onChange={() => this.select(flavor.name)} checked={this.state.instance.flavor_name === flavor.name} />
                                            </Table.Cell>
                                            <Table.Cell>{flavor.name}</Table.Cell>
                                            <Table.Cell>{flavor.vcpus}</Table.Cell>
                                            <Table.Cell>{`${flavor.ram} MB`}</Table.Cell>
                                            <Table.Cell>{`${flavor.disk} GB`}</Table.Cell>
                                            <Table.Cell>{`${flavor.swap} MB`}</Table.Cell>
                                        </Table.Row>)}
                                </Table.Body>
                            </Table>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input label='Quantity' type='number' min="1" max="2" value={this.state.instance.quantity}
                                onChange={(e) => this.setState({ ...this.state, instance: { ...this.state.instance, quantity: e.target.value } })} />
                        </Form.Group>
                    </Form>
                </Modal.Content>

                <Modal.Actions>
                    <Button animated='fade' color='red' onClick={this.handleClose}>
                        <Button.Content visible>
                            Cancel
						</Button.Content>
                        <Button.Content hidden>
                            <Icon name='user close' />
                        </Button.Content>
                    </Button>
                    <Button
                        animated='fade'
                        color='green'
                        loading={this.state.isLoading}
                        onClick={this.addNode}
                        disabled={this.state.instance.flavor_name === ""}>
                        <Button.Content visible>
                            Create
						</Button.Content>
                        <Button.Content hidden>
                            <Icon name='angle double right' />
                        </Button.Content>
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}
