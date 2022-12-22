import JWT from "jsonwebtoken";
import { createSignature } from '../utils/helpers';
import { defineProtectedEventHandler } from '../utils/wrapper';

export default defineProtectedEventHandler<{ accessToken: string, refreshToken: string }>(async (event, user) => {
  const config = useRuntimeConfig()

  const body = await readBody<{
    name: string | null,
    image: string | null,
    email: string | null,
    dob: string,
    gender: string
  }>(event);
  const payload = {
    name: user.name ?? body.name,
    image: user.image ?? body.image,
    email: user.email ?? body.email,
    phone: user.phone,
    dob: body.dob,
    gender: body.gender
  }
  // TODO: payload checking

  try {
    // create new account
    const response = await ofetch('/user/webhook', {
      baseURL: config.apiURL, method: 'POST',
      headers: { 'Signature': `${createSignature(payload, config.authWebhook)}` },
      body: payload
    })

    console.log({ id: response.id });
    const accessToken = JWT.sign({ id: response.id }, config.authAccessSecret)
    const refreshToken = JWT.sign({ id: response.id }, config.authRefreshSecret)

    return { accessToken, refreshToken }
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Some Unknown Error" })
  }
})
