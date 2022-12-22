export default defineEventHandler<{ authToken: string } | { accessToken: string, refreshToken: string }>(async (event) => {
  const { otp } = await readBody<{ otp: string }>(event)

  const user = await useStorage().getItem(`user:${userid}`)
  const phoneStatus = await useStorage().getItem(`user:${user.phone}`)

  if (phoneStatus.otp === otp) {

  } else {
    throw createError({ statusCode: 401, statusMessage: "OTP don't match" })
  }
  // if authToken uuid exist on the memory db
  // else throw error

  // if the otp matches
  // else send wrong otp

  // if phone number exist on the db send accessToken refreshToken
  // else create authToken
  return { authToken: "" }
})
