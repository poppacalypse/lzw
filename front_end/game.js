// initialise context
kaboom({
  scale: 3,
  width: 240,
  height: 160,
  background: [0,0,0],
  canvas: document.getElementById("screen"),
});

const PLAYER_SPEED = 80;

loadSprite("floor", "/sprites/floor.png", { sliceX: 8 });
loadSprite("wall_left", "/sprites/wall_left.png");
loadSprite("wall_mid", "/sprites/wall_mid.png");
loadSprite("wall_right", "/sprites/wall_right.png");
loadSprite("wall_fountain", "/sprites/wall_fountain.png", {
  sliceX: 3,
  anims: { // (anims in plural)
    idle: { from: 0, to: 2, speed: 5, loop: true } 
    // 'idle' is own name. get frames 0-2, at speed of 5 frames per second
  }
});
loadSprite("knight", "/sprites/knight.png", {
  sliceX: 8,
  anims: {
    idle: { from: 0, to: 3, speed: 5, loop: true },
    run: { from: 4, to: 7, speed: 10, loop: true },
  },
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

  // add Map level 
  map = addLevel(matrix[level], mapConfig);

  // add Player 
  const player = add([
    // position. map grid starts at 1, so (2,2) is first unblocked square
    pos(map.getPos(2,2)),
    sprite("knight", { anim: "idle" }),
    solid(), // makes other objects impenetrable
    area(), // generates collider area from shape & enables collision detection
    origin("center"), // by default top-left
  ]);

  onKeyDown("left", () => {
    player.flipX(true);
    player.move(-PLAYER_SPEED, 0);
  });
  onKeyDown("right", () => {
    player.flipX(false);
    player.move(PLAYER_SPEED, 0);
  });
  onKeyDown("up", () => {
    player.move(0, -PLAYER_SPEED);
  });
  onKeyDown("down", () => {
    player.move(0, PLAYER_SPEED);
  });

  onKeyPress(["left", "right", "up", "down"], () => {
    player.play("run");
  });
});


go("play", { level: 0 });