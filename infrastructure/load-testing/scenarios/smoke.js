import { buildOptions } from "../config/base.js";
import { smokeJourney } from "../scripts/service-flows.js";

export const options = buildOptions({
  vus: 1,
  iterations: 1,
  tags: {
    scenario: "smoke",
  },
});

export default function () {
  smokeJourney();
}
