import React from 'react';
import { Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import TrackCompositionRow from 'components/CompositionGrid/TrackCompositionRow';
import PianoRoll from 'components/CompositionGrid/PianoRoll';
import { showPianoRoll, addRegion, removeRegion, addNote, removeNote } from 'actions/compositionActions';
import { getRegionIdByBitIndex, getRegionByRegionId } from 'engine/CompositionParser';
import {tools} from 'engine/Constants'

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
                if(notesToDraw[sixteenthNumber]){
                    this.props.dispatch(removeNote(this.props.composition.pianoRollRegion, noteNumber, sixteenthNumber, noteLength));
                }
                break;
            }
        }
    }

    render() {
        let trackCompositionRowList = new Array;
        let pianoRoll;
        if (this.props.composition.showPianoRoll) {
            let bitsNumber = getRegionByRegionId(this.props.composition.pianoRollRegion, this.props.composition.regionList).regionLength;
            pianoRoll = <PianoRoll bitsNumber={bitsNumber} onNoteClick={this.handleNoteClicked.bind(this)} />
        } else {
            for (let i = 0; i < this.props.trackList.length; i++) {
                trackCompositionRowList.push(<TrackCompositionRow
                    bits={this.props.composition.bitsInComposition}
                    key={this.props.trackList[i].index}
                    trackIndex={this.props.trackList[i].index}
                    onEmptyBitClick={this.handleEmptyBitClicked.bind(this)}
                    onRegionClick={this.handleRegionClicked.bind(this)}
                />)
            }
        }
        return (
            <div className="nopadding">
                <Row className="nopadding timeBar">
                    <Row className="nopadding timeBarNumbers">
                        1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20
                    </Row>
                    <Row className="npadding timeBarSpikes">
                        | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
                    </Row>
                </Row>
                <Row className="nopadding compositionPanel">
                    {trackCompositionRowList}
                    {pianoRoll}
                </Row>
            </div>
        );
    }
}

//REDUX connection
const mapStateToProps = (state) => {
    return {
        trackList: state.tracks.trackList,
        active: state.tracks.active,
        composition: state.composition,
        selectedTool: state.control.tool,
        regionDrawLength: state.control.regionDrawLength,
        noteDrawLength: state.control.noteDrawLength
    }
}

export default connect(mapStateToProps)(CompositionGrid);