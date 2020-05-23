import * as React from 'react';
import { Col } from 'react-bootstrap';
import { isNullOrUndefined } from 'engine/Utils';

class VolumeSlider extends React.Component {
    constructor() {
        super();
        this.state = {
            volumes: {
                right: 0,
                left: 0,
            },
        };
    }
    initCanvas(input) {
        if (!isNullOrUndefined(input) && isNullOrUndefined(this.canvasContext)) {
            this.canvas = input;
            this.canvasContext = input.getContext('2d');
            this.gradient = this.canvasContext.createLinearGradient(0, 0, 0, 300);
            this.gradient.addColorStop(1, '#000000');
            this.gradient.addColorStop(0.75, '#ff0000');
            this.gradient.addColorStop(0.25, '#ffff00');
            this.gradient.addColorStop(0, '#ffffff');
            this.canvasContext.fillStyle = this.gradient;
            requestAnimationFrame(this.updateVolumeAnimation.bind(this));
        }
    }
    updateVolumeAnimation() {
        const newVolumes = this.props.trackNode.getAverageVolume();
        this.setState((/*state*/) => ({ volumes: newVolumes }));
        this.canvasContext.clearRect(0, 0, 52, 150);
        this.canvasContext.fillStyle = this.gradient;
        this.canvasContext.fillRect(5, 150 - this.state.volumes.left, 20, 150);
        this.canvasContext.fillRect(27, 150 - this.state.volumes.right, 20, 150);
        requestAnimationFrame(this.updateVolumeAnimation.bind(this));
    }
    render() {
        return (
            <div className="volumeSectionDiv">
                <Col xs={6} className="nopadding">
                    <div className="volumeValue">{Math.floor(this.props.volume * 100)}%</div>
                    <input
                        className="volumeSlider"
                        type="range"
                        orient="vertical"
                        min={0}
                        max={200}
                        value={this.props.volume * 100}
                        onChange={(event) => this.props.onVolumeChange(this.props.trackIndex, event.target.value)}
                    />
                </Col>
                <Col xs={6} className="nopadding">
                    <div className="volumeValue">
                        {Math.floor(
                            this.state.volumes.left > this.state.volumes.right
                                ? this.state.volumes.left
                                : this.state.volumes.right,
                        )}
                    </div>
                    <canvas
                        className="volumeMeterCanvas"
                        width={50}
                        height={150}
                        ref={(input) => {
                            this.initCanvas(input);
                        }}
                    ></canvas>
                </Col>
            </div>
        );
    }
}

export default VolumeSlider;
