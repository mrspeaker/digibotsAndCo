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

        levels: [
            "intro/getready",
            "intro/getready2",
            "intro/getready3",
            "intro/getready4",
            "intro/getready5",

            "simple/simple1",
            "level03",
            "simple/ladders",
            "switcha",
            "simple/elevatorsAndTeleports",
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
                en: "arrow keys:.move",
                fr: "les cle: bouger"
            },
            "keys-build": {
                en: "space bar:.build",
                fr: "space: construire"
            },
            "keys-erase": {
                en: "x key:.erase",
                fr: "x: effacer"
            },
            "keys-both": {
                en: "space & x:.fast!",
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
