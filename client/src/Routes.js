import React, { Component } from 'react';
import { Switch } from 'react-router-dom';
import Cookies from 'universal-cookie';

import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Dashboard from './Components/Dashboard/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import UnLoggedRoute from './Components/UnLoggedRoute/UnLoggedRoute';

class Routes extends Component {

	constructor(props){
        super(props);
        this.setToken = this.setToken.bind(this);

        this.cookies = new Cookies();
        let token = this.cookies.get('token');

        this.state = {
            token: token ? token : undefined,
        }
    }
    
    setToken(token){
        this.setState({
            ...this.state,
            token: token
        });
        if (token) this.cookies.set('token', token, { expires: new Date(new Date().getTime() + 60 * 60 * 24 * 1000), path: '/' });
        else this.cookies.remove('token');
    }

	render() {
		return (
			<Switch>
                <UnLoggedRoute token={this.state.token} setToken={this.setToken} exact path='/login' component={Login} />
                <UnLoggedRoute token={this.state.token} setToken={this.setToken} exact path='/registration' component={Register} />
                <ProtectedRoute token={this.state.token} setToken={this.setToken} path='*' component={Dashboard} />
			</Switch>
		);
	}
}

export default Routes;
