import * as THREE from "three";
import { BigN, BigNumber, generateUUID, getDirectionBetweenTwoPoints } from "../utils/generics";
import { World } from "./World";

export class Force {
  uuid: string;
  className: string;

  direction: THREE.Vector3;
  magnitude: BigNumber;

  /**
   *
   * @param uuid - the id of the force
   * @param className - a class type to be applied to similar forces
   * @param direction - the force direction
   * @param magnitude - the force magnitude
   */
  constructor(
    uuid: string = "",
    className: string = "",
    direction: THREE.Vector3 = new THREE.Vector3(),
    magnitude: BigNumber = new BigN(0)
  ) {
    this.uuid = uuid || generateUUID();
    this.className = className;
    this.direction = direction;
    this.magnitude = magnitude;
  }

  copy(f: Force) {
    // this.uuid = f.uuid;
    // this.className = f.className;
    this.direction = f.direction.clone();
    this.magnitude = new BigN(f.magnitude);
  }

  clone() {
    const f = new Force();
    f.copy(this);
    return f;
  }

  /**
   * Returns the resultant force between a and b, by using the Parallelogram Law of Vector Addition.
   * @param a
   * @param b
   * @returns
   */
  static getResultant(a: Force, b: Force): Force {
    const resDir = Force.getResultantDirection(a, b);
    const resAng = Force.getResultantAngle(a, b);
    const resMagnitude = Force.getResultantMagnitude(a, b, resAng);

    return new Force("", "", resDir, resMagnitude);
  }

  /**
   * The direction of the resultant vector computed by applying the Parallelogram Law of Vector Addition
   * (that's what should be called..)
   * @param a
   * @param b
   * @returns
   */
  protected static getResultantDirection(a: Force, b: Force): THREE.Vector3 {
    const c = new THREE.Vector3()
      .add(a.direction.clone().multiplyScalar(a.magnitude.toNumber()))
      .add(b.direction.clone().multiplyScalar(b.magnitude.toNumber()));
    return getDirectionBetweenTwoPoints(new THREE.Vector3(), c);
  }

  protected static getResultantAngle(a: Force, b: Force): BigNumber {
    return BigN.cos(a.direction.angleTo(b.direction));
  }

  /**
   * Magnitude of resultant vector R for the Parallelogram Law of Vector Addition:
   * |R| = √(P2 + Q2 + 2PQcosθ)
   *
   * @param a
   * @param b
   * @param angle
   * @returns
   */
  protected static getResultantMagnitude(a: Force, b: Force, angle: BigNumber): BigNumber {
    const toBeSquaredRooted = BigN.sum(
      a.magnitude.pow(2),
      b.magnitude.pow(2),
      BigN.mul(2, a.magnitude.mul(b.magnitude).mul(angle))
    );
    if (toBeSquaredRooted.lessThanOrEqualTo(0)) {
      // avoids to compute the square root of negative numbers (giving NaN values).
      return new BigN(0);
    }
    return BigN.sqrt(toBeSquaredRooted);
  }

  /**
   * Builds a visualisatino arrow for the force.
   * @param world
   * @param color - the color of the arrow
   * @param origin - the origin of the force
   * @param multiplier - if the force has too low magnitude it would be difficult to see it unless we don't multiply that magnitude.
   */
  buildHelper(
    world: World,
    color: THREE.ColorRepresentation = 0xffffff,
    origin: THREE.Vector3 = new THREE.Vector3(),
    multiplier: BigNumber = new BigN(1)
  ) {
    const helper = new THREE.ArrowHelper(this.direction, origin, this.magnitude.mul(multiplier).toNumber(), color);
    helper.name = "HelperItem"; // this name is important for the arrow to be removed at each frame, it's not ideal but it's just for debugging.
    world.add(helper);
  }
}
