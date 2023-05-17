import { AuthResponse, PhoneStatus } from "../utils/models";

export default defineProtectedEventHandler<Omit<AuthResponse, 'user'>>(async (event, user) => {
  const config = useRuntimeConfig()
  const storage = useStorage()

  try {
    const phoneStatus = await storage.getItem(`phone:${user.phone}`) as PhoneStatus | null

    if (!(user && phoneStatus && phoneStatus.verified))
      throw createError({ statusCode: 400, statusMessage: "OAuth or SMS Login first" })

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
    console.log({ user: payload });

    // create new account
    const response = await ofetch('/user/webhook', {
      baseURL: config.apiURL,
      method: 'POST',
      headers: { 'Signature': `${createSignature(payload, config.authWebhook)}` },
      body: payload
    })

    // Reset retryCount
    phoneStatus.retryCount = 0;
    phoneStatus.verified = true;
    await storage.setItem(`phone:${user.phone}`, phoneStatus);

    const accessToken = createJWTToken('access', response.id, config.authAccessSecret)
    const refreshToken = createJWTToken('refresh', response.id, config.authRefreshSecret)

    return { isRegistered: true, token: { access: accessToken, refresh: refreshToken } }
  } catch (error: any) {
    if (error.statusCode === 400)
      throw error
    else if (error.statusCode === 409)
      throw createError({ statusCode: 409, statusMessage: "Phone or Email already exists" })

    console.error("Auth register POST", error)
    throw createError({ statusCode: 500, statusMessage: "Some Unknown Error Found" })
  }
})
