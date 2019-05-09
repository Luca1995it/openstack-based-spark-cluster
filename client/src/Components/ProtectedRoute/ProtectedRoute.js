import React from 'react';
import {Route, Redirect} from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => (

    <Route {...rest} render={(props) => {
        return rest.token ? <Component {...rest} /> : <Redirect to={{pathname: '/login', state: props.location.pathname }} />
    }} />

);

export default ProtectedRoute;
