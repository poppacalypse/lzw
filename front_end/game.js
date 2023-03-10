// initialise context
kaboom({
  scale: 2.5,
  width: 282,
  height: 192,
  background: [0,0,0],
  canvas: document.getElementById("screen"),
});

const PLAYER_SPEED = 80;
const OGRE_SPEED = 30;
const WIZARD_SPEED = 10;
const DEMON_SPEED = 10;
const FIRE_SPEED = 100;

const BASE_X = width()/2;
const BASE_Y = 65;

const BASE_URL = "http://127.0.0.1:3000/api/v1";

let currentPlayer;

loadSprite("floor", "/sprites/floor.png", { sliceX: 8 });
loadSprite("wall_left", "/sprites/wall_left.png");
loadSprite("wall_mid", "/sprites/wall_mid.png");
loadSprite("wall_right", "/sprites/wall_right.png");
loadSprite("wall_goo", "/sprites/wall_goo.png");
loadSprite("wall_fire", "/sprites/wall_fire.png", {
  sliceX: 3,
  anims: { // (Anims in plural)
    idle: { from: 0, to: 2, speed: 5, loop: true } 
    // 'idle' is own name. get frames 0-2, at speed of 5 frames per second
  }
});
loadSprite("wall_fire_basin", "/sprites/wall_fire_basin.png", {
  sliceX: 3,
  anims: { 
    idle: { from: 0, to: 2, speed: 5, loop: true } 
  }
});
loadSprite("llamazon1", "/sprites/llamazon1.png", {
  sliceX: 32,
  anims: {
    idle: { from:  0, to: 20, speed: 5, loop: true },
    run:  { from: 21, to: 31, speed: 10, loop: true }
  },
});
loadSprite("llamazon2", "/sprites/llamazon2.png", {
  sliceX: 17,
  anims: {
    idle: { from: 0, to: 4, speed: 15, loop: true },
    run: { from: 5, to: 16, speed: 20, loop: true }
  },
});
loadSprite("llamazon3", "/sprites/llamazon3.png", {
  sliceX: 17,
  anims: {
    idle: { from: 0, to: 4, speed: 10, loop: true },
    run: { from: 5, to: 16, speed: 15, loop: true }
  },
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
    idle: { from: 0, to: 3, speed: 5, loop: true },
    run: { from: 4, to: 7, speed: 3, loop: true }
  },
});
loadSprite("demon", "/sprites/demon.png", {
  sliceX: 8,
  anims: {
    idle: { from: 0, to: 3, speed: 5, loop: true },
    run: { from: 4, to: 7, speed: 3, loop: true }
  },
});
loadSprite("llama", "/sprites/llama_idle.png", {
  sliceX: 20,
  anims: {
    idle: { from: 0, to: 19, speed: 5, loop: true }
  },
});

/*
* -------------------
* SUBMIT FORM 
* -------------------
*/

const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  currentPlayer = document.getElementById("username").value.trim();

  await fetch(BASE_URL + "/players", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      username: currentPlayer,
    }),
  });

  go("play", { level: 0});
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
    // Solid means you can't move through it. "wall" at end is a tag, can be named anything
    l: () => [sprite ("wall_left"),  area(), solid(), "wall"], 
    r: () => [sprite ("wall_right"), area(), solid(), "wall"],
    w: () => [sprite ("wall_mid"), area(), solid(), "wall"],
    g: () => [sprite ("wall_goo"), area(), solid(), "wall"],
    // Fountain is an animation, so must specify type - idle or run (anim in singular)
    f: () => [
      sprite ("wall_fire", { anim: "idle" }), 
      area(), 
      solid(), 
      "wall"
    ],
    b: () => [
      sprite ("wall_fire_basin", { anim: "idle" }), 
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
      "fwwwfwwfwwff",
      "b   b  b  bb",
      "l &        r",
      "l          r",
      "l     ^    g",
      "l          r",
      "l &        r",
      "l          r",
      "l^         g",
      "l          r",
      "l h  &    fr",
      "gwwwwwwwwwbr",
    ],
    [
      "lwwwwwwwwwwr",
      "l          r",
      "l          r",
      "l         rr",
      "l          r",
      "l          r",
      "l          r",
      "l          r",
      "l          r",
      "l          r",
      "l          r",
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
  add([text(currentPlayer), pos(238,70), origin("center"), scale(0.1)])

  // ----- PLAYER ----- 
  // const player = add([
  //   // position. map grid starts at 1, so (2,2) is first unblocked square
  //   pos(map.getPos(2,2)),
  //   sprite("knight", { anim: "idle" }),
  //   solid(), // makes other objects impenetrable
  //   // area(), // generates collider area from shape & enables collision detection
  //   origin("center"), // by default top-left
  //   area({ width: 16, height: 16, offset: vec2(0,7) }),
  // ]);

  const player = add([
    // position. map grid starts at 1, so (2,2) is first unblocked square
    pos(map.getPos(10,2)),
    sprite("llamazon3", { anim: "idle" }),
    scale(0.047),
    solid(), // makes other objects impenetrable
    // area(), // generates collider area from shape & enables collision detection
    // origin("center"), // by default top-left
    // ?????? removing this solved the "stuck at left wall" issue
    area({ width: 516, height: 595 }),
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
    player.flipX(false);
    player.move(-PLAYER_SPEED, 0);
  });
  onKeyDown("right", () => {
    player.flipX(true);
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

          // wait for 1 sec 
          await wait(1);
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

  // ----- DEMON -----
  const demon = add([
    sprite("demon"),
    pos(map.getPos(1,9)),
    origin("center"),
    // w/o area defn, object cannot detect boundary for collision
    area(), 
    "danger",
    state("move", ["idle", "attack", "move"]) // state fn from Kaboom library
  ]);

  // when demon is in idle state, do something
  // Or in tech jargon:
  // run the callback every time demon ENTERs "idle" state
  demon.onStateEnter("idle", async () => {
    demon.play("idle");
    // IDLE for 2sec, then enter ATTACK state
    await wait(2)
    demon.enterState("attack");
  });

  // run the callback every time demon ENTERs "attack" state
  demon.onStateEnter("attack", async () => {
    if (player.exists()){
      // calculate vector of player from demon
      const dir = player.pos.sub(demon.pos).unit(); 

      // generate fire
      add([
        pos(demon.pos),
        move(dir, FIRE_SPEED),
        rect(3,1), // rectangle
        area(),
        origin("center"),
        color(RED),
        // destroy object when it's out of screen view
        cleanup(),
        "fire",
        "danger"
      ]);
    }

    await wait(1)
    demon.enterState("move");
  });

  // run the callback every time demon ENTERs "move" state
  demon.onStateEnter("move", async () => {
    demon.play("run");
    // MOVE for 2secs, then enter ATTACK state
    await wait(2);
    demon.enterState("idle");
  });

  demon.onStateUpdate("move", () => {
    if (!player.exists()) return;

    const dir = player.pos.sub(demon.pos).unit();
    demon.flipX(dir.x < 0);
    demon.move(dir.scale(DEMON_SPEED));
  });

  demon.enterState("move");


  // ----- WIZARD -----
  // const wizard = add([
  //   sprite("wizard"),
  //   pos(map.getPos(1,9)),
  //   origin("center"),
  //   // w/o area defn, object cannot detect boundary for collision
  //   area(), 
  //   "danger",
  //   state("move", ["idle", "attack", "move"]) // state fn from Kaboom library
  // ]);

  //   // when Wizard is in idle state, do something
  //   // Or in tech jargon:
  //   // run the callback every time Wizard ENTERs "idle" state
  //   wizard.onStateEnter("idle", async () => {
  //     wizard.play("idle");
  //     // IDLE for 2sec, then enter ATTACK state
  //     await wait(2)
  //     wizard.enterState("attack");
  //   });

  //   // run the callback every time Wizard ENTERs "attack" state
  //   wizard.onStateEnter("attack", async () => {
  //     if (player.exists()){
  //       // calculate vector of player from wizard
  //       const dir = player.pos.sub(wizard.pos).unit(); 

  //       // generate fire
  //       add([
  //         pos(wizard.pos),
  //         move(dir, FIRE_SPEED),
  //         rect(3,1), // rectangle
  //         area(),
  //         origin("center"),
  //         color(RED),
  //         // destroy object when it's out of screen view
  //         cleanup(),
  //         "fire",
  //         "danger"
  //       ]);
  //     }

  //     await wait(1)
  //     wizard.enterState("move");
  //   });

  //   // run the callback every time Wizard ENTERs "move" state
  //   wizard.onStateEnter("move", async () => {
  //     wizard.play("run");
  //     // MOVE for 0.5secs, then enter ATTACK state
  //     await wait(2);
  //     wizard.enterState("idle");
  //   });

  //   wizard.onStateUpdate("move", () => {
  //     if (!player.exists()) return;

  //     const dir = player.pos.sub(wizard.pos).unit();
  //     wizard.flipX(dir.x < 0);
  //     wizard.move(dir.scale(WIZARD_SPEED));
  //   });

  //   wizard.enterState("move");
});

/*
* -------------------
* SCENE - GAME OVER 
* -------------------
*/

const saveGame = async (player, score) => {
  await fetch(BASE_URL + "/games", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      username: player,
      score: score,
    }),
  });
}

scene("over", ({ score }) => {
  add([ text(score, 26), origin("center"), pos(width()/2, height()/2) ]);
  add([
    pos((width()/2), 150),
    origin("center"),
    text("click to see leaderboard", {
        size: 10, // 48 pixels tall
    }),
  ])

  if (score > 0) saveGame(currentPlayer, score);

  onMousePress(() => {
    go("intro");
  });
});

/*
* -------------------
* SCENE - INTRO 
* -------------------
*/

const fetchTop5 = async () => {
  const response = await fetch(BASE_URL + "/games");
  const games = await response.json();
  return games;
}

scene("intro", async () => {
  // Step 1 - fetch top 5 games from APIs
  const games = await fetchTop5();
  console.log(games);

  // Step 2 - render leaderboard 
  add([
    pos(BASE_X, BASE_Y - 30),
    sprite("llama", { anim: "idle" }),
    origin("center"),
    scale(0.08),
  ]);

  games.forEach((game, index) => {
    add([
      text(`${game.player.username.toUpperCase()}\u00A0${game.score}`, {
        size: 10,
        width: 180,
      }),
      pos(BASE_X, BASE_Y + 20 * index),
      origin("center")
    ]);
  });

  add([
    pos((width()/2), 170),
    origin("center"),
    text("click to play again", {
        size: 10, // 48 pixels tall
    }),
  ])

  onMousePress(() => {
    go("play", { level: 0 });
  });

});

// go("play", { level: 1 });
go("intro");

// debug.inspect = true;