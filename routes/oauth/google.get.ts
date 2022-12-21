import { getGoogleOAuthURL } from "../../utils/helpers"

export default defineEventHandler<string>(async (event) => {
	const config = useRuntimeConfig()
	return getGoogleOAuthURL(config.oauthGoogleId, config.oauthGoogleRedirect)
})
