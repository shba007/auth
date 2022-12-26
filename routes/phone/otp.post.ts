import JWT from "jsonwebtoken";
import crypto from "node:crypto";
import { getExpiryTimeFromNow } from '../../utils/helpers';
import { generateOTP, sendOTP } from "../../utils/sms";
import { AuthResponse, PhoneStatus } from "../../utils/models";

export default defineEventHandler<AuthResponse>(async (event) => {
  // update user or create user
  // create uuid, authToken
  // create otp and store to db
  // send the otp to sms api and authToken to user
  const config = useRuntimeConfig()
  const { phone } = await readBody<{ phone: string }>(event)

  const phoneStatus: PhoneStatus | null = await useStorage().getItem(`phone:${phone}`)

  if (phoneStatus && new Date(phoneStatus.expiresIn).getTime() > new Date().getTime()) {
    createError({ statusCode: 400, statusMessage: "OTP not expired" })
  }

  try {
    const authHeader = event.node.req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    let userId: string;

    if (token == null) {
      const payload = {
        id: crypto.randomUUID(),
        phone: phone
      }
      userId = payload.id

      console.log(payload);
      await useStorage().setItem(`user:${userId}`, payload)
    } else {
      const { id } = JWT.verify(token, config.private.authSecret) as { id: string }
      const user = await useStorage().getItem(`user:${id}`)
      user.phone = phone

      console.log(user);
      await useStorage().setItem(`user:${userId}`, user)
    }

    // TODO: Send OTP
    const otp = generateOTP()
    const response = await sendOTP(otp, parseInt(phone))
    // console.log({ response });

    const newPhoneStatus = {
      otp,
      expiresIn: getExpiryTimeFromNow({ minute: 3 }),
      retriesCount: phoneStatus !== null ? phoneStatus.retriesCount++ : 0
    }

    console.log(newPhoneStatus);
    await useStorage().setItem(`phone:${phone}`, newPhoneStatus)

    const authToken = JWT.sign({ id: userId }, config.authSecret)

    return { isRegistered: false, token: { auth: authToken } }
  } catch (error: any) {
    console.error("Auth phone/otp POST", error)

    throw createError({ statusCode: 500, statusMessage: "Some Unknown Error Found" })
  }
})
