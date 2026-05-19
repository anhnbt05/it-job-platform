import assert from "node:assert/strict";

export async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { response, body, text };
}

export function assertStatus(response, expectedStatus, message) {
  assert.equal(
    response.status,
    expectedStatus,
    `${message} returned ${response.status}`,
  );
}

export function bearerHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

export function springHeaders(userId, role) {
  return {
    Accept: "application/json",
    "X-User-Id": userId,
    "X-User-Role": role,
  };
}

export function unwrapData(body) {
  if (Array.isArray(body)) {
    return body;
  }

  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }

  return body;
}

export function assertNonEmptyArray(value, message) {
  assert.ok(Array.isArray(value), `${message} should be an array`);
  assert.ok(value.length > 0, `${message} should not be empty`);
}

export function assertObject(value, message) {
  assert.ok(value && typeof value === "object", `${message} should be an object`);
}
