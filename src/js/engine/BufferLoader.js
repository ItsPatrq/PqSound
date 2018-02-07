class BufferLoader {
    constructor(context, urlList=null, callback=null) {
        this.context = context;
        this.urlList = urlList;
        this.onload = callback;
        this.bufferList = new Array();
        this.loadCount = 0;
    }

    loadBuffer = function (url, index) {
        // Load buffer asynchronously
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        let thisBuffer = this;

        request.onload = function () {
            // Asynchronously decode the audio file data in request.response
            thisBuffer.context.decodeAudioData(
                request.response,
                function (buffer) {
                    if (!buffer) {
                        console.log('error decoding file data: ' + url);
                        return;
                    }
                    thisBuffer.bufferList[index] = buffer;
                    if (++thisBuffer.loadCount == thisBuffer.urlList.length){
                        thisBuffer.onload(thisBuffer);
                    }
                },
                function (error) {
                    console.log('decodeAudioData error', error);
                }
            );
        }

        request.onerror = function () {
            console.log('BufferLoader: XHR error');
        }

        request.send();
    }

    load = function () {
        this.bufferList.length = 0;
        for (var i = 0; i < this.urlList.length; ++i)
            this.loadBuffer(this.urlList[i], i);
    }
}

export default BufferLoader;