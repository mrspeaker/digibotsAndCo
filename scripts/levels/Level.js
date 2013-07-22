(function (Ω, blocks, Player, Workman, Switch, Popup, Font) {

    "use strict";

    var Level = Ω.Class.extend({

        players: null,
        maps: null,
        portal: null,
        machines: null,
        monsters: null,
        spawners: null,
        keys: null,

        collectedKeys: 0,

        effects: null,

        sheet: new Ω.SpriteSheet("res/tiles.png", 16),
        glitchSheet: new Ω.SpriteSheet("res/glitched.png", 16),
        font: new Font("res/mamefont.png", 16, 16),

        sounds: {
            pickup: new Ω.Sound("res/sound/collect", 1, false),
            portal: new Ω.Sound("res/sound/portalopen", 0.9, false),
            escape: new Ω.Sound("res/sound/portalout", 0.9, false),
            theme: new Ω.Sound("res/sound/theme", 0.8, true),
            themeMinor: new Ω.Sound("res/sound/themeMinor", 0.8, true),
            gameover: new Ω.Sound("res/sound/themeGameOver", 0.85, false)
        },

        rowTypes:  { "EQUATOR": 0, "AIR": 1, "GROUND": 2 },

        glitchType: 0,
        glitchTile: 0,

        loaded: false,

        time: null,
        frame: 0,

        monsterSpawnTime: 0,
        levelOverTime: -1,

        state: null,

        init: function (screen, levelName, players) {
            this.levelName = levelName;
            var self = this,
                maps;

            this.screen = screen;
            this.effects = [];
            this.monsters = [];

            this.players = [new Player(this, players[0])];

            levelLoader.load(
                levelName,
                {
                    normal: this.sheet,
                    glitch: this.glitchSheet
                },
                function (data) {

                    self.onload(data);
                    self.glitch();

                }
            );

            this.state = new Ω.utils.State("BORN");

        },

        onload: function (data) {

            this.w = data.meta.w;
            this.h = data.meta.h;
            this.cellW = data.meta.cellW;
            this.cellH = data.meta.cellH;
            this.tileW = data.meta.tileW;
            this.tileH = data.meta.tileH;
            this.equator = data.meta.equator;
            this.glitchAmount = data.meta.glitchAmount / 100;

            // tie glboal Glitch
            game.globalGlitchAmount = ((this.glitchAmount * 3) * (game.globalGlitchAmountMax - game.globalGlitchAmountMin)) + game.globalGlitchAmountMin;


            this.monsterTime = data.meta.time;
            this.monsterSpawnRate = data.meta.monsterSpawnRate * 1000;
            this.monsterWhenKeysLeft = data.meta.monsterWhenKeysLeft;
            this.goodTime = data.meta.time * 0.75 | 0;

            this.maps = data.maps;

            // Create and wire up the machines
            this.machines = data.machines.map(this.make, this);
            this.machines.forEach(function (m) {

                m.wireItUp()
                return m;

            });

            this.keys = data.entities.keys.map(function (k) {

                return new Key(k.x, k.y, this);

            }, this);
            this.maxKeys = this.keys.length;
            this.collectedKeys = 0;

            this.portal = this.machines.filter(function (m) {

                 return m.name === "portal";

            })[0];

            this.unbuildables = [blocks.ROCK, blocks.LIMESTONE, blocks.NOBUILD, blocks.NOBUILD_SOLID];

            this.spawners = data.entities.workers
                .map(this.makeWorker, this)
                .map(this.players[0].addWorker, this.players[0]);
            this.maxWorkers = this.spawners.length;

            this.time = Date.now();
            this.loaded = true;

        },

        onEnd: function () {

            Ω.Sound._reset();
            game.players[0].score = this.players[0].score;

        },

        makeWorker: function (json) {

            return new Workman(
                json.x / this.tileW | 0,
                (json.y - 1) / this.tileH | 0,
                json.type,
                this.players[0]
            );

        },

        makeMonster: function () {

            this.sounds.theme.rewind();
            this.sounds.themeMinor.play();

            this.monsters.push(
                new GlitchMonster(10, 10, this)
            );

        },

        make: function (data) {

            var ent = null;

            switch (data.type) {

            case "portal":
                ent = new Portal(
                    this,
                    data.x,
                    data.y,
                    data.properties.unlock
                )
                break;

            case "switch":
                ent = new Switch(
                    this,
                    data.x,
                    data.y - 16,
                    data.properties.state === "on" ? true : false,
                    data.properties.target);
                break;

            case "spikes":
                ent = new Spikes(
                    data.x,
                    data.y - 16);
                break;

            case "elevator":
                ent = new Elevator(
                    this,
                    data.name,
                    data.x,
                    data.y - 16,
                    parseInt(data.properties.speed),
                    parseInt(data.properties.top),
                    parseInt(data.properties.bottom))
                break;

            case "door":
                ent = new Door(
                    data.name,
                    this,
                    data.properties.direction,
                    data.x,
                    data.y - 16);
                break;

            case "teleport":
                ent = new Teleport(
                    this,
                    data.name,
                    data.x,
                    data.y - 16,
                    data.properties.target);
                break;

            case "teleport-pad":
                ent = new Teleport(
                    this,
                    data.name,
                    data.x,
                    data.y - 16);
                break;

            default:
                console.error("Unhandled machine:", data);
                break;
            }

            return ent;

        },

        getMachineByName: function (name) {

            var match = this.machines.filter(function (m) {

                return m.name === name;

            });

            return match.length ? match[0] : null;

        },

        tick: function () {

            if (!this.loaded) {
                return;
            }

            this.state.tick();
            this.frame++;

            switch (this.state.get()) {
                case "BORN":
                    Ω.Sound._reset();
                    if (this.state.first()) {
                        this.sounds.theme.play();
                        if (game.lastTrackTime) {
                            this.sounds.theme.audio.currentTime = game.lastTrackTime;
                            game.lastTrackTime = 0;
                        }

                    }
                    this.state.set("GETREADY");
                    break;

                case "GETREADY":
                    if (this.state.first()) {
                        this.render = function (gfx) {
                            this.render_RUNNING(gfx);
                            this.render_GETREADY(gfx);
                        }
                    }
                    if (this.state.count > 150) {
                        this.render = this.render_RUNNING;
                        this.time = Date.now();
                        this.state.set("RUNNING");
                        this.monsterStartTime = this.time + (this.monsterTime * 1000);
                    }
                    break;

                case "RUNNING":
                    this.tick_RUNNING();
                    break;

                case "LEVELOVER":

                    game.lastTrackTime = this.sounds.theme.audio.currentTime;

                    this.onEnd();

                    //levelScreen, time, maxTime, keys, maxKeys, workers, maxWorkers
                    game.setScreen(new LevelClearScreen(
                        this.screen,
                        this.levelClearedAt,
                        this.monsterTime * 1000,
                        this.goodTime,
                        this.collectedKeys,
                        this.maxKeys,
                        this.players[0].escaped,
                        this.maxWorkers
                        ));
                    break;

                case "GAMEOVER":
                    if (this.state.first()) {
                        this.onEnd();
                        game.setDialog(new ContinueDialog(this, this.font, this.players[0].score * 0.4 | 0));
                    }
                    if (this.state.count === 1) {
                        this.onEnd();
                        this.sounds.gameover.play();
                        this.render = function (gfx) {
                            this.render_RUNNING(gfx);
                            this.render_GAMEOVER(gfx);
                        }
                    }
                    this.tick_RUNNING();
                    if (this.state.count > 150) {
                        game.setScreen(new HiScoreEntryScreen(this.players[0].score));
                    }
                    break;
            }

        },

        tick_RUNNING: function () {

            var self = this;

            this.timePassed = Date.now() - this.time;

            this.players.map(function (p) {

                p.tick(self.maps);

                p.workers.forEach(function (w) {

                    Ω.Physics.checkCollision(w, self.machines, "hitMachine");
                    Ω.Physics.checkCollision(w, self.keys, "hitKey");

                });

            });

            this.monsters = this.monsters.filter(function (m) {

                return m.tick();

            });

            var now = Date.now();
            if (now > this.monsterStartTime) {
                if (this.monsters.length === 0 ||
                    now - this.monsterSpawnTime > this.monsterSpawnRate)  {
                        this.makeMonster();
                        this.monsterSpawnTime = now;
                }
            }

            this.machines = this.machines.filter(function (m) {

                return m.tick();

            });

            this.keys = this.keys.filter(function (k) {

                return k.tick();

            });

            this.effects = this.effects.filter(function (e) {

                return e.tick();

            });

            if (Math.random() < 0.05) {
                this.glitch();
            }
            if (Math.random() < 0.01) {
                this.glitchType = Ω.utils.rand(5);
            }
            // Don't stay on background swap for too long... it's hard to look at!
            if (this.glitchType == 4 && Ω.utils.oneIn(40)) {
                this.glitchType = Ω.utils.rand(4);
            }

            // Flickr the glitched-looking tiles sheets in and out
            if (Math.random() < 0.04) {
                this.maps.fore.sheet = this.maps.fore.glitchSheet;
                this.maps.back.sheet = this.maps.back.glitchSheet;
                setTimeout(function () {

                    self.maps.fore.sheet = self.maps.fore.normalSheet;
                    self.maps.back.sheet = self.maps.back.normalSheet;

                }, Ω.utils.rand(500) + 200);
            }

            // Start a monster at random
            if (this.monsterAfterTime === -2 || this.monsters.length > 0 ) {
                if (Math.random() < 0.0004) {
                   this.makeMonster();
                }
            }

            if (this.levelOverTime !== -1) {
                if (--this.levelOverTime <= 0) {
                    this.state.set("LEVELOVER");
                }
            }

        },

        continueGame: function (cost) {
            game.addScore(-cost);
            this.screen.repeatLevel();
        },

        setBlock: function (map, pos, tile) {

            if (this.maps.clear.cells[pos[1]][pos[0]] > 0) {
                map.cells[pos[1]][pos[0]] = blocks.BLANK;
                return;
            }

            map.cells[pos[1]][pos[0]] = tile;

        },

        glitch: function () {

            var i,
                j,
                foreMap = this.maps.fore,
                foreTile,
                backTile;

            for (j = 0; j < this.cellH; j++) {

                // TODO: just move map render Y down!
                if (j < 3) {
                    continue;
                }

                if (Math.random() < 0.7) {
                    this.glitchTile = Ω.utils.rand(26) + 2;
                }

                switch (this.glitchType) {
                case 0:
                    // RANDOM replace
                    for (i = 0; i < this.cellW; i++) {
                        foreTile = this.glitchTile;
                        this.setBlock(foreMap, [i, j], foreMap.cells[j][i] === blocks.BLANK ? 0 : foreTile);
                    }
                    break;
                case 1:
                case 2:
                    // Random new
                    for (i = 0; i < this.cellW; i++) {
                        foreTile = Math.random() < this.glitchAmount ? this.glitchTile : blocks.BLANK;
                        this.setBlock(foreMap, [i, j], foreTile);
                    }
                    break;
                case 2:
                    //Same lines
                    for (i = this.cellW - 1; i > 1; i--) {
                        this.setBlock(foreMap, [i - 1, j], foreMap.cells[j][this.cellW - 1]);
                    }
                    foreTile = Ω.utils.oneIn(3) ? this.glitchTile : blocks.BLANK;
                    //foreMap.cells[j][this.w - 1] = foreTile;
                    this.setBlock(foreMap, [i, j], foreTile);
                    break;
                case 3:
                    // Colour in background
                    for (i = 0; i < this.cellW; i++) {
                        backTile = this.maps.back.cells[j][i];
                        if (backTile === blocks.PLATFORM || backTile === blocks.DIRT) {
                            foreTile = this.glitchTile;
                        } else {
                            foreTile = blocks.BLANK;
                        }
                        this.setBlock(foreMap, [i, j], foreTile);
                    }
                    break;
                }

            }


        },

        gotPortalToken: function (player) {

            this.effects.push(
                new Flash()
            );
            this.sounds.pickup.play();
            player.score += data.points.coin;
            this.collectedKeys++;

            if (--this.portal.unlock === 0) {

                this.sounds.portal.play();
                player.score += data.points.portalOpen;

                this.effects.push(
                    new Popup("secure connection", this.font, 150, 8 * 16, 10 * 16)
                );

                this.effects.push(
                    new Popup("established", this.font, 150, 11 * 16, 12 * 16)
                );

            }

        },

        workerOut: function (worker) {

            this.sounds.escape.play();
            worker.boss.score += data.points.workerOut;
            worker.boss.escaped++;

            this.levelOverCheck(worker);

        },

        levelOverCheck: function (worker) {

            this.effects = this.effects.filter(function (e) {
                return !(e.name && e.name === "popup")
            });

            if (this.levelOverTime === -1) {
                this.effects.push(
                    new Popup("level clear", this.font, 150, 10 * 16, 10 * 16)
                );
                this.levelOverTime = 500;
                this.levelClearedAt = this.timePassed;
            } else {
                // this.effects.push(
                //     new Popup("bonus", this.font, 150, 10 * 16, 8 * 16)
                // );
            }

            var removed = 0;
            this.players[0].workers.forEach(function(w) {
                w.speed = w.crazySpeed;
                if (w === worker) {
                    w.remove = true;
                }
                // Find all that have been removed this frame
                if (w.remove) {
                    removed++;
                }
            });

            if (this.players[0].workers.length - removed === 0) {
                this.levelOverTime = Math.min(30, this.levelOverTime);
            }

        },

        gameOver: function (p) {

            this.state.set("GAMEOVER");

        },

        render: function (gfx) {

            this.render_RUNNING(gfx);

        },

        render_GETREADY: function (gfx) {
            var c = gfx.ctx,
                finalLevel = this.levelName === "crazy/spikesGalore";

            c.fillStyle = "#000";
            c.fillRect(9 * 16, 9 * 16, 12 * 16, 7 * 16);
            c.strokeStyle = "#666";
            c.strokeRect(9 * 16, 9 * 16, 12 * 16, 7 * 16);

            if ((Date.now() / 300 % 2) | 0 === 1) {

                this.font.write(gfx, finalLevel ? "final battle!" : data.lang.get("get-ready"), finalLevel ? 9 * 16 : 11 * 16, 10 * 16, 1);

            }
            this.font.write(gfx, "time: " + Ω.utils.formatTime(this.monsterTime * 1000), 10 * 16, 12 * 16);
            this.font.write(gfx, "keys: " + this.portal.unlock, 10 * 16, 14 * 16);

        },

        render_GAMEOVER: function (gfx) {

            this.font.write(gfx, "game over", (this.cellW / 2 - 4 | 0) * 16, 9.5 * 16);

        },

        render_RUNNING: function (gfx) {

            if (!this.loaded) {
                return;
            }

            var c = gfx.ctx,
                remindFast = this.levelName === "intro/getready3";

            // Dirt background
            c.fillStyle = "hsl(11, 30%, 40%)";
            c.fillRect(0, (this.equator) * 16, this.maps.back.cellW * 16, (this.maps.back.cellH - this.equator) * 16);

            this.maps.back.render(gfx);

            this.machines.forEach(function (m) {

                m.render(gfx);

            });

            this.keys.forEach(function (k) {

                k.render(gfx);

            });

            this.players.forEach(function (p) {

                p.render(gfx);

            });

            this.monsters.forEach(function (m) {

                m.render(gfx);

            });

            //if (this.monsters.length > 0) {
                this.maps.fore.render(gfx);
            //}

            this.players.map(function (p) {

                p.renderCursor(gfx);

            });

            this.effects.forEach(function (e) {

                e.render(gfx);

            });

            var score = this.players[0].score,
                hi = Math.max(score, game.hiscores[0][1]);

            this.font.write(gfx, Ω.utils.formatScore(score, 6), 34, 16);
            this.font.write(gfx, "hi" + Ω.utils.formatScore(hi, 6), 174, 16, 1);

            var time = this.state.isNot("RUNNING") ? this.monsterTime * 1000 : this.monsterStartTime - Date.now(),
                timeCol = 0;
            if (time < 0) {
                time = 0;
                timeCol = (Date.now() / 300 | 0) % 2 ? 1 : 0;
            }
            this.font.write(gfx, Ω.utils.formatTime(time), 350, 16, timeCol);

            if (remindFast && this.frame > 170 && this.frame < 750) {
                c.fillStyle = "#000";
                c.fillRect(5 * 16, 25 * 16, 21 * 16, 3 * 16);
                if ((Date.now() / 300 % 2) | 0 === 1 ) {
                    this.font.write(gfx, "try a button combo!", 6 * 16, 26 * 16);
                }
            }


        }

    });

    window.Level = Level;

}(Ω, blocks, Player, Workman, Switch, Popup, Font));
