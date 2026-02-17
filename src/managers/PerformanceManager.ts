export class PerformanceManager {
  private fpsText!: Phaser.GameObjects.Text;
  private objectCountText!: Phaser.GameObjects.Text;
  private textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: "20px",
    color: "#00ff00",
    stroke: "#000000",
    strokeThickness: 4,
    fontFamily: "monospace",
    resolution: window.devicePixelRatio,
  };

  constructor(scene: Phaser.Scene) {
    this.createPerformanceDisplay(scene);
  }

  public update(scene: Phaser.Scene) {
    const fps = Math.round(scene.game.loop.actualFps);
    this.fpsText.setText(`FPS: ${fps}`);
    this.objectCountText.setText(
      `Objects: ${scene.children.length} | Physics: ${scene.physics.world.bodies.size}`,
    );
  }

  private createPerformanceDisplay(scene: Phaser.Scene) {
    this.createFpsText(scene);
    this.createObjectCountText(scene);
    this.setupResizeListener(scene);
  }

  private createFpsText(scene: Phaser.Scene) {
    this.fpsText = scene.add.text(
      scene.scale.width - 10,
      10,
      "",
      this.textStyle,
    );
    this.fpsText.setOrigin(1, 0);
    this.fpsText.setDepth(9999);
    scene.cameras.main.ignore(this.fpsText);
  }

  private createObjectCountText(scene: Phaser.Scene) {
    this.objectCountText = scene.add.text(
      scene.scale.width - 10,
      32,
      "",
      this.textStyle,
    );
    this.objectCountText.setOrigin(1, 0);
    this.objectCountText.setDepth(9999);
    scene.cameras.main.ignore(this.objectCountText);
  }

  private setupResizeListener(scene: Phaser.Scene) {
    scene.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.fpsText.setX(gameSize.width - 10);
      this.objectCountText.setX(gameSize.width - 10);
    });
  }
}
