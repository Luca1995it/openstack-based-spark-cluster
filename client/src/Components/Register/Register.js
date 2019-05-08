import React, { Component } from 'react';
import { Button, Form, Grid, Header, Label, Segment } from 'semantic-ui-react';
import axios from 'axios';

class Register extends Component {

    state = {
        message: "",
        username: "",
        password: "",
        email: "",
        isLoading: false,
        error: false
    }

    constructor(props) {
        super(props);
        this.register = this.register.bind(this);
    }

    register() {
        this.setState({
            ...this.state,
            isLoading: true
        }, () => {
            axios.post('/api/register', {
                username: this.state.username,
                password: this.state.password,
                email: this.state.email
            })
                .then(res => {
                    console.log(res);
                    let result = res.data;

                    switch (result.status) {
                        case "OK":
                            this.props.setToken(result.token);
                            break;
                        case "MALFORMED_JSON":
                        case "MISSING_AUTH_PARAMS":
                        case "WRONG_AUTH_PARAMS":
                        default:
                            this.setState({
                                ...this.state,
                                message: result.message,
                                error: true
                            }, () => setTimeout(() => {
                                this.setState({
                                    ...this.state,
                                    message: undefined,
                                    error: false
                                });
                            }, 3000));
                            break;
                    }
                })
                .catch(err => {
                    console.log(err);
                    this.setState({
                        ...this.state,
                        message: "Internal Error",
                        error: true
                    }, () => setTimeout(() => {
                        this.setState({
                            ...this.state,
                            message: undefined,
                            error: false
                        });
                    }, 3000));
                });
        })

    }

    render() {
        return <Segment textAlign='center'>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={5} />
                    <Grid.Column width={6}>
                        <Header as='h2' color='teal' textAlign='center'>
                            Log-in to your account
                        </Header>
                        {this.state.message ? <Label color='red'>{this.state.message}</Label> : null}
                        <Form size='large'>
                            <Segment stacked>
                                <Form.Input
                                    fluid icon='user' iconPosition='left'
                                    placeholder='Username...' type='text'
                                    error={this.state.error}
                                    value={this.state.username}
                                    onChange={(e) => this.setState({ ...this.state, username: e.target.value })}
                                    size='big'
                                    onKeyPress={(e) => { return e.key === 'Enter' ? this.login() : null }} />

                                <Form.Input
                                    fluid icon='lock' iconPosition='left'
                                    placeholder='Password' type='password'

                                    error={this.state.error}
                                    value={this.state.password}
                                    onChange={(e) => this.setState({ ...this.state, password: e.target.value })}
                                    size='big'
                                    onKeyPress={(e) => { return e.key === 'Enter' ? this.login() : null }} />

                                <Button color='teal' fluid size='large' onClick={this.login} loading={this.state.isLoading}>
                                    Login
                                </Button>
                            </Segment>
                        </Form>
                    </Grid.Column>
                    <Grid.Column width={5} />
                </Grid.Row>
            </Grid>
        </Segment>
    }
}

export default Register;