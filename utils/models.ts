interface PhoneStatus {
  otp: number
  otpTimeout: string
  retryCount: number
  retryTimeout: string
  verified: boolean
}

interface UserInfo {
  id: string
  name: string | null
  image: string | null
  email: string | null
  phone: string
}

interface AuthResponse {
  isRegistered: boolean
  token:
    | {
        auth: string
      }
    | {
        access: string
        refresh: string
      }
  user:
    | {
        name: string
        email: string
      }
    | {
        phone: string
      }
}
