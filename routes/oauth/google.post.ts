import JWT from "jsonwebtoken"
import { createSignature, getGoogleUser } from "../../utils/helpers"
import { AuthResponse } from "../../utils/models"

export default defineEventHandler<AuthResponse>(async (event) => {
  const config = useRuntimeConfig()
  // if authToken uuid exist on the memory db
  // else throw error

  // if the otp matches
  // else send wrong otp

  // if exist on the db send accessToken refreshToken
  // else create authToken
  const { code } = await readBody<{ code: string }>(event)
  const user = await getGoogleUser({ code, client_id: config.oauthGoogleId, client_secret: config.oauthGoogleSecret, redirect_uri: config.oauthGoogleRedirect })

  try {
    const payload = { email: user.email }
    const response = await ofetch('/user/webhook', {
      baseURL: config.apiURL, method: 'GET',
      headers: { 'Signature': `${createSignature(payload, config.authWebhook)}` },
      query: payload
    })
    const accessToken = JWT.sign({ id: response.id }, config.authAccessSecret)
    const refreshToken = JWT.sign({ id: response.id }, config.authRefreshSecret)

    return { isRegistered: false, token: { access: accessToken, refresh: refreshToken } }
  } catch (error) {
    if (error.statusCode === 404) {
      const payload = {
        id: user.id,
        name: user.name,
        image: user.picture,
        email: user.email,
      }
      console.log({ payload });
      await useStorage().setItem(`user:${payload.id}`, payload)
      const authToken = JWT.sign({ id: payload.id }, config.authSecret)

      return { isRegistered: false, token: { auth: authToken } }
    } else
      throw createError({ statusCode: 500, statusMessage: "Some Unknown Error" })
  }
})
