import React, {Component} from 'react';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react';


class Login extends Component {

    constructor(props){
        super(props);
        this.login = this.login.bind(this);
    }

    login(){
        /*
            implement call to API to log in and get the token.
        */
        
        this.props.setUserState({
            logged: true,
            token: "provaprova"
        });
    }

    render() {
        return <Segment textAlign='center' verticalAlign='middle'>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={5}/>
                    <Grid.Column width={6}>
                        <Header as='h2' color='teal' textAlign='center'>
                            Log-in to your account
                        </Header>
                        <Form size='large'>
                            <Segment stacked>
                                <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address' />
                                <Form.Input fluid icon='lock' iconPosition='left' placeholder='Password' type='password'/>
                                <Button color='teal' fluid size='large' onClick={this.login}>
                                    Login
                                </Button>
                            </Segment>
                        </Form>
                    </Grid.Column>
                    <Grid.Column width={5}/>
                </Grid.Row>
            </Grid>
        </Segment>
    }
}

export default Login;