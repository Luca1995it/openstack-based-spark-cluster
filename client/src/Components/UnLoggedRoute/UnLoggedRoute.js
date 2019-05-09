import React from 'react';
import {Route, Redirect} from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => (

	<Route {...rest} render={
        () => { return !rest.token ? <Component {...rest} /> : <Redirect to='/dashboard' />}
    } />

);

export default ProtectedRoute;
