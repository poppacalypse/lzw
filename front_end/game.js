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
loadSprite("ogre", "/sprites/ogre.png", {
  sliceX: 4,
  anims: {
    run: { from: 0, to: 3, speed: 7, loop: true },
  },
});
loadSprite("spikes", "/sprites/spikes.png", {
  sliceX: 4,
  anims: {
    idle: { from: 0, to: 3, speed: 3, loop: true },
  },
});
loadSprite("hole", "/sprites/hole.png", {
  sliceX: 2,
  anims: {
    open: { from: 0, to: 1, speed: 5, loop: false },
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
      "wall"
    ],
    "&": () => [
      sprite ("ogre", { anim: "run" }), 
      scale(0.70),
      area(), 
      solid(), 
      origin("center"),
      "ogre",
      "danger"
    ],
    "^": () => [
      sprite ("spikes", { anim: "idle" }), 
      area(), 
      // solid(), 
      "spikes",
      "danger"
    ],
    h: () => [
      sprite ("hole"), area(), { opened: "false" }, "hole"],
  };

  // List of maps
  const matrix = [
    [
      "lwwwffwwwr",
      "l        r",
      "l     &  r",
      "l    ^   r",
      "l        r",
      "l &    & r",
      "l        r",
      "l^       r",
      "l h  &   r",
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
    // area(), // generates collider area from shape & enables collision detection
    origin("center"), // by default top-left
    area({ width: 16, height: 16, offset: vec2(0,8) }),
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

  onKeyRelease(["left", "right", "up", "down"], () => {
    if(
      !isKeyDown("left") &&
      !isKeyDown("right") &&
      !isKeyDown("up") &&
      !isKeyDown("down")
    ) {
      player.play("idle");
    }
  });
});


go("play", { level: 0 });

// debug.inspect = true;