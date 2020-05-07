class Plugin {
    constructor(currEnum, index, audioContext){
        this.name = currEnum.name;
        this.id = currEnum.id;
        this.index = index;
        this.context = audioContext;
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