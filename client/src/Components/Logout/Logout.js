import React, {Component} from 'react';
import { Button, Grid, Header, Segment } from 'semantic-ui-react';


class Logout extends Component {

    render() {
        return <Segment textAlign='center'>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={5}/>
                    <Grid.Column width={6}>
                        <Header as='h2' color='teal' textAlign='center'>
                            Logout
                        </Header>
                        <Button color='teal' fluid size='large' onClick={() => this.props.setToken(undefined)}>
                            Logout
                        </Button>
                    </Grid.Column>
                    <Grid.Column width={5}/>
                </Grid.Row>
            </Grid>
        </Segment>
    }
}

export default Logout;