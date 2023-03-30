import JWT from "jsonwebtoken";
import crypto from "node:crypto";

import { AuthResponse, PhoneStatus } from "../../utils/models";

// update user or create user
// create uuid, authToken
// create otp and store to db
// send the otp to sms api and authToken to user
export default defineEventHandler<Omit<AuthResponse, 'user'>>(async (event) => {
  const config = useRuntimeConfig()
  const { action, phone } = await readBody<{ action: 'login' | 'register', phone: string }>(event)

  let phoneStatus = await useStorage().getItem(`phone:${phone}`) as PhoneStatus | null
  // Handle all Errors
  if (phoneStatus && new Date(phoneStatus.retryTimeout).getTime() > new Date().getTime()) {
    // TODO: Send a security alert
    throw createError({ statusCode: 400, statusMessage: "Retry not expired" })
  }

  try {
    const authHeader = event.node.req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    let user: { id: string, phone: string };

    if (!!token) {
      const payload = JWT.verify(token, config.authSecret) as { id: string }
      user = await useStorage().getItem(`user:${payload.id}`) as {
        id: string;
        phone: string;
      }
      user.phone = phone
    } else {
      user = {
        id: crypto.randomUUID(),
        phone
      }
    }

    await useStorage().setItem(`user:${user.id}`, user)

    let userFound = true
    if (action === 'register') {
      try {
        // Check if user phone number already exists
        const payload = { phone: phone }
        const response = await ofetch('/user/webhook', {
          baseURL: config.apiURL, method: 'GET',
          headers: { 'Signature': `${createSignature(payload, config.authWebhook)}` },
          query: payload
        })

        userFound = true
      } catch (error) {
        userFound = false
      }
    }

    if (action === 'register' && userFound) {
      const authToken = createJWTToken('auth', user.id, config.authSecret)
      return { isRegistered: true, token: { auth: authToken } }
    }
    const otp = generateOTP()
    // FIXME: Uncomment
    // await sendOTP(otp, parseInt(phone))

    const retryCount = phoneStatus == null ? 0 : ++phoneStatus.retryCount
    phoneStatus = {
      otp,
      otpTimeout: getExpiryTimeFromNow({ minute: 3 }),
      retryCount,
      retryTimeout: getExpiryTimeFromNow(retryCount >= 3 ? { hour: 3 } : { minute: 1, second: 25 }),
      verified: false
    }

    console.log({ user, phone: phoneStatus });
    await useStorage().setItem(`phone:${user.phone}`, phoneStatus)

    const authToken = createJWTToken('auth', user.id, config.authSecret)

    return { isRegistered: false, token: { auth: authToken } }
  } catch (error: any) {
    console.error("Auth sms/otp POST", error)

    throw createError({ statusCode: 500, statusMessage: "Some Unknown Error Found" })
  }
})
