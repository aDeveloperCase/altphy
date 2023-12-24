import * as THREE from "three";
import { BigN, BigNumber, noop } from "../utils/generics";
import { World } from "./World";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export class WorldItem extends THREE.Mesh {
  world: World;
  isBody: boolean = false;
  fieldRadius: BigNumber = new BigN(0);

  label: CSS2DObject | null = null;

  constructor(world: World, geometry?: THREE.BufferGeometry, material?: THREE.Material | THREE.Material[]) {
    super(geometry, material);
    this.world = world;
  }

  update() {
    if (this.label) {
      this.label.position.copy(this.position);
      this.label.position.y += 0.2;
      this.label.position.z += 0.2;
    }
  }

  onCollision(other: WorldItem) {
    noop(other);
  }

  onInteraction(other: WorldItem, distance: BigNumber) {
    noop(other, distance);
  }
}
