import * as React from 'react';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';

const Output = (props) => {
    const availableAuxTracks = [];
    const isEnabled = props.auxTracks.length > 1;
    for (let i = 0; i < props.auxTracks.length; i++) {
        availableAuxTracks.push(
            <Dropdown.Item
                key={props.auxTracks[i].index}
                eventKey={props.auxTracks[i].index}
                onClick={() => {
                    props.onOutputChange(props.auxTracks[i].index);
                }}
            >
                {props.auxTracks[i].name}
            </Dropdown.Item>,
        );
    }
    return (
        <div className="output">
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id={'tooltipTimeSignature'}>{'Output AUX'}</Tooltip>}
                delay={{ show: 500, hide: 0 }}
            >
                <div style={{ margin: 'auto' }}>
                    <DropdownButton
                        disabled={!isEnabled}
                        variant="link"
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
