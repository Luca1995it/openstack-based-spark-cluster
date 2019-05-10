import React, { Component } from 'react';
import { Modal, Button, Icon, Header, Form } from 'semantic-ui-react';

import axios from 'axios';

import './ModalStyle.css';

export default class SshPairsAdd extends Component {

    state = {
        modalOpen: false,
        isLoading: false,
        key: "",
        name: ""
    }

    constructor(props) {
        super(props)
        this.addKey = this.addKey.bind(this)
    }

    handleOpen = () => {
        this.setState({
            ...this.state,
            modalOpen: true,
            key: "",
            name: ""
        });
    }

    handleClose = () => this.setState({
        ...this.state,
        modalOpen: false
    })

    addKey() {
        this.setState({
            ...this.state,
            isLoading: true,
        }, () => axios.post('/api/sshpairs', {
            key: this.state.key,
            name: this.state.name
        }).then(res => {
            this.setState({
                ...this.state,
                isLoading: false,
                modalOpen: false
            })
            setTimeout(() => this.props.refresh(), 500);
        }).catch(err => {
            this.setState({
                ...this.state,
                isLoading: false
            })
            console.log(err);
        }));
    }

    render() {
        return (
            <Modal
                trigger={<Button size='small' floated='right' onClick={this.handleOpen} className="topBtns newDocument"><Icon name='add' />Add a new ssh PUBLIC key</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}
            >
                <Modal.Content>
                    <Header content={`New key: ${this.state.name}`} />
                    <Form>
                        <Form.Group>
                            <Form.Input label='Name' width='6' value={this.state.name} onChange={(e) => this.setState({ ...this.state, name: e.target.value})} />
                        </Form.Group>
                        <Form.Group>
                            <Form.TextArea
                                width='10'
                                label='Your ssh RSA key'
                                value={this.state.key}
                                cols='40'
                                rows='8'
                                onChange={(e) => this.setState({ ...this.state, key: e.target.value })}
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
                        onClick={this.addKey}
                        disabled={this.state.name === "" || this.state.key === ""}>
                        <Button.Content visible>
                            Add
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
