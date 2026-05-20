import { buildOptions, resolvePeakVus } from "../config/base.js";
import { mixedJourney } from "../scripts/service-flows.js";

const peakVus = resolvePeakVus(30);
const warmupVus = Math.max(1, Math.min(5, Math.ceil(peakVus * 0.1)));

export const options = buildOptions({
  stages: [
    { duration: "15s", target: warmupVus },
    { duration: "15s", target: peakVus },
    { duration: "20s", target: peakVus },
    { duration: "10s", target: warmupVus },
    { duration: "10s", target: 0 },
  ],
  tags: {
    scenario: "spike",
  },
});

export default function () {
  mixedJourney();
}
