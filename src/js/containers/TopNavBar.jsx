import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { switchKeyboardVisibility } from 'actions/keyboardActions';
import { hidePianoRoll } from 'actions/compositionActions';

class TopNavBar extends React.Component {
    constructor() {
        super();
    }

    switchKeyboardVisibility() {
        this.props.dispatch(switchKeyboardVisibility());
    }

    switchPianoRollVisibility() {
        this.props.dispatch(hidePianoRoll());
    }

    render() {
        let showHideKeyboard = this.props.keyboardVisible ? 'Hide keyboard' : 'Show keyboard';
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
                        <NavItem eventKey={1} href='#'>Home</NavItem>
                        <NavItem eventKey={2} href='#'>About</NavItem>
                        <NavDropdown eventKey={3} title='Show' id='basic-nav-dropdown'>
                            <MenuItem eventKey={3.1} onClick={() => this.switchKeyboardVisibility()}>{showHideKeyboard}</MenuItem>
                            <MenuItem eventKey={3.2} onClick={() => this.switchPianoRollVisibility()}>Hide Piano Roll</MenuItem>
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

//REDUX connection
const mapStateToProps = (state) => {
    return {
        keyboardVisible: state.keyboard.show
    }
}

export default connect(mapStateToProps)(TopNavBar);