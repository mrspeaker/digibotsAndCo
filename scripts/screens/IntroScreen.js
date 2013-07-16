(function (Ω) {

    "use strict";

    var IntroScreen = Ω.Screen.extend({

        time: 0,

        font: new Font("res/mamefont.png", 16, 16),

        images: {
            client: new Ω.Image("res/clientlady.png"),
            top: new Ω.Image("res/button-top.png"),
            topDown: new Ω.Image("res/button-top-down.png"),
            bottom: new Ω.Image("res/button-bottom.png"),
            key: new Ω.Image("res/bigkey2.png"),
            key2: new Ω.Image("res/bigkey.png")
        },

        fullLength: 2300,

        coin: new Ω.Sound("res/sound/insertcoin", 0.6, false),
        drums: new Ω.Sound("res/sound/themeIntro", 0.8, true),

        text: [
            { start: 50, end: 450, x: 1, y: 3, msg: "i need your services, now!"},
            { start: 200, end: 450, x: 1, y: 4, msg: "evil forces are snooping"},
            { start: 270, end: 450, x: 1, y: 5, msg: "on all my communications."},

            { start: 480, end: 750, x: 1, y: 3, msg: "i need you to stop them by"},
            { start: 550, end: 750, x: 1, y: 4, msg: "providing me with a secure"},
            { start: 620, end: 750, x: 1, y: 5, msg: "digital channel."},

            { start: 750, end: 1150, x: 1, y: 3, msg: "go into the computer and"},
            { start: 820, end: 1150, x: 1, y: 4, msg: "retrieve all of my secret"},
            { start: 890, end: 1150, x: 1, y: 5, msg: "encryption keys."},

            { start: 1150, end: 1490, x: 1, y: 3, msg: "use the primary button to"},
            { start: 1250, end: 1490, x: 1, y: 4, msg: "draw and paint a secure"},
            { start: 1300, end: 1490, x: 1, y: 5, msg: "pathway to the exit node."},

            { start: 1490, end: 1950, x: 1, y: 3, msg: "the secondary button will"},
            { start: 1550, end: 1950, x: 1, y: 4, msg: "erase and dig. both buttons"},
            { start: 1650, end: 1950, x: 1, y: 5, msg: "will speed things along."},

            { start: 1950, end: 2500, x: 1, y: 3, msg: "you must hurry. they are "},
            { start: 2000, end: 2500, x: 1, y: 4, msg: "listening to ever******************hacking the system."},
            { start: 2200, end: 2500, x: 1, y: 5, msg: "good luck."},

        ],

        init: function () {

            this.writers = this.text.map(function (t) {

                var w = new Writer(this.font, t.x * 16, t.y * 16, t.msg, 3);
                w.start = t.start;
                w.end = t.end;

                return w;

            }, this);

            this.coin.play();

        },

        tick: function () {

            if (this.time++ < 50) {
                return;
            }
            if (this.time === 100) {
                this.drums.play();
                game.globalGlitchAmount = game.globalGlitchAmountMin * 4;
            }

            this.writers.forEach(function (w) {
                if (w.start <= this.time && w.end >= this.time) {
                    w.tick();
                }
            }, this);

            if (this.time > this.fullLength || (Ω.input.pressed("draw") && this.time > 20)) {
                game.globalGlitchAmount = game.globalGlitchAmountMin;
                var level = Ω.urlParams.level ? parseInt(Ω.urlParams.level, 10) : 0;
                game.setScreen(new LevelScreen(level));
            }

        },

        render: function (gfx) {

            var c = gfx.ctx;

            c.fillStyle = "#000";
            c.fillRect(0, 0, gfx.w, gfx.h);

            this.images.client.render(gfx, 8 * 16, 9 * 16);


            if (this.time > 880 && this.time < 1950) {
                this.images.key.render(gfx, 20 * 16, 19 * 16 + (Math.sin(Date.now() / 500) * 10));
            }


            // Test explain controls
            if (this.time > 1150 && this.time < 1950) {

                var flash = (Date.now() / 500 | 0) % 2 === 0;

                this.images.bottom.render(gfx, 18.5 * 16, 11 * 16);
                this.images.bottom.render(gfx, 21.5 * 16, 11 * 16);

                if (flash) {
                    this.images.top.render(gfx, 18.5 * 16 + 6, 11 * 16 + 6);
                } else {
                    this.images.topDown.render(gfx, 18.5 * 16 + 6, 11 * 16 + 6);
                }

                if (this.time > 1500 && !flash) {
                    this.images.topDown.render(gfx, 21.5 * 16 + 6, 11 * 16 + 6);
                } else {
                    this.images.top.render(gfx, 21.5 * 16 + 6, 11 * 16 + 6);
                }
            }


            this.writers.forEach(function (w) {
                if (w.start <= this.time && w.end >= this.time) {
                    w.render(gfx);
                }
            }, this);

        }

    });

    window.IntroScreen = IntroScreen;

}(Ω));
