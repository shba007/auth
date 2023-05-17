import { AuthResponse } from "../../utils/models"

export default defineEventHandler<AuthResponse>(async (event) => {
  const config = useRuntimeConfig()
  const storage = useStorage()
  // if authToken uuid exist on the memory db
  // else throw error

  // if the otp matches
  // else send wrong otp

  // if exist on the db send accessToken refreshToken
  // else create authToken
  try {
    const { code } = await readBody<{ code: string }>(event)
    const OAuthUser = await getGoogleUser({ code, client_id: config.oauthGoogleId, client_secret: config.oauthGoogleSecret, redirect_uri: config.oauthGoogleRedirect })

    try {
      const payload = { email: OAuthUser.email }
      const user = await ofetch('/user/webhook', {
        baseURL: config.apiURL, method: 'GET',
        headers: { 'Signature': `${createSignature(payload, config.authWebhook)}` },
        query: payload
      })

      const accessToken = createJWTToken('access', user.id, config.authAccessSecret)
      const refreshToken = createJWTToken('refresh', user.id, config.authRefreshSecret)

      return {
        isRegistered: true,
        token: { access: accessToken, refresh: refreshToken },
        user: user
      }
    } catch (error: any) {
      if (error.statusCode === 404) {
        const user = {
          id: OAuthUser.id,
          name: OAuthUser.name,
          image: OAuthUser.picture,
          email: OAuthUser.email,
        }

        await storage.setItem(`user:${user.id}`, user)
        const authToken = createJWTToken('auth', user.id, config.authSecret)

        return {
          isRegistered: false,
          token: { auth: authToken },
          user: {
            name: user.name,
            email: user.email
          }
        }
      } else
        throw error
    }
  } catch (error: any) {
    console.error("Auth oauth/google POST", error)

    if (error.statusCode === 404)
      throw error

    throw createError({ statusCode: 500, statusMessage: 'Some Unknown Error Found' })
  }
})
