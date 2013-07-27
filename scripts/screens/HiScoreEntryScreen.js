(function (Ω) {

    "use strict";

    var HiScoreEntryScreen = Ω.Screen.extend({

        time: null,
        over: false,

        x: 7 * 16 - 5,
        y: 10 * 16 - 4,
        w: 16,
        h: 16,

        chars: "abcdefghijklmnopqrstuvwxyz0123456789.!?".split(""),
        charsPerLine: 8,
        charsXOff: 7 * 16,
        charsYOff: 10 * 16,

        backButton: {
            x: 19 * 16,
            y: 21 * 16,
            w: 16,
            h: 16
        },

        okButton: {
            x: 21 * 16,
            y: 21 * 16,
            w: 16,
            h: 16
        },

        speed: 2,
        name: "",

        font: new Font("res/mamefont.png", 16, 16),

        skip: false,

        init: function (score) {

            Ω.Sound._reset();

            this.score = score;
            var poss = " 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th,10th".split(",");

            if (!score || score < game.hiscores[9][1]) {
                this.skip = true;
                return;
            }

            var pos = 9;
            for (var i = 0; i < 9; i++) {
                if (score > game.hiscores[i][1]) {
                    pos = i;
                    break;
                }
            }

            this.pos = pos;
            this.posLabel = poss[pos];

            this.time = Date.now() + (35 * 1000);
            this.timeLeft = ((this.time - Date.now()) / 1000) | 0;

        },

        save: function () {

            game.hiscores.splice(this.pos, 0, [this.name, this.score]);

            Ω.utils.storage.set(
                game.hiScoreKey,
                JSON.stringify(game.hiscores.slice(0, 50))
            );

        },

        done: function () {

            game.reset();

        },

        tick: function () {

            if (this.skip) {
                this.done();
                return;
            }

            if (!this.over) {
                this.handleInput();
            }

            // Wrap cursor
            if (this.x < -8) {
                this.x = Ω.env.w;
            }
            if (this.x > Ω.env.w) {
                this.x = 0;
            }
            if (this.y < -8) {
                this.y = Ω.env.h;
            }
            if (this.y > Ω.env.h) {
                this.y = 0;
            }

            if (!this.over) {
                this.timeLeft = ((this.time - Date.now()) / 1000) | 0;

                if (this.timeLeft <= 0) {
                    this.over = 200;
                }
            } else {
                if (--this.over <= 0) {
                    this.hitOk();
                }
            }

        },

        handleInput: function() {
            // Move
            if (Ω.input.isDown("up")) {
                this.y -= this.speed;
            }
            if (Ω.input.isDown("down")) {
                this.y += this.speed;
            }
            if (Ω.input.isDown("left")) {
                this.x -= this.speed;
            }
            if (Ω.input.isDown("right")) {
                this.x += this.speed;
            }

            if (Ω.input.pressed("draw")) {

                var x = this.x - this.charsXOff + 8,
                    y = this.y - this.charsYOff + 8,
                    ch;

                Ω.Physics.checkCollision(this.backButton, [this], "hitBack");
                Ω.Physics.checkCollision(this.okButton, [this], "hitOk");

                if (x < 0 || x > this.charsPerLine * 32 + 4 ||
                    y < 0 || y > (this.chars.length / this.charsPerLine | 0) * 32 + 4) {
                    return;
                }

                var xpos = ((x + 4) / 16 | 0),
                    ypos = ((y + 4) / 16 | 0);

                if (xpos % 2 || ypos % 2) {
                    // Space
                } else {

                    ch = this.chars[
                        (xpos / 2) +
                        (ypos / 2) * this.charsPerLine
                    ];

                    if (this.name.length < 3) {
                        this.name += ch;
                    } else {
                        this.name = this.name.slice(0, 2) + ch;
                    }

                }


            }

        },

        hitBack: function () {

            this.name = this.name.slice(0, -1);

        },

        hitOk: function () {

            this.save();
            this.done();

        },


        render: function (gfx) {

            var c = gfx.ctx,
                flash = this.over ? ((Date.now() / 500 | 0) % 2 == 0 ? 1 : 0) : 1;

            if (this.skip) {
                return;
            }

            c.fillStyle = "#000";
            c.fillRect(0, 0, gfx.w, gfx.h);

            this.font.write(gfx, data.lang.get("champs"), 32, 16, 0);

            this.font.write(gfx, this.posLabel, 6 * 16, 7 * 16, flash);
            this.font.write(gfx, this.score, ((6 - this.score.toString().length) + 16) * 16, 7 * 16, flash);

            var underlineOffset = 12 * 16;
            this.font.write(gfx, this.name, underlineOffset, 7 * 16, !this.over ? 0 : flash);


            if (!this.over) {
                c.strokeStyle = "#090";
                c.lineWidth = "2";

                for (var i = 0; i < 3; i++) {
                    c.beginPath();
                    c.moveTo(underlineOffset + (i * 16) + 1, 8 * 16 + 2);
                    c.lineTo(underlineOffset + (i * 16) + 14, 8 * 16 + 2)
                    c.stroke();
                }
            }

            this.font.write(gfx, "[" /* Backspace */, this.backButton.x, this.backButton.y);
            this.font.write(gfx, "]" /* Backspace */, this.okButton.x, this.okButton.y);

            this.chars.forEach(function (c, i) {
                this.font.write(
                    gfx,
                    c,
                    this.charsXOff + (i % this.charsPerLine | 0) * 32,
                    this.charsYOff + (i / this.charsPerLine | 0) * 32
                );
            }, this);

            if (!this.over) {

                this.font.write(gfx, this.timeLeft, 7 * 16, this.okButton.y, 1);

                c.strokeStyle = "#090";
                c.strokeRect(this.x - 1, this.y -1, 24, 24);
            }

        }

    });

    window.HiScoreEntryScreen = HiScoreEntryScreen;

}(Ω));
