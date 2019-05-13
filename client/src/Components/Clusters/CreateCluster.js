import React, { Component } from 'react';
import { Modal, Button, Icon, Header, Form, Table } from 'semantic-ui-react';

import axios from 'axios';

import './ModalStyle.css';

export default class CreateCluster extends Component {

    state = {
        modalOpen: false,
        isLoading: false,
        cluster: {
            name: "",
            key: "",
        },
        keys: []
    }

    constructor(props) {
        super(props)
        this.addCluster = this.addCluster.bind(this)
    }

    handleOpen = () => {
        this.setState({
            ...this.state,
            modalOpen: true,
            cluster: {
                ...this.state.cluster,
                flavors: []
            }
        }, () => {
            axios.get('/api/sshpairs').then(res => {
            this.setState({
                ...this.state,
                cluster: {
                    ...this.state.cluster,
                    flavors: res[0].data.flavors.map(obj => ({ ...obj, quantity: 0 }))
                },
                keys: res[1].data.sshpairs
            });
        }).catch(err => {
            console.log(err);
            this.setState({
                ...this.state,
                cluster: {
                    ...this.state.cluster,
                    flavors: []
                }
            });
        })});
    }

    handleClose = () => this.setState({
        ...this.state,
        modalOpen: false
    })

    addCluster() {
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => axios.post('/api/clusters', {
                ...this.state.cluster,
                name: this.state.cluster.name,
                flavors: this.state.cluster.flavors.map(obj => ({name: obj.name, quantity: obj.quantity})),
                key: this.state.cluster.key
            }).then(res => {
                this.setState({
                    ...this.state,
                    isLoading: false,
                    modalOpen: false
                })
                setTimeout(() => this.props.refresh(), 500);
            })
            .catch(err => {
                //TODO: handle error
                console.log(err);
            })
        );
    }

    render() {
        return (
            <Modal
                trigger={<Button size='small' floated='right' onClick={this.handleOpen} className="topBtns newDocument"><Icon name='add' />Create new cluster</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}
            >
                <Modal.Content>
                    <Header content={`New cluster: ${this.state.cluster.name}`} />
                    <Form>
                        <Form.Group>
                            <Form.Input label='Name' width='6' value={this.state.cluster.name} onChange={(e) => this.setState({ ...this.state, cluster: { ...this.state.cluster, name: e.target.value } })} />
                            <Form.Dropdown
                                label='Your ssh RSA key'
                                search selection
                                loading={this.state.isLoading}
                                onChange={(e, thing) => {
                                    this.setState({
                                        ...this.state,
                                        cluster: {
                                            ...this.state.cluster,
                                            key: thing.value
                                        }
                                    })
                                }}
                                options={this.state.keys.map(key => ({
                                    value: key.id,
                                    text: key.name,
                                    key: key.id,
                                }))}
                            />
                        </Form.Group>
                    </Form>
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
                                                            if(res > 3) res = 3;
                                                            if(res < 0) res = 0;
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
                        onClick={this.addCluster}
                        disabled={this.state.cluster.name === "" || this.state.cluster.flavors.map(obj => obj.quantity).reduce((a, b) => a + b, 0) <= 0 || !this.state.cluster.key}>
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
