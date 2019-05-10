import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';

import {Container} from 'semantic-ui-react';

import './Dashstyle.css';
import Navbar from '../Navbar/Navbar';
import Home from '../Home/Home';
import Clusters from '../Clusters/Clusters';
import Pricing from '../Pricing/Pricing';
import SshPairs from '../SshPairs/SshPairs';

class Dashboard extends Component {

    render() {
        return (
            <div className='container'>
                <Navbar {...this.props} />
                <Container className='innerContainer'>
                    <Switch>
                        <Route path='/dashboard/clusters' component={Clusters} />
                        <Route path='/dashboard/pricing' component={Pricing} />
                        <Route path='/dashboard/sshpairs' component={SshPairs} />
                        <Route path='/dashboard*' component={Home} />
                    </Switch>
                </Container>
            </div>
        );
    }
}

export default Dashboard;