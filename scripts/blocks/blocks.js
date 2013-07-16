(function () {

    "use strict";

    var walkables,
        blocks;

    blocks = {
        "BLANK": 0,
        "LADDER": 70,
        "LADDER_BASE": 68,
        "COIN": 35,
        "ROCK": 41,
        "LIMESTONE": 42,
        "PLATFORM": 38,
        "STAIR_L": 40,
        "STAIR_R": 39,
        "DIRT": 37,
        "SWITCH_L": 73,
        "SWITCH_R": 72,
        "NOBUILD": 43,
        "NOBUILD_SOLID": 44,

        has: function(block, types) {

            if (!Array.isArray(types)) {
                types = [types];
            }
            return types.indexOf(block) >= 0;

        },

        allHave: function (blocks, types) {

            var self = this;

            return blocks.every(function (b) {

                return self.has(b, types);

            });

        },

        anyHave: function (blocks, types) {

            var self = this;

            return blocks.some(function (b) {

                return self.has(b, types);

            });

        },

        areWalkable: function(blocks) {

            return this.allHave(blocks, walkables);

        },

        isLadder: function (cell) {

            return cell === blocks.LADDER ||
                cell === blocks.LADDER_BASE;
        }
    };

    // Fixme: walkables also defined in Levle.js
    walkables = [blocks.BLANK, blocks.LADDER, blocks.NOBUILD];

    window.blocks = blocks;
    window.walkables = walkables;
}());