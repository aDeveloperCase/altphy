import * as THREE from "three";
import { BigN, BigNumber, getDirectionBetweenTwoPoints } from "../utils/generics";
import { World } from "./World";
import { WorldItem } from "./WorldItem";
import { ForceList } from "./ForceList";
import { Force } from "./Force";

export class Alphatron extends WorldItem {
  public static radius: BigNumber = new BigN(0.5);

  protected static geometry = new THREE.SphereGeometry(Alphatron.radius.toNumber(), 25, 25);
  protected static material = new THREE.MeshBasicMaterial({ color: 0x6666ff, wireframe: true });

  velocities: ForceList = new ForceList();
  torques: ForceList = new ForceList();

  prevPos: THREE.Vector3 = new THREE.Vector3();
  prevRot: THREE.Euler = new THREE.Euler();
  latestPos: THREE.Vector3 = new THREE.Vector3();
  latestRot: THREE.Euler = new THREE.Euler();

  constructor(world: World) {
    super(world, Alphatron.geometry, Alphatron.material);
  }

  update(): void {
    this.velocities.refresh();
    this.torques.refresh();

    const torqueNet = this.torques.getNet();
    const velocityNet = this.velocities.getNet();
    velocityNet.magnitude = velocityNet.magnitude.mul(0.2);

    this.prevRot.copy(this.rotation);
    this.rotateOnWorldAxis(torqueNet.direction, torqueNet.magnitude.toNumber());
    this.latestRot.copy(this.rotation);

    this.prevPos.copy(this.position);
    this.position.add(velocityNet.direction.clone().multiplyScalar(velocityNet.magnitude.toNumber()));
    this.latestPos.copy(this.position);

    // This friction numbers shuold be computed in a different way..
    // Maybe by introducing the mass property to the bodies.
    this.velocities.applyFriction(new BigN(0.98), "AlphaCollision");
    this.velocities.applyFriction(new BigN(0.9), "GammaCollision");
    this.torques.applyFriction(new BigN(0.9), "GammaCollisionTorque");
  }

  /**
   * What happens when the alphatron collides with another alphatron.
   * @param other
   */
  onCollision(other: Alphatron): void {
    this.position.copy(this.prevPos);
    other.position.copy(other.prevPos);

    const velocity = new Force(`alpha-alpha-collision=${this.uuid}<=>${other.uuid}`, "AlphaCollision");

    velocity.direction = getDirectionBetweenTwoPoints(this.position, other.position);
    velocity.magnitude = new BigN(0.1).negated(); // This magic number should be computed in a different way..

    this.velocities.addOrUpdate(velocity);
  }
}
