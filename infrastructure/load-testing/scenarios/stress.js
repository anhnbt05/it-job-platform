import { buildOptions } from "../config/base.js";
import { mixedJourney } from "../scripts/service-flows.js";

export const options = buildOptions({
  stages: [
    { duration: "30s", target: 5 },
    { duration: "1m", target: 15 },
    { duration: "1m", target: 25 },
    { duration: "1m", target: 25 },
    { duration: "30s", target: 0 },
  ],
  tags: {
    scenario: "stress",
  },
});

export default function () {
  mixedJourney();
}
