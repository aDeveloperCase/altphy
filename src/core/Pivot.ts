export class Pivot<ItemType> {
  itemA: ItemType;
  itemB: ItemType;

  constructor(itemA: ItemType, itemB: ItemType) {
    this.itemA = itemA;
    this.itemB = itemB;
  }
}
