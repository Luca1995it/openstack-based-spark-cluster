import React from 'react'
import { Route, Redirect } from 'react-router-dom'

const UnLoggedRoute = ({ component: Component, ...rest }) => (

    <Route {...rest} render={(props) => {
        return rest.token ? <Redirect to='/dashboard' /> : <Component {...rest} />; 
    }} />

);

export default UnLoggedRoute;
