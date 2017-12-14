class MIDIController{
    constructor(){
        this.devices = new Array;
        this.connect();
    }

    connect(){
        if(window.navigator && 'function' === typeof window.navigator.requestMIDIAccess) {
            return window.navigator.requestMIDIAccess().then(this.connectCallBack, this.onMIDIFailure);
        } else {
            this.MIDISupported = false;
        }
    }
    connectCallBack(access){
        if('function' === typeof access.inputs) {
            // deprecated
            this.devices = access.inputs();
            console.error('Update your Chrome version!');
        } else {
            if(access.inputs && access.inputs.size > 0) {
                var inputs = access.inputs.values(),
                    input = null;

                // iterate through the devices
                for (input = inputs.next(); input && !input.done; input = inputs.next()) {
                    this.devices.push(input.value);
                }
            } else {
                console.error('No devices detected!');
            }

        }
    }
    onMIDIFailure(e) {
        // when we get a failed response, run this code
        console.log('No access to MIDI devices or your browser doesn\'t support WebMIDI API. Please use WebMIDIAPIShim ' + e);
    }
}

export default MIDIController;