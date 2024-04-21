# controls.js
What's this? 
Maybe it's faster to understand by having a look at the demo over here: https://xtsoler.github.io/controls.js/

controls.js is a little javascript library that tries to offer on screen controls for your game. The controls will work with keyboard, mouse and a controller if it is properly detected by a compatible broswer.

Fastest way to see how it works is to clone the repository and have a look at the js/main.js file:

const controls = new Controls();

const game = new BrosGame(controls);

game.init();

We create a new Controls object and then feed it to our game constructor, in this case BrosGame which is a simple example game.
Then some references to that object are necesary so that the on screen controls are operational and also properly depicted when pressed.
Look for comments before references to this.controls object in js/brosGame.js

Still work in progress!
So far only tested with a PS5 dual sense controller, works on Chrome on PC as well as on an iPhone in Safari.
