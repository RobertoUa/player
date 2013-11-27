# Scripting

## Overview

Scripting gives your animation the ability to react on certain input events, such as _mouse clicks_ or _key presses_. For example, you can make an animated cat follow your mouse cursor, or open a web page if a user clicks on a certain object, or let a user move objects with arrow keys, etc.

## The Basics

To add a handler for a specific input event, you should first decide what kind of event you need. Currently supported mouse events are:

* Click — User clicked (pressed & released left mouse button) at the object
* Press — User pressed left mouse button within object bounds
* Release — User released left mouse button within object bounds
* Enter — User moved mouse and it's entered an object shape
* Leave — User moved mouse and it's left an object shape
* Move — User moved mouse somewhere inside a canvas

And keyboard events:

* Type — User typed a character (pressed and released a key)
* Press — User pressed a key
* Release — User released a key

Ok, now that you know which one you need we're ready to implement a...

## Handler

Handlers are just predefined functions which look something like this:

	function onClick(ctx, evt, t) {
		// your code
	}

We're done all the dirty work, so all you need to do is write the body of the handler function. But before that, you should know something about how things are organized in the Player world.

## Elements

Elements are the core building blocks of the Player. If you see something, it's an Element. Even something you can't see (like an audio track) is an element. Scenes (a group of animated elements) are elements too.

Elements are organized hierarchically (some elements may contain another elements and so on) into Scenes. And there is always a Root scene.

Elements have a shape, a border and a shadow. They also have a Pivot (a point they're rotated around), an Alpha (which determines their transparency), and other properties which are described in detail in the [Full Player API documentation](http://animatron.com/player/doc/API.html).

Now let's try to create an element with a help of a ...

## Builder

A Builder is a special thing whose main purpose (as its name suggests) is to construct the Player's world.

Here is an example of how we could create a circle:

	var circle = _b('red_circle')   // _b is a builder
		.circle(                    // will create a rectangle
			[50, 50],               // at x = 50, y = 50
			20)                     // with radius = 20 pixels
		.fill(                      // and fill it with
			'#f00');                // red color

Ok, now lets add this element to our scene:

	this.$.scene.add(circle);

`this.$` here is a current element. All elements have a link to their own scene so `this.$.scene` will refer to the element's scene and `add(elem)` will add an element to the scene.

And what if we wish to add an element to another scene? It's easy, we just have to find that scene and add our circle to it:

	var anotherScene = this.findByName('another-scene')[0];
	anotherScene.add(circle);

Please note that `this.findByName(name)` will return an array of elements (scene is an element too, remember?) even if there is just one matching element, so we need to pick just the first one: `[0]`.

Now we know something about building blocks, but how do we bring our world to life?

## Tweens

Tweens are changes in your animation. If you see something changing, it means that somewhere there is a tween which describes that change.

In simple terms, a tween is the change of a value over time.

For example, movement is the change of an element's coordinates. Rotation is the change of element's angle. Vanishing is a change of an element's opacity.

So, if an object moves from one side of the canvas to another, it is due to a TRANSLATE tween (i.e. the object’s current coordinates are translated to the coordinates of the other side of the canvas). If an object changes its opacity, it is due to an ALPHA tween, and if it rotates, it’s due to a ROTATE tween and so on. Even audio tracks use tweens (VOLUME).

Let's see a real example. We'll add a tween to our red circle and move it somewhere on the screen. Let's use Builder again:

	circle.trans(
		[0, 5],      // 1
		[[0, 0],     // 2
		 [100, 0],   // 3
		C.E_DEF      // 4
	);

1. Defining a time range for our transition: from 0 to 5 secs
2. Defining a start point RELATIVE to our current position
3. An end point RELATIVE to current position
4. And define an Easing function (which will discuss a little bit later)

Ok - now we know how to create elements and how to animate them, so let's define our first click handler.

## Handler example

In this example we will add a handler which will rotate a rectangle 360 degrees and then rotate it back. We will assign this handler on mouse click event so every time user will click on the object it will rotate:

	function onClick(ctx, evt, t) {
		var rect = null;
		var rects = this.findByName('rect');
		if (rects.length == 0) {                        // 1
			rect = _b('rect')
			.rect([50, 50], [30, 30])
			.fill('#0f')
			.build();                                   // 2

			this.$.scene.add(rect);
		} else {
			rect = rects[0];
		}

		_b(rect).rotate(
			[t, t + 2],
			[0, Math.PI * 2],                           // 3
			C.E_DEF);

		_b(rect).rotate(
			[t + 2, t + 4],
			[Math.PI * 2, 0],                           // 4
			C.E_DEF);
	};

1. Before anything else, let's check if there are any existing rects to make sure that each time a user clicks the mouse we’ll use an existing rectangle instead of creating a new one.
2. `build()` will create an Element here so we can use like it was found in the Player if it was a second time we're clicking the mouse
3. And rotate it forth in 2 seconds
4. And then back in next 2 seconds

## Easing

In a real world there is no constant speed. A bird moves with different speeds, a man walks faster or slower, a ball rolls faster and then slows down and stops. So we need something to emulate these real world (or maybe not so real) speed changes. This is why we need different Easing functions.

The C.E_DEF mentioned earlier in tweens is one of such functions which keeps speed of the change constant all the time. But more often you will need to use different Easing functions which are described in the [Player API documentation](http://animatron.com/player/doc/API.html#tween-easings).

## Events

Every handler receives an Event: `evt`. Depending on type of the event it could be a mouse event or keyboard events.

Mouse event contains coordinates of the mouse pointer:

	var x = evt.pos[0];
	var y = evt.pos[1];

Keyboard events contains key code:

	var space = evt.key === 32;
    var r_pressed = evt.char === 'R';