# djwt

The absolute minimum to make JSON Web Tokens on deno. Based on
[JWT](https://tools.ietf.org/html/rfc7519) and
[JWS](https://www.rfc-editor.org/rfc/rfc7515.html) specifications.

This library is a [registered Deno Module](https://github.com/denoland/registry)
and accessible through the https://deno.land/x/ service.

## Features

To generate **JWTs** which look in their finalized form like this (with line
breaks for display purposes only)

```
 eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9
 .
 eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ
 .
 dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

... we use the mandatory
[**Compact Serialization**](https://www.rfc-editor.org/rfc/rfc7515.html#section-3.1)
process where a web token is represented as the concatenation of

`'BASE64URL(UTF8(JWS Protected Header))' || '.' || 'BASE64URL(JWS Payload)' ||'.'|| 'BASE64URL(JWS Signature)'`

### Cryptographic Algorithm

**HMAC SHA-256** ("HS256"), **HMAC SHA-512** ("HS512") and **none**
([_Unsecured JWTs_](https://tools.ietf.org/html/rfc7519#section-6)) of the
signature and MAC algorithms defined in the JSON Web Algorithms (JWA)
[specification](https://www.rfc-editor.org/rfc/rfc7518.html) have been
implemented already. But more shall come soon.

### Expiration Time

The optional **exp** claim identifies the expiration time on or after which the
JWT must not be accepted for processing. This library checks if the current
date/time is before the expiration date/time listed in the **exp** claim.

### Critical Header

This library supports the Critical Header Parameter **crit** which is described
in the JWS specification
[here](https://www.rfc-editor.org/rfc/rfc7515.html#section-4.1.11).

Look up
[this example](https://github.com/timonson/djwt/blob/master/examples/example.ts)
to see how the **crit** header parameter works.

## API

The API consists mostly of the two functions `makeJwt` and `validateJwt`,
generating and validating a JWT, respectively.

#### makeJwt(header: Jose, payload: Claims | string, key: string = ""): string

The function `makeJwt` returns the url-safe encoded JWT.

In cases where you only need the signing and verification feature of the JWS,
you can enter the _empty string_ `""` as _payload_.

#### validateJwt(jwt: string, key: string = "", throwErrors: boolean = true, critHandlers: Handlers = {}): Promise<any>

The function `validateJwt` returns a _promise_ which - if the JWT is valid -
resolves to a JWT representation as JavaScript object:
`{header, payload, signature}`.

#### setExpiration(exp: number | Date): number

Additionally there is the helper function `setExpiration` which simplifies
setting an expiration date.

```javascript
// A specific date:
setExpiration(new Date("2020-07-01"))
// One hour from now:
setExpiration(new Date().getTime() + 60 * 60 * 1000)
```

## Example

Try djwt out with this simple _server_ example:

The server will respond to a **GET** request with a newly created JWT.  
On the other hand, if you send a JWT as data along with a **POST** request, the
server will check the validity of the JWT.

```javascript
import { serve } from "https://deno.land/std/http/server.ts"
import { encode, decode } from "https://deno.land/std/strings/mod.ts"
import makeJwt, { setExpiration } from "https://deno.land/x/djwt/create.ts"
import validateJwt from "https://deno.land/x/djwt/validate.ts"

const key = "abc123"
const claims = {
  iss: "joe",
  exp: setExpiration(new Date().getTime() + 60000),
}
const header = {
  alg: "HS512",
  typ: "JWT",
}

for await (const req of serve("0.0.0.0:8000")) {
  if (req.method === "GET") {
    const jwt = makeJwt(header, claims, key)
    req.respond({ body: encode(jwt + "\n") })
  } else {
    const requestBody = decode(await Deno.readAll(req.body))
    ;(await validateJwt(requestBody, key, false))
      ? req.respond({ body: encode("Valid JWT\n") })
      : req.respond({ status: 401, body: encode("Invalid JWT\n") })
  }
}
```

## Contribution

Every kind of contribution to this project is highly appreciated.

## Todo

1. Add more optional features from the
   [JWT](https://tools.ietf.org/html/rfc7519) and
   [JWS](https://www.rfc-editor.org/rfc/rfc7515.html) specifications
2. Make more tests
