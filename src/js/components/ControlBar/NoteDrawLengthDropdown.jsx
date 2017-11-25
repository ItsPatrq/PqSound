import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import * as Utils from 'engine/Utils';

const NoteDrawLengthDropdown = (props) => {
    if (props.isVisible) {
        let noteLengthsMenuItems = new Array;
        for (let property in Utils.noteLengths) {
            if (Utils.noteLengths.hasOwnProperty(property)) {
                noteLengthsMenuItems.push(
                    <MenuItem
                        key={(Utils.noteLengths[property] + 1).toString()}
                        eventKey={(Utils.noteLengths[property] + 1).toString()}
                        onClick={() => props.onNoteDrawLengthChange(Utils.noteLengths[property])}>{property}
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