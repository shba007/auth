import JWT from "jsonwebtoken";
import { getExpiryTimeFromNow } from '../../utils/helpers';
import { generateOTP, sendOTP } from "../../utils/sms";

interface PhoneStatus {
  otp: number,
  expiresIn: number,
  retriesCount: number
}

export default defineEventHandler<{ authToken: string }>(async (event) => {
  // update user or create user
  // create uuid, authToken
  // create otp and store to db
  // send the otp to sms api and authToken to user
  const config = useRuntimeConfig()
  const { phone } = await readBody<{ phone: string }>(event)

  const phoneStatus: PhoneStatus | null = await useStorage().getItem(`phone:${phone}`)

  console.log({ phoneStatus });

  if (phoneStatus && new Date(phoneStatus.expiresIn).getTime() > new Date().getTime()) {
    throw createError({ statusCode: 400, statusMessage: "OTP not expired" })
  }

  try {
    const authHeader = event.node.req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    let userId: string;

    if (token == null) {
      // TODO: generate id
      const payload = {
        id: "",
        phone: phone
      }
      userId = payload.id

      await useStorage().setItem(`user:${userId}`, payload)
    } else {
      const { id } = JWT.verify(token, config.private.authSecret) as { id: string }
      const user = await useStorage().getItem(`user:${id}`)
      user.phone = phone

      console.log({ user });
      await useStorage().setItem(`user:${userId}`, user)
    }

    // Send OTP
    const otp = generateOTP()
    const res = await sendOTP(otp, parseInt(phone))

    console.log({ res });

    const newPhoneStatus = {
      otp: otp,
      expiresIn: getExpiryTimeFromNow({ minute: 3 }),
      retriesCount: phoneStatus !== null ? phoneStatus.retriesCount++ : 0
    }

    await useStorage().setItem(`phone:${phone}`, newPhoneStatus)

    const authToken = JWT.sign({ id: userId }, config.authSecret)

    return { authToken }
  } catch (error) {
    console.log({ error });

    throw createError({ statusCode: 500, statusMessage: "Some Unknown Error" })
  }
})
