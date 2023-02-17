const config = useRuntimeConfig()

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "Access-Control-Allow-Origin": config.corsURL,
    'Access-Control-Allow-Credentials': 'true',
    "Access-Control-Allow-Headers": config.corsURL,
    "Access-Control-Expose-Headers": config.corsURL
  })
  if (getMethod(event) === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.statusMessage = "No Content."
    return 'OK'
  }
})
