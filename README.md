# Digibots & co.

By Mr Speaker

Canvas & WebGL game for the french "No Future Contest" with my chosen constraint, "tous les programmeurs sont morts (le jeu doit exploiter le concept/l’esthétique du bug/glitch)".

    Move: stick / keys
    Build: button 1 / space
    Erase: button 2 / x
    Fast: both buttons


## Notes to self...

- add "goodtime" to levels
- build min js.

## If I'm really bored

- french version
- when "bitten", move a bit to stop stacking.
- can't draw over people?
- add "parts bonus"
- players stacked
- time is real time, not game time. don't change tabs.
- sfx toggle in paws
- music toggle in paws
- pretty paws
- no ajax error handling when loading levels

## Ideaz

- panic mode: click on player, makes them idle
- glitch in time to the moosic.

## Add back to Ω

Add these changes back to my Ω500 framework/library thing

- utils.neighbours
- convert Physics class to helper methods
- rounded snap utils
- gravity in entity (somehow)
- add default min-timer to dialogs
- make dialog killKey be an init param
- entity: add params to base hitBlocks: function(xBlocks, yBlocks) {},
- entity: add TL, BL, TR, BR notes to hitblocks
- map: add "getBlock(x, y)" (or [x, y]) helper
- map: add walkable helper
- oneIn(max) util
- gfx not passed to main game object render (uses Ω.gfx in base game class)
- font writing
- ajax
- Ω.input.release(this.killKey); in dialog
- remove default background render on game.js
- utils State class
- sounds: stop()
- Ω.js: assetsToLoad === 0 && pageLoaded to fix preload
- color opt for particles
