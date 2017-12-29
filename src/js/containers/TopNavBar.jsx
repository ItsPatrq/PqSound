import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { switchKeyboardVisibility, updateWidth, switchKeyNameVisibility, switchKeyBindVisibility } from 'actions/keyboardActions';
import { switchPianorollVisibility, loadCompositionState } from 'actions/compositionActions';
import { switchAltKey, switchUploadModalVisibility, loadControlState } from 'actions/controlActions'
import { loadTrackState } from 'actions/trackListActions';
import * as Utils from 'engine/Utils';
import FileUploadModal from 'components/FileUploadModal';

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
                    case 66: {
                        that.handleSwitchKeyNameVisibility();
                        break;
                    }
                    case 18: {
                        that.props.dispatch(switchAltKey());
                    }
                }
            }
        }, false);
        window.addEventListener('keyup', function (e) {
            switch (e.keyCode) {
                case 18: {
                    that.props.dispatch(switchAltKey());
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

    handleSwitchKeyNameVisibility() {
        this.props.dispatch(switchKeyNameVisibility());
    }

    handleSwitchKeyBindVisibility() {
        this.props.dispatch(switchKeyBindVisibility());
    }

    /**
     * TODO: Removed region
     */
    handleSwitchPianoRollVisibility() {
        this.props.dispatch(switchPianorollVisibility());
    }

    homeClicked() {
        if (this.props.keyboardVisible) {
            this.props.dispatch(switchKeyboardVisibility(false));
        }
        if (this.props.pianoRollVisible) {
            this.props.dispatch(switchPianorollVisibility(false));
        }
    }

    getExportData() {
        let tempControl = { ...this.props.control };
        delete tempControl['midiController'];
        delete tempControl['sequencer'];
        let obj = {
            tracks: this.props.tracks,
            control: tempControl,
            composition: this.props.composition
        };
        console.log(obj)

        return encodeURIComponent(JSON.stringify(obj));
    }

    import() {
        let fileInput = document.getElementById('fileUpload');
        console.log(fileInput)
        fileInput.click();
    }

    export() {
        let linkElement = document.createElement('a');
        let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(this.getExportData());

        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'PqSoundComposition.json');
        linkElement.click();
    }

    fileUploadModalVisibilitySwitch() {
        this.props.dispatch(switchUploadModalVisibility())
    }

    handleFileUpload(accepted, rejected){
        if(accepted.length > 0){
            const reader = new FileReader();
            reader.onload = () => {
                const fileAsBinaryString = reader.result;
                let loadedState = JSON.parse(decodeURIComponent(fileAsBinaryString));
                this.props.dispatch(loadTrackState(loadedState.tracks));
                this.props.dispatch(loadControlState(loadedState.control));
                this.props.dispatch(loadCompositionState(loadedState.composition))
            };
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
    
            reader.readAsBinaryString(accepted[0]);    
        } else {
            console.log('rejected')
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
                        </NavDropdown>
                        <NavItem eventKey={4} onClick={this.fileUploadModalVisibilitySwitch.bind(this)}>
                            Import
                        </NavItem>
                        <NavItem eventKey={5} onClick={this.export.bind(this)}>Export</NavItem>
                        <NavItem eventKey={6} >Load demo</NavItem>
                    </Nav>
                </Navbar.Collapse>
                <FileUploadModal
                    showModal={this.props.control.showUploadModal}
                    modalVisibilitySwitch={this.fileUploadModalVisibilitySwitch.bind(this)}
                    onFileUpload={this.handleFileUpload.bind(this)}
                />
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
        pianoRollRegion: state.composition.pianoRollRegion,
        composition: state.composition,
        tracks: state.tracks,
        control: state.control
    }
}

export default connect(mapStateToProps)(TopNavBar);