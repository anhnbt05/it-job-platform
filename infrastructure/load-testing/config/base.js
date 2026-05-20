import { check, fail, sleep } from "k6";

const DEFAULT_GATEWAY_BASE_URL = "http://host.docker.internal:8000";

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function jsonParseOrNull(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const env = {
  gatewayBaseUrl: trimTrailingSlash(
    __ENV.GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL,
  ),
  services: {
    identity: trimTrailingSlash(
      __ENV.IDENTITY_BASE_URL ||
        `${__ENV.GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL}/identity`,
    ),
    organization: trimTrailingSlash(
      __ENV.ORGANIZATION_BASE_URL ||
        `${__ENV.GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL}/organization`,
    ),
    notification: trimTrailingSlash(
      __ENV.NOTIFICATION_BASE_URL ||
        `${__ENV.GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL}/notification`,
    ),
    job: trimTrailingSlash(
      __ENV.JOB_BASE_URL || "http://host.docker.internal:8082/api",
    ),
    application: trimTrailingSlash(
      __ENV.APPLICATION_BASE_URL || "http://host.docker.internal:8083/api",
    ),
    dashboard: trimTrailingSlash(
      __ENV.DASHBOARD_BASE_URL || "http://host.docker.internal:8084/api",
    ),
  },
  credentials: {
    admin: {
      email: __ENV.ADMIN_EMAIL || "admin@example.com",
      password: __ENV.ADMIN_PASSWORD || "admin123",
      role: "admin",
      userId:
        __ENV.ADMIN_USER_ID || "33333333-3333-3333-3333-333333333333",
    },
    candidate: {
      email: __ENV.CANDIDATE_EMAIL || "candidate@example.com",
      password: __ENV.CANDIDATE_PASSWORD || "candidate123",
      role: "candidate",
      userId:
        __ENV.CANDIDATE_USER_ID || "44444444-4444-4444-4444-444444444444",
      level: "junior",
    },
    recruiter: {
      email: __ENV.RECRUITER_EMAIL || "recruiter@example.com",
      password: __ENV.RECRUITER_PASSWORD || "recruiter123",
      role: "recruiter",
      userId:
        __ENV.RECRUITER_USER_ID || "66666666-6666-6666-6666-666666666666",
    },
  },
  seeded: {
    companyId: __ENV.COMPANY_ID || "11111111-1111-1111-1111-111111111111",
    branchId: __ENV.BRANCH_ID || "22222222-2222-2222-2222-222222222222",
    openJobId: __ENV.OPEN_JOB_ID || "90000000-0000-0000-0000-000000000001",
  },
  failFast: (__ENV.FAIL_FAST || "false").toLowerCase() === "true",
  peakVus: Number.parseInt(__ENV.PEAK_VUS || "", 10),
};

export const defaultThresholds = {
  http_req_failed: ["rate<0.05"],
  http_req_duration: ["p(95)<1500", "p(99)<3000"],
  checks: ["rate>0.95"],
};

export function buildOptions(overrides = {}) {
  return {
    thresholds: defaultThresholds,
    ...overrides,
  };
}

export function resolvePeakVus(defaultValue) {
  if (Number.isFinite(env.peakVus) && env.peakVus > 0) {
    return env.peakVus;
  }

  return defaultValue;
}

export function jsonParams(tags = {}, extraHeaders = {}) {
  return {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    tags,
  };
}

export function bearerParams(token, tags = {}, extraHeaders = {}) {
  return jsonParams(tags, {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  });
}

export function serviceUrl(serviceName, path) {
  return `${env.services[serviceName]}${path}`;
}

export function springUserHeaders(userId, role, tags = {}, extraHeaders = {}) {
  return {
    headers: {
      Accept: "application/json",
      "X-User-Id": userId,
      "X-User-Role": role,
      ...extraHeaders,
    },
    tags,
  };
}

export function springCandidateHeaders(userId, tags = {}, extraHeaders = {}) {
  return {
    headers: {
      Accept: "application/json",
      "X-User-Id": userId,
      ...extraHeaders,
    },
    tags,
  };
}

export function parseJsonResponse(response) {
  if (!response || !response.body) {
    return null;
  }

  if (typeof response.body === "object") {
    return response.body;
  }

  return jsonParseOrNull(response.body);
}

export function expectStatus(response, allowedStatuses, label) {
  const statuses = Array.isArray(allowedStatuses)
    ? allowedStatuses
    : [allowedStatuses];

  const success = check(response, {
    [`${label} status in ${statuses.join(",")}`]: (res) =>
      statuses.includes(res.status),
  });

  if (!success && env.failFast) {
    fail(
      `${label} failed with status ${response.status}: ${String(
        response.body || "",
      ).slice(0, 300)}`,
    );
  }

  return success;
}

export function expectApiSuccess(response, label) {
  const body = parseJsonResponse(response);

  const success = check(body, {
    [`${label} body parsed`]: (parsed) => parsed !== null,
    [`${label} success=true`]: (parsed) =>
      parsed === null || parsed.success === undefined || parsed.success === true,
  });

  if (!success && env.failFast) {
    fail(`${label} response body invalid: ${String(response.body).slice(0, 300)}`);
  }

  return body;
}

export function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function weightedPick(weightedItems) {
  const total = weightedItems.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;

  for (const item of weightedItems) {
    cursor -= item.weight;
    if (cursor <= 0) {
      return item.value;
    }
  }

  return weightedItems[weightedItems.length - 1].value;
}

export function think(minSeconds = 0.2, maxSeconds = 0.8) {
  sleep(minSeconds + Math.random() * (maxSeconds - minSeconds));
}

export function summaryDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
