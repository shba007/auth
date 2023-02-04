import JWT from "jsonwebtoken";
import crypto from "node:crypto";
import { getExpiryTimeFromNow } from '../../utils/helpers';
import { generateOTP, sendOTP } from "../../utils/sms";
import { AuthResponse, PhoneStatus } from "../../utils/models";

export default defineEventHandler<Omit<AuthResponse, 'user'>>(async (event) => {
  // update user or create user
  // create uuid, authToken
  // create otp and store to db
  // send the otp to sms api and authToken to user
  const config = useRuntimeConfig()
  const { phone } = await readBody<{ phone: string }>(event)

  const phoneStatus: PhoneStatus | null = await useStorage().getItem(`phone:${phone}`)

  if (phoneStatus && new Date(phoneStatus.expiresIn).getTime() > new Date().getTime())
    createError({ statusCode: 400, statusMessage: "OTP not expired" })

  try {
    const authHeader = event.node.req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    let user: { id: string, phone: string };

    if (!!token) {
      const payload = JWT.verify(token, config.authSecret) as { id: string }
      user = await useStorage().getItem(`user:${payload.id}`)
      user.phone = phone
    } else {
      user = {
        id: crypto.randomUUID(),
        phone
      }
    }

    await useStorage().setItem(`user:${user.id}`, user)

    const otp = generateOTP()
    // await sendOTP(otp, parseInt(phone))

    const newPhoneStatus = {
      otp,
      expiresIn: getExpiryTimeFromNow({ minute: 3 }),
      retriesCount: phoneStatus !== null ? phoneStatus.retriesCount++ : 0
    }

    console.log({ user, newPhoneStatus });
    await useStorage().setItem(`phone:${phone}`, newPhoneStatus)

    const authToken = JWT.sign({ id: user.id }, config.authSecret)

    return { isRegistered: false, token: { auth: authToken } }
  } catch (error: any) {
    console.error("Auth sms/otp POST", error)

    throw createError({ statusCode: 500, statusMessage: "Some Unknown Error Found" })
  }
})
