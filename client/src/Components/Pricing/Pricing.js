import React, { Component } from 'react';
import { Header, Button, Grid, Segment } from 'semantic-ui-react';
import './Pricing.css';

class Pricing extends Component {

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


/*
class Home extends Component {

    render (){
        return <Container text>
            <Header
                as='h1'
                content='Imagine-a-Company'
                inverted
                className='header1'
            />
            <Header
                as='h2'
                content='Do whatever you want when you want to.'
                inverted
                className='header2'
            />
            <Button primary size='huge'>
                Get Started
            </Button>
        </Container>
    }
}*/

export default Pricing;
