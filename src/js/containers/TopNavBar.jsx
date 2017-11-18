import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

class TopNavBar extends React.Component {
    constructor() {
        super();
    }
    render() {
        return (
            <Navbar inverse fixedTop collapseOnSelect fluid>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href='#'>PqSound</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavItem eventKey={1} href='#'>Link1</NavItem>
                        <NavItem eventKey={2} href='#'>Link2</NavItem>
                        <NavDropdown eventKey={3} title='Dropdown' id='basic-nav-dropdown'>
                            <MenuItem eventKey={3.1}>Action</MenuItem>
                            <MenuItem eventKey={3.2}>Another action</MenuItem>
                            <MenuItem eventKey={3.3}>Something strange might be here</MenuItem>
                            <MenuItem divider />
                            <MenuItem eventKey={3.4}>This thing shall be separated</MenuItem>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default TopNavBar;