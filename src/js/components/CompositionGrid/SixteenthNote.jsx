import React from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as Utils from 'engine/Utils';
import { updateTrackComposition } from 'actions/compositionActions';

const SixteenthNote = (props) => {
    let sixteenthNote = new Array;
    let thisUpdateTrackComposition = function(sixteenthIndex){
        props.dispatch(updateTrackComposition(props.pianoRollKey, props.quarterIndex, sixteenthIndex));
    }
    for (let i = 0; i < 4; i++) {
        if (
            Utils.isNullOrUndefined(props.tracksCompositions[props.pianoRollTrack]) ||
            Utils.isNullOrUndefined(props.tracksCompositions[props.pianoRollTrack][props.pianoRollRegion]) ||
            Utils.isNullOrUndefined(props.tracksCompositions[props.pianoRollTrack][props.pianoRollRegion]) ||
            Utils.isNullOrUndefined(props.tracksCompositions[props.pianoRollTrack][props.pianoRollRegion][props.pianoRollKey]) ||
            Utils.isNullOrUndefined(props.tracksCompositions[props.pianoRollTrack][props.pianoRollRegion][props.pianoRollKey][props.quarterIndex]) ||
            !props.tracksCompositions[props.pianoRollTrack][props.pianoRollRegion][props.pianoRollKey][props.quarterIndex][i]
        ) {
            sixteenthNote.push(
                <Col xs={3} className="nopadding sixteenthNote" key={i.toString()} onClick={() => thisUpdateTrackComposition(i)}>
                </Col>
            );
        } else {
            sixteenthNote.push(
                <Col xs={3} className="nopadding sixteenthNote active" key={i.toString()} onClick={() => thisUpdateTrackComposition(i)}>
                </Col>
            );
        }
    }
    return (
        <div >
            {sixteenthNote}
        </div>
    );
}

//REDUX connection
const mapStateToProps = (state) => {
    return {
        tracksCompositions: state.composition.tracksCompositions,
        pianoRollTrack: state.composition.pianoRollTrack,
        pianoRollRegion: state.composition.pianoRollRegion
    }
}

export default connect(mapStateToProps)(SixteenthNote);