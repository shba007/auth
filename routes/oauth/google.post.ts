import { createSignature, getGoogleUser } from "../../utils/helpers"

export default defineEventHandler<{ authToken: string } | { accessToken: string, refreshToken: string }>(async (event) => {
	const config = useRuntimeConfig()
	const { code } = await readBody<{ code: string }>(event)

	// get google user
	const user = await getGoogleUser({ code, client_id: config.oauthGoogleId, client_secret: config.oauthGoogleSecret, redirect_uri: config.oauthGoogleRedirect })
	const payload = { email: user.email }

	// if authToken uuid exist on the memory db
	// else throw error

	// if the otp matches
	// else send wrong otp

	// if exist on the db send accessToken refreshToken
	// else create authToken
	try {
		const response = await ofetch('/user/webhook', {
			baseURL: config.apiURL, method: 'GET',
			headers: { 'Signature': `${createSignature(payload, config.authWebhook)}` },
			query: payload
		})

		return { accessToken: "", refreshToken: "" }
	} catch (error) {
		if (error.statusCode === 404)
			return { authToken: "" }
		else
			throw createError({ statusCode: 500, statusMessage: "Some Unknown Error" })
	}
})
