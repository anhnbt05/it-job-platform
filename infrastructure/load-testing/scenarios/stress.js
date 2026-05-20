import { buildOptions, resolvePeakVus } from "../config/base.js";
import { mixedJourney } from "../scripts/service-flows.js";

const peakVus = resolvePeakVus(25);
const rampOneVus = Math.max(1, Math.ceil(peakVus * 0.2));
const rampTwoVus = Math.max(rampOneVus, Math.ceil(peakVus * 0.6));

export const options = buildOptions({
  stages: [
    { duration: "30s", target: rampOneVus },
    { duration: "1m", target: rampTwoVus },
    { duration: "1m", target: peakVus },
    { duration: "1m", target: peakVus },
    { duration: "30s", target: 0 },
  ],
  tags: {
    scenario: "stress",
  },
});

export default function () {
  mixedJourney();
}
