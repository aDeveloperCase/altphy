import { BigNumber } from "../utils/generics";
import { Force } from "./Force";

export class ForceList {
  protected list: Force[] = [];

  count(): number {
    return this.list.length;
  }

  getAll(): Force[] {
    return this.list;
  }

  refresh(): void {
    this.list = this.list.filter(function (f) {
      return f.magnitude.abs().greaterThan(0);
    });
  }

  getNet(): Force {
    let netForce = new Force();

    this.list.forEach(function (f) {
      netForce = Force.getResultant(netForce, f);
    });

    return netForce;
  }

  remove(uuid: string): void {
    const index = this.list.findIndex((f) => f.uuid === uuid);
    if (index !== -1) {
      this.list.splice(index, 1);
    }
  }

  applyFriction(fr: BigNumber, className: string = "") {
    this.list.forEach((f) => {
      if (!className || f.className === className) {
        f.magnitude = f.magnitude.mul(fr);
      }
    });
  }

  addOrUpdate(f: Force): Force {
    const force = this.list.find((force) => f.uuid === force.uuid);
    if (force) {
      force.copy(f);
      return force;
    }

    this.list.push(f);
    return f;
  }

  getBy(uuid: string): Force | null {
    return this.list.find((f) => f.uuid === uuid) || null;
  }
}
