import http from "k6/http";
import { check, group } from "k6";
import {
  bearerParams,
  env,
  expectApiSuccess,
  expectStatus,
  jsonParams,
  serviceUrl,
  springCandidateHeaders,
  springUserHeaders,
  summaryDateRange,
  think,
  weightedPick,
} from "../config/base.js";
import {
  getCurrentUser,
  signInAsAdmin,
  signInAsCandidate,
  signInAsRecruiter,
} from "./login.test.js";

function getCategories(accessToken, role) {
  const response = http.get(
    serviceUrl("organization", "/categories"),
    bearerParams(accessToken, {
      service: "organization",
      operation: "list_categories",
      role,
    }),
  );

  expectStatus(response, 200, `${role} list categories`);
  const body = expectApiSuccess(response, `${role} list categories`);

  check(body, {
    [`${role} categories returned`]: (payload) =>
      Array.isArray(payload) ? payload.length > 0 : Array.isArray(payload?.data),
  });

  return body;
}

function getCompanies(accessToken, role) {
  const response = http.get(
    serviceUrl("organization", "/companies"),
    bearerParams(accessToken, {
      service: "organization",
      operation: "list_companies",
      role,
    }),
  );

  expectStatus(response, 200, `${role} list companies`);
  return expectApiSuccess(response, `${role} list companies`);
}

function getCompany(accessToken, role) {
  const response = http.get(
    serviceUrl("organization", `/companies/${env.seeded.companyId}`),
    bearerParams(accessToken, {
      service: "organization",
      operation: "get_company",
      role,
    }),
  );

  expectStatus(response, 200, `${role} get company`);
  return expectApiSuccess(response, `${role} get company`);
}

function getBranches(accessToken, role) {
  const response = http.get(
    serviceUrl(
      "organization",
      `/branches?companyId=${encodeURIComponent(env.seeded.companyId)}`,
    ),
    bearerParams(accessToken, {
      service: "organization",
      operation: "list_branches",
      role,
    }),
  );

  expectStatus(response, 200, `${role} list branches`);
  return expectApiSuccess(response, `${role} list branches`);
}

function getNotifications(accessToken, role) {
  const response = http.get(
    serviceUrl("notification", ""),
    bearerParams(accessToken, {
      service: "notification",
      operation: "list_notifications",
      role,
    }),
  );

  expectStatus(response, 200, `${role} list notifications`);
  return expectApiSuccess(response, `${role} list notifications`);
}

function getJobs(userId, role) {
  const response = http.get(
    serviceUrl("job", "/jobs"),
    springUserHeaders(userId, role, {
      service: "job",
      operation: "list_jobs",
      role,
    }),
  );

  expectStatus(response, 200, `${role} list jobs`);
  return expectApiSuccess(response, `${role} list jobs`);
}

function getJobDetail(userId, role, jobId = env.seeded.openJobId) {
  const response = http.get(
    serviceUrl("job", `/jobs/${jobId}`),
    springUserHeaders(userId, role, {
      service: "job",
      operation: "get_job_detail",
      role,
    }),
  );

  expectStatus(response, 200, `${role} get job detail`);
  return expectApiSuccess(response, `${role} get job detail`);
}

function getRecommendedJobs() {
  const candidate = env.credentials.candidate;
  const response = http.get(
    serviceUrl(
      "job",
      `/jobs/candidates/${candidate.userId}/recommended?level=${candidate.level}`,
    ),
    jsonParams({
      service: "job",
      operation: "recommended_jobs",
      role: candidate.role,
    }),
  );

  expectStatus(response, 200, "candidate get recommended jobs");
  return expectApiSuccess(response, "candidate get recommended jobs");
}

function getFavorites() {
  const response = http.get(
    serviceUrl("job", "/jobs/favorites"),
    springCandidateHeaders(env.credentials.candidate.userId, {
      service: "job",
      operation: "list_favorites",
      role: "candidate",
    }),
  );

  expectStatus(response, 200, "candidate list favorites");
  return expectApiSuccess(response, "candidate list favorites");
}

function getApplications() {
  const response = http.get(
    serviceUrl("application", "/applications"),
    springCandidateHeaders(env.credentials.candidate.userId, {
      service: "application",
      operation: "list_applications",
      role: "candidate",
    }),
  );

  expectStatus(response, 200, "candidate list applications");
  return expectApiSuccess(response, "candidate list applications");
}

export function getDashboardSummary() {
  const range = summaryDateRange();
  const response = http.get(
    serviceUrl(
      "dashboard",
      `/dashboard/summary?startDate=${range.startDate}&endDate=${range.endDate}`,
    ),
    jsonParams({
      service: "dashboard",
      operation: "summary",
    }),
  );

  expectStatus(response, 200, "dashboard summary");
  return expectApiSuccess(response, "dashboard summary");
}

export function generateDashboardReport(type = "pdf") {
  const range = summaryDateRange();
  const response = http.post(
    serviceUrl("dashboard", "/dashboard/reports"),
    JSON.stringify({
      type,
      startDate: range.startDate,
      endDate: range.endDate,
    }),
    jsonParams(
      {
        service: "dashboard",
        operation: "report",
        type,
      },
      {
        Accept: type === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ),
  );

  expectStatus(response, 200, `dashboard ${type} report`);

  check(response, {
    [`dashboard ${type} report has body`]: (res) => res.body && res.body.length > 0,
  });

  return response;
}

export function candidateJourney() {
  group("candidate journey", () => {
    const auth = signInAsCandidate();
    think();
    getCurrentUser(auth.accessToken, "candidate");
    think();
    getCategories(auth.accessToken, "candidate");
    think();
    getCompanies(auth.accessToken, "candidate");
    think();
    getNotifications(auth.accessToken, "candidate");
    think();
    getJobs(env.credentials.candidate.userId, "candidate");
    think();
    getJobDetail(env.credentials.candidate.userId, "candidate");
    think();
    getRecommendedJobs();
    think();
    getFavorites();
    think();
    getApplications();
    think();
    getDashboardSummary();
  });
}

export function recruiterJourney() {
  group("recruiter journey", () => {
    const auth = signInAsRecruiter();
    think();
    getCurrentUser(auth.accessToken, "recruiter");
    think();
    getCompanies(auth.accessToken, "recruiter");
    think();
    getNotifications(auth.accessToken, "recruiter");
    think();
    getCompany(auth.accessToken, "recruiter");
    think();
    getBranches(auth.accessToken, "recruiter");
    think();
    getJobs(env.credentials.recruiter.userId, "recruiter");
    think();
    getJobDetail(env.credentials.recruiter.userId, "recruiter");
    think();
    getDashboardSummary();
  });
}

export function adminJourney() {
  group("admin journey", () => {
    const auth = signInAsAdmin();
    think();
    getCurrentUser(auth.accessToken, "admin");
    think();
    getCategories(auth.accessToken, "admin");
    think();
    getCompanies(auth.accessToken, "admin");
    think();
    getNotifications(auth.accessToken, "admin");
    think();
    getCompany(auth.accessToken, "admin");
    think();
    getBranches(auth.accessToken, "admin");
    think();
    getJobs(env.credentials.admin.userId, "admin");
    think();
    getDashboardSummary();
  });
}

export function smokeJourney() {
  candidateJourney();
  recruiterJourney();
  adminJourney();
  generateDashboardReport("pdf");
}

export function mixedJourney() {
  const flow = weightedPick([
    { weight: 5, value: candidateJourney },
    { weight: 3, value: recruiterJourney },
    { weight: 2, value: adminJourney },
  ]);

  flow();

  if (Math.random() < 0.15) {
    generateDashboardReport(Math.random() < 0.5 ? "pdf" : "xlsx");
  }
}
