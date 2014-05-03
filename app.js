$(function() {

    var canvas = document.getElementById("mainCanvas");
    var stage;
    var loadQueue;
    var layers = {};
    var images = {};

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
        loadQueue.installPlugin(createjs.Sound);
        loadQueue.setUseXHR(false);
        loadQueue.on("complete", buildInterface, this);
        loadQueue.loadManifest([
            {id:"background", src:"img/background.jpg"},
            {id:"backgroundMask", src:"img/background-mask.png"},
            {id:"filmGrain", src:"img/noise.png"},
            {id:"twinkle", src:"img/twinkling.png"},
            {id:"blinker1", src:"img/blinker1.png"},
            {id:"blinker2", src:"img/blinker2.png"},
            {id:"neon1", src:"img/neon1.png"},
            {id:"neon2", src:"img/neon2.png"},
            {id:"ambientSound", src:"sound/ambient.mp3", type:createjs.LoadQueue.SOUND}
        ]);

        window.onresize = resize;
    }

    function buildInterface()
    {
        resize();

        layers.background = new createjs.Container();
        layers.backgroundOverlay = new createjs.Container();
        layers.twinkle = new createjs.Shape();
        layers.filmGrain = new createjs.Shape();

        stage.addChild(layers.background);
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
        images.neon1 = new createjs.Bitmap(loadQueue.getResult("neon1"));
        images.neon2 = new createjs.Bitmap(loadQueue.getResult("neon2"));

        // Work on our background
        layers.background.setBounds(0,0, images.background.image.width, images.background.image.height);
        layers.backgroundOverlay.setBounds(0,0, images.background.image.width, images.background.image.height);

        layers.background.addChild(images.background);

        var amf = new createjs.AlphaMaskFilter(images.backgroundMask.image);
        images.backgroundOverlay.filters = [amf];
        images.backgroundOverlay.cache(0, 0, images.backgroundMask.image.width, images.backgroundMask.image.height);
        layers.backgroundOverlay.addChild(images.backgroundOverlay);

        // Setup our blinkers and neons
        layers.backgroundOverlay.addChild(images.blinker1);

        images.blinker2.x = 430;
        images.blinker2.y = 295;
        layers.backgroundOverlay.addChild(images.blinker2);

        images.neon1.x = 74;
        images.neon1.y = 769;
        layers.backgroundOverlay.addChild(images.neon1);

        images.neon2.x = 1895;
        images.neon2.y = 407;
        layers.backgroundOverlay.addChild(images.neon2);

        makeBlink(images.blinker1, 2500, 1500, 0);
        makeBlink(images.blinker2, 1000, 1000, 250);
        makeBlink(images.neon2, 250, 500, 0);

        resize();

        createjs.Ticker.setFPS(24);
        createjs.Ticker.addEventListener("tick", tick);
    }

    function tick()
    {
        // Make our twinkle
        if(getRandom(0,100) < 25)
        {
            layers.twinkle.x = getRandom(-500, 500) - 500;
            layers.twinkle.y = getRandom(-500, 500) - 500;
        }

        processNeon(images.neon1);

        // Randomly move our film grain
        layers.filmGrain.x = getRandom(-500, 500) - 500;
        layers.filmGrain.y = getRandom(-500, 500) - 500;

        stage.update();
    }

    init();
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



