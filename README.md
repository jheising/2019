2019
====

A browser experiment by [@jimheising](http://twitter.com/jimheising)

### Background

This is a little project I've always wanted to work on but finally got around to doing. Originally the idea was to make a compiled screensaver, but after a while I decided it would be more fun to see if it could be done in the browser. The idea is to see what is possible with real-time video compositing in the browser— things start to get a bit CPU intensive when you are working with many levels and layers of alpha channels.

### How it was done

Originally my idea was to build this entirely in 3D, but IMHO even the best Hollywood CGI doesn't come close to matching the warmth and realism of the real model sets used in Blade Runner, so I decided to start with a still image directly from a vid-cap of the movie. The challenge at this point was now to make a still image feel like it was alive, so I used a few tricks.

***Trick #1 - Remove anything that would be moving.*** The original picture had a Spinner right smack dab in the middle of the frame. Obviously the spinner would be moving in real life so I had to remove it from the image. This was done with a heck of a lot of work in with the Photoshop spot repair, content-aware fills and other stuff. Eventually with enough work I was able to remove it and "paint" in the background that would be behind it.

***Trick #2 - Make the lights come alive.*** Normally when you see city lights in a video or in real life, they are hardly ever a solid color or brightness. They "twinkle" (a bit like stars) due to the varying density of air, noise in the imager of the camera and other things. So again in Photoshop, I was able to select all the lights (mostly by intensity and color, but a bunch by hand) and create a mask. Then I went through and created a version of the whole scene without lights (mostly done with the Photoshop spot repair tool). The light flickering is accomplished by randomly moving a picture of colored noise behind a masked version (ie the light areas removed) of the city. This is then layered over the background of the image of the city with no lights. The reason for this final background layer (without lights) is that when a light is dimmer, we want it to become the color of that specific area without lights, and not just some standard uniform color like black.

***Trick #3 - Add some noise.*** The film-grain effect is another overlay on top of the flickering lights and everything else that just adds more "movement" to the scene. It's just another image of noise that is randomly moved around the page.

***Trick #4 - Make things imperfect.*** One of the more difficult parts of the image composite was the billboard area. This had a still image of a geisha that was comprised of a matrix of lights. I had to create an overlay mask for this matrix so the video could be seen behind it. Because of the complexity and imperfection of this matrix, it would be really difficult to remove and mask out the matrix pixels individually. So I had to create my own pattern of dots and transform it (using the Photoshop perspective/vanishing point tool) to fit into the perspective of the scene. This wasn't that hard to do, but it just didn't look right. So I spent a ton of time adding imperfections into the matrix to make it appear aged and give the illusion of depth and imperfection.

### How to use it

Sit back, drone out and imagine what it would be like to live in Los Angeles, 2019.

### Limitations

Many... I've only optimized for Chrome and Safari on the Mac. Firefox appears to be quite slow. Appears to crash most mobile browsers.

### To Dos

- Increase performace
- Add animations for flying Spinners
- Create a mobile version (if possible)
