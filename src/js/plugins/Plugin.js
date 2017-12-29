import Store from '../stroe';

class Plugin {
    constructor(currEnum, index){
        this.name = currEnum.name;
        this.id = currEnum.id;
        this.index = index;
        this.context = Store.getState().webAudio.context;
    }


    getPluginNode(){
        return {input: this.input, output: this.output}
    }

    updatePreset(newPreset){
        this.preset = {...this.preset, ...newPreset};
        this.updateNodes();
    }
}

export default Plugin;