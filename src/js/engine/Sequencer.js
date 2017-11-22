import Store from '../stroe';

class Sequencer {
    constructor() {
        this.noteTime = null;
        this.startTime = null;
        this.rythmIndex = null;
        this.timeoutId = null;
        this.timerWorker = null;
    }
    handlePlay() {
        console.log("Handle play scheduler");        
        this.noteTime = 0.0;
        this.startTime = Store.getState().webAudio.context.currentTime + 0.005;
        this.rythmIndex = 0;
        this.schedule();
        this.timerWorker.postMessage('start');
    }
    handleStop(/*event*/) {
        clearTimeout(this.timeoutId);
    }
    schedule() {
        let currentTime = Store.getState().webAudio.context.currentTime;

        currentTime -= this.startTime;

        while (this.noteTime < currentTime + 0.120) {
            // Convert noteTime to context time.
            var contextPlayTime = this.noteTime + this.startTime;

            Store.getState().webAudio.keyboard.sounds[this.rythmIndex].play();
            this.advenceNote();
        }
    }
    advenceNote() {
        let tempo = Store.getState().control.BPM;
        console.log(tempo);
        var secoundsPerBeat = 60.0 / tempo;

        this.rythmIndex++;

        if (this.rythmIndex === 12) {
            this.rythmIndex = 0;
        }

        this.noteTime += 0.25 * secoundsPerBeat;
    }
    init() {
        var that = this;
        var timerWorkerBlob = new Blob([
            'var timeoutID=0;' +
            'function schedule(){timeoutID=setTimeout(function(){postMessage(\'schedule\'); schedule();},100);}' +
            'onmessage = function(e) { if (e.data == \'start\') { if (!timeoutID) schedule();} else if (e.data == \'stop\') {if (timeoutID) clearTimeout(timeoutID);' +
            'timeoutID=0;};}']);

        // Obtain a blob URL reference to our worker 'file'.
        var timerWorkerBlobURL = window.URL.createObjectURL(timerWorkerBlob);

        this.timerWorker = new Worker(timerWorkerBlobURL);
        this.timerWorker.onmessage = function (/*e*/) {
            that.schedule();
        };
        this.timerWorker.postMessage('init'); // Start the worker.
    }
}

export default Sequencer;