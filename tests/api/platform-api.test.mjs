import test from "node:test";
import assert from "node:assert/strict";
import { config } from "./config.mjs";
import {
  assertNonEmptyArray,
  assertObject,
  assertStatus,
  bearerHeaders,
  requestJson,
  springHeaders,
  unwrapData,
} from "./helpers.mjs";

async function signIn({ email, password, role }) {
  const { response, body } = await requestJson(
    `${config.identityBaseUrl}/auth/sign-in`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
  );

  assertStatus(response, 201, `${role} sign-in`);
  assertObject(body, `${role} sign-in body`);
  assert.equal(body?.accessToken && typeof body.accessToken, "string");
  assert.equal(body?.refreshToken && typeof body.refreshToken, "string");

  return body.accessToken;
}

function summaryDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

test("gateway and service health endpoints respond", async () => {
  const healthChecks = [
    {
      name: "gateway identity health",
      url: `${config.identityBaseUrl}/health`,
      expectedStatus: 200,
    },
    {
      name: "job service health",
      url: `${config.jobBaseUrl}/health`,
      expectedStatus: 200,
    },
    {
      name: "application service health",
      url: `${config.applicationBaseUrl}/health`,
      expectedStatus: 200,
    },
    {
      name: "dashboard service health",
      url: `${config.dashboardBaseUrl}/health`,
      expectedStatus: 200,
    },
  ];

  await Promise.all(
    healthChecks.map(async ({ name, url, expectedStatus }) => {
      const { response } = await requestJson(url, {
        headers: { Accept: "application/json" },
      });
      assertStatus(response, expectedStatus, name);
    }),
  );
});

test("candidate API automation flow works end-to-end", async () => {
  const token = await signIn(config.credentials.candidate);

  const meResult = await requestJson(`${config.identityBaseUrl}/users/me`, {
    headers: bearerHeaders(token),
  });
  assertStatus(meResult.response, 200, "candidate get current user");
  assertObject(meResult.body, "candidate current user");

  const categoriesResult = await requestJson(
    `${config.organizationBaseUrl}/categories`,
    {
      headers: bearerHeaders(token),
    },
  );
  assertStatus(categoriesResult.response, 200, "candidate get categories");
  assertNonEmptyArray(
    unwrapData(categoriesResult.body),
    "candidate categories payload",
  );

  const companiesResult = await requestJson(
    `${config.organizationBaseUrl}/companies`,
    {
      headers: bearerHeaders(token),
    },
  );
  assertStatus(companiesResult.response, 200, "candidate get companies");
  assertNonEmptyArray(
    unwrapData(companiesResult.body),
    "candidate companies payload",
  );

  const jobsResult = await requestJson(`${config.jobBaseUrl}/jobs`, {
    headers: springHeaders(
      config.credentials.candidate.userId,
      config.credentials.candidate.role,
    ),
  });
  assertStatus(jobsResult.response, 200, "candidate get jobs");
  assertNonEmptyArray(unwrapData(jobsResult.body), "candidate jobs payload");

  const recommendedResult = await requestJson(
    `${config.jobBaseUrl}/jobs/candidates/${config.credentials.candidate.userId}/recommended?level=${config.credentials.candidate.level}`,
    {
      headers: { Accept: "application/json" },
    },
  );
  assertStatus(recommendedResult.response, 200, "candidate get recommended jobs");
  assert.ok(
    Array.isArray(unwrapData(recommendedResult.body)),
    "candidate recommended jobs payload should be an array",
  );

  const applicationsResult = await requestJson(
    `${config.applicationBaseUrl}/applications`,
    {
      headers: springHeaders(
        config.credentials.candidate.userId,
        config.credentials.candidate.role,
      ),
    },
  );
  assertStatus(applicationsResult.response, 200, "candidate get applications");
  assert.ok(
    Array.isArray(unwrapData(applicationsResult.body)),
    "candidate applications payload should be an array",
  );
});

test("recruiter API automation flow works end-to-end", async () => {
  const token = await signIn(config.credentials.recruiter);

  const meResult = await requestJson(`${config.identityBaseUrl}/users/me`, {
    headers: bearerHeaders(token),
  });
  assertStatus(meResult.response, 200, "recruiter get current user");
  assertObject(meResult.body, "recruiter current user");

  const jobsResult = await requestJson(`${config.jobBaseUrl}/jobs`, {
    headers: springHeaders(
      config.credentials.recruiter.userId,
      config.credentials.recruiter.role,
    ),
  });
  assertStatus(jobsResult.response, 200, "recruiter get jobs");
  assert.ok(
    Array.isArray(unwrapData(jobsResult.body)),
    "recruiter jobs payload should be an array",
  );

  const companiesResult = await requestJson(
    `${config.organizationBaseUrl}/companies`,
    {
      headers: bearerHeaders(token),
    },
  );
  assertStatus(companiesResult.response, 200, "recruiter get companies");
  assertNonEmptyArray(
    unwrapData(companiesResult.body),
    "recruiter companies payload",
  );
});

test("admin API automation flow returns dashboard summary", async () => {
  const token = await signIn(config.credentials.admin);
  const range = summaryDateRange();

  const meResult = await requestJson(`${config.identityBaseUrl}/users/me`, {
    headers: bearerHeaders(token),
  });
  assertStatus(meResult.response, 200, "admin get current user");
  assertObject(meResult.body, "admin current user");

  const usersResult = await requestJson(`${config.identityBaseUrl}/users`, {
    headers: bearerHeaders(token),
  });
  assertStatus(usersResult.response, 200, "admin get users");
  assertNonEmptyArray(unwrapData(usersResult.body), "admin users payload");

  const summaryResult = await requestJson(
    `${config.dashboardBaseUrl}/dashboard/summary?startDate=${range.startDate}&endDate=${range.endDate}`,
    {
      headers: { Accept: "application/json" },
    },
  );
  assertStatus(summaryResult.response, 200, "admin dashboard summary");

  const summary = unwrapData(summaryResult.body);
  assertObject(summary, "dashboard summary payload");
  assertObject(summary?.jobStats, "dashboard job stats");
  assertObject(summary?.applicationStats, "dashboard application stats");
  assert.ok(
    typeof summary.jobStats.total === "number",
    "dashboard jobStats.total should be a number",
  );
  assert.ok(
    typeof summary.applicationStats.total === "number",
    "dashboard applicationStats.total should be a number",
  );
});
