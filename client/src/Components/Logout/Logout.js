import React, {Component} from 'react';
import { Button, Form, Grid, Header, Segment } from 'semantic-ui-react';


class Logout extends Component {

    constructor(props){
        super(props);
        this.logout = this.logout.bind(this);
    }

    logout(){
        /*
            implement call to API to log in and get the token.
        */
        
        this.props.setUserState({
            logged: false,
            token: undefined
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
                                
                            <Button color='teal' fluid size='large' onClick={this.logout}>
                                Logout
                            </Button>

                        </Form>
                    </Grid.Column>
                    <Grid.Column width={5}/>
                </Grid.Row>
            </Grid>
        </Segment>
    }
}

export default Logout;