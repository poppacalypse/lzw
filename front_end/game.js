// initialise context
kaboom({
  scale: 3,
  width: 282,
  height: 192,
  background: [0,0,0],
  canvas: document.getElementById("screen"),
});

const PLAYER_SPEED = 80;
const OGRE_SPEED = 30;
const WIZARD_SPEED = 20;
const FIRE_SPEED = 100;

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
    run: { from: 4, to: 7, speed: 10, loop: true }
  },
});
loadSprite("ogre", "/sprites/ogre.png", {
  sliceX: 4,
  anims: {
    run: { from: 0, to: 3, speed: 7, loop: true }
  },
});
loadSprite("spikes", "/sprites/spikes.png", {
  sliceX: 4,
  anims: {
    idle: { from: 0, to: 3, speed: 3, loop: true }
  },
});
loadSprite("hole", "/sprites/hole.png", {
  sliceX: 2,
  anims: {
    open: { from: 0, to: 1, speed: 3, loop: false }
  },
});
loadSprite("chest", "/sprites/chest.png", {
  sliceX: 3,
  anims: {
    open: { from: 0, to: 2, speed: 20, loop: false },
    close: { from: 2, to: 0, speed: 20, loop: false }
  },
});
loadSprite("wizard", "/sprites/wizard.png", {
  sliceX: 8,
  anims: {
    idle: { from: 0, to: 2, speed: 5, loop: true },
    run: { from: 4, to: 7, speed: 10, loop: true }
  },
});

/*
* -------------------
* SCENE - PLAY 
* -------------------
*/

scene("play", ({ level }) => {
  // add background 10x10
  addLevel(
    [
      "            ",
      "            ",
      "            ",
      "            ",
      "            ",
      "            ",
      "            ",
      "            ",
      "            ",
      "            ",
      "            ",
      "            ",
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
      { dir: choose([-1,1]), timer: 0 },
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
    h: () => [sprite ("hole"), area(), { opened: false }, "hole"],
  };

  // List of maps
  const matrix = [
    [
      "lwwwwffwwwwr",
      "l          r",
      "l     &    r",
      "l     ^    r",
      "l          r",
      "l          r",
      "l &        r",
      "l          r",
      "l^         r",
      "l          r",
      "l h  &     r",
      "lwwwwwwwwwwr",
    ],
    [
      "lffffffffffr",
      "l          r",
      "l          r",
      "ll        rr",
      "l          r",
      "l          r",
      "ll        rr",
      "ll        rr",
      "l          r",
      "l          r",
      "ll        rr",
      "lwwwwwwwwwwr",
    ],
  ];

  // add Map level 
  map = addLevel(matrix[level], mapConfig);

  // ----- SCORE LABEL -----
  add([pos(238,20), sprite("chest", { frame: 2 }), origin("center")])
  const scoreLabel = add([
    text("0"),
    pos(238,45),
    { value: 0 },
    scale(0.3),
    origin("center")
  ]);
  add([text("Carl Poppa"), pos(238,70), origin("center"), scale(0.1)])

  // ----- PLAYER ----- 
  const player = add([
    // position. map grid starts at 1, so (2,2) is first unblocked square
    pos(map.getPos(2,2)),
    sprite("knight", { anim: "idle" }),
    solid(), // makes other objects impenetrable
    // area(), // generates collider area from shape & enables collision detection
    origin("center"), // by default top-left
    area({ width: 16, height: 16, offset: vec2(0,7) }),
  ]);

  player.onCollide("danger", async (d) => {
    shake(10);
    burp();
    addKaboom(player.pos); // kaboom graphic at the player's position
    destroy(player); // destroys both player...
    destroy(d); // ...and danger

    await wait(1);
    go("over", { score: scoreLabel.value });
  });

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
  onKeyPress("space", () => {
    every("hole", async (h) => {
      if (player.isTouching(h)) {
        if (!h.opened) {
          h.play("open");
          h.opened = true;

          // wait for 1.5 sec 
          await wait(1.5);
          go("play", { level: 1 });
        }
      }
    });
    every("chest", async (c) => {
      if (player.isTouching(c)) {
        if (!c.opened) {
          c.play("open");
          c.opened = true;

          scoreLabel.value++;
          scoreLabel.text = scoreLabel.value;
        }
      }
    });
  });

  // ----- OGRES -----
  // Event that runs at every frame @ 60 FPS
  // Applies to all game objects with specified tag(s) 
  onUpdate("ogre", (o) => {
    // when the ogre moves in ogre direction at ogre speed 
    o.move(o.dir * OGRE_SPEED, 0);
    o.timer -= dt(); // countdown fn from Kaboom: get delta time since last frame (timer reset)
    
    // at this point, ogres move sideways once and stop
    // to ensure continuous movement, change dir & randomise timer
    if (o.timer <= 0) {
      o.dir = -o.dir // negative direction i.e. changes direction
      o.timer =rand(5); // randomise timer from 0 up to 5 secs
    }
  });

  // ==================== MAP LEVEL 01 ===================
  if (level == 0) return;
  
  // ----- CHESTS ----- 
  // add a new chest in a random position every 2 seconds
  // then fade it out within 4 seconds 
  loop(2, () => {
    const x = rand(1,8) // because 0 and 9 are walls
    const y = rand(1,8)

    add([
      sprite("chest"),
      pos(map.getPos(x,y)),
      area(),
      solid(),
      { opened: false },
      // auto-destroy after 4secs, start fading away after 0.5sec
      lifespan(4, { fade: 0.5 }),
      "chest"
    ])
  });

  // ----- WIZARD -----
  const wizard = add([
    sprite("wizard"),
    pos(map.getPos(9,9)),
    origin("center"),
    "danger",
    state("move", ["idle", "attack", "move"]) // state fn from Kaboom library

    // when Wizard is in idle state, do something
    // or in tech jargon:
    // run the callback every time Wizard ENTERs "idle" state
    wizard.onStateEnter("idle", async () => {});

    // run the callback every time Wizard ENTERs "attack" state
    wizard.onStateEnter("attack", async () => {});

    // run the callback every time Wizard ENTERs "move" state
    wizard.onStateEnter("move", async () => {});

  ]);
});

/*
* -------------------
* SCENE - GAME OVER 
* -------------------
*/

scene("over", ({ score }) => {
  add([ text(score, 26), origin("center"), pos(width()/2, height()/2) ]);

  onMousePress(() => {
    go("play", { level: 0 });
  });
});


go("play", { level: 1 });


// debug.inspect = true;