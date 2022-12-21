import { createHmac } from "node:crypto";

interface GoogleTokensResult {
	access_token: string;
	expires_in: Number;
	refresh_token: string;
	scope: string;
	id_token: string;
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

	// console.log(signature === digest ? "Digest Match\n" : "Digest don't Match\n", { signature, digest });
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
		const res = await ofetch<GoogleTokensResult>("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: qs.toString(),
		});
		access_token = res.access_token
		id_token = res.id_token

	} catch (error: any) {
		console.log("Error fetching Google Token", error);
	}

	try {
		const res = await ofetch<GoogleUserResult>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
			method: "GET",
			headers: { "Authorization": `Bearer ${id_token}` },
		});

		return res;
	} catch (error: any) {
		console.log("Error fetching Google Token", error);
	}
}
