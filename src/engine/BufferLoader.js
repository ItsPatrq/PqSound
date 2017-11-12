class BufferLoader {
    constructor(mainApp, urlList, callback) {
        this.mainApp = mainApp;
        this.urlList = urlList;
        this.onload = callback;
        this.bufferList = new Array();
        this.loadCount = 0;

        try {
            this.mainApp.context = new AudioContext();
            console.log(this.mainApp);
        } catch (e) {
            //TODO: error panel
            alert('Web Audio API is not supported in this browser');
        }
    }

    loadBuffer = function (url, index) {
        // Load buffer asynchronously
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        var loader = this;

        request.onload = function () {
            // Asynchronously decode the audio file data in request.response
            loader.mainApp.context.decodeAudioData(
                request.response,
                function (buffer) {
                    if (!buffer) {
                        alert('error decoding file data: ' + url);
                        return;
                    }
                    loader.bufferList[index] = buffer;
                    if (++loader.loadCount == loader.urlList.length)
                        loader.onload(loader.bufferList);
                },
                function (error) {
                    console.error('decodeAudioData error', error);
                }
            );
        }

        request.onerror = function () {
            alert('BufferLoader: XHR error');
        }

        request.send();
    }

    load = function () {
        for (var i = 0; i < this.urlList.length; ++i)
            this.loadBuffer(this.urlList[i], i);
    }
}

module.exports = BufferLoader;