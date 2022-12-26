import { getGoogleOAuthURL } from "../../utils/helpers"

export default defineEventHandler<string>(async (event) => {
  try {
    const config = useRuntimeConfig()
    return getGoogleOAuthURL(config.oauthGoogleId, config.oauthGoogleRedirect)
  } catch (error: any) {
    console.error("Auth oauth/google GET", error)

    throw createError({ statusCode: 500, statusMessage: 'Some Unknown Error Found' })
  }
})
