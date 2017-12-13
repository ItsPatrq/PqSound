import React from 'react';

const WhiteKey = (props) => {
    let className;
    if (props.isPressed) {
        className = 'blackKey pressed';
    } else {
        className = 'blackKey';
    }
    return (
        <div
            className={className}
            style={{ marginLeft: props.margin + 'px' }}
            onMouseEnter={(event) => props.handleMouseOver(event, props.note)}
            onMouseDown={(event) => props.handleMouseOver(event, props.note)}
            onMouseLeave={(event) => props.handleMouseLeave(event, props.note)}
            onMouseUp={(event) => props.handleMouseLeave(event, props.note)}
        >
        </div>
    );
}

export default WhiteKey;