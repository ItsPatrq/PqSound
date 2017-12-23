import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import TrackCompositionRow from 'components/CompositionGrid/TrackCompositionRow';
import PianoRoll from 'components/CompositionGrid/PianoRoll';
import TimeBar from 'components/CompositionGrid/TimeBar';
import PianoRollKeyboard from 'components/CompositionGrid/PianoRollKeyboard';
import { showPianoRoll, addRegion, removeRegion, addNote, removeNote } from 'actions/compositionActions';
import { getRegionIdByBitIndex, getRegionByRegionId } from 'engine/CompositionParser';
import { tools, SoundOrigin } from 'constants/Constants'
import {getTrackByIndex} from 'engine/Utils';
import * as KeyboardActions from 'actions/keyboardActions';
class CompositionGrid extends React.Component {
    constructor() {
        super();
    }

    handleEmptyBitClicked(trackIndex, bitIndex, bitsToDraw) {
        switch (this.props.selectedTool) {
            case tools.draw.id: {
                let canDraw = true;
                for (let i = 0; i < this.props.regionDrawLength; i++) {
                    if (bitsToDraw[bitIndex + i] || bitIndex + i >= this.props.composition.bitsInComposition) {
                        canDraw = false;
                        break;
                    }
                }
                if (canDraw) {
                    this.props.dispatch(addRegion(trackIndex, bitIndex, this.props.regionDrawLength));
                }
                break;
            }
        }
    }

    handleRegionClicked(trackIndex, bitIndex) {
        let regionIndex = getRegionIdByBitIndex(trackIndex, bitIndex);
        switch (this.props.selectedTool) {
            case tools.select.id: {
                this.props.dispatch(showPianoRoll(trackIndex, regionIndex));
                break;
            }
            case tools.remove.id: {
                this.props.dispatch(removeRegion(regionIndex));
                break;
            }
        }
    }

    handleNoteClicked(noteNumber, sixteenthNumber, notesToDraw) {
        let noteLength;
        switch (this.props.noteDrawLength) {
            case 0: {
                noteLength = 16;
                break;
            } case 1: {
                noteLength = 8;
                break;
            } case 2: {
                noteLength = 4;
                break;
            } case 3: {
                noteLength = 2;
                break;
            } case 4: {
                noteLength = 1;
                break;
            }
        }
        switch (this.props.selectedTool) {
            case tools.draw.id: {
                let canDraw = sixteenthNumber + noteLength <= notesToDraw.length ? true : false;
                for (let i = 0; i < noteLength && canDraw; i++) {
                    if (notesToDraw[sixteenthNumber + i]) {
                        canDraw = false;
                    }
                }
                if (canDraw) {
                    this.props.dispatch(addNote(this.props.composition.pianoRollRegion, noteNumber, sixteenthNumber, noteLength));
                }
                break;
            }
            case tools.remove.id: {
                if (notesToDraw[sixteenthNumber]) {
                    this.props.dispatch(removeNote(this.props.composition.pianoRollRegion, noteNumber, sixteenthNumber, noteLength));
                }
                break;
            }
        }
    }

    handleUp(event, note) {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        if (this.props.keyboard.notesPlaying.includes(note)) {
            let currTrackIndex = getRegionByRegionId(this.props.composition.pianoRollRegion, this.props.composition.regionList).trackIndex;
            this.props.sound.stop(currTrackIndex, note)
            this.props.dispatch(KeyboardActions.removePlayingNote(note));
        }
        return false;
    }

    handleDown(event, note) {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        if (event.buttons == 1 &&  //leftClick
            !this.props.keyboard.notesPlaying.includes(note)) {
            let currTrackIndex = getRegionByRegionId(this.props.composition.pianoRollRegion, this.props.composition.regionList).trackIndex;
            this.props.sound.play(currTrackIndex, null, note, SoundOrigin.pianoRollNote)
            this.props.dispatch(KeyboardActions.addPlayingNote(note))
        }
        return false;
    }

    render() {
        let trackCompositionRowList = new Array;
        let pianoRoll;
        if (this.props.composition.showPianoRoll) {
            let currRegion = getRegionByRegionId(this.props.composition.pianoRollRegion, this.props.composition.regionList);
            let bitsNumber = currRegion.regionLength;
            let currTrackIndex = currRegion.trackIndex;
            return (
                <Col xs={12} className="nopadding compositionPanelPianoRoll">
                    <PianoRollKeyboard
                        instrument={getTrackByIndex(this.props.trackList, currTrackIndex).instrument}
                        onDown={this.handleDown.bind(this)}
                        onUp={this.handleUp.bind(this)}
                    />
                    <PianoRoll bitsNumber={bitsNumber} onNoteClick={this.handleNoteClicked.bind(this)} />
                </Col>
            );
        } else {
            /**
             * start iteration from i = 1 because i = 0 is the master track
             */
            for (let i = 1; i < this.props.trackList.length; i++) {
                trackCompositionRowList.push(<TrackCompositionRow
                    bits={this.props.composition.bitsInComposition}
                    key={this.props.trackList[i].index}
                    trackIndex={this.props.trackList[i].index}
                    trackType={this.props.trackList[i].trackType}
                    onEmptyBitClick={this.handleEmptyBitClicked.bind(this)}
                    onRegionClick={this.handleRegionClicked.bind(this)}
                />)
            }
            trackCompositionRowList.sort((a,b) => {return a.props.trackIndex - b.props.trackIndex});
            return (
                <Col xs={10} className="nopadding compositionPanel">
                        <TimeBar bits={this.props.composition.bitsInComposition} />
                        <div className="compositionRowList">
                            {trackCompositionRowList}
                        </div>
                </Col>
            );
        }
    }
}

//REDUX connection
const mapStateToProps = (state) => {
    return {
        trackList: state.tracks.trackList,
        composition: state.composition,
        selectedTool: state.control.tool,
        regionDrawLength: state.control.regionDrawLength,
        noteDrawLength: state.control.noteDrawLength,
        keyboard: state.keyboard,
        sound: state.webAudio.sound
    }
}

export default connect(mapStateToProps)(CompositionGrid);