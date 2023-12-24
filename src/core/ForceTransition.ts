import { BigN, BigNumber, BigPi, generateUUID } from "../utils/generics";
import { Force } from "./Force";

export enum Phase {
  PHASE_A,
  PHASE_B,
  ENDED,
}

/**
 * Easing transition for a force that goes from a force of origin to the target force.
 * The force will start with the same direction and magnitude of the force of origin up to a zero vector.
 * Then from the zero vector will transform to the target force by using the same target force direction
 * and reaching the same target force magnitude.
 *
 * Maybe this class could be useful to stabilise the gamma-gamma pivots oscillations?
 */
export class ForceTransition {
  uuid: string;
  forceOrigin: Force;
  forceTarget: Force;
  forceOriginEnd: Force;
  forceTargetStart: Force;

  forceTransition: Force;

  protected step: number = 0;
  protected durationA: number = 0;
  protected durationB: number = 0;
  protected phase: Phase = Phase.PHASE_A;

  constructor(uuid: string, forceOrigin: Force, forceTarget: Force, durationA = 30, durationB = 30) {
    this.uuid = uuid || generateUUID();

    this.forceOrigin = forceOrigin;
    this.forceTarget = forceTarget;

    this.forceOriginEnd = forceOrigin.clone();
    this.forceOriginEnd.magnitude = new BigN(0);

    this.forceTargetStart = forceTarget.clone();
    this.forceTargetStart.magnitude = new BigN(0);

    this.forceTransition = forceOrigin.clone();
    this.forceTransition.uuid = uuid;

    this.durationA = durationA;
    this.durationB = durationB;
  }

  animate(): Force {
    switch (this.phase) {
      case Phase.PHASE_A:
        this.forceTransition.magnitude = this.easeLinear(
          this.step,
          this.forceOrigin.magnitude,
          this.forceOriginEnd.magnitude,
          this.durationA
        );

        if (this.step === this.durationA) {
          this.step = 0;
          this.forceTransition.direction = this.forceTarget.direction;
          this.phase = Phase.PHASE_B;
          break;
        }
        this.step++;
        break;
      case Phase.PHASE_B:
        this.forceTransition.magnitude = this.easeLinear(
          this.step,
          this.forceTargetStart.magnitude,
          this.forceTarget.magnitude,
          this.durationB
        );

        if (this.step === this.durationB) {
          this.phase = Phase.ENDED;
          break;
        }
        this.step++;
        break;
    }

    return this.forceTransition;
  }

  getStatus(): Phase {
    return this.phase;
  }

  protected easeInSine(step: number, initialValue: BigNumber, targetValue: BigNumber, duration: number): BigNumber {
    if (targetValue.equals(0)) {
      targetValue = initialValue.negated();
    }

    return new BigN(targetValue)
      .negated()
      .mul(BigN.cos(BigN.div(step, duration).mul(BigN.div(BigPi, 2))))
      .plus(targetValue)
      .plus(initialValue);
  }

  protected easeLinear(step: number, initialValue: BigNumber, targetValue: BigNumber, duration: number): BigNumber {
    if (targetValue.equals(0)) {
      targetValue = initialValue.negated();
    }

    return initialValue.plus(BigN.mul(BigN.div(targetValue, duration), step));
  }
}
