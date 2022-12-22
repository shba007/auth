interface SMSResponse {
  return: boolean,
  request_id: string,
  message: string[]
}

export async function sendOTP(otp: number, phone: number | number[]) {
  const config = useRuntimeConfig()

  return await ofetch<SMSResponse>("https://www.fast2sms.com/dev/bulkV2", {
    method: "GET",
    query: {
      "authorization": config.smsSecret,
      "variables_values": otp.toString(),
      "route": "otp",
      "numbers": Array.isArray(phone) ? phone.join() : phone.toString()
    }
  })
}

export function generateOTP(digits = 6) {
  const min = parseInt(`1${"0".repeat(digits - 1)}`)
  const max = parseInt("9".repeat(digits))
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
