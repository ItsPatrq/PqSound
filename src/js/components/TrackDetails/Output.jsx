import React from 'react';
import { MenuItem, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';

const Output = (props) => {
    const availableAuxTracks = [];
    const isEnabled = props.auxTracks.length > 1;
    for (let i = 0; i < props.auxTracks.length; i++) {
        availableAuxTracks.push(
            <MenuItem
                key={props.auxTracks[i].index}
                eventKey={props.auxTracks[i].index}
                onClick={() => {
                    props.onOutputChange(props.auxTracks[i].index);
                }}
            >
                {props.auxTracks[i].name}
            </MenuItem>,
        );
    }
    return (
        <div className="output">
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id={'tooltipTimeSignature'}>{'Output AUX'}</Tooltip>}
                delayShow={500}
            >
                <div style={{ margin: 'auto' }}>
                    <DropdownButton
                        disabled={!isEnabled}
                        bsStyle="link"
                        className="drop-down outputSelectorDropDown"
                        title={props.dropDownTitle}
                        id="OutputSelectorDropDown"
                    >
                        {availableAuxTracks}
                    </DropdownButton>
                </div>
            </OverlayTrigger>
        </div>
    );
};

export default Output;
