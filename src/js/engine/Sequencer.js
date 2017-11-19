import Store from '../stroe';

class Sequencer {
    constructor() {
        this.noteTime = null;
        this.startTime = null;
        this.rythmIndex = null;
        this.timeoutId = null;
    }
    handlePlay() {
        this.noteTime = 0.0;
        this.startTime = Store.getState().webAudio.context.currentTime + 0.005;
        this.rythmIndex = 0;
        this.schedule()
    }
    handleStop(/*event*/){
        clearTimeout(this.timeoutId);
    }
    schedule(){
        let currentTime = Store.getState().webAudio.context.currentTime;

        currentTime -= this.startTime;



        while(this.noteTime < currentTime + 0.200){
            this.advenceNote();
        }
        this.timeoutId = setTimeout(this.schedule(), 0);
    }
    advenceNote(){
        let tempo = 120;
        var secoundsPerBeat = 60.0/tempo;

        this.rythmIndex++;

        this.noteTime += 0.25 * secoundsPerBeat;
    }
}

export default Sequencer;