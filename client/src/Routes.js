import React, { Component } from 'react';
import { Switch } from 'react-router-dom';

import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Dashboard from './Components/Dashboard/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import UnLoggedRoute from './Components/UnLoggedRoute/UnLoggedRoute';

import Cookies from 'universal-cookie';
import config from './Config.json';
import axios from 'axios';
import { Label } from 'semantic-ui-react';

import './Routes.css';

const cookie = new Cookies();

axios.defaults.baseURL = config.api_server;
document.title = config.project_name;

class Routes extends Component {

    constructor(props){
        super(props);
        this.setToken = this.setToken.bind(this);

        axios.interceptors.response.use(response => {
            if (["MISSING_TOKEN", "INVALID_TOKEN", "TOKEN_EXPIRED"].includes(response.data.status)) {
                this.setToken(undefined);
            }
            return response;
        }, error => {
            console.log(error);
            if (!error.status) {
                this.setState({
                    ...this.state,
                    error_message: "Network error, check your connectivity"
                }, () => setTimeout(() => {
                    this.setState({
                        ...this.state,
                        error_message: ""
                    });
                }, 3000))}
            else if (error.response.status === 500 || error.response.status === 401){
                this.setToken(undefined);
            }
        });

        axios.interceptors.request.use(request => {
            if (this.state.token) request.headers = {
                ...request.headers,
                'X-CSRF-TOKEN': this.state.token
            };
            console.log(request);
            return request;
        });

        this.state = {
            token: cookie.get('token'),
            error_message: ""
        }
    }

    setToken(t) {
        if (t) cookie.set('token', t, { expires: new Date(new Date().getTime() + 60 * 60 * 24 * 1000), path: '/' });
        else cookie.remove('token');
        
        this.setState({
            ...this.state,
            token: t
        });
    }

	render() {
		return (<div>
            {this.state.error_message ? <Label className='error_bar' horizontal color='red'>{this.state.error_message}</Label> : null}
			<Switch>
                <UnLoggedRoute token={this.state.token} setToken={this.setToken} exact path='/login' component={Login} />
                <UnLoggedRoute token={this.state.token} exact path='/registration' component={Register} />
                <ProtectedRoute token={this.state.token} setToken={this.setToken} path='*' component={Dashboard} />
			</Switch></div>
		);
	}
}

export default Routes;
