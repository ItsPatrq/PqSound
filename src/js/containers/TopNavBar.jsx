import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { switchKeyboardVisibility } from 'actions/keyboardActions';
import { switchPianorollVisibility } from 'actions/compositionActions';
import * as Utils from 'engine/Utils';

class TopNavBar extends React.Component {
    constructor() {
        super();
    }

    switchKeyboardVisibility() {
        this.props.dispatch(switchKeyboardVisibility());
    }

    switchPianoRollVisibility() {
        this.props.dispatch(switchPianorollVisibility());
    }

    homeClicked() {
        if(this.props.keyboardVisible){
            this.props.dispatch(switchKeyboardVisibility(false));
        }
        if(this.props.pianoRollVisible){
            this.props.dispatch(switchPianorollVisibility(false));
        }
        
    }

    render() {
        let showHideKeyboard = this.props.keyboardVisible ? 'Hide keyboard' : 'Show keyboard';
        let showHidePianoroll = this.props.pianoRollVisible ? 'Hide pianoroll' : 'Show pianoroll';
        if(Utils.isNullOrUndefined(this.props.pianoRollRegion)){
            showHidePianoroll = null;
        }
        return (
            <Navbar inverse fixedTop collapseOnSelect fluid>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a onClick={() => this.homeClicked()}>PqSound</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavItem eventKey={1} onClick={() => this.homeClicked()}>Home</NavItem>
                        <NavItem eventKey={2} href='#'>About</NavItem>
                        <NavDropdown eventKey={3} title='Show' id='basic-nav-dropdown'>
                            <MenuItem eventKey={3.1} onClick={() => this.switchKeyboardVisibility()}>{showHideKeyboard}</MenuItem>
                            <MenuItem eventKey={3.2} onClick={() => this.switchPianoRollVisibility()}>{showHidePianoroll}</MenuItem>
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
        keyboardVisible: state.keyboard.show,
        pianoRollVisible: state.composition.showPianoRoll,
        pianoRollRegion: state.composition.pianoRollRegion
    }
}

export default connect(mapStateToProps)(TopNavBar);