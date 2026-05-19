const DEFAULTS = {
  gatewayBaseUrl: "http://127.0.0.1:8000",
  identityBaseUrl: "http://127.0.0.1:8000/identity",
  organizationBaseUrl: "http://127.0.0.1:8000/organization",
  jobBaseUrl: "http://127.0.0.1:8082/api",
  applicationBaseUrl: "http://127.0.0.1:8083/api",
  dashboardBaseUrl: "http://127.0.0.1:8084/api",
  adminEmail: "admin@example.com",
  adminPassword: "admin123",
  adminUserId: "33333333-3333-3333-3333-333333333333",
  candidateEmail: "candidate@example.com",
  candidatePassword: "candidate123",
  candidateUserId: "44444444-4444-4444-4444-444444444444",
  recruiterEmail: "recruiter@example.com",
  recruiterPassword: "recruiter123",
  recruiterUserId: "66666666-6666-6666-6666-666666666666",
};

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function envValue(name, fallback) {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

export const config = {
  gatewayBaseUrl: trimTrailingSlash(
    envValue("API_AUTOMATION_GATEWAY_URL", DEFAULTS.gatewayBaseUrl),
  ),
  identityBaseUrl: trimTrailingSlash(
    envValue("API_AUTOMATION_IDENTITY_URL", DEFAULTS.identityBaseUrl),
  ),
  organizationBaseUrl: trimTrailingSlash(
    envValue(
      "API_AUTOMATION_ORGANIZATION_URL",
      DEFAULTS.organizationBaseUrl,
    ),
  ),
  jobBaseUrl: trimTrailingSlash(
    envValue("API_AUTOMATION_JOB_URL", DEFAULTS.jobBaseUrl),
  ),
  applicationBaseUrl: trimTrailingSlash(
    envValue(
      "API_AUTOMATION_APPLICATION_URL",
      DEFAULTS.applicationBaseUrl,
    ),
  ),
  dashboardBaseUrl: trimTrailingSlash(
    envValue("API_AUTOMATION_DASHBOARD_URL", DEFAULTS.dashboardBaseUrl),
  ),
  credentials: {
    admin: {
      email: envValue("API_AUTOMATION_ADMIN_EMAIL", DEFAULTS.adminEmail),
      password: envValue(
        "API_AUTOMATION_ADMIN_PASSWORD",
        DEFAULTS.adminPassword,
      ),
      userId: envValue("API_AUTOMATION_ADMIN_USER_ID", DEFAULTS.adminUserId),
      role: "admin",
    },
    candidate: {
      email: envValue(
        "API_AUTOMATION_CANDIDATE_EMAIL",
        DEFAULTS.candidateEmail,
      ),
      password: envValue(
        "API_AUTOMATION_CANDIDATE_PASSWORD",
        DEFAULTS.candidatePassword,
      ),
      userId: envValue(
        "API_AUTOMATION_CANDIDATE_USER_ID",
        DEFAULTS.candidateUserId,
      ),
      role: "candidate",
      level: "junior",
    },
    recruiter: {
      email: envValue(
        "API_AUTOMATION_RECRUITER_EMAIL",
        DEFAULTS.recruiterEmail,
      ),
      password: envValue(
        "API_AUTOMATION_RECRUITER_PASSWORD",
        DEFAULTS.recruiterPassword,
      ),
      userId: envValue(
        "API_AUTOMATION_RECRUITER_USER_ID",
        DEFAULTS.recruiterUserId,
      ),
      role: "recruiter",
    },
  },
};
