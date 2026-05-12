import http from "k6/http";
import { check } from "k6";
import {
  bearerParams,
  env,
  expectApiSuccess,
  expectStatus,
  jsonParams,
  parseJsonResponse,
  serviceUrl,
} from "../config/base.js";

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
  return signIn(env.credentials.candidate);
}

export function signInAsRecruiter() {
  return signIn(env.credentials.recruiter);
}

export function signInAsAdmin() {
  return signIn(env.credentials.admin);
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
