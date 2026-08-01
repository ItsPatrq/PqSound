import * as React from 'react';
import Modal from 'components/Modal';
import { TrackTypes } from 'constants/Constants';

const AddNewTrackModal = (props) => {
    return (
        <Modal
            show={props.showModal}
            size="sm"
            title="Add New Track"
            onHide={() => props.modalVisibilitySwitch()}
            dialogClassName="instrumentModal"
        >
            <div className="trackTypeSelectDiv">
                Track type:
                <div
                    className="trackTypeItemDiv"
                    onClick={() => {
                        props.onAddNewTrack(TrackTypes.virtualInstrument);
                        props.modalVisibilitySwitch();
                    }}
                >
                    Virtual instrument
                </div>
                <div
                    className="trackTypeItemDiv"
                    onClick={() => {
                        props.onAddNewTrack(TrackTypes.aux);
                        props.modalVisibilitySwitch();
                    }}
                >
                    AUX
                </div>
            </div>
        </Modal>
    );
};

export default AddNewTrackModal;
