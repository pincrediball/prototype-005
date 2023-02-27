(function () {
  const width = 400;
  const height = 600;

  class Machine extends Phaser.Scene {
    ball;
    scoreText;
    score = 0;
    bumperBodyIds = new Set();

    preload() {
      this.load.image('ball', 'assets/ball.png');
      this.load.image('outerBox', 'assets/outer-box.png');
      this.load.image('bumper', 'assets/bumper-round-001.png');
    }

    create() {
      this.scoreText = this.add
        .text(10, height - 60, `Score: ${this.score}`, {
          fontStyle: 'bold',
          fill: '#fff',
          fontSize: 48,
          fontFamily: 'sans-serif',
        })
        .setAlpha(0.75);

      this.matter.add
        .image(width - 20, height / 6, 'outerBox', null, { isStatic: true })
        .setScale(45, 1)
        .setBounce(0.3)
        .setAngle(60);

      this.ball = this.matter.add
        .image(width - 15, height - 15, 'ball', null, { density: 0.01 })
        .setCircle(8)
        .setBounce(0.3);

      this.ball.setFixedRotation();

      [
        { x: 140, y: 160 },
        { x: 190, y: 80 },
        { x: 190, y: 240 },
        { x: 100, y: 290 },
        { x: 80, y: 40 },
        { x: 40, y: 130 },
        { x: 50, y: 230 },
        { x: 320, y: 300 },
      ].forEach((coords) => {
        const bumper = this.matter.add.image(coords.x, coords.y, 'bumper', undefined, {
          isStatic: true,
        });
        bumper.setCircle(24, { isStatic: true });
        bumper.setBounce(1);
        this.bumperBodyIds.add(bumper.body.id);
      });

      this.ball.setOnCollide(this.handleCollision.bind(this));
    }

    handleCollision(data) {
      const { bodyA, bodyB } = data;
      if (this.bumperBodyIds.has(bodyA?.id) || this.bumperBodyIds.has(bodyB?.id)) {
        const velocity = this.ball?.body?.velocity;
        let vx = velocity.x * 2;
        let vy = velocity.y * 2;
        vx = vx < -18 ? -18 : vx > 18 ? 18 : vx;
        vy = vy < -18 ? -18 : vy > 18 ? 18 : vy;
        this.ball?.setVelocity(vx, vy);
        this.setScore(this.score + 10);
      }
    }

    setScore(score) {
      this.score = score;
      this.scoreText.text = `Score: ${this.score}`;
    }

    restart() {
      this.score = 0;
      this.scene.restart();
    }

    runPlaybook() {
      this.ball.setPosition(width - 15, height - 15);
      this.ball.setVelocity(0, -28);
    }
  }

  const createConfig = (opts) => ({
    type: Phaser.AUTO,
    parent: 'game',
    scale: {
      mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
    },
    width,
    height,
    physics: {
      default: 'matter',
      matter: {
        setBounds: true,
        debug: true,
        velocityIterations: 20,
        positionIterations: 15,
        runner: {
          isFixed: true,
        },
      },
    },
    ...opts,
  });

  document.addEventListener('DOMContentLoaded', () => {
    const scenes = [];
    const container = document.getElementById('game');
    for (let i = 0; i < 8; i++) {
      const div = document.createElement('div');
      container.appendChild(div);
      div.style.height = '420px';
      div.style.display = 'inline-block';
      const scene = new Machine();
      const game = new Phaser.Game(
        createConfig({
          parent: div,
          scene,
        })
      );
      scenes.push(scene);
    }

    document.getElementById('plunge').addEventListener('click', () => {
      scenes.forEach((s) => s.restart());
      setTimeout(() => {
        scenes.forEach((s) => s.runPlaybook());
      }, 100);
    });
  });
})();
