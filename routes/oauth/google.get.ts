export default defineEventHandler<string>(async (event) => {
  try {
    const config = useRuntimeConfig()

    return getGoogleOAuthURL(
      config.oauthGoogleId,
      mapURL(config.oauthGoogleRedirect, config.apiURL, event)
    )
  } catch (error: any) {
    console.error("Auth oauth/google GET", error)

    throw createError({ statusCode: 500, statusMessage: 'Some Unknown Error Found' })
  }
})
