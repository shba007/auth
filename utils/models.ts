export interface PhoneStatus {
  otp: number,
  expiresIn: number,
  retriesCount: number
}

export interface UserInfo {
  id: string,
  name: string | null,
  image: string | null,
  email: string | null,
  phone: string
}

export interface AuthResponse {
  isRegistered: boolean,
  token: {
    auth: string
  } | {
    access: string,
    refresh: string
  }
}
