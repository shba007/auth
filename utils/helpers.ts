import { createHmac } from "node:crypto";
import JWT from "jsonwebtoken";

interface GoogleTokensResult {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export function createSignature(payload: any, secret: string) {
  const digest = createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");

  console.log("\npayload", payload, "secret", secret, "digest", digest);

  return digest
}

export function getGoogleOAuthURL(clientId: string, redirectUrl: string) {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const options = {
    client_id: clientId,
    redirect_uri: redirectUrl,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);

  return `${rootUrl}?${qs.toString()}`;
}

export async function getGoogleUser({ code, client_id, client_secret, redirect_uri }: { code: string, client_id: string, client_secret: string, redirect_uri: string }) {
  const values = {
    code,
    client_id,
    client_secret,
    redirect_uri,
    grant_type: "authorization_code",
  };

  const qs = new URLSearchParams(values);
  let access_token, id_token;

  try {
    const response = await ofetch<GoogleTokensResult>("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: qs.toString(),
    });
    access_token = response.access_token
    id_token = response.id_token

  } catch (error) {
    console.error("Error fetching Google Token", error);
  }

  try {
    const response = await ofetch<GoogleUserResult>(`https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${access_token}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${id_token}` },
    });

    return response;
  } catch (error) {
    console.error("Error fetching Google Token", error);
  }
}

export function getExpiryTimeFromNow({ days = 0, hour = 0, minute = 0, second = 0 }: { days?: number, hour?: number, minute?: number, second?: number }): string {
  const millisecond = ((((days) * 24 + hour) * 60 + minute) * 60 + second) * 1000

  return new Date(new Date().getTime() + millisecond).toISOString().slice(0, -5) + "Z"
}

export function isTokenExpired(token: string) {
  const decodedToken = JWT.decode(token)

  if (typeof decodedToken === 'string' || decodedToken == undefined || decodedToken?.exp == undefined)
    return false

  return Date.now() >= decodedToken.exp * 1000
}
