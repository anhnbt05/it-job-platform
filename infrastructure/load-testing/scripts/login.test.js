import http from "k6/http";
import { check } from "k6";
import encoding from "k6/encoding";
import {
  bearerParams,
  env,
  expectApiSuccess,
  expectStatus,
  jsonParams,
  parseJsonResponse,
  serviceUrl,
} from "../config/base.js";

const authCache = {
  candidate: null,
  recruiter: null,
  admin: null,
};

function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    return JSON.parse(
      encoding.b64decode(parts[1], "rawurl", "s"),
    );
  } catch (_error) {
    return null;
  }
}

function isCachedAuthValid(cachedAuth) {
  if (!cachedAuth?.accessToken || !cachedAuth?.refreshToken) {
    return false;
  }

  const payload = decodeJwtPayload(cachedAuth.accessToken);
  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 - Date.now() > 10_000;
}

export function signIn({ email, password, role }) {
  const response = http.post(
    serviceUrl("identity", "/auth/sign-in"),
    JSON.stringify({
      email,
      password,
    }),
    jsonParams({ service: "identity", operation: "sign_in", role }),
  );

  expectStatus(response, 201, `${role} sign-in`);

  const body = parseJsonResponse(response);

  check(body, {
    [`${role} access token present`]: (payload) =>
      typeof payload?.accessToken === "string" && payload.accessToken.length > 0,
    [`${role} refresh token present`]: (payload) =>
      typeof payload?.refreshToken === "string" &&
      payload.refreshToken.length > 0,
  });

  return body;
}

export function signInAsCandidate() {
  if (!isCachedAuthValid(authCache.candidate)) {
    authCache.candidate = signIn(env.credentials.candidate);
  }

  return authCache.candidate;
}

export function signInAsRecruiter() {
  if (!isCachedAuthValid(authCache.recruiter)) {
    authCache.recruiter = signIn(env.credentials.recruiter);
  }

  return authCache.recruiter;
}

export function signInAsAdmin() {
  if (!isCachedAuthValid(authCache.admin)) {
    authCache.admin = signIn(env.credentials.admin);
  }

  return authCache.admin;
}

export function getCurrentUser(accessToken, role) {
  const response = http.get(
    serviceUrl("identity", "/users/me"),
    bearerParams(accessToken, {
      service: "identity",
      operation: "get_me",
      role,
    }),
  );

  expectStatus(response, 200, `${role} get current user`);
  return expectApiSuccess(response, `${role} get current user`);
}

export default function loginTest() {
  const auth = signInAsCandidate();
  getCurrentUser(auth.accessToken, "candidate");
}
