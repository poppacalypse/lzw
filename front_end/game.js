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
  anims: {
    idle: { from: 0, to: 2, speed: 5, loop: true }
  }
});


scene("play", () => {
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
  )
});

go("play");