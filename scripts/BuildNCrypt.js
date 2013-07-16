(function (Ω) {

    "use strict";

    /*
        Digibots & co.
        a game by Mr Speaker.
        mrspeaker.net
        @mrspeaker
        -2013-

        URL Params

        mute: silence please (actually - i think i broke this with the theme tune)
        clean: erase hiscore table
        locale: fr for french, else english
        level: jump straight to level X, and skip intro
        hi: jump to hiscore entry with random score
        board: view hiscore leader board
    */


    var BuildNCrypt = Ω.Game.extend({

        canvas: "#board",
        players: null,
        hiscores: null,

        locale: "en",
        hiScoreKey: "bnc-scores",

        startTime: null,

        booted: false,

        glGLitch: 0,
        globalGlitchAmountMin: 0.004,
        globalGlitchAmountMax: 0.01,
        globalGlitchAmount: 0.004,

        init: function (w, h) {

            var self = this;

            this.startTime = Date.now();
            this._super(w, h);

            this.initWebGL();

            Ω.evt.progress.push(function (remaining, max) {
                //console.log(remaining, max);
            });

            Ω.input.bind([
                ["escape", "escape"],
                ["left", "left"],
                ["right", "right"],
                ["up", "up"],
                ["down", "down"],
                ["space", "draw"],
                [88, "erase"], // x
                [93, "erase"] // icade
            ]);

        },

        load: function () {

            this.hiscores = [["erc", 4000]];
            for (var i = 0; i < 9; i++) {
                this.hiscores.push(["...", 0]);
            }

            if (!window.localStorage) {
                return;
            }

            var d = window.localStorage[game.hiScoreKey];
            if (d) {
                try {
                    d = JSON.parse(d);
                    this.hiscores = d;
                } catch (e) {
                    console.log("error parsing hiscores");
                }
            }

            if (Ω.urlParams.mute) {

                Ω.Sound._setVolume(0);

            }

            if (Ω.urlParams.clean) {
                window.localStorage && window.localStorage.removeItem(game.hiScoreKey)
            }

            if (Ω.urlParams.locale) {

                if (Ω.urlParams.locale.toLowerCase() === "fr") {
                    this.locale = "fr";
                }

            }


            this.reset();

        },

        stopPreload: function () {

            // Clear the preloader thing
            if (preloo) {
                clearInterval(preloo);
                document.querySelector("section").style.background = "#111";
            }

        },

        reset: function () {

            Ω.Sound._reset();

            this.globalGlitchAmount = this.globalGlitchAmountMin;

            this.players = [
                {
                    x: 14 * 16,
                    y: 22 * 16,
                    score: 0
                }
            ];

            this.stopPreload();

            if (Ω.urlParams.level) {

                var level = Ω.urlParams.level ? parseInt(Ω.urlParams.level, 10) : 0;
                game.setScreen(new LevelScreen(level));
                return;

            }

            if (Ω.urlParams.end) {

                game.setScreen(new EndScreen());
                return;
            }

            if (Ω.urlParams.board) {

                game.setScreen(new HiScoreScreen());
                return;
            }

            if (Ω.urlParams.hi) {

                // Testing hiscore entry page
                var max = this.hiscores[0][1] * 1.1,
                    min = this.hiscores[9][1];

                game.setScreen(new HiScoreEntryScreen(((Math.random() * max - min) | 0) + min));
                return;

            }

            this.setScreen(this.booted ? new TitleScreen() : new BootScreen());
            this.booted = true;

        },

        addScore: function (score) {

            this.players[0].score += score;

        },

        getScore: function (score) {

            return this.players[0].score;

        },

        initWebGL: function () {

            var canvas = document.getElementById("post"),
                c = this.webGLctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

            if (!c) {
                console.error("No web gl context: no post effects");
                canvas.style.display = "none";
                document.getElementById("board").style.display = "block";
                return;
            }

            var program = Ω.gfx.loadShaders(c, "vert-post", "frag-post"),
                buffer = c.createBuffer(),
                positionIndex = c.getAttribLocation(program, "a_position");


            this.timeLoc = c.getUniformLocation(program, "u_time");
            this.glitchLoc = c.getUniformLocation(program, "u_doGlitch");
            this.pointsLoc = c.getUniformLocation(program, "points");


            c.enableVertexAttribArray(positionIndex); // Need to enable it, for some reason
            c.bindBuffer(c.ARRAY_BUFFER, buffer); // bind buffer is like an extra parameter to vAP (for backward compatibility)
            // specify the location and data format of the array of generic vertex attributes at index index to use when rendering
            c.vertexAttribPointer(positionIndex, 2, c.FLOAT, false, 0, 0);

            // init the main texture
            c.bindTexture(c.TEXTURE_2D, c.createTexture());
            //c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, true);
            c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, Ω.gfx.canvas);
            c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR);
            c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR);
            c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE);
            c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE);

            c.bufferData(
                c.ARRAY_BUFFER,
                new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]),
                c.STATIC_DRAW);

        },

        tick: function () {

            this._super();

            this.glGLitch--;

            if (Math.random() < this.globalGlitchAmount) {
                this.glGLitch = (Math.random() * 20 | 0) + 1;
            }



        },

        renderGL: function (gfx) {

            var gl = this.webGLctx;

            if (!gl) return;

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gfx.canvas);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            gl.uniform1f(this.timeLoc, Date.now() -this.startTime);
            gl.uniform1i(this.glitchLoc, this.glGLitch > 0 ? 1 : 0);
            gl.uniform1fv(this.points, [100, 100, 200, 200]);
        },

        render: function () {

            // FIxme - no gfx passed in!
            var gfx = Ω.gfx;

            this._super(gfx);

            this.renderGL(gfx);

        }

    });

    window.BuildNCrypt = BuildNCrypt;

}(Ω));
