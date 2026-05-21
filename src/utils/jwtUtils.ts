import jwt from "jsonwebtoken";
import { ConfigError, UnauthorizedError } from "../errors/customErrors.js";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ConfigError(`Variável de ambiente ${name} não configurada`);
  }
  return value;
}

export function signAccessToken(payload: object) {
  const secret = getEnvVar("JWT_SECRET");
  return jwt.sign(payload, secret, {
    expiresIn: "15m",
    issuer: "magia-das-velas-api",
    audience: "users",
  });
}

export function signRefreshToken(payload: object) {
  const refreshSecret = getEnvVar("JWT_REFRESH_SECRET");
  return jwt.sign(payload, refreshSecret, {
    expiresIn: "7d",
    issuer: "magia-das-velas-api",
    audience: "users",
  });
}

export function verifyAccessToken(token: string) {
  const secret = getEnvVar("JWT_SECRET");
  try {
    return jwt.verify(token, secret, { issuer: "magia-das-velas-api", audience: "users" });
  } catch {
    throw new UnauthorizedError("Token inválido ou expirado");
  }
}

export function verifyRefreshToken(token: string) {
  const refreshSecret = getEnvVar("JWT_REFRESH_SECRET");
  try {
    return jwt.verify(token, refreshSecret, { issuer: "magia-das-velas-api", audience: "users" });
  } catch {
    throw new UnauthorizedError("Refresh token inválido");
  }
}
