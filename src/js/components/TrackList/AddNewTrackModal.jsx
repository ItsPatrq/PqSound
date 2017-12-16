import React from 'react';
import {Modal, Button} from 'react-bootstrap';
import { TrackTypes } from 'constants/Constants';

const AddNewTrackModal = (props) => {
    return (
        <Modal
          backdrop="static"
          show={props.showModal}
          bsSize="small"
          onHide={() => props.modalVisibilitySwitch()}
          dialogClassName="instrumentModal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Track</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="trackTypeSelectDiv">
              Track type:
              <div className="trackTypeItemDiv" onClick={() => {
                props.onAddNewTrack(TrackTypes.virtualInstrument);
                props.modalVisibilitySwitch();
              }} >
                  Virtual instrument
                </div>
                <div className="trackTypeItemDiv" onClick={() => {
                  props.onAddNewTrack(TrackTypes.aux);
                  props.modalVisibilitySwitch();
                }} >
                    AUX
                </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => props.modalVisibilitySwitch()}>Close</Button>
          </Modal.Footer>
        </Modal>
    );
}

export default AddNewTrackModal;