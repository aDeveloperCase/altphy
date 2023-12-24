import * as THREE from "three";
import { WorldItem } from "./WorldItem";
import { BigN, BigNumber, getDirectionBetweenTwoPoints } from "../utils/generics";
import { Alphatron } from "./Alphatron";
import { GCharge } from "../utils/constants";
import { World } from "./World";
import { Force } from "./Force";
import { Pivot } from "./Pivot";
import { ForceTransition, Phase } from "./ForceTransition";

export class Gammatron extends WorldItem {
  public static radius: BigNumber = new BigN(0.1);

  public static minPivotDistance: BigNumber = new BigN(0.01);
  public static maxPivotDistance: BigNumber = new BigN(0.05);

  public static maxFieldEnergy: BigNumber = new BigN(0.01);

  protected static geometry = new THREE.SphereGeometry(Gammatron.radius.toNumber(), 25, 25);
  protected static materialPos = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  protected static materialNeg = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });

  pivot: Pivot<Gammatron> | null = null;

  alphatron: Alphatron;
  charge: GCharge;

  omega: BigNumber = new BigN(0);
  gamma: BigNumber = new BigN(0);
  distance: BigNumber = new BigN(1);

  torqueTransition: ForceTransition | null = null;
  speedTransition: ForceTransition | null = null;

  constructor(world: World, alphatron: Alphatron, charge: GCharge) {
    super(world, Gammatron.geometry, charge === GCharge.POS ? Gammatron.materialPos : Gammatron.materialNeg);
    this.alphatron = alphatron;
    this.fieldRadius = new BigN(3);
    this.charge = charge;
  }

  /**
   * Gammatron updates happening at each frame.
   */
  update() {
    super.update();

    const c = this.alphatron.position;
    const r = this.distance;

    const gamma = this.gamma;
    const omega = this.omega;

    // Cartesian coordinates retrieved from the spherical coordinates: https://en.wikipedia.org/wiki/Spherical_coordinate_system#Cartesian_coordinates
    const tX = BigN.mul(r, BigN.sin(omega)).mul(BigN.cos(gamma));
    const tY = BigN.mul(r, BigN.sin(omega)).mul(BigN.sin(gamma));
    const tZ = BigN.mul(r, BigN.cos(omega));

    const translation = new THREE.Vector3().set(tX.toNumber(), tY.toNumber(), tZ.toNumber()).normalize();

    this.quaternion.copy(this.alphatron.quaternion);
    this.position.set(c.x, c.y, c.z);
    this.translateOnAxis(translation, r.toNumber());
  }

  /**
   * This method defines what should happen when the gammatron collides with an alphatron..
   * Currently it just restores the previous alphatrons position and rotation and then computes a bounce back
   * both as a movement (speed) and rotation (torque).
   * @param other
   */
  onCollision(other: Alphatron): void {
    this.alphatron.position.copy(this.alphatron.latestPos);
    this.alphatron.rotation.copy(this.alphatron.latestRot);

    other.position.copy(other.latestPos);
    other.rotation.copy(other.latestRot);

    const speed = new Force(`gamma-alpha-collision=${this.uuid}<=>${other.uuid}`, "GammaCollision");
    speed.direction = getDirectionBetweenTwoPoints(other.position, this.position);
    speed.magnitude = new BigN(0.05); // this magic number should be computed in different way..

    this.alphatron.speeds.addOrUpdate(speed);

    const posComponent = new Force();
    posComponent.direction = getDirectionBetweenTwoPoints(this.alphatron.position, this.position);
    posComponent.magnitude = this.distance;

    const torque = new Force(`gamma-alpha-collision-torque=${this.uuid}<=>${other.uuid}`, "GammaCollisionTorque");
    const triangle = new THREE.Triangle(this.position, this.alphatron.position, other.position);

    // if (new BigN(triangle.getArea()).greaterThanOrEqualTo(AlmostZero)) {
    const omega = speed.direction.angleTo(posComponent.direction);
    let magnitude = new BigN(posComponent.magnitude).mul(speed.magnitude).mul(BigN.sin(omega));

    torque.direction = triangle.getNormal(new THREE.Vector3());
    torque.magnitude = magnitude;
    // }

    this.alphatron.torques.addOrUpdate(torque);
  }

  /**
   * This methods defines what should happen when the gammatron enters the interaction field of another gammatron.
   * @param other
   * @param distance
   * @returns
   */
  onInteraction(other: Gammatron, distance: BigNumber): void {
    const isPivot = this.isPivot(other);
    let isPivotBreaking = false;

    if (!isPivot && (this.pivot || other.pivot)) {
      return;
    }

    if (this.alphatron.uuid === other.alphatron.uuid) {
      return;
    }

    const speedUuid = `interaction-gamma-gamma-speed=${this.uuid}<=>${other.uuid}`;
    const torqueUuid = `interaction-gamma-gamma-torque=${this.uuid}<=>${other.uuid}`;

    const otherSpeedUuid = `interaction-gamma-gamma-speed=${other.uuid}<=>${this.uuid}`;
    const otherTorqueUuid = `interaction-gamma-gamma-torque=${other.uuid}<=>${this.uuid}`;

    if (!isPivot && distance.lessThanOrEqualTo(Gammatron.minPivotDistance)) {
      const pivot = new Pivot(this, other);
      this.pivot = pivot;
      other.pivot = pivot;

      this.alphatron.speeds.remove(speedUuid);
      this.alphatron.torques.remove(torqueUuid);

      other.alphatron.speeds.remove(otherSpeedUuid);
      other.alphatron.torques.remove(otherTorqueUuid);

      return;
    }

    if (isPivot && distance.greaterThan(Gammatron.maxPivotDistance)) {
      // my attempt at stabilising the pivot:
      // when the two gammas are going too far awawy from each other setting the previous alphatron position and rotation
      // should prevent the forces oscillations.
      this.alphatron.position.copy(this.alphatron.prevPos);
      this.alphatron.rotation.copy(this.alphatron.prevRot);
      isPivotBreaking = true;
    } else if (isPivot) {
      return;
    }

    const field = new Force(`interaction-gamma-gamma-field=${this.uuid}<=>${other.uuid}`, "GammaGammaInteraction");
    field.direction = getDirectionBetweenTwoPoints(this.position, other.position);

    // the energy starts from 0 when distance is 0 and increases until it reaches its maximum when the distance is equal to the fieldRadius.
    const distanceFieldComponentMinToMax = Gammatron.maxFieldEnergy.div(other.fieldRadius).mul(distance); // from min to max
    // here we get the inverse: the energy is at its minimum when the distance is the greatest, the energy is at its maximum when distance is zero.
    const distanceFieldComponentMaxToMin = Gammatron.maxFieldEnergy.sub(distanceFieldComponentMinToMax); // from max to min
    field.magnitude = distanceFieldComponentMaxToMin;

    // The field force should be split into speed (movement) and torque in some other way..
    // Instead the speed is currently copied from the field force.
    const speed = new Force(speedUuid, "GammaGammaSpeed");
    speed.copy(field);

    // the position force never changes.. it could be stored somewhere else..?
    const posComponent = new Force(`alpha-gamma-position=${other.uuid}<=>${this.uuid}`, "AlphaGammaPosition");
    posComponent.direction = getDirectionBetweenTwoPoints(this.alphatron.position, this.position);
    posComponent.magnitude = this.distance;

    const torque = new Force(torqueUuid, `GammaGammaTorque`);

    // the normal of this triangle will be the direction of the torque force.
    const triangle = new THREE.Triangle(this.position, this.alphatron.position, other.position);

    const omega = field.direction.angleTo(posComponent.direction);
    torque.direction = triangle.getNormal(new THREE.Vector3());
    // computing the magnitude of the torque force: https://en.wikipedia.org/wiki/Torque
    torque.magnitude = new BigN(posComponent.magnitude).mul(field.magnitude).mul(BigN.sin(omega)).negated();

    // I'm leaving this code commented but it was a good indicator of when the forces started oscillating too much
    // in opposite directions (when two gammas are too close to each other and we are not taking any solution to prevent the oscillations).
    // Maybe this indicator could be exploited somehow..?
    // const oldTorque = this.alphatron.torques.getBy(torqueUuid);
    // const oldSpeed = this.alphatron.speeds.getBy(speedUuid);
    // const directionChangeAngle = new BigN(torque.direction.angleTo(oldTorque?.direction));

    this.alphatron.speeds.addOrUpdate(speed);
    this.alphatron.torques.addOrUpdate(torque);

    field.buildHelper(this.world, 0xffff00, this.position, new BigN(100));
  }

  protected isPivot(other: Gammatron) {
    return (
      this.pivot &&
      ((this.pivot.itemA === this && this.pivot.itemB === other) || (this.pivot.itemB === this && this.pivot.itemA === other))
    );
  }
}
