import { randomUUID } from "crypto";

export default defineEventHandler<Promise<{ accessToken: string, refreshToken: string }>>(async (event) => {
  try {
    const config = useRuntimeConfig()
    const uuid = randomUUID()

    const payload = {
      id: uuid,
      name: `anonymous-${uuid.slice(0, 6)}`,
      image: null,
      email: null,
      phone: null,
      dob: null,
      gender: null
    }

    // create new account
    const response = await ofetch('/user/webhook', {
      baseURL: mapURL(config.apiUrl, config.apiUrl, event),
      method: 'POST',
      headers: { 'Signature': `${createSignature(payload, config.authWebhook)}` },
      body: payload
    })

    const accessToken = createJWTToken('access', response.id, config.authAccessSecret)
    const refreshToken = createJWTToken('refresh', response.id, config.authRefreshSecret)

    return { accessToken, refreshToken }
  } catch (error: any) {
    console.error("Auth anonymous GET", error)

    throw createError({ statusCode: 500, statusMessage: 'Some Unknown Error Found' })
  }
})
