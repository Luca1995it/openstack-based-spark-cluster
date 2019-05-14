import React, { Component } from 'react'
import { Header, Loader, Divider, Segment } from 'semantic-ui-react'
import axios from 'axios';
import './Home.css';

export default class Home extends Component {

    state = {
        isLoading: false,
        clusters_num: [],
        flavors_num: [],
        keys_num: []
    }

    componentDidMount(){
        this.setState({
            ...this.state,
            modalOpen: true,
            cluster: {
                ...this.state.cluster,
                flavors: []
            }
        }, () => {
            let requests = [axios.get('/api/cluster'), axios.get('/api/flavor'), axios.get('/api/sshpair')];
            axios.all(requests).then(res => 
                this.setState({
                    ...this.state,
                    clusters_num: res[0].data.cluster.length,
                    flavors_num: res[1].data.flavor.length,
                    keys_num: res[2].data.sshpair.length
                })).catch(err => {
                console.log(err);
                this.setState({
                    ...this.state,
                    clusters_num: "data unavailable",
                    flavors_num: "data unavailable",
                    keys_num: "data unavailable"
                });
            })
        });
    }

    render() {
        if (this.state.isLoading) return <Loader active inline='centered' />

        return (
            <div className='homeContainer'>
                <div className="homeSubContainer">
                    <Header size='medium'>Apache Spark Cluster Manager</Header>
                    <Divider />

                    <div className='homeAdvices'>
                        <Segment>
                            {`You have ${this.state.clusters_num} clusters running!`}
                        </Segment>
                        <Segment>
                            {`You registered ${this.state.keys_num} SSH keys!`}
                        </Segment>
                        <Segment>
                            {`There are ${this.state.flavors_num} different slave nodes available! (Comprehending the master node)`}
                        </Segment>
                    </div>
                </div>
            </div>
        )
    }
}
