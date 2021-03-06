import makeJwt, { setExpiration } from "https://deno.land/x/djwt/create.ts"
import validateJwt from "https://deno.land/x/djwt/validate.ts"

const claims = {
  iss: "joe",
  jti: "123456789abc",
  exp: setExpiration(new Date().getTime() + 1000),
  // exp: setExpiration(new Date().getTime() - 10000), // Invalid JWT: the jwt is expired
}

const headerObject = {
  alg: "HS512",
  crit: ["dummy"],
  dummy: 100,
}

const critHandlers = {
  dummy(value: any) {
    console.log(`dummy works: ${value}`)
    return value * 2
  },
}

const key = "abc123"
try {
  const jwt = makeJwt(headerObject, claims, key)
  console.log("JWT:", jwt)
  const validatedJwt = await validateJwt(jwt, key, true, critHandlers)
  console.log("JWT is valid!\n", validatedJwt)
} catch (err) {
  console.log(err)
}
