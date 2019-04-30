import React, { Component } from 'react';
import { Grid, Segment, List, Container, Header } from 'semantic-ui-react';
import './Footer.css';

class Footer extends Component {

    render() {
        return (
            <Segment inverted vertical>
                <Container className='footer-segment-style'>
                    <Grid divided inverted stackable>
                        <Grid.Row>
                            <Grid.Column width={8}>
                                <Header inverted as='h4' content='What' />
                                <List link inverted>
                                    <List.Item >Apache Spark Cluster Manager</List.Item>
                                    <List.Item >Based on OpenStack framework</List.Item>
                                </List>
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <Header inverted as='h4' content='Who' />
                                <List link inverted>
                                    <List.Item >Developed by Luca Di Liello & Andrea Zampieri</List.Item>
                                    <List.Item >@ University of Trento</List.Item>
                                </List>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Container>
            </Segment>
        );
    }
}

export default Footer;
