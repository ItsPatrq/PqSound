import * as React from 'react';
import { ChevronRight } from 'components/Icons';

// One clean control per side = shift the visible range up one octave.
const OptionKeyRight = (props) => {
    return (
        <button
            className="optionKey right optionKeyBtn"
            title="Octave up"
            onClick={() => props.onChangeKeyboardRange(12)}
        >
            <ChevronRight />
        </button>
    );
};

export default OptionKeyRight;
