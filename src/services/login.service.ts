import { api } from "./api";

export const postToken = async (username: string, password: string) => {
  const body = new URLSearchParams();

  body.append("grant_type", "password");
  body.append("username", username);
  body.append("password", password);

  const response = await api.post("/token", body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};