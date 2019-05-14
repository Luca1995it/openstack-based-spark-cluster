import React, { Component } from 'react';
import { Modal, Button, Icon, Header, Form } from 'semantic-ui-react';

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
        }, () => {
            axios.get('/api/sshpair').then(res => {
            this.setState({
                ...this.state,
                keys: res.data.sshpair
            });
        }).catch(err => {
            console.log(err);
            this.props.setErrorMessage("there was a problem loading the keys, try refreshing the page")
            this.setState({
                ...this.state,
                keys: [],
                modalOpen: false
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
        }, () => axios.post('/api/cluster', {
            key_id: this.state.cluster.key,
            name: this.state.cluster.name
        }).then(res => {
                this.setState({
                    ...this.state,
                    isLoading: false,
                    modalOpen: false
                }, () => setTimeout(() => this.props.refresh(), 500));
            }).catch(err => {
                console.log(err);
                this.props.setErrorMessage("there was a problem adding the cluster, try refreshing the page")
                this.setState({
                    ...this.state,
                    isLoading: false,
                    modalOpen: false
                });
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
                        <Form.Group widths='equal'>
                            <Form.Input label='Name' value={this.state.cluster.name} onChange={(e) => this.setState({ ...this.state, cluster: { ...this.state.cluster, name: e.target.value } })} />
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
                        disabled={this.state.cluster.name === "" || !this.state.cluster.key}>
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
