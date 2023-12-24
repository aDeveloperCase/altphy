import * as THREE from "three";
import { WorldItem } from "./WorldItem";
import { Gammatron } from "./Gammatron";
import { Alphatron } from "./Alphatron";
import { BigN, BigNumber } from "../utils/generics";

export class World extends THREE.Scene {
  items: WorldItem[] = [];
  gammatrons: Gammatron[] = [];
  alphatrons: Alphatron[] = [];

  addItem(...object: WorldItem[]): this {
    object.forEach((item) => {
      switch (true) {
        case item instanceof Gammatron:
          this.gammatrons.push(item as Gammatron);
          this.items.push(item);
          this.add(item);
          break;
        case item instanceof Alphatron:
          this.alphatrons.push(item as Alphatron);
          this.items.push(item);
          this.add(item);
          break;
      }
    });

    return this;
  }

  removeItem(item: WorldItem): this {
    let listIndex = -1;
    let itemIndex = -1;

    switch (true) {
      case item instanceof Gammatron:
        listIndex = this.gammatrons.indexOf(item as Gammatron);
        if (listIndex !== -1) {
          this.gammatrons = this.gammatrons.slice(listIndex, 1);
        }

        itemIndex = this.items.indexOf(item);
        if (itemIndex !== -1) {
          this.items = this.items.slice(itemIndex, 1);
        }

        this.remove(item);
        break;
      case item instanceof Alphatron:
        listIndex = this.alphatrons.indexOf(item as Alphatron);
        if (listIndex !== -1) {
          this.alphatrons = this.alphatrons.slice(listIndex, 1);
        }

        itemIndex = this.items.indexOf(item);
        if (itemIndex !== -1) {
          this.items = this.items.slice(itemIndex, 1);
        }

        this.remove(item);
        break;
    }

    return this;
  }

  update() {
    this.cleanHelpers();

    this.items.forEach(function (item) {
      item.update();
    });

    this.traverseInteractions(this.gammatrons);
    this.traverseCollisions(this.gammatrons, this.alphatrons, Gammatron.radius.plus(Alphatron.radius));
    this.traverseCollisions(this.alphatrons, this.alphatrons, Alphatron.radius.mul(2));
  }

  cleanHelpers() {
    this.children.forEach((obj) => {
      if (obj.name === "HelperItem") this.remove(obj);
    });
  }

  traverseCollisions(listA: WorldItem[], listB: WorldItem[], distance: BigNumber) {
    listA.forEach((item) => {
      if (item.isBody) {
        this.evaluateCollision(item, listB, distance);
      }
    });
  }

  evaluateCollision(item: WorldItem, list: WorldItem[], distance: BigNumber) {
    const otherBodies = list.filter((other) => other.isBody && item.uuid !== other.uuid);
    otherBodies.forEach((other) => {
      const dis = new BigN(item.position.distanceTo(other.position));

      if (dis.lessThan(distance)) {
        item.onCollision(other);
      }
    });
  }

  traverseInteractions(list: WorldItem[]) {
    const self = this;

    list.forEach(function (item) {
      if (item.isBody) {
        self.evaluateInteractions(item, list);
      }
    });
  }

  evaluateInteractions(item: WorldItem, list: WorldItem[]) {
    const otherBodies = list.filter(function (other) {
      return other.isBody && item.uuid !== other.uuid;
    });

    otherBodies.forEach(function (other) {
      const distance = new BigN(item.position.distanceTo(other.position));

      if (distance.lessThan(other.fieldRadius)) {
        item.onInteraction(other, distance);
      }
    });
  }
}
