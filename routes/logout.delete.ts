export default defineProtectedEventHandler<{
  statusCode: number
  statusMessage: string
}>(async (event, user) => {
  try {
    return { statusCode: 202, statusMessage: 'Logout Successfully' }
  } catch (error: any) {
    console.error('Auth logout DELETE', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
