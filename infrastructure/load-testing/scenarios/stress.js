import loginTest from "../scripts/login.test.js";

export const options = {
  vus: 50,
  duration: "30s",
};

export default function () {
  loginTest();
}
