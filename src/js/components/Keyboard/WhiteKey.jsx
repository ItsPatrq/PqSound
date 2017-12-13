import React from 'react';

const WhiteKey = (props) => {
    let className;
    if (props.isPressed) {
        className = 'whiteKey pressed';
    } else {
        className = 'whiteKey';
    }
    return (
        <div
            className={className}
            onMouseEnter={(event) => props.handleMouseOver(event, props.note)}
            onMouseDown={(event) => props.handleMouseOver(event, props.note)}
            onMouseLeave={(event) => props.handleMouseLeave(event, props.note)}
            onMouseUp={(event) => props.handleMouseLeave(event, props.note)}
        >
        </div>
    );
}

export default WhiteKey;