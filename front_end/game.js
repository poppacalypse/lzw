// initialise context
kaboom({
  scale: 3,
  width: 240,
  height: 160,
  background: [0,0,0],
  canvas: document.getElementById("screen"),
});

loadSprite("floor", "/sprites/floor.png", { sliceX: 8 });
loadSprite("wall_left", "/sprites/wall_left.png");
loadSprite("wall_mid", "/sprites/wall_mid.png");
loadSprite("wall_right", "/sprites/wall_right.png");
loadSprite("wall_fountain", "/sprites/wall_fountain.png", {
  sliceX: 3,
  anims: { // (anims in plural)
    idle: { from: 0, to: 2, speed: 5, loop: true } // get frames 0-2, at speed of 5 frames per second
  }
});


scene("play", ({level}) => {
  // add background 10x10
  addLevel(
    [
      "          ",
      "          ",
      "          ",
      "          ",
      "          ",
      "          ",
      "          ",
      "          ",
      "          ",
      "          ",
    ],
    {
      width: 16,
      height: 16,
      // if you see a space, find a Sprite called 'floor'. then get a random frame from 0-8
      " ": () => [sprite("floor", { frame: ~~rand(0, 8) }),],
    }
  );

  const mapConfig = {
    width: 16,
    height: 16,
    // solid means you can't move through it. "wall" at end is a tag, can be named anything
    l: () => [sprite ("wall_left"), area(), solid(), "wall"], 
    r: () => [sprite ("wall_right"), area(), solid(), "wall"],
    w: () => [sprite ("wall_mid"), area(), solid(), "wall"],
    // fountain is an animation, so must specify type - idle or run (anim in singular)
    f: () => [
      sprite ("wall_fountain", { anim: "idle" }), 
      area(), 
      solid(), 
      "wall",
    ],
  };

  // List of maps
  const matrix = [
    [
      "lwwwffwwwr",
      "l        r",
      "l        r",
      "l        r",
      "l        r",
      "l        r",
      "l        r",
      "l        r",
      "l        r",
      "lwwwwwwwwr",
    ],
    [
      "lffffffffr",
      "l        r",
      "l        r",
      "l        r",
      "l        r",
      "l        r",
      "l        r",
      "l        r",
      "l        r",
      "lwwwwwwwwr",
    ],
  ];

  // add map level 
  map = addLevel(matrix[level], mapConfig);
});

go("play", { level: 0 });