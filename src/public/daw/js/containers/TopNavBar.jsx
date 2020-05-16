import * as React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import {
    switchKeyboardVisibility,
    updateWidth,
    switchKeyNameVisibility,
    switchKeyBindVisibility,
} from 'actions/keyboardActions';
import { switchPianorollVisibility, loadCompositionState } from 'actions/compositionActions';
import {
    switchAltKey,
    switchUploadModalVisibility,
    switchAboutModalVisibility,
    loadControlState,
} from 'actions/controlActions';
import { loadTrackState, updateAllTrackNodes } from 'actions/trackListActions';
import * as Utils from 'engine/Utils';
import FileUploadModal from 'components/FileUploadModal';
import AboutModal from 'components/AboutModal';
import { TrackTypes } from 'constants/Constants';
import { fetchSamplerInstrument } from 'actions/webAudioActions';
import Demo from 'constants/Demo';

class TopNavBar extends React.Component {
    constructor() {
        super();
        window.addEventListener(
            'keydown',
            ((that) => (e) => {
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
                            if (!that.props.control.altClicked) {
                                that.props.dispatch(switchAltKey());
                            }
                        }
                    }
                }
            })(this),
            false,
        );
        window.addEventListener(
            'keyup',
            function (e) {
                switch (e.keyCode) {
                    case 18: {
                        that.props.dispatch(switchAltKey());
                    }
                }
            },
            false,
        );
    }

    handleSwitchKeyboardVisibility() {
        const ComposingCol = document.getElementById('ComposingCol');
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
        const tempControl = Utils.copy(this.props.control);
        delete tempControl['midiController'];
        delete tempControl['sequencer'];
        const tempTracks = Utils.copy(this.props.tracks);
        for (let i = 0; i < tempTracks.trackList.length; i++) {
            delete tempTracks.trackList[i]['trackNode'];
            if (tempTracks.trackList.trackType === TrackTypes.virtualInstrument) {
                tempTracks.trackList[i].instrument = {
                    preset: tempTracks.trackList[i].instrument.preset,
                    id: tempTracks.trackList[i].instrument.id,
                    index: tempTracks.trackList[i].instrument.index,
                };
            }
            for (let j = 0; j < tempTracks.trackList[i].pluginList.length; j++) {
                tempTracks.trackList[i].pluginList[j] = {
                    preset: tempTracks.trackList[i].pluginList[j].preset,
                    id: tempTracks.trackList[i].pluginList[j].id,
                    index: tempTracks.trackList[i].pluginList[j].index,
                };
            }
        }
        const obj = {
            tracks: tempTracks,
            control: tempControl,
            composition: this.props.composition,
        };

        return encodeURIComponent(JSON.stringify(obj));
    }

    export() {
        const linkElement = document.createElement('a');
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(this.getExportData());

        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'PqSoundComposition.json');
        linkElement.click();
    }

    fileUploadModalVisibilitySwitch() {
        this.props.dispatch(switchUploadModalVisibility());
    }

    aboutModalVisibilitySwitch() {
        this.props.dispatch(switchAboutModalVisibility());
    }

    loadDemo() {
        this.loadComposition(Demo);
    }

    loadComposition(binaryString) {
        const loadedState = JSON.parse(decodeURIComponent(binaryString));
        this.props.dispatch(loadTrackState(loadedState.tracks));
        this.props.dispatch(loadControlState(loadedState.control));
        this.props.dispatch(loadCompositionState(loadedState.composition));
        this.props.dispatch(updateAllTrackNodes());
        /**
         * loading all required samples
         */
        for (let i = 1; i < loadedState.tracks.trackList.length; i++) {
            if (loadedState.tracks.trackList[i].trackType === TrackTypes.virtualInstrument) {
                for (let j = 0; j < this.props.samplerInstruments.length; j++) {
                    if (
                        loadedState.tracks.trackList[i].instrument.id === 0 &&
                        this.props.samplerInstruments[j].id === loadedState.tracks.trackList[i].instrument.preset.id
                    ) {
                        if (!this.props.samplerInstruments[j].loaded && !this.props.samplerInstruments[j].fetching) {
                            this.props.dispatch(
                                fetchSamplerInstrument(loadedState.tracks.trackList[i].instrument.preset.id),
                            );
                        }
                    }
                }
            }
        }
    }

    handleFileUpload(accepted, rejected) {
        if (accepted.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                const fileAsBinaryString = reader.result;
                this.loadComposition(fileAsBinaryString);
            };
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');

            reader.readAsBinaryString(accepted[0]);
        }
        if (rejected.length > 0) {
            console.log(rejected);
        }
    }

    render() {
        const showHideKeyboard = this.props.keyboardVisible ? 'Hide Keyboard' : 'Show Keyboard';
        const showHideKeyNames = this.props.keyNamesVisible ? 'Hide key names' : 'Show key names';
        const showHideBindNames = this.props.keyBindVisible ? 'Hide key bindings' : 'Show key bindings';
        const showHideKeyNamesMenuItem = this.props.keyboardVisible ? (
            <MenuItem eventKey={3.2} onClick={() => this.handleSwitchKeyNameVisibility()}>
                {showHideKeyNames}
            </MenuItem>
        ) : null;
        const showHideBindNamesMenuItem = this.props.keyboardVisible ? (
            <MenuItem eventKey={3.3} onClick={() => this.handleSwitchKeyBindVisibility()}>
                {showHideBindNames}
            </MenuItem>
        ) : null;
        const showHidePianoroll = this.props.pianoRollVisible ? 'Hide Piano Roll' : 'Show Piano Roll';
        const showHidePianorollMenuItem = !Utils.isNullOrUndefined(this.props.pianoRollRegion) ? (
            <MenuItem eventKey={3.4} onClick={() => this.handleSwitchPianoRollVisibility()}>
                {showHidePianoroll}
            </MenuItem>
        ) : null;

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
                        <NavItem eventKey={1} onClick={() => this.homeClicked()}>
                            Home
                        </NavItem>
                        <NavItem eventKey={2} onClick={this.aboutModalVisibilitySwitch.bind(this)}>
                            About
                        </NavItem>
                        <NavDropdown eventKey={3} title="Show" id="basic-nav-dropdown">
                            <MenuItem eventKey={3.1} onClick={() => this.handleSwitchKeyboardVisibility()}>
                                {showHideKeyboard}
                            </MenuItem>
                            {showHideKeyNamesMenuItem}
                            {showHideBindNamesMenuItem}
                            {showHidePianorollMenuItem}
                        </NavDropdown>
                        <NavItem eventKey={4} onClick={this.fileUploadModalVisibilitySwitch.bind(this)}>
                            Import
                        </NavItem>
                        <NavItem eventKey={5} onClick={this.export.bind(this)}>
                            Export
                        </NavItem>
                        <NavItem eventKey={6} onClick={this.loadDemo.bind(this)}>
                            Load demo
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
                <FileUploadModal
                    showModal={this.props.control.showUploadModal}
                    modalVisibilitySwitch={this.fileUploadModalVisibilitySwitch.bind(this)}
                    onFileUpload={this.handleFileUpload.bind(this)}
                />
                <AboutModal
                    showModal={this.props.control.showAboutModal}
                    modalVisibilitySwitch={this.aboutModalVisibilitySwitch.bind(this)}
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
        control: state.control,
        samplerInstruments: state.webAudio.samplerInstrumentsSounds.map((value) => {
            return { name: value.name, loaded: value.loaded, id: value.id, fetching: value.fetching };
        }),
    };
};

export default connect(mapStateToProps)(TopNavBar);
