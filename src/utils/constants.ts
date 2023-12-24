export enum GPos {
  SOUTH = "south",
  SOUTH_EAST = "south-east",
  EAST = "east",
  NORTH_EAST = "north-east",
  NORTH = "north",
  NORTH_WEST = "north-west",
  WEST = "west",
  SOUTH_WEST = "south-west",
  UP_SOUTH_EAST = "up-south-east",
  UP_EAST = "up-east",
  UP_NORTH_EAST = "up-north-east",
  DOWN_NORTH_WEST = "down-north-west",
  DOWN_WEST = "down-west",
  DOWN_SOUTH_WEST = "down-south-west",
  UP_SOUTH = "up-south",
  UP = "up",
  UP_NORTH = "up-north",
  DOWN_NORTH = "down-north",
  DOWN = "down",
  DOWN_SOUTH = "down-south",
  UP_SOUTH_WEST = "up-south-west",
  UP_WEST = "up-west",
  UP_NORTH_WEST = "up-north-west",
  DOWN_NORTH_EAST = "down-north-east",
  DOWN_EAST = "down-east",
  DOWN_SOUTH_EAST = "down-south-east",
}

export enum GCharge {
  POS = "positive",
  NEG = "negative",
}

export type GList = {
  [key in GPos]?: GCharge;
};
