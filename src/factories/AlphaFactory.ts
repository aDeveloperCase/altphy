import { Alphatron } from "../core/Alphatron";
import { World } from "../core/World";
import { GList } from "../utils/constants";
import { GammaFactory } from "./GammaFactory";

export class AlphaFactory {
  public static generate(world: World, filter: GList = {}, name: string = "") {
    const a = new Alphatron(world);
    a.isBody = true;
    a.uuid = name || a.uuid;

    GammaFactory.generate(a, world, filter);
    world.addItem(a);

    return a;
  }
}
