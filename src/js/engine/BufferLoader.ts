export class BufferLoader {
    context: AudioContext;
    urlList: string[];
    onload: (bufferLoader: BufferLoader) => void;
    loadCount: number;
    bufferList: AudioBuffer[];
    constructor(context: AudioContext, urlList: string[], callback: (bufferLoader: BufferLoader) => void) {
        this.context = context;
        this.urlList = urlList;
        this.onload = callback;
        this.bufferList = [];
        this.loadCount = 0;
    }

    loadBuffer(url: string, index: number): void {
        // Load buffer asynchronously
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = ((thisBuffer) => (): void => {
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
                },
            );
        })(this);

        request.onerror = function (): void {
            console.log('BufferLoader: XHR error');
        };

        return request.send();
    }

    load(): void {
        this.bufferList.length = 0;
        for (let i = 0; i < this.urlList.length; ++i) this.loadBuffer(this.urlList[i], i);
    }
}

export default BufferLoader;
