import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';

import axios from 'axios';
import Routes from './Routes';
import config from './Config.json';

axios.defaults.baseURL = config.api_server;
document.title = config.project_name;

ReactDOM.render(
    <Router>
        <Routes />
    </Router>
, document.getElementById('root'));
