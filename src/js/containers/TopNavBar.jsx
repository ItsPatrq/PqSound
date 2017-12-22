import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { switchKeyboardVisibility, updateWidth, switchKeyNameVisibility, switchKeyBindVisibility } from 'actions/keyboardActions';
import { switchPianorollVisibility } from 'actions/compositionActions';
import * as Utils from 'engine/Utils';

class TopNavBar extends React.Component {
    constructor() {
        super();
        let that = this;
        window.addEventListener('keydown', function (e) {
            if (e.altKey) {
                switch (e.keyCode) {
                    case 80: {
                        that.handleSwitchKeyboardVisibility();
                        break;
                    }
                    case 78: {
                        that.handleSwitchKeyBindVisibility();
                        break;
                    }
                    case 66:{
                        that.handleSwitchKeyNameVisibility();
                        break;
                    }
                }
            }
        }, false);
    }

    handleSwitchKeyboardVisibility() {
        let ComposingCol = document.getElementById('ComposingCol');
        if (Utils.isNullOrUndefined(ComposingCol) && this.props.keyboardWidth !== 0) {
            this.props.dispatch(updateWidth(0));
        } else if (ComposingCol.offsetWidth !== this.props.keyboardWidth) {
            this.props.dispatch(updateWidth(ComposingCol.offsetWidth));
        }
        this.props.dispatch(switchKeyboardVisibility());
    }

    handleSwitchKeyNameVisibility(){
        this.props.dispatch(switchKeyNameVisibility());
    }

    handleSwitchKeyBindVisibility(){
        this.props.dispatch(switchKeyBindVisibility());
    }

    /**
     * TODO: Removed region
     */
    handleSwitchPianoRollVisibility() {
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
        let showHideKeyNames = this.props.keyNamesVisible ? 'Hide key names' : 'Show key names';
        let showHideBindNames = this.props.keyBindVisible ? 'Hide key bindings' : 'Show key bindings';
        let showHideKeyNamesMenuItem = this.props.keyboardVisible ?
        <MenuItem eventKey={3.2} onClick={() => this.handleSwitchKeyNameVisibility()}>{showHideKeyNames}</MenuItem> :
        null;
        let showHideBindNamesMenuItem = this.props.keyboardVisible ?
        <MenuItem eventKey={3.3} onClick={() => this.handleSwitchKeyBindVisibility()}>{showHideBindNames}</MenuItem> :        
        null;
        let showHidePianoroll = this.props.pianoRollVisible ? 'Hide pianoroll' : 'Show pianoroll';
        let showHidePianorollMenuItem = !Utils.isNullOrUndefined(this.props.pianoRollRegion) ?
        <MenuItem eventKey={3.4} onClick={() => this.handleSwitchPianoRollVisibility()}>{showHidePianoroll}</MenuItem> :
        null;

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
                            <MenuItem eventKey={3.1} onClick={() => this.handleSwitchKeyboardVisibility()}>{showHideKeyboard}</MenuItem>
                            {showHideKeyNamesMenuItem}
                            {showHideBindNamesMenuItem}
                            {showHidePianorollMenuItem}
                            <MenuItem eventKey={3.5}>Something strange might be here</MenuItem>
                            <MenuItem divider />
                            <MenuItem eventKey={3.6}>This thing shall be separated</MenuItem>
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
        keyNamesVisible: state.keyboard.keyNamesVisible,
        keyBindVisible: state.keyboard.keyBindVisible,
        keyboardWidth: state.keyboard.width,
        keyboardFirstKey: state.keyboard.firstKey,
        pianoRollVisible: state.composition.showPianoRoll,
        pianoRollRegion: state.composition.pianoRollRegion
    }
}

export default connect(mapStateToProps)(TopNavBar);