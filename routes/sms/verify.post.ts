import { AuthResponse, PhoneStatus } from "../../utils/models";

export default defineProtectedEventHandler<AuthResponse>(async (event, user) => {
  const config = useRuntimeConfig()
  const storage = useStorage()
  if (!(user && user.phone))
    throw createError({ statusCode: 400, statusMessage: "Send OTP First" });

  const { otp } = await readBody<{ otp: number }>(event);
  const phoneStatus = await storage.getItem(`phone:${user.phone}`) as PhoneStatus;
  console.log({ user, phoneStatus });

  try {
    if (phoneStatus.otp !== otp)
      throw createError({ statusCode: 401, statusMessage: "OTP don't match" });

    if (new Date(phoneStatus.otpTimeout).getTime() < new Date().getTime())
      throw createError({ statusCode: 400, statusMessage: "OTP expired" });

    const payload = { phone: user.phone };
    const response = await ofetch("/user/webhook", {
      baseURL: config.apiURL,
      method: "GET",
      headers: { Signature: `${createSignature(payload, config.authWebhook)}` },
      query: payload,
    });

    user.id = response.id
    console.log("response", response);

    // Reset retryCount
    phoneStatus.retryCount = 0;
    phoneStatus.verified = true;
    await storage.setItem(`phone:${user.phone}`, phoneStatus);

    const accessToken = createJWTToken("access", user.id, config.authAccessSecret);
    const refreshToken = createJWTToken("refresh", user.id, config.authRefreshSecret);

    return {
      isRegistered: true,
      token: { access: accessToken, refresh: refreshToken },
      user: { phone: user.phone },
    };
  } catch (error: any) {
    console.error("Auth sms/verify POST", error);

    if (error.statusCode === 400 || error.statusCode === 401) {
      throw error;
    } else if (error.statusCode === 404) {
      // Reset retryCount
      phoneStatus.retryCount = 0;
      phoneStatus.verified = true;
      await storage.setItem(`phone:${user.phone}`, phoneStatus);

      const authToken = createJWTToken("auth", user.id, config.authSecret);
      return {
        isRegistered: false,
        token: { auth: authToken },
        user: { phone: user.phone },
      };
    }

    throw createError({ statusCode: 500, statusMessage: "Some Unknown Error Found" });
  }
});
