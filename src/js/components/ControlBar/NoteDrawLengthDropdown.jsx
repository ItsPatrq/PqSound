import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { noteLengths } from 'constants/Constants';

const NoteDrawLengthDropdown = (props) => {
    if (props.isVisible) {
        let noteLengthsMenuItems = new Array;
        for (let property in noteLengths) {
            if (noteLengths.hasOwnProperty(property)) {
                noteLengthsMenuItems.push(
                    <MenuItem
                        key={(noteLengths[property].id + 1).toString()}
                        eventKey={(noteLengths[property].id + 1).toString()}
                        onClick={() => props.onNoteDrawLengthChange(noteLengths[property].id)}>{noteLengths[property].name}
                    </MenuItem>
                );
            }
        }

        return (
            <DropdownButton bsStyle="default" className="drop-down" title="Note draw length" id={props.id} >
                {noteLengthsMenuItems}
            </DropdownButton>
        )
    }
    else {
        return null;
    }
}
export default NoteDrawLengthDropdown;