import React from 'react';
import { Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import TrackCompositionRow from 'components/CompositionGrid/TrackCompositionRow';
import PianoRoll from 'components/CompositionGrid/PianoRoll';
import { showPianoRoll, updateTrackComposition } from 'actions/compositionActions';

class CompositionGrid extends React.Component {
    constructor() {
        super();
    }

    handleRegionClicked(trackIndex, regionIndex) {
        this.props.dispatch(showPianoRoll(trackIndex, regionIndex));
    }

    render() {
        let trackCompositionRowList = new Array;
        let pianoRoll;
        if (this.props.composition.showPianoRoll) {
            pianoRoll = <PianoRoll />
        } else {
            for (let i = 0; i < this.props.trackList.length; i++) {
                trackCompositionRowList.push(<TrackCompositionRow
                    bits={this.props.composition.bitsInComposition}
                    key={this.props.trackList[i].index}
                    trackIndex={this.props.trackList[i].index}
                    handleRegionClicked={this.handleRegionClicked.bind(this)}
                />)
            }
        }
        return (
            <div className="nopadding">
                <Row className="nopadding timeBar">
                    | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
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
        composition: state.composition
    }
}

export default connect(mapStateToProps)(CompositionGrid);