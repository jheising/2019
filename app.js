var stage;
var loadQueue;
var layers = {};
var images = {};

$(function() {

    var canvas = document.getElementById("mainCanvas");

    function calculateAspectFillScale(targetWidth, targetHeight, nativeWidth, nativeHeight)
    {
        // Calculate resize ratios for resizing
        var ratioW = targetWidth / nativeWidth;
        var ratioH = targetHeight / nativeHeight;

        // smaller ratio will ensure that the image fits in the view
        var ratio = ratioW > ratioH ? ratioW : ratioH;

        return ratio;
    }

    /*function aspectFillLayer(target, imageWidth, imageHeight, center)
    {
        var scaleRatio = calculateAspectFillScale(width, height, imageWidth, imageHeight);
        bitmap.scaleX = scaleRatio;
        bitmap.scaleY = scaleRatio;
    }*/

    function spinnerFlight1()
    {
        layers.spinner.x = 1400;
        layers.spinner.y = 650;
        //layers.spinner.alpha = 0;

        createjs.Tween.get(layers.spinner, {loop:true}).to({x:980,y:680}, 2000).to({alpha:0});

    }

    function resize()
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;



        if(images.background)
        {
            var scaleRatio = calculateAspectFillScale(canvas.width, canvas.height, images.background.image.width, images.background.image.height);

            layers.background.scaleX = layers.background.scaleY = scaleRatio;
            layers.backgroundOverlay.scaleX = layers.backgroundOverlay.scaleY = scaleRatio;
        }

        if(layers.filmGrain)
        {
            // Work on our film grain
            layers.filmGrain.graphics.clear();
            layers.filmGrain.graphics.beginBitmapFill(images.filmGrain,'repeat').drawRect(0, 0, canvas.width + 1000, canvas.height + 1000);
        }

        if(layers.twinkle)
        {
            // Work on our film grain
            layers.twinkle.graphics.clear();
            layers.twinkle.graphics.beginBitmapFill(images.twinkle,'repeat').drawRect(0, 0, canvas.width + 1000, canvas.height + 1000);
        }

        stage.update();
    }

    function init()
    {
        stage = new createjs.Stage("mainCanvas");

        loadQueue = new createjs.LoadQueue();
        loadQueue.setUseXHR(false);
        loadQueue.on("complete", finishLoad, this);
        loadQueue.loadManifest([
            {id:"background", src:"img/background.jpg"},
            {id:"backgroundMask", src:"img/background-mask.png"},
            {id:"filmGrain", src:"img/noise.png"},
            {id:"twinkle", src:"img/twinkling.png"},
            {id:"blinker1", src:"img/blinker1.png"},
            {id:"blinker2", src:"img/blinker2.png"},
            {id:"blinker3", src:"img/blinker3.png"},
            {id:"lightning", src:"img/lightning.png"},
            {id:"smoke", src:"img/smoke.png"},
            {id:"smokeOverlay", src:"img/smokeOverlay.png"},
            {id:"neon1", src:"img/neon1.png"},
            {id:"neon2", src:"img/neon2.png"},
            {id:"spinner", src:"img/spinner.png"},
        ]);

        $("#ambientAudio").on("canplay", finishLoad);

        window.onresize = resize;
    }

    var filesCompleted = false;
    var soundsCompleted = false;
    function finishLoad(event)
    {
        if(event.type == "canplay")
        {
            soundsCompleted = true;
        }
        else
        {
            filesCompleted = true;
        }

        if(filesCompleted && soundsCompleted)
        {
            buildInterface();
        }
    }

    function buildInterface()
    {
        resize();

        layers.background = new createjs.Container();
        layers.backgroundOverlay = new createjs.Container();
        layers.twinkle = new createjs.Shape();
        layers.smokeOverlay = new createjs.Container();
        layers.smoke = new createjs.Shape();
        layers.filmGrain = new createjs.Shape();
        layers.spinner = new createjs.Container();

        //stage.addChild(layers.background);
        stage.addChild(layers.twinkle);
        stage.addChild(layers.backgroundOverlay);
        stage.addChild(layers.filmGrain);

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

        // Work on our background
        layers.background.setBounds(0,0, images.background.image.width, images.background.image.height);
        layers.backgroundOverlay.setBounds(0,0, images.background.image.width, images.background.image.height);

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
        layers.smoke.graphics.beginBitmapFill(images.smoke,'repeat').drawRect(0, 0, images.smoke.width, images.smoke.height * 2);

        layers.smoke.alpha = 0.5;
        layers.smokeOverlay.x = 737;
        layers.smokeOverlay.y = 277;
        var smokeMask = new createjs.Shape();
        smokeMask.graphics.beginFill("#000").drawRect(layers.smokeOverlay.x,layers.smokeOverlay.y,images.smokeOverlay.image.width, images.smokeOverlay.image.height);
        layers.smokeOverlay.mask = smokeMask;
        layers.smokeOverlay.setBounds(0,0,52,53);
        layers.smokeOverlay.addChild(layers.smoke);
        layers.smokeOverlay.addChild(images.smokeOverlay);

        layers.backgroundOverlay.addChild(layers.smokeOverlay);

        createjs.Tween.get(layers.smoke, {override:true, loop:true}).to({y:-images.smoke.height}, 15000);

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

        createjs.Ticker.setFPS(24);
        createjs.Ticker.addEventListener("tick", tick);

        createjs.Sound.play("ambientSound", createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 1, 0);

        $("#loadingIndicator").delay(2500).fadeOut(5000, function(){
            $(this).remove();
        });

        //spinnerFlight1();
    }

    var lightningOn = false;
    var lightningLength = getRandom(250, 1000);

    function tick()
    {
        // Make our twinkle
        //if(getRandom(0,100) < 25)
        //{
            layers.twinkle.x = getRandom(-500, 500) - 500;
            layers.twinkle.y = getRandom(-500, 500) - 500;
        //}

        processNeon(images.neon1);

        // Do our lightning
        if(!lightningOn)
        {
            lightningLength--;

            if(lightningLength <= 0)
            {
                lightningOn = true;
                lightningLength = getRandom(25, 50);
            }
        }
        else
        {
            if(getRandom(0,500) < 25)
            {
                images.lighting.alpha = 0;
            }
            else
            {
                images.lighting.alpha = 1;
            }

            lightningLength--;

            if(lightningLength <= 0)
            {
                lightningLength = getRandom(250, 1000);
                images.lighting.alpha = 0;
                lightningOn = false;
            }
        }


        // Randomly move our film grain
        layers.filmGrain.x = getRandom(-500, 500) - 500;
        layers.filmGrain.y = getRandom(-500, 500) - 500;

        stage.update();
    }

    init();

    $('#fullscreen').click(function () {
        if (screenfull.enabled) {

            screenfull.toggle();
            $('#fullscreen').toggleClass("fa-expand", !screenfull.isFullscreen).toggleClass("fa-compress", screenfull.isFullscreen);
        }
    });

    var isMute = false;

    $('#mute').click(function () {

        isMute = !isMute;
        createjs.Sound.setMute(isMute);
        $('#mute').toggleClass("fa-volume-up", !isMute).toggleClass("fa-volume-off", isMute);

    });
});

function getRandom (min, max) {
    return Math.random() * (max - min) + min;
}

function processNeon(target)
{
    if(getRandom(0,750) < 25)
    {
        target.alpha = 0.0;
    }
    else
    {
        target.alpha = 1.0;
    }
}

function makeBlink(target, onTime, offTime, fadeTime)
{
    target.alpha = 0.0;

    function beginAnimation()
    {
        target.alpha = 0.0;
        createjs.Tween.get(target, {override:true, loop:true}).to({alpha:1.0}, fadeTime).wait(onTime).to({alpha:0.0}, fadeTime).wait(offTime);
    }

    // Choose a random start time
    createjs.Tween.get(target, {override:true}).wait(getRandom(0, offTime)).call(beginAnimation);
}

/*!
 * screenfull
 * v1.2.0 - 2014-04-29
 * (c) Sindre Sorhus; MIT License
 */
!function(){"use strict";var a="undefined"!=typeof module&&module.exports,b="undefined"!=typeof Element&&"ALLOW_KEYBOARD_INPUT"in Element,c=function(){for(var a,b,c=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],d=0,e=c.length,f={};e>d;d++)if(a=c[d],a&&a[1]in document){for(d=0,b=a.length;b>d;d++)f[c[0][d]]=a[d];return f}return!1}(),d={request:function(a){var d=c.requestFullscreen;a=a||document.documentElement,/5\.1[\.\d]* Safari/.test(navigator.userAgent)?a[d]():a[d](b&&Element.ALLOW_KEYBOARD_INPUT)},exit:function(){document[c.exitFullscreen]()},toggle:function(a){this.isFullscreen?this.exit():this.request(a)},onchange:function(){},onerror:function(){},raw:c};return c?(Object.defineProperties(d,{isFullscreen:{get:function(){return!!document[c.fullscreenElement]}},element:{enumerable:!0,get:function(){return document[c.fullscreenElement]}},enabled:{enumerable:!0,get:function(){return!!document[c.fullscreenEnabled]}}}),document.addEventListener(c.fullscreenchange,function(a){d.onchange.call(d,a)}),document.addEventListener(c.fullscreenerror,function(a){d.onerror.call(d,a)}),void(a?module.exports=d:window.screenfull=d)):void(a?module.exports=!1:window.screenfull=!1)}();

