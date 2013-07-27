(function (Ω, Tiled) {

    "use strict";

    var levelLoader,
        rowTypes;

    rowTypes = { "EQUATOR": 0, "AIR": 1, "GROUND": 2 };

    levelLoader = {

        load: function (levelName, sheets, cb) {

            var self = this,
                meta = {},
                maps = {
                    back: null,
                    fore: null,
                    clear: null
                },
                portal;


            function visible(ents) {

                return ents.filter(function (e) {

                    return e.visible;

                });

            }

            new Tiled("res/levels/" + levelName + ".json?" + Date.now(), function (t) {

                meta = {
                    cellW: t.w,
                    cellH: t.h,
                    tileW: t.tileW,
                    tileH: t.tileH,
                    w: sheets.normal.w * t.w,
                    h: sheets.normal.h * t.h,
                    time: t.properties.time || 30,
                    equator: t.properties.equator || (t.h / 2 | 0) + 3,
                    glitchAmount: t.properties.glitchAmount || 0,
                    monsterSpawnRate: t.properties.monsterSpawnRate || 10,
                    monsterWhenKeysLeft: t.properties.monsterWhenKeysLeft || -2
                };

                if (!t.properties.time) console.error("Map property 'time' not set");
                if (!t.properties.equator) console.error("Map prop 'equator' not set");
                if (!t.properties.glitchAmount) console.error("Map prop 'glitchAmount' not set");

                maps.clear = self.initMap(sheets.normal, meta.cellW, meta.cellH);
                maps.fore = self.initMap(sheets.normal, meta.cellW, meta.cellH);
                maps.back = new Ω.Map(sheets.normal, t.layerByName("background").data);
                maps.back.walkables = walkables;//[0, 70, 75];

                // Set the level portal
                portal = t.objectByName("machines", "portal").map(function (p) {

                    return {
                        x: p.x / meta.tileW | 0,
                        y: p.y / meta.tileH | 0,
                        w: 2,
                        h: 2,
                        unlock: p.properties.unlock,
                        tiles: [33, 34, 69]
                    };

                })[0];

                // Set the glitchy sprite sheets
                maps.back.normalSheet = sheets.normal;
                maps.fore.normalSheet = sheets.normal;
                maps.back.glitchSheet = sheets.glitch;
                maps.fore.glitchSheet = sheets.glitch;

                this.monsters = [
                    //new GlitchMonster(10, 3, this)
                ];

                cb && cb({
                    raw: t,
                    meta: meta,
                    maps: maps,
                    machines: visible(t.layerByName("machines").data),
                    entities: {
                        workers: visible(t.objectsByName("spawn", "worker")),
                        keys: visible(t.objectsByName("keys"))
                    }
                });

            });

        },

        initMap: function (sheet, w, h) {

            var i,
                j,
                map = [];

            for (j = 0; j < h; j++) {

                map.push([]);

                for (i = 0; i < w; i++) {

                    map[j].push(0);

                }
            }

            return new Ω.Map(sheet, map);

        },

        generate: function (sheet, equator, cellW, cellH) {

            var backMap = [],
                foreMap = [],
                clearMap = [],
                j,
                i,
                count,
                rowType,
                backTile,
                foreTile;


            for (j = 0; j < cellH; j++) {

                backMap.push([]);
                foreMap.push([]);
                clearMap.push([]);

                if (j < equator) {
                    rowType = rowTypes.AIR;
                } else {
                    rowType = rowTypes.GROUND;
                }

                for (i = 0; i < cellW; i++) {

                    clearMap[j].push(0);

                    // TODO: just move map render Y down!
                    if (j < 3) {
                        backMap[j].push(blocks.BLANK);
                        foreMap[j].push(blocks.BLANK);
                    } else {

                        switch (rowType) {

                        case rowTypes.EQUATOR:
                            backTile = blocks.BLANK;
                            foreTile = blocks.BLANK;
                            break;

                        case rowTypes.AIR:
                            backTile = blocks.BLANK;
                            if (Ω.utils.oneIn(45)) {
                                backTile = blocks.STAIR_R;
                                count = 5;
                                while (count--) {
                                    if (i - count > 0) {
                                        backMap[j][i - count] = count === 4 ? blocks.STAIR_L : blocks.PLATFORM;
                                    }
                                }
                            } else if (Ω.utils.oneIn(20)) {
                                count = 2;
                                while (count--) {
                                    if (i - count > 0) {
                                        backMap[j][i - count] = blocks.ROCK;
                                    }
                                }

                            }
                            foreTile = Ω.utils.rand(200) < 5 ? Ω.utils.rand(26) + 2 : blocks.BLANK;
                            break;

                        case rowTypes.GROUND:
                            backTile = blocks.DIRT;
                            if (Ω.utils.oneIn(20)) {
                                count = 2;
                                while (count--) {
                                    if (i - count > 0) {
                                        backMap[j][i - count] = blocks.LIMESTONE;
                                    }
                                }

                            }
                            foreTile = Ω.utils.rand(200) < 5 ? Ω.utils.rand(26) + 2 : blocks.BLANK;
                            break;

                        }

                        backMap[j].push(backTile);
                        foreMap[j].push(foreTile);
                    }

                }

            }

            return {
                back: new Ω.Map(sheet, backMap),
                fore: new Ω.Map(sheet, foreMap),
                clear: new Ω.Map(sheet, clearMap)
            };

        }
    };

    window.levelLoader = levelLoader;

}(Ω, Tiled));