/*
 * Name          : controls.js
 * @author       : Christos Tsoleridis
 * Last modified : 14.04.2024
 * Revision      : 0.0.1
 *
 * Modification History:
 * Date         Version     Modified By			Description
 * 2024-04-14	0.0.1		Christos Tsoleridis	initial version
 
 * The MIT License (MIT)
 *
 *  This file is part of the JoyStick Project (https://github.com/bobboteck/JoyStick).
 *	Copyright (c) 2015 Roberto D'Amico (Bobboteck).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
class Controls{
    constructor(){
        console.log("Controls constructor executed.");
        this.window = window;
        // input byte stuff
        this.input_byte_0 = 0;
        this.input_byte_1 = 0;

        // font size stuff
        this.fontBase = 1000; // selected default width for canvasMain
        this.fontSize = 70; // default size for font
        this.tracked_touches = [];

        this.canvasMain = document.getElementById('mainCanvas');
        this.ctx = this.canvasMain.getContext('2d');

        this.canvasControls = document.createElement('canvas');
        this.ctxControls = this.canvasControls.getContext("2d");
        //ctxControls.font = myFontSize + "px " + fontName;

        // list of objects drawn, each rectangle should have x,y,width,height properties
        this.buttonObjects = [];
        this.textObjects = [];
        this.videoX = 0;
        this.videoY = 0;
        this.videoWidth = 0;
        this.videoHeight = 0;

        this.firstButtonInteraction = true;
        this.debug = true;
        this.debug_text = 'debug';
        this.last_user_input_method_controller = false;        

        // gamepad stuff ------------------------
        this.haveEvents = 'GamepadEvent' in window;
        this.haveWebkitEvents = 'WebKitGamepadEvent' in window;
        this.controllers = {};
        if (this.haveEvents) {
        window.addEventListener("gamepadconnected", this.connectHandler.bind(this));
        window.addEventListener("gamepaddisconnected", this.disconnectHandler.bind(this));
        } else if (this.haveWebkitEvents) {
        window.addEventListener("webkitgamepadconnected", this.connectHandler.bind(this));
        window.addEventListener("webkitgamepaddisconnected", this.disconnectHandler.bind(this));
        } else {
        setInterval(this.scanGamepads.bind(this), 500);
        }
        // --------------------------------------

        this.init();
    }
    init() {
        // Initialization code
        this.resizeCanvas();
        this.bindEvents();
    }

    // Resize the canvas and its content
    resizeCanvas() {
        //console.log("this.window.innerWidth=" + this.window.innerWidth);
        //console.log("this.canvasMain.width" + this.canvasMain.width);
        
        this.canvasMain.width = this.window.innerWidth - (this.window.innerWidth*0.005);
        this.canvasMain.height = this.window.innerHeight - (this.window.innerHeight*0.005);
        this.canvasControls.width = this.canvasMain.width;
        this.canvasControls.height = this.canvasMain.height;
        this.buttonObjects = [];
        this.textObjects = [];

        if (this.canvasMain.width > this.canvasMain.height) {
            this.videoX = this.canvasMain.width / 3.5;
            this.videoWidth = this.canvasMain.width / 2;
            this.videoHeight = this.canvasMain.height;
            const buttonWidth = this.canvasMain.width / 4 / 2, buttonHeight = this.canvasMain.height /6, marginX = this.canvasMain.width * 0.05, marginY = this.canvasMain.height * 0.05;
            var limited_marginX = marginX, limited_marginY = marginY;
            if (limited_marginX > 5) {
                limited_marginX = 5;
            }
            if (limited_marginY > 5) {
                limited_marginY = 5;
            }
            //this.buttonObjects.push({name: "COIN", x: marginX, y: this.canvasMain.height - buttonHeight - marginY, width: buttonWidth, height: buttonHeight, keyboard_code: 53, bit_offset: 0, font: "", fontWidth: 9, fontHeight: 0}); // 1 key
            this.buttonObjects.push({name: "START", x: this.canvasMain.width - marginX - buttonWidth, y: limited_marginY, width: buttonWidth, height: buttonHeight, keyboard_code: 49, bit_offset: 1, font: "", fontWidth: 9, fontHeight: 0}); // 5 key
            this.buttonObjects.push({name: "FIRE", x: this.canvasMain.width - buttonWidth - limited_marginX - buttonWidth / 2, y: 3 * buttonHeight + 2 * limited_marginY, width: buttonWidth, height: buttonHeight, keyboard_code: 86, bit_offset: 2, font: "", fontWidth: 9, fontHeight: 0}); // V key
            this.buttonObjects.push({name: "JUMP", x: this.canvasMain.width - buttonWidth - limited_marginX, y: 2 * buttonHeight + limited_marginY, width: buttonWidth, height: buttonHeight, keyboard_code: 67, bit_offset: 3, font: "", fontWidth: 9, fontHeight: 0}); // C key
            this.buttonObjects.push({name: "LEFT", x: limited_marginX, y: 2.5 * buttonHeight, width: buttonWidth, height: buttonHeight, keyboard_code: 37, bit_offset: 4, font: "", fontWidth: 9, fontHeight: 0}); // Left key
            //buttonObjects.push({name: "Up", x: 400, y: 250, width: buttonWidth, height: buttonHeight, keyboard_code: 38, bit_offset: 5}); // Up key
            this.buttonObjects.push({name: "RIGHT", x: limited_marginX * 2 + buttonWidth, y: 2.5 * buttonHeight, width: buttonWidth, height: buttonHeight, keyboard_code: 39, bit_offset: 6, font: "", fontWidth: 9, fontHeight: 0}); // Right key
            //buttonObjects.push({name: "Down", x: 400, y: 250, width: buttonWidth, height: buttonHeight, keyboard_code: 40, bit_offset: 7}); // Down key

            // other text elements on screen
            this.textObjects.push({the_text: "*arrow keys", x: limited_marginX, y: 2.5 * buttonHeight - this.canvasMain.height / 20 - limited_marginY, width: buttonWidth, height: this.canvasMain.height / 20, font: "", fontWidth: 9, fontHeight: 0}); // 1 key
            this.textObjects.push({the_text: "*V: fire, C: jump", x: this.canvasMain.width - limited_marginX - buttonWidth, y: 2 * buttonHeight + limited_marginY - this.canvasMain.height / 20, width: buttonWidth, height: this.canvasMain.height / 20, font: "", fontWidth: 9, fontHeight: 0}); // 1 key
            this.textObjects.push({the_text: "*1: start", x: this.canvasMain.width - marginX - buttonWidth, y: limited_marginY + buttonHeight, width: buttonWidth, height: this.canvasMain.height / 22, font: "", fontWidth: 9, fontHeight: 0}); // 1 key
            //this.textObjects.push({the_text: "*5: coin", x: marginX, y: this.canvasMain.height - buttonHeight - marginY - this.canvasMain.height / 22, width: buttonWidth, height: this.canvasMain.height / 22, font: "", fontWidth: 9, fontHeight: 0}); // 1 key
        } else {
            this.videoX = 0;
            this.videoWidth = this.canvasMain.width;
            this.videoHeight = this.canvasMain.height * 5.4 / 9;
            const buttonWidth = this.canvasMain.width / 4, buttonHeight = this.canvasMain.height / 9, marginX = this.canvasMain.width * 0.05, marginY = this.canvasMain.height * 0.05;
            var limited_marginX = marginX, limited_marginY = marginY;
            if (limited_marginX > 5) {
                limited_marginX = 5;
            }
            if (limited_marginY > 5) {
                limited_marginY = 5;
            }
            //this.buttonObjects.push({name: "COIN", x: marginX, y: this.canvasMain.height - buttonHeight - limited_marginY * 2, width: buttonWidth, height: buttonHeight, keyboard_code: 53, bit_offset: 0, font: "", fontWidth: 9, fontHeight: 0}); // 1 key
            this.buttonObjects.push({name: "START", x: this.canvasMain.width - marginX - buttonWidth, y: this.canvasMain.height - buttonHeight - limited_marginY * 2, width: buttonWidth, height: buttonHeight, keyboard_code: 49, bit_offset: 1, font: "", fontWidth: 9, fontHeight: 0}); // 5 key
            this.buttonObjects.push({name: "FIRE", x: this.canvasMain.width - buttonWidth - limited_marginX - buttonWidth / 2, y: this.canvasMain.height - buttonHeight * 2.1 - 3 * limited_marginY, width: buttonWidth, height: buttonHeight, keyboard_code: 86, bit_offset: 2, font: "", fontWidth: 9, fontHeight: 0}); // V key
            this.buttonObjects.push({name: "JUMP", x: this.canvasMain.width - buttonWidth - limited_marginX, y: this.canvasMain.height - buttonHeight * 3.1 - 4 * limited_marginY, width: buttonWidth, height: buttonHeight, keyboard_code: 67, bit_offset: 3, font: "", fontWidth: 9, fontHeight: 0}); // C key
            this.buttonObjects.push({name: "LEFT", x: limited_marginX, y: this.canvasMain.height - buttonHeight * 2.5 - 3 * limited_marginY, width: buttonWidth, height: buttonHeight, keyboard_code: 37, bit_offset: 4, font: "", fontWidth: 9, fontHeight: 0}); // Left key
            //buttonObjects.push({name: "Up", x: 400, y: 250, width: buttonWidth, height: buttonHeight, keyboard_code: 38, bit_offset: 5}); // Up key
            this.buttonObjects.push({name: "RIGHT", x: limited_marginX * 2 + buttonWidth, y: this.canvasMain.height - buttonHeight * 2.5 - 3 * limited_marginY, width: buttonWidth, height: buttonHeight, keyboard_code: 39, bit_offset: 6, font: "", fontWidth: 9, fontHeight: 0}); // Right key
            //buttonObjects.push({name: "Down", x: 400, y: 250, width: buttonWidth, height: buttonHeight, keyboard_code: 40, bit_offset: 7}); // Down key
        }

        // font related calculations
        for (var buttonObject of this.buttonObjects) {
            var font_pixels = (buttonObject.height * 0.95);
            buttonObject.font = font_pixels + 'px sans-serif';
            this.ctx.font = buttonObject.font;
            var fontMetrics = this.ctx.measureText(buttonObject.name);
            while (fontMetrics.width > buttonObject.width) {
                font_pixels = font_pixels - 0.05;
                buttonObject.font = font_pixels + 'px sans-serif';
                this.ctx.font = buttonObject.font;
                fontMetrics = this.ctx.measureText(buttonObject.name);
            }
            buttonObject.fontHeight = fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent;
            buttonObject.fontWidth = fontMetrics.width;
            //console.log(this.buttonObject.font);
        }
        for (var textObject of this.textObjects) {
            var font_pixels = (textObject.height * 0.95);
            textObject.font = font_pixels + 'px sans-serif';
            this.ctx.font = textObject.font;
            var fontMetrics = this.ctx.measureText(textObject.the_text);
            while (fontMetrics.width > textObject.width) {
                font_pixels = font_pixels - 0.05;
                textObject.font = font_pixels + 'px sans-serif';
                this.ctx.font = textObject.font;
                fontMetrics = this.ctx.measureText(textObject.the_text);
            }
            textObject.fontHeight = fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent;
            textObject.fontWidth = fontMetrics.width;
            //console.log("this.textObject.font=" + this.textObject.font);
        }
        /**
         * Your drawings need to be inside this function otherwise they will be reset when 
         * you resize the browser window and the canvasMain goes will be cleared.
         */
        this.refreshMainCanvas();
    }
    key2bit_num(key) {
        for (const element of this.buttonObjects) {
            if (element.keyboard_code == key) {
                return element.bit_offset;
            }
        }
        return null;
    }
    keyboard_or_mouse_input(bit_offset, set_or_clear) {
        this.last_user_input_method_controller = false;
        if (bit_offset != null) {
            this.bitset_byte1(set_or_clear, bit_offset);
        }
        this.refreshMainCanvas();
    }
    handleKeyDown(event) {
        if (event.repeat) { return }
        if (this.firstButtonInteraction) {
            //init_audio();
            this.firstButtonInteraction = false;
        }
        if (this.debug) {
            console.log(event.which);
        }
        //sendInput(event.which, true);
        this.keyboard_or_mouse_input(this.key2bit_num(event.which), true);
        // if (debug) {
        //     console.log(bit_test(input_byte_0, 0));
        // }
    }
    handleKeyUp(event) {
        this.keyboard_or_mouse_input(this.key2bit_num(event.which), false);
    }
    // Bind events to the canvas
    bindEvents() {
        // Event binding logic
        // resize the canvasMain to fill browser window dynamically
        window.addEventListener('resize', this.resizeCanvas.bind(this), false);
        // detect orientation change in phones/tablets
        window.onorientationchange = (event) => {
            this.resizeCanvas();
        };
        
        // keyboard stuff --------------------------------------------------------------------------------------------------------------
        document.addEventListener('keydown', this.handleKeyDown.bind(this), false);
        document.addEventListener('keyup', this.handleKeyUp.bind(this), false);
        // -----------------------------------------------------------------------------------------------------------------------------

        // Binding the click event on the canvasMain
        //var canvasMain = document.getElementById('canvasMain');
        //var context = canvasMain.getContext('2d');
        this.canvasMain.addEventListener('mousedown', this.handleMouseDown.bind(this), false);
        

        this.canvasMain.addEventListener('mouseup', this.clearAll.bind(this), false);
        this.canvasMain.addEventListener('mouseout', this.clearAll.bind(this), false);

        // -----------------------------------------------------------------------------------------------------------------------------

        // touch stuff --------------------------------------------------------------------------------------------------------------
        // Set up touch events for mobile, etc
        this.canvasMain.addEventListener("touchstart",this.handleTouchStart.bind(this), false);

        this.canvasMain.addEventListener("touchend", this.handleTouchEnd.bind(this), false);

        this.canvasMain.addEventListener("touchmove", this.handleTouchMove.bind(this), false);

        // Get the position of a touch relative to the canvasMain
        function getTouchPos(canvasMainDom, touchEvent) {
            var rect = canvasMainDom.getBoundingClientRect();
            return {
                x: touchEvent.touches[0].clientX - rect.left,
                y: touchEvent.touches[0].clientY - rect.top
            };
        }

        // Prevent scrolling when touching the canvasMain
        document.body.addEventListener("touchstart", this.preventTouchDefault.bind(this), false);
        document.body.addEventListener("touchend", this.preventTouchDefault.bind(this), false);
        document.body.addEventListener("touchmove", this.preventTouchDefault.bind(this), false);
    }

    // Send input data
    sendData() {
        // Send data logic
        var ab = new ArrayBuffer(2);
        var ia = new Uint8Array(ab);
    
        ia[0] = this.input_byte_0;
        ia[1] = this.input_byte_1;
        var bb = new Blob([ab]);
        //ws.send(bb);
    }

    // Draw a button
    drawButton(buttonObject, layer_ctx) {
        // Drawing logic for button
        layer_ctx.beginPath();
        layer_ctx.rect(buttonObject.x, buttonObject.y, buttonObject.width, buttonObject.height);
        layer_ctx.fillStyle = 'rgba(225,225,225,1)';
        layer_ctx.fill();
        layer_ctx.fillStyle = 'rgba(225,225,225,0.5)';
        if (this.bit_test(this.input_byte_0, buttonObject.bit_offset)) {
            layer_ctx.fillStyle = 'rgba(0,225,225,0.5)';
        }
        layer_ctx.fill();
        layer_ctx.lineWidth = 2;
        layer_ctx.strokeStyle = '#000000';
        layer_ctx.stroke();
        layer_ctx.closePath();
        layer_ctx.fillStyle = '#000000';
        //ctx.fillText(rect.name, rect.x + rect.width / 4, rect.y + 64);
        //ctx.font = getFont();

        layer_ctx.font = buttonObject.font;
        layer_ctx.fillText(buttonObject.name, buttonObject.x + (buttonObject.width / 2) - (buttonObject.fontWidth / 2), buttonObject.y + (buttonObject.height / 2) + (buttonObject.fontHeight / 2));
    }

    // Draw text
    drawText(textObject, layer_ctx) {
        // Drawing logic for text
        layer_ctx.fillStyle = '#000000';
        layer_ctx.font = textObject.font;
        layer_ctx.fillText(textObject.the_text, textObject.x + (textObject.width / 2) - (textObject.fontWidth / 2), textObject.y + (textObject.height / 2) + (textObject.fontHeight / 2));
    }

    // Refresh the main canvas
    refreshMainCanvas() {
        // Refresh logic
        //console.log("refreshMainCanvas()");
        this.ctx.clearRect(0, 0, this.canvasMain.width, this.canvasMain.height);
        this.ctxControls.clearRect(0, 0, this.canvasControls.width, this.canvasControls.height);
        
        for (var element of this.buttonObjects) {
            this.drawButton(element, this.ctxControls);
        }
        for (var element of this.textObjects) {
            this.drawText(element, this.ctxControls);
        }

        
        this.ctx.drawImage(this.canvasControls,0 ,0);
        if (this.debug){
            var output = "";
            for(var i = 0 ; i<8 ; i++){
                if (this.bit_test(this.input_byte_0, i)) {
                    output += "1";
                } else {
                    output += "0";
                }
            }
            this.ctx.fillText(this.debug_text, 40, 40);
            this.ctx.fillText(output, 40, 60);
            var curr_input = "-";
            if(this.last_user_input_method_controller){
                curr_input = "controller";
            }
            this.ctx.fillText(curr_input, 40, 80);
        }
            
    }
    // Function to get the mouse position
    getMousePos(canvasMain, event) {
        var rect = this.canvasMain.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }
    // Clear all input
    clearAll(event) {
        // Clear all input logic
        // clear all bits in input byte
        //sendInput(53, false);
        //sendInput(49, false);
        for (const element of this.buttonObjects) {
            this.keyboard_or_mouse_input(element.bit_offset, false);
        }
    }

    // Handle mouse down event
    handleMouseDown(evt) {
        // Mouse down event handling logic
        if (this.firstButtonInteraction) {
            //init_audio();
            this.firstButtonInteraction = false;
        }
        var mousePos = this.getMousePos(this.canvasMain, evt);
        for (const element of this.buttonObjects) {
            if (this.isInside(mousePos, element)) {
                //alert('clicked inside rect');
                //sendInput(element.keyboard_code, true);
                this.keyboard_or_mouse_input(element.bit_offset, true);
            } else {
                //alert('clicked outside rect');
            }
        }
    }

    // Handle touch start event
    handleTouchStart(e) {
        if (this.firstButtonInteraction) {
            //init_audio();
            this.firstButtonInteraction = false;
        }
        //mousePos = getTouchPos(canvasMain, e);
        var current_touches = e.touches;
        for (var i = 0; i < current_touches.length; i++) {
            for (const element of this.buttonObjects) {
                if (this.isInside({x: current_touches[i].clientX, y: current_touches[i].clientY}, element)) {
                    //alert('clicked inside rect');
                    this.tracked_touches.push({id: current_touches[i].identifier, hitObject: element});
                    //sendInput(element.keyboard_code, true);	
                    this.keyboard_or_mouse_input(element.bit_offset, true);
                } //else {
                //alert('clicked outside rect');
                //}
            }
        }
    }

    // Handle touch end event
    handleTouchEnd(e) {
        var current_touches = e.changedTouches;
            for (var i = 0; i < current_touches.length; i++) {
                for (const t of this.tracked_touches) {
                    if (t.id == current_touches[i].identifier) {
                        //sendInput(t.hitObject.keyboard_code, false);
                        this.keyboard_or_mouse_input(t.hitObject.bit_offset, false);
                    }
                }
            }
    }

    // Handle touch move event
    handleTouchMove(e) {
        var touch = e.touches[0];
            var mouseEvent = new MouseEvent("mousemove", {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvasMain.dispatchEvent(mouseEvent);
    }

    // Get the touch position relative to the canvas
    //getTouchPos(canvasMainDom, touchEvent) {
        // Get touch position logic
    //}

    // Prevent default touch behaviors
    preventTouchDefault(e) {
        if (e.target == this.canvasMain) {
            e.preventDefault();
        }
    }

    // Function to check whether a point is inside a rectangle
    isInside(pos, rect) {
        return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y
    }
    
    getFont() {
        var ratio = this.fontSize / this.fontBase;   // calc ratio
        var size = this.canvasMain.width * ratio;   // get font size based on current width
        return (size | 0) + 'px sans-serif'; // set font
    }

    bitset_byte1(set_or_clear, bitnum) {
        if (set_or_clear) {
            if (!this.bit_test(this.input_byte_0, bitnum)) {
                this.input_byte_0 = this.bit_set(this.input_byte_0, bitnum);
                this.sendData();
            }
        } else {
            if (this.bit_test(this.input_byte_0, bitnum)) {
                this.input_byte_0 = this.bit_clear(this.input_byte_0, bitnum);
                this.sendData();
            }
        }
    }

    bit_set(num, bit) {
        return num | 1 << bit;
    }

    bit_clear(num, bit) {
        return num & ~(1 << bit);
    }

    bit_test(num, bit) {
        return ((num >> bit) % 2 !== 0);
    }

    // gamepad stuff ------------------------
    connectHandler(e) {
        console.log(e.gamepad.index);
        this.controllers[e.gamepad.index] = e.gamepad;
    }
    disconnectHandler(e) {
        delete this.controllers[e.gamepad.index];
    }
    updateStatus() {
        this.refreshMainCanvas();
        this.scanGamepads();
        for (let j in this.controllers) {
          const controller = this.controllers[j];
          for (let i = 0; i < controller.buttons.length; i++) {
             const val = controller.buttons[i];
             let pressed = val == 1.0;
            // let touched = false;
             if (typeof(val) == "object") {
               pressed = val.pressed;
            }
            
            if(i==15){
                this.setWhenDifferent(6, pressed);
            }
            if(i==14){
                this.setWhenDifferent(4, pressed);
            }
            if(i==0){
                this.setWhenDifferent(2, pressed);
            }
            if(i==1){
                this.setWhenDifferent(3, pressed);
            }
            if(i==9){
                this.setWhenDifferent(1, pressed);
            }
          }
        }
        //this.refreshMainCanvas();
      }

      setWhenDifferent(bit_offset, pressed){
        if(pressed){
            this.last_user_input_method_controller = true;
        }
        if(this.last_user_input_method_controller){
            if(this.bit_test(this.input_byte_0, bit_offset) != pressed){
                this.bitset_byte1(pressed, bit_offset);
                //this.keyboard_or_mouse_input(6, pressed);
            }
        }
        
      }
    
      scanGamepads() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        for (let i = 0; i < gamepads.length; i++) {
          if (gamepads[i] && (gamepads[i].index in this.controllers)) {
            this.controllers[gamepads[i].index] = gamepads[i];
          }
        }
      }
    // --------------------------------------
    
}


