export class BufferLoader {
    context: AudioContext;
    urlList: string[];
    onload: (bufferLoader: BufferLoader) => void;
    loadCount: number;
    bufferList: AudioBuffer[];
    activeFetching: number;

    constructor(context: AudioContext, urlList: string[], callback: (bufferLoader: BufferLoader) => void) {
        this.context = context;
        this.urlList = urlList;
        this.onload = callback;
        this.timoutLoad = this.timoutLoad.bind(this);
        this.bufferList = [];
        this.loadCount = 0;
        this.activeFetching = 0;
    }

    loadBuffer(url: string, index: number): void {
        // Load buffer asynchronously
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = ((thisBuffer) => (): void => {
            thisBuffer.activeFetching--;
            // Asynchronously decode the audio file data in request.response
            thisBuffer.context.decodeAudioData(
                request.response,
                function (buffer) {
                    if (!buffer) {
                        console.log('error decoding file data: ' + url);
                        return;
                    }
                    thisBuffer.bufferList[index] = buffer;
                    if (++thisBuffer.loadCount == thisBuffer.urlList.length) {
                        thisBuffer.onload(thisBuffer);
                    }
                },
                function (error) {
                    console.log('decodeAudioData error', error);
                    thisBuffer.timoutLoad(url, index);
                },
            );
        })(this);

        request.onerror = ((thisBuffer) => (): void => {
            console.log('BufferLoader: XHR error');
            thisBuffer.activeFetching--;
            thisBuffer.timoutLoad(url, index);
        })(this);
        this.activeFetching++;
        return request.send();
    }

    load(): void {
        this.bufferList.length = 0;
        for (let i = 0; i < this.urlList.length; ++i) {
            this.timoutLoad(this.urlList[i], i);
        }
    }

    timoutLoad(url: string, index: number): void {
        if (this.activeFetching > 4) {
            setTimeout(() => this.timoutLoad(url, index), 1000);
        } else {
            this.loadBuffer(url, index);
        }
    }
}

export default BufferLoader;
