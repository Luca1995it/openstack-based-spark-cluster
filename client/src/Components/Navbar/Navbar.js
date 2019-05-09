import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import { Menu, Button, List } from 'semantic-ui-react';

import './NavbarStyle.css';

export default class Navbar extends Component {

	constructor(props){
		super(props);
		const path = props.location.pathname.split('/')
		this.state = {
			activeItem: (path[2] || 'home'),
			hovering: false
        }
	}

	hovering(name){
		this.setState({
			...this.state,
			hovering: name
		});
	}

	unhovering(){
		this.setState({
			...this.state,
			hovering: false
		});
	}

	componentWillReceiveProps(nextProps){
		const path = nextProps.location.pathname.split('/')
		switch (path[2]) {
			case 'clusters':{
				this.setState({
					...this.state,
					activeItem: 'clusters'
				});
				break;
			}

			case 'pricing':{
				this.setState({
					...this.state,
					activeItem: 'pricing'
				})
				break;
			}

			case 'contacts':{
				this.setState({
					...this.state,
					activeItem: 'contacts'
				})
				break;
			}

			default:{
				this.setState({
					...this.state,
					activeItem: 'home'
				})
				break;
			}
		}
	}

	render(){
		return (
			<Menu vertical stackable className='navbar' id='sidenav'>
				<Menu.Item
					name='home'
					as={Link}
					to={'/dashboard'}
					active={this.state.activeItem === 'home'}
					className='noSubItem'
					>
					<span className='navText'>Home</span>
				</Menu.Item>

                <Menu.Item
					name='clusters'
					as={Link}
					to={'/dashboard/clusters'}
					active={this.state.activeItem === 'clusters'}
					className='noSubItem'
					>
					<span className='navText'>Clusters</span>
				</Menu.Item>

                <Menu.Item
					name='pricing'
					as={Link}
					to={'/dashboard/pricing'}
					active={this.state.activeItem === 'pricing'}
					className='noSubItem'
					>
					<span className='navText'>Pricing</span>
				</Menu.Item>

                <Menu.Item
					name='contacts'
					as={Link}
					to={'/dashboard/contacts'}
					active={this.state.activeItem === 'contacts'}
					className='noSubItem'
					>
					<span className='navText'>Contacts</span>
				</Menu.Item>

				<Menu.Item className='sign'>
					<Button className='logoutButton' fluid basic onClick={()=>this.props.setToken(undefined)}><span>Logout</span></Button>
					<br />
                    <List link inverted>
                        <List.Item >Apache Spark Cluster Manager</List.Item>
                        <List.Item >Based on OpenStack framework</List.Item>
                    </List>
					<br />
                    <List link inverted>
                        <List.Item >Developed by Luca Di Liello & Andrea Zampieri</List.Item>
                        <List.Item >@ University of Trento</List.Item>
                    </List>
				</Menu.Item>
			</Menu>
		)
	}
}
