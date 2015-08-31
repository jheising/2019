/*!
 * 2019
 * (c) Jim Heising <jheising@gmail.com>; MIT License
 */

var stage;
var loadQueue;
var layers = {};
var images = {};
var videoScreenHeight = 1141;
var videoScreenWidth = 563;
var grainStage;
var infoIsOpen = false;

var videos = [65241541, 14288152, 41881648, 75272501, 6839316, 11057525, 35602560, 2026165, 27910846, 26199158, 84608237, 49037990, 33188079, 72038249, 67923125]; // Some default cool videos
var currentVideoURL;

function playNextVideoInPlaylist()
{
    var randomIndex = getRandom(0, videos.length - 1);
    loadVimeoVideo(videos[randomIndex].toString().trim());
}

var playerOrigin = '*';
function playCurrentVimeoVideo()
{
    var contentWindow = $("#videoSource")[0].contentWindow;

    var message = {
        method: "setVolume",
        value: 0
    };
    contentWindow.postMessage(JSON.stringify(message), playerOrigin);

    message = {
        method: "addEventListener",
        value: "finish"
    };
    contentWindow.postMessage(JSON.stringify(message), playerOrigin);

    message = {
        method: "play"
    };
    contentWindow.postMessage(JSON.stringify(message), playerOrigin);
}

function loadVimeoVideo(videoID) {

    currentVideoURL = "https://player.vimeo.com/video/" + videoID;

    console.log("Loading Video: " + currentVideoURL);

    $("#videoSource").attr("src", currentVideoURL + "?api=1&title=0&byline=0&autoplay=1");
}

function onMessageReceived(event) {

    // Handle messages from the vimeo player only
    if (!(/^https?:\/\/player.vimeo.com/).test(event.origin)) {
        return false;
    }

    if (playerOrigin === '*') {
        playerOrigin = event.origin;
    }

    var data = JSON.parse(event.data);

    switch (data.event) {
        case 'ready':
            playCurrentVimeoVideo();
            break;

        case 'finish':
            playNextVideoInPlaylist();
            break;
    }
}

$(function () {

    // Listen for messages from the video player
    if (window.addEventListener) {
        window.addEventListener('message', onMessageReceived, false);
    }
    else {
        window.attachEvent('onmessage', onMessageReceived, false);
    }

    var grainCanvas = document.getElementById("grain");
    var canvas = document.getElementById("mainCanvas");

    function calculateAspectFillScale(targetWidth, targetHeight, nativeWidth, nativeHeight) {
        // Calculate resize ratios for resizing
        var ratioW = targetWidth / nativeWidth;
        var ratioH = targetHeight / nativeHeight;

        // smaller ratio will ensure that the image fits in the view
        var ratio = ratioW > ratioH ? ratioW : ratioH;

        return ratio;
    }

    function spinnerFlight1() {
        layers.spinner.x = 1400;
        layers.spinner.y = 650;
        //layers.spinner.alpha = 0;

        createjs.Tween.get(layers.spinner, {loop: true}).to({x: 980, y: 680}, 2000).to({alpha: 0});

    }

    function resize() {
        grainCanvas.width = canvas.width = window.innerWidth;
        grainCanvas.height = canvas.height = window.innerHeight;

        if (images.background) {
            var scaleRatio = calculateAspectFillScale(canvas.width, canvas.height, images.background.image.width, images.background.image.height);

            layers.background.scaleX = layers.background.scaleY = scaleRatio;
            layers.backgroundOverlay.scaleX = layers.backgroundOverlay.scaleY = scaleRatio;

            layers.background.x = layers.backgroundOverlay.x = canvas.width - images.background.image.width * scaleRatio; // Right align

            $("#videoScreen").width(videoScreenWidth);
            $("#videoScreen").height(videoScreenHeight);

            $("#videoContainer").width(572);
            $("#videoContainer").height(images.background.image.height);
            $("#videoContainer").css({"-webkit-transform": "scale(" + scaleRatio + "," + scaleRatio + ")"});
        }

        if (layers.filmGrain) {
            // Work on our film grain
            layers.filmGrain.graphics.clear();
            layers.filmGrain.graphics.beginBitmapFill(images.filmGrain, 'repeat').drawRect(0, 0, canvas.width + 1000, canvas.height + 1000);

            layers.filmGrain.cache(0, 0, canvas.width + 1000, canvas.height + 1000);
        }

        if (layers.twinkle) {
            // Work on our film grain
            layers.twinkle.graphics.clear();
            layers.twinkle.graphics.beginBitmapFill(images.twinkle, 'repeat').drawRect(0, 0, canvas.width + 1000, canvas.height + 1000);

            layers.twinkle.cache(0, 0, canvas.width + 1000, canvas.height + 1000);
        }


        stage.update();
    }

    function init() {
        stage = new createjs.Stage("mainCanvas");
        grainStage = new createjs.Stage("grain");

        loadQueue = new createjs.LoadQueue();

        if (location.protocol == "file:")
            loadQueue.setUseXHR(false);

        loadQueue.on("complete", finishLoad, this);
        loadQueue.loadManifest([
            {id: "background", src: "img/background.jpg"},
            {id: "backgroundMask", src: "img/background-mask.png"},
            {id: "filmGrain", src: "img/noise.png"},
            {id: "twinkle", src: "img/twinkling.png"},
            {id: "blinker1", src: "img/blinker1.png"},
            {id: "blinker2", src: "img/blinker2.png"},
            {id: "blinker3", src: "img/blinker3.png"},
            {id: "lightning", src: "img/lightning.png"},
            {id: "smoke", src: "img/smoke.png"},
            {id: "smokeOverlay", src: "img/smokeOverlay.png"},
            {id: "neon1", src: "img/neon1.png"},
            {id: "neon2", src: "img/neon2.png"},
            {id: "spinner", src: "img/spinner.png"},
        ]);

        $("#ambientAudio").on("canplay", finishLoad);

        window.onresize = resize;
    }

    var filesCompleted = false;
    var soundsCompleted = false;

    function finishLoad(event) {
        if (event.type == "canplay") {
            soundsCompleted = true;
        }
        else {
            filesCompleted = true;
        }

        if (filesCompleted && soundsCompleted) {
            buildInterface();
        }
    }

    function buildInterface() {
        resize();

        $(".bubble-loader").animate({opacity: 0.0}, 1000);

        layers.background = new createjs.Container();
        layers.backgroundOverlay = new createjs.Container();
        layers.twinkle = new createjs.Shape();
        layers.smokeOverlay = new createjs.Container();
        layers.spinner = new createjs.Container();
        layers.smoke = new createjs.Shape();
        layers.filmGrain = new createjs.Shape();

        stage.addChild(layers.background);
        stage.addChild(layers.twinkle);
        stage.addChild(layers.backgroundOverlay);

        images.background = new createjs.Bitmap(loadQueue.getResult("background"));
        images.backgroundOverlay = new createjs.Bitmap(loadQueue.getResult("background"));
        images.backgroundMask = new createjs.Bitmap(loadQueue.getResult("backgroundMask"));
        images.filmGrain = loadQueue.getResult("filmGrain");
        images.twinkle = loadQueue.getResult("twinkle");
        images.blinker1 = new createjs.Bitmap(loadQueue.getResult("blinker1"));
        images.blinker2 = new createjs.Bitmap(loadQueue.getResult("blinker2"));
        images.blinker3 = new createjs.Bitmap(loadQueue.getResult("blinker3"));
        images.lighting = new createjs.Bitmap(loadQueue.getResult("lightning"));
        images.smokeOverlay = new createjs.Bitmap(loadQueue.getResult("smokeOverlay"));
        images.smoke = loadQueue.getResult("smoke");
        images.neon1 = new createjs.Bitmap(loadQueue.getResult("neon1"));
        images.neon2 = new createjs.Bitmap(loadQueue.getResult("neon2"));
        images.spinner = new createjs.Bitmap(loadQueue.getResult("spinner"));

        grainStage.addChild(layers.filmGrain);

        // Work on our background
        layers.background.setBounds(0, 0, images.background.image.width, images.background.image.height);
        layers.backgroundOverlay.setBounds(0, 0, images.background.image.width, images.background.image.height);

        layers.background.addChild(images.background);

        var amf = new createjs.AlphaMaskFilter(images.backgroundMask.image);
        images.backgroundOverlay.filters = [amf];
        images.backgroundOverlay.cache(0, 0, images.backgroundMask.image.width, images.backgroundMask.image.height);
        layers.backgroundOverlay.addChild(images.backgroundOverlay);

        // Spinner
        //layers.spinner.addChild(images.spinner);
        //layers.backgroundOverlay.addChild(layers.spinner);

        // Setup our smoke

        layers.smoke.graphics.clear();
        layers.smoke.graphics.beginBitmapFill(images.smoke, 'repeat').drawRect(0, 0, images.smoke.width, images.smoke.height * 2);

        layers.smoke.alpha = 0.5;
        layers.smokeOverlay.x = 737;
        layers.smokeOverlay.y = 277;
        var smokeMask = new createjs.Shape();
        smokeMask.graphics.beginFill("#000").drawRect(layers.smokeOverlay.x, layers.smokeOverlay.y, images.smokeOverlay.image.width, images.smokeOverlay.image.height);
        layers.smokeOverlay.mask = smokeMask;
        layers.smokeOverlay.setBounds(0, 0, 52, 53);
        layers.smokeOverlay.addChild(layers.smoke);
        layers.smokeOverlay.addChild(images.smokeOverlay);

        layers.backgroundOverlay.addChild(layers.smokeOverlay);

        createjs.Tween.get(layers.smoke, {override: true, loop: true}).to({y: -images.smoke.height}, 15000);

        // Setup our blinkers and neons
        layers.backgroundOverlay.addChild(images.blinker1);

        images.blinker2.x = 430;
        images.blinker2.y = 295;
        layers.backgroundOverlay.addChild(images.blinker2);

        images.blinker3.x = 199;
        images.blinker3.y = 250;
        layers.backgroundOverlay.addChild(images.blinker3);

        images.lighting.alpha = 0;
        images.lighting.x = 574;
        images.lighting.y = 0;
        layers.backgroundOverlay.addChild(images.lighting);

        images.neon1.x = 74;
        images.neon1.y = 769;
        layers.backgroundOverlay.addChild(images.neon1);

        images.neon2.x = 1895;
        images.neon2.y = 407;
        layers.backgroundOverlay.addChild(images.neon2);

        makeBlink(images.blinker1, 2500, 1500, 0);
        makeBlink(images.blinker2, 1000, 1000, 250);
        makeBlink(images.blinker3, 30000, 60000, 0);
        makeBlink(images.neon2, 250, 500, 0);

        resize();

        $("#controls").fadeIn();

        createjs.Ticker.setFPS(24);
        createjs.Ticker.addEventListener("tick", tick);

        $("#loadingIndicator").fadeOut(5000, function () {
            $(this).remove();
        });
    }

    var lightningOn = false;
    var lightningLength = getRandom(250, 1000);

    function tick() {
        layers.twinkle.x = getRandom(-500, 500) - 500;
        layers.twinkle.y = getRandom(-500, 500) - 500;

        processNeon(images.neon1);

        // Do our lightning
        if (!lightningOn) {
            lightningLength--;

            if (lightningLength <= 0) {
                lightningOn = true;
                lightningLength = getRandom(25, 50);
            }
        }
        else {
            if (getRandom(0, 500) < 25) {
                images.lighting.alpha = 0;
            }
            else {
                images.lighting.alpha = 1;
            }

            lightningLength--;

            if (lightningLength <= 0) {
                lightningLength = getRandom(250, 1000);
                images.lighting.alpha = 0;
                lightningOn = false;
            }
        }

        // Randomly move our film grain
        layers.filmGrain.x = getRandom(-500, 500) - 500;
        layers.filmGrain.y = getRandom(-500, 500) - 500;

        stage.update();
        grainStage.update();
    }

    $("#controls").fadeOut(0);

    var isWebkit = (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) || (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor));

    if(!isWebkit)
    {
        $(".bubble-loader").hide();
        $("#loadingIndicator").append('<div style="text-align: center; position: absolute; bottom: 25px; width: 100%">This experiment requires Chrome or Safari</div>');
        return;
    }

    init();

    function closeInfoOverlay()
    {
        $('#infoOverlay').fadeOut(250);
        infoIsOpen = false;
    }

    function openInfoOverlay()
    {
        $('#infoOverlay').fadeIn(250);
        infoIsOpen = true;
    }

    $('#fullscreen').click(function () {
        if (screenfull.enabled) {

            screenfull.toggle();
            $('#fullscreen > i').toggleClass("fa-expand", !screenfull.isFullscreen).toggleClass("fa-compress", screenfull.isFullscreen);
        }
    });

    var isMute = false;

    $('#mute').click(function () {

        isMute = !isMute;
        $('#mute > i').toggleClass("fa-volume-up", !isMute).toggleClass("fa-volume-off", isMute)[0];
        $('#ambientAudio')[0].muted = isMute;

    });

    $('#info, #title').click(function(){
        if(infoIsOpen)
        {
            closeInfoOverlay();
        }
        else
        {
            openInfoOverlay();
        }
    });

    $('#infoOverlay').click(closeInfoOverlay);

    // Has the user specified their own video list?
    var userVideos = getQueryVariable("videos");

    if(userVideos)
    {
        videos = userVideos.split(',');
    }

    playNextVideoInPlaylist();
});

function getRandom(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

function processNeon(target) {
    if (getRandom(0, 750) < 25) {
        target.alpha = 0.0;
    }
    else {
        target.alpha = 1.0;
    }
}

function makeBlink(target, onTime, offTime, fadeTime) {
    target.alpha = 0.0;

    function beginAnimation() {
        target.alpha = 0.0;
        createjs.Tween.get(target, {override: true, loop: true}).to({alpha: 1.0}, fadeTime).wait(onTime).to({alpha: 0.0}, fadeTime).wait(offTime);
    }

    // Choose a random start time
    createjs.Tween.get(target, {override: true}).wait(getRandom(0, offTime)).call(beginAnimation);
}

/*!
 * screenfull
 * v1.2.0 - 2014-04-29
 * (c) Sindre Sorhus; MIT License
 */
!function () {
    "use strict";
    var a = "undefined" != typeof module && module.exports, b = "undefined" != typeof Element && "ALLOW_KEYBOARD_INPUT"in Element, c = function () {
        for (var a, b, c = [
            ["requestFullscreen", "exitFullscreen", "fullscreenElement", "fullscreenEnabled", "fullscreenchange", "fullscreenerror"],
            ["webkitRequestFullscreen", "webkitExitFullscreen", "webkitFullscreenElement", "webkitFullscreenEnabled", "webkitfullscreenchange", "webkitfullscreenerror"],
            ["webkitRequestFullScreen", "webkitCancelFullScreen", "webkitCurrentFullScreenElement", "webkitCancelFullScreen", "webkitfullscreenchange", "webkitfullscreenerror"],
            ["mozRequestFullScreen", "mozCancelFullScreen", "mozFullScreenElement", "mozFullScreenEnabled", "mozfullscreenchange", "mozfullscreenerror"],
            ["msRequestFullscreen", "msExitFullscreen", "msFullscreenElement", "msFullscreenEnabled", "MSFullscreenChange", "MSFullscreenError"]
        ], d = 0, e = c.length, f = {}; e > d; d++)if (a = c[d], a && a[1]in document) {
            for (d = 0, b = a.length; b > d; d++)f[c[0][d]] = a[d];
            return f
        }
        return!1
    }(), d = {request: function (a) {
        var d = c.requestFullscreen;
        a = a || document.documentElement, /5\.1[\.\d]* Safari/.test(navigator.userAgent) ? a[d]() : a[d](b && Element.ALLOW_KEYBOARD_INPUT)
    }, exit: function () {
        document[c.exitFullscreen]()
    }, toggle: function (a) {
        this.isFullscreen ? this.exit() : this.request(a)
    }, onchange: function () {
    }, onerror: function () {
    }, raw: c};
    return c ? (Object.defineProperties(d, {isFullscreen: {get: function () {
        return!!document[c.fullscreenElement]
    }}, element: {enumerable: !0, get: function () {
        return document[c.fullscreenElement]
    }}, enabled: {enumerable: !0, get: function () {
        return!!document[c.fullscreenEnabled]
    }}}), document.addEventListener(c.fullscreenchange, function (a) {
        d.onchange.call(d, a)
    }), document.addEventListener(c.fullscreenerror, function (a) {
        d.onerror.call(d, a)
    }), void(a ? module.exports = d : window.screenfull = d)) : void(a ? module.exports = !1 : window.screenfull = !1)
}();

