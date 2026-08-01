import * as React from 'react';
import Dropdown from 'components/Dropdown';
import { noteLengths } from 'constants/Constants';

const NoteDrawLengthDropdown = (props) => {
    if (props.isVisible) {
        const noteLengthsMenuItems = [];
        for (const property in noteLengths) {
            if (noteLengths.hasOwnProperty(property)) {
                const id = noteLengths[property].id;
                noteLengthsMenuItems.push({
                    key: (id + 1).toString(),
                    label: noteLengths[property].name,
                    onClick: () => props.onNoteDrawLengthChange(id),
                });
            }
        }

        return <Dropdown className="drop-down" title="Note draw length" id={props.id} items={noteLengthsMenuItems} />;
    } else {
        return null;
    }
};
export default NoteDrawLengthDropdown;
