import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  imports: {
    imports: [
      { name: 'ofetch', from: 'ofetch' },
    ],
  },
  storage: {
    'db': {
      driver: 'fs',
      base: './data/db'
    }
  },
  runtimeConfig: {
    apiURL: process.env.API_URL,
    corsURL: process.env.CORS_URL,
    authAccessSecret: process.env.AUTH_ACCESS_SECRET,
    authRefreshSecret: process.env.AUTH_REFRESH_SECRET,
    authSecret: process.env.AUTH_SECRET,
    authWebhook: process.env.AUTH_WEBHOOK,
    oauthGoogleId: process.env.OAUTH_GOOGLE_ID,
    oauthGoogleSecret: process.env.OAUTH_GOOGLE_SECRET,
    oauthGoogleRedirect: process.env.OAUTH_GOOGLE_REDIRECT,
    smsSecret: process.env.SMS_SECRET
  },
})
