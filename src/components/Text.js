import React from 'react';
import PropTypes from 'prop-types';

class TextComponent extends React.Component {
    static propTypes = {
        clickText: PropTypes.string.isRequired,
        staticText: PropTypes.string.isRequired
    }
    render(){
        return (
            <div>
                <p className="text">{this.props.staticText}</p>
                <p className="text">
                    {`Text from parent: ${this.props.clickText}`}
                </p>
            </div>
        );
    }
}

export default TextComponent;