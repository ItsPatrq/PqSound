import React from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';

class TrackDetails extends React.Component {
    constructor() {
        super();
    }

    getTrackName(){
        for(let i = 0; i < this.props.trackList.length; i++){
            if(this.props.trackList[i].index === this.props.active){
                return this.props.trackList[i].name;
            }
        }
    }

    render() {
        return (
            <div>
                <Col xs={6} className="trackDetails nopadding">
                    track-details(current)
                    <div className="trackName">
                        {this.getTrackName()}
                    </div>
                </Col>
                <Col xs={6} className="trackDetails nopadding">
                    track-details(master)
                    <div className="trackName">
                        Master
                    </div>
                </Col>
            </div>
        );
    }
}

//REDUX connection
const mapStateToProps = (state) => {
    return {
        trackList: state.tracks.trackList,
        active: state.tracks.active
    }
}

export default connect(mapStateToProps)(TrackDetails);