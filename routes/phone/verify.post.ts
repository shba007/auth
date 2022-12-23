import JWT from "jsonwebtoken";
import { createSignature } from "../../utils/helpers";
import { AuthResponse, PhoneStatus } from "../../utils/models"
import { defineProtectedEventHandler } from "../../utils/wrapper"

export default defineProtectedEventHandler<AuthResponse>(async (event, user) => {
  const config = useRuntimeConfig()
  if (!user?.phone)
    throw createError({ statusCode: 400, statusMessage: "Send OTP First" })

  console.log({ user });
  const phoneStatus: PhoneStatus = await useStorage().getItem(`phone:${user.phone}`)
  console.log({ phoneStatus });

  const { otp } = await readBody<{ otp: number }>(event)

  if (phoneStatus.otp !== otp) {
    // TODO: OTP Don't match
    throw createError({ statusCode: 401, statusMessage: "OTP don't match" })
  }
  // if authToken uuid exist on the memory db
  // else throw error

  // if the otp matches
  // else send wrong otp

  // if phone number exist on the db send accessToken refreshToken
  // else create authToken
  try {
    const payload = { phone: user.phone }
    const response = await ofetch('/user/webhook', {
      baseURL: config.apiURL, method: 'GET',
      headers: { 'Signature': `${createSignature(payload, config.authWebhook)}` },
      query: payload
    })
    console.log({ response });

    const accessToken = JWT.sign({ id: response.id }, config.authAccessSecret)
    const refreshToken = JWT.sign({ id: response.id }, config.authRefreshSecret)

    return { isRegistered: true, token: { access: accessToken, refresh: refreshToken } }
  } catch (error) {
    if (error.statusCode === 404) {
      const authToken = JWT.sign({ id: user.id }, config.authSecret)

      return { isRegistered: false, token: { auth: authToken } }
    }
    console.log({ error });

    throw createError({ statusCode: 500, statusMessage: "Some Unknown Error" })
  }
})
