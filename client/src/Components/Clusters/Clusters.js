import React, { Component } from 'react'
import { Header, Loader, Divider } from 'semantic-ui-react'

import './Clusters.css';

class Clusters extends Component {

    state = {
        isLoading: false
    }

    constructor(props) {
        super(props);
    }

    render() {
        if (this.state.isLoading) return <Loader active inline='centered' />

        return (
            <div className='homeContainer'>
                <div className="homeSubContainer">
                    <Header size='medium'>Apache Spark Cluster Manager</Header>
                    <Divider />

                    <div className='homeAdvices'>
                        {'There are 4 clusters running!'}
                    </div>
                </div>
            </div>
        )
    }
}

export default Clusters;