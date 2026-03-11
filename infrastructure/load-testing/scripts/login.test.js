import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL;

export default function () {
  const res = http.post(`${BASE_URL}/auth/sign-in`, {
    email: "test@gmail.com",
    password: "123456",
  });

  check(res, {
    "login success": (r) => r.status === 201,
  });
}
