(function () {

    "use strict";

    var data = {
        points: {
            coin: 50,
            portalOpen: 230,
            workerOut: 120,
            timeBonus: 1000,
            keyBonus: 300,
            workerBonus: 300
        },

        cuts: {
            titleLength: 650,
            hiScoreLength: 650
        },

        monster: {

            huntInInit: 260,
            huntIn: 180,
            huntFor: 150

        },

        levels: [
            "intro/getready",
            "intro/getready2",
            "intro/getready3",
            "intro/getready4",
            "intro/getready5",

            "simple/simple1",
            "level03",
            "simple/ladders",
            "simple/elevatorsAndTeleports",
            "switcha",
            "crazy/elevatorsAndTeleports2",

            "simple/zigUp",
            "crazy/spikesGalore"
        ],

        lang: {
            get: function (key) {

                var out = this[key][game.locale];
                return out || this[key]["en"];

            },
            title: {
                en: "do*igibi*ots & co.",
                fr: "do*igibi*ots & co."
            },
            "keys-nav": {
                en: inArcadeCabinet ? "joystick:.move" : "arrow keys:.move",
                fr: "les cle: bouger"
            },
            "keys-build": {
                en: inArcadeCabinet ? "button 1:.build" : "space bar:.build",
                fr: "space: construire"
            },
            "keys-erase": {
                en: inArcadeCabinet ? "button 2:.erase" : "x key:.erase",
                fr: "x: effacer"
            },
            "keys-both": {
                en: inArcadeCabinet ? "both:.fast!" : "space & x:.fast!",
                fr: "le deux: vite!"
            },
            "get-ready": {
                en: "get ready",
                fr: "pret"
            },
            "champs": {
                en: "employees of the month"
            }
        }
    };

    window.data = data;
}());
