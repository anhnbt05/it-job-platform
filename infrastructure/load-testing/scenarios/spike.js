import { buildOptions } from "../config/base.js";
import { mixedJourney } from "../scripts/service-flows.js";

export const options = buildOptions({
  stages: [
    { duration: "15s", target: 2 },
    { duration: "15s", target: 30 },
    { duration: "20s", target: 30 },
    { duration: "10s", target: 2 },
    { duration: "10s", target: 0 },
  ],
  tags: {
    scenario: "spike",
  },
});

export default function () {
  mixedJourney();
}
