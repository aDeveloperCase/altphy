import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { Alphatron } from "../core/Alphatron";
import { Gammatron } from "../core/Gammatron";
import { World } from "../core/World";
import { GCharge, GList, GPos } from "../utils/constants";
import { BigPi } from "../utils/generics";

const orderedLabels = [
  GPos.SOUTH,
  GPos.SOUTH_EAST,
  GPos.EAST,
  GPos.NORTH_EAST,
  GPos.NORTH,
  GPos.NORTH_WEST,
  GPos.WEST,
  GPos.SOUTH_WEST,
  GPos.UP_SOUTH_EAST,
  GPos.UP_EAST,
  GPos.UP_NORTH_EAST,
  GPos.DOWN_NORTH_WEST,
  GPos.DOWN_WEST,
  GPos.DOWN_SOUTH_WEST,
  GPos.UP_SOUTH,
  GPos.UP,
  GPos.UP_NORTH,
  GPos.DOWN_NORTH,
  GPos.DOWN,
  GPos.DOWN_SOUTH,
  GPos.UP_SOUTH_WEST,
  GPos.UP_WEST,
  GPos.UP_NORTH_WEST,
  GPos.DOWN_NORTH_EAST,
  GPos.DOWN_EAST,
  GPos.DOWN_SOUTH_EAST,
];

const skipPositions = ["gamma-2::1", "gamma-2::5", "gamma-3::1", "gamma-3::5", "gamma-4::1", "gamma-4::5"];

export class GammaFactory {
  public static generate(alphatron: Alphatron, world: World, gammaList: GList = {}) {
    const omegaStep = BigPi.mul(2).div(8);
    const gammaStep = BigPi.div(4);

    const filter = Object.keys(gammaList);
    let labelIndex = 0;

    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 8; i++) {
        const posName = "gamma-" + (j + 1) + "::" + (i + 1);
        if (skipPositions.includes(posName)) {
          continue;
        }

        const labelText = orderedLabels[labelIndex];
        labelIndex++;

        if (filter.length && !filter.includes(labelText)) {
          continue;
        }

        let g = new Gammatron(world, alphatron, gammaList[labelText]! || GCharge.POS);
        g.uuid = alphatron.uuid + "::" + labelText;
        g.omega = omegaStep.mul(i);
        g.gamma = gammaStep.mul(j);
        g.isBody = true;

        world.addItem(g);

        // 2D labels used for debugging gammas positions.
        // const text = document.createElement("div");
        // text.className = "label";
        // text.style.color = "#ffffff";
        // text.textContent = labelText;

        // const label = new CSS2DObject(text);
        // label.position.copy(g.position);
        // g.label = label;

        // world.add(label);
      }
    }
  }
}
