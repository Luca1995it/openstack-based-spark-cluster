import React, { Component } from 'react';
import { Header, Button, Grid, Segment } from 'semantic-ui-react';
import './Contacts.css';

class Contacts extends Component {

    render() {
        return <Segment className="pricing-text" vertical>
            <Grid container stackable verticalAlign='middle'>
                <Grid.Row>
                    <Header as='h3' style={{ fontSize: '2em' }}>
                        Pricing
                    </Header>
                    <p>
                        We can give your company superpowers to do things that they never thought possible.
                        Let us delight your customers and empower your needs... through pure data analytics.
                    </p>
                    <Header as='h3' style={{ fontSize: '2em' }}>
                        We Make Bananas That Can Dance
                    </Header>
                    <p style={{ fontSize: '1.33em' }}>
                        Yes that's right, you thought it was the stuff of dreams, but even bananas can be
                        bioengineered.
                    </p>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column textAlign='center'>
                        <Button size='huge'>Check Them Out</Button>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    }
}

export default Contacts;
