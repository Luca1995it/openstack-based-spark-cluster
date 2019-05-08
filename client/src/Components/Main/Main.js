import React, { Component } from 'react'
import { Container, Menu, Responsive, Segment, Visibility, Label} from 'semantic-ui-react'
import Home from '../Home/Home';
import Login from '../Login/Login';
import Logout from '../Logout/Logout';
import Footer from '../Footer/Footer';
import Clusters from '../Clusters/Clusters';
import Pricing from '../Pricing/Pricing';
import Contacts from '../Contacts/Contacts';

const getWidth = () => {
    const isSSR = typeof window === 'undefined'
    return isSSR ? Responsive.onlyTablet.minWidth : window.innerWidth
}

class Main extends Component{

    state = {
        fixed: false,
        token: undefined,
        page: 'home'
    }

    constructor(props){
        super(props);
        this.setToken = this.setToken.bind(this);
        this.setPage = this.setPage.bind(this);
    }

    hideFixedMenu = () => this.setState({ fixed: false })
    showFixedMenu = () => this.setState({ fixed: true })

    setPage(page){
        this.setState({
            ...this.state,
            page: page
        });
    }

    setToken(token){
        this.setState({
            ...this.state,
            token: token
        }, () => {
            if(token){
                this.setPage('home')
            }
        });
    }

    render() {
        const { fixed } = this.state

        let child = null;
        switch (this.state.page) {
            case 'home':
                child = <Home />;
                break;

            case 'clusters':
                child = <Clusters />;
                break;
            
            case 'pricing':
                child = <Pricing />;
                break;
            
            case 'contacts':
                child = <Contacts />;
                break;

            case 'login':
                child = <Login setToken={this.setToken}/>;
                break;

            case 'logout':
                child = <Logout setToken={this.setToken}/>;
                break;

            default:
                child = <Home />;
                break;
        }

        return (
            <Responsive getWidth={getWidth} minWidth={Responsive.onlyTablet.minWidth}>
                <Visibility
                    once={false}
                    onBottomPassed={this.showFixedMenu}
                    onBottomPassedReverse={this.hideFixedMenu}>
                    <Segment
                        inverted
                        textAlign='center'
                        style={{ padding: '1em 0em' }}
                        vertical>
                        <Menu
                            fixed={fixed ? 'top' : null}
                            inverted={!fixed}
                            pointing={!fixed}
                            secondary={!fixed}
                            size='large'>
                            <Container>
                                <Menu.Item>
                                    <Label circular color='teal' size='medium'>
                                        Apache Spark Cluster Manager v1.0
                                    </Label>
                                </Menu.Item>
                                <Menu.Item as='a' active={this.state.page === 'home'} onClick={() => this.setPage('home')}>
                                    Home
                                </Menu.Item>
                                {this.state.logged ? 
                                    <Menu.Item as='a' active={this.state.page === 'clusters'} onClick={() => this.setPage('clusters')}>
                                        Clusters
                                    </Menu.Item> : null
                                }
                                <Menu.Item as='a' active={this.state.page === 'pricing'} onClick={() => this.setPage('pricing')}>
                                    Pricing
                                </Menu.Item>
                                <Menu.Item as='a' active={this.state.page === 'contacts'} onClick={() => this.setPage('contacts')}>
                                    Contacts
                                </Menu.Item>
                                {!this.state.logged ?
                                <Menu.Item position='right' as='a' active={this.state.page === 'login'} onClick={() => this.setPage('login')}>
                                    Log in
                                </Menu.Item> :
                                <Menu.Item position='right' as='a' active={this.state.page === 'logout'} onClick={() =>this.setPage('logout')}>
                                    Log out
                                </Menu.Item>}
                            </Container>
                        </Menu>
                    </Segment>
                </Visibility>
                
                {child}
                <Footer />
            </Responsive>
        );
    }
}

export default Main;