import { defineProtectedEventHandler } from "../utils/wrapper";

export default defineProtectedEventHandler<{ statusCode: number, statusMessage: string }>(async (event, user) => {
  try {
    return { statusCode: 201, statusMessage: "" }

  } catch (error: any) {
    console.error("Auth logout DELETE", error)

    throw createError({ statusCode: 500, statusMessage: 'Some Unknown Error Found' })
  }
})
