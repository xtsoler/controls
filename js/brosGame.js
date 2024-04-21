
        class BrosGame {
            constructor(controls) {
                this.controls = controls;
                //this.canvas = document.getElementById('mainCanvas');
                this.canvas = document.createElement('canvas');
                //this.canvas.width = controls.videoWidth;
                this.canvas.width = 512;
                //this.canvas.height = controls.videoHeight;
                this.canvas.height = 448;
                this.ctx = this.canvas.getContext('2d');
                this.player = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height - 50,
                    width: 40,
                    height: 40,
                    speed: 5,
                    jumping: false,
                    jumpHeight: 100,
                    jumpSpeed: 5,
                    jumpCount: 0,
                    isOnGround: true,
                    facingLeft: false,
                    spriteIndex: 0,
                    sprites: []
                };
                this.snowball = {
                    x: 0,
                    y: 0,
                    radius: 5,
                    speed: 45,
                    directionX: 0,
                    directionY: -1,
                    visible: false
                };
                this.enemies = [];
                this.level = 1;
                this.gameState = 'start';
            }

            init() {
                this.loadSprites();
                //document.addEventListener('keydown', this.handleKeyDown.bind(this));
                this.startGame();
            }

            loadSprites() {
                const playerRight1 = new Image();
                playerRight1.src = 'images/player-right-1.png';
                //const playerRight2 = new Image();
                //playerRight2.src = 'images/player-right-2.png';
                const playerLeft1 = new Image();
                playerLeft1.src = 'images/player-left-1.png';
                //const playerLeft2 = new Image();
                //playerLeft2.src = 'images/player-left-2.png';
                playerRight1.onload = () => {
                    this.player.sprites[0] = playerRight1;
                    //this.player.sprites[1] = playerRight2;
                    this.player.sprites[2] = playerLeft1;
                    //this.player.sprites[3] = playerLeft2;
                };
            }

            startGame() {
                this.spawnEnemies();
                this.gameLoop();
            }

            spawnEnemies() {
                this.enemies = [];
                for (let i = 0; i < 5; i++) {
                    this.enemies.push({
                        x: Math.random() * (this.canvas.width - 40),
                        y: 50,
                        width: 40,
                        height: 40,
                        speed: Math.random() * 2 + 1
                    });
                }
            }
            /*
            handleKeyDown(event) {
                if (this.gameState === 'playing') {
                    if (event.key === 'ArrowLeft') {
                        this.player.x -= this.player.speed;
                        this.player.facingLeft = true;
                    } else if (event.key === 'ArrowRight') {
                        this.player.x += this.player.speed;
                        this.player.facingLeft = false;
                    } else 
                    if (event.key === ' ') {
                        if (!this.snowball.visible) {
                            this.snowball.visible = true;
                            this.snowball.x = this.player.x + this.player.width / 2;
                            this.snowball.y = this.player.y;
                        }
                    } else if (event.key === 'ArrowUp' && this.player.isOnGround) {
                        this.player.jumping = true;
                        this.player.isOnGround = false;
                    }
                } else if (this.gameState === 'start' && event.key === 'Enter') {
                    this.gameState = 'playing';
                }
            }
            */

            update() {
                if (this.gameState === 'playing') {
                    // Update player position
                    if (this.player.jumping) {
                        this.player.y -= this.player.jumpSpeed;
                        this.player.jumpCount += this.player.jumpSpeed;
                        if (this.player.jumpCount >= this.player.jumpHeight) {
                            this.player.jumping = false;
                            this.player.jumpCount = 0;
                        }
                    } else {
                        this.player.y += this.player.jumpSpeed;
                        if (this.player.y >= this.canvas.height - this.player.height) {
                            this.player.isOnGround = true;
                            this.player.y = this.canvas.height - this.player.height;
                        }
                    }
                    // respect active control commands
                    if (this.controls.bit_test(this.controls.input_byte_0, 6)) {// P1 LEFT
                        this.player.x += this.player.speed;
                        this.player.facingLeft = false;
                    }
                    if (this.controls.bit_test(this.controls.input_byte_0, 4)) {// P1 RIGHT
                        this.player.x -= this.player.speed;
                        this.player.facingLeft = true;
                    }
                    if (this.controls.bit_test(this.controls.input_byte_0, 2)) {// P1 FIRE
                        if (!this.snowball.visible) {
                            this.snowball.visible = true;
                            this.snowball.x = this.player.x + this.player.width / 2;
                            this.snowball.y = this.player.y;
                        }
                    }
                    if (this.controls.bit_test(this.controls.input_byte_0, 3) && this.player.isOnGround) {// P1 JUMP
                        this.player.jumping = true;
                        this.player.isOnGround = false;
                    }

                    // Update snowball position
                    if (this.snowball.visible) {
                        this.snowball.y += this.snowball.speed * this.snowball.directionY;

                        // Check collision with enemies
                        for (let i = 0; i < this.enemies.length; i++) {
                            if (this.snowball.x > this.enemies[i].x && this.snowball.x < this.enemies[i].x + this.enemies[i].width &&
                                this.snowball.y > this.enemies[i].y && this.snowball.y < this.enemies[i].y + this.enemies[i].height) {
                                this.snowball.visible = false;
                                this.enemies.splice(i, 1);
                                if (this.enemies.length === 0) {
                                    this.level++;
                                    this.spawnEnemies();
                                }
                                break;
                            }
                        }

                        // Check if snowball is out of bounds
                        if (this.snowball.y < 0) {
                            this.snowball.visible = false;
                        }
                    }

                    // Update enemy position
                    for (let i = 0; i < this.enemies.length; i++) {
                        this.enemies[i].y += this.enemies[i].speed;
                        if (this.enemies[i].y > this.canvas.height) {
                            this.enemies[i].y = 50;
                            this.enemies[i].x = Math.random() * (this.canvas.width - this.enemies[i].width);
                        }
                    }

                    // Prevent player from going out of bounds
                    if (this.player.x < 0) {
                        this.player.x = 0;
                    } else if (this.player.x > this.canvas.width - this.player.width) {
                        this.player.x = this.canvas.width - this.player.width;
                    }
                } else if (this.gameState === 'start' && this.controls.bit_test(this.controls.input_byte_0, 1)) {// P1 START
                    this.gameState = 'playing';
                }
            }

            draw() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                if (this.gameState === 'start') {
                    this.ctx.font = '30px Arial';
                    this.ctx.fillStyle = 'black';
                    this.ctx.fillText('Press Start', this.canvas.width / 2 - 150, this.canvas.height / 2);
                } else if (this.gameState === 'playing') {
                    // Draw player
                    if (this.player.facingLeft) {
                        this.ctx.drawImage(this.player.sprites[this.player.spriteIndex], this.player.x, this.player.y, this.player.width, this.player.height);
                    } else {
                        this.ctx.drawImage(this.player.sprites[this.player.spriteIndex + 2], this.player.x, this.player.y, this.player.width, this.player.height);
                    }

                    // Draw snowball
                    if (this.snowball.visible) {
                        this.ctx.beginPath();
                        this.ctx.arc(this.snowball.x, this.snowball.y, this.snowball.radius, 0, Math.PI * 2);
                        this.ctx.fillStyle = 'teal';
                        this.ctx.fill();
                        this.ctx.closePath();
                    }

                    // Draw enemies
                    for (let i = 0; i < this.enemies.length; i++) {
                        this.ctx.fillStyle = 'red';
                        this.ctx.fillRect(this.enemies[i].x, this.enemies[i].y, this.enemies[i].width, this.enemies[i].height);
                    }

                    // Draw level
                    this.ctx.font = '20px Arial';
                    this.ctx.fillStyle = 'black';
                    this.ctx.fillText('Level: ' + this.level, 10, 20);
                }
                this.controls.ctx.clearRect(controls.videoX, controls.videoY, controls.videoWidth, controls.videoHeight);
                this.controls.ctx.drawImage(this.canvas, controls.videoX, controls.videoY, controls.videoWidth, controls.videoHeight);
            }

            gameLoop() {
                this.update();
                
                
                //this.controls.refreshMainCanvas();
                this.controls.updateStatus();
                this.draw();
                requestAnimationFrame(() => this.gameLoop());
            }
        }

        //const game = new BrosGame();
        //game.init();
