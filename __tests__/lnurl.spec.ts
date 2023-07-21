import { bech32 } from "bech32"

// TODO: import in other tests? or a from global files imported in all tests?

// Note: import explicitly to use the types shipped with jest.
import { it } from "@jest/globals"

const lnurl1 =
  "LNURL1DP68GURN8GHJ7MRWWPSHJTNRDUHKG6TNW3EX7TTJDA6HGETJ9AKXUATJDSKHW6T5DPJ8YCTH8AKXU5RP09GXZUNPD4EN6ETEFFAXZ3EE09JYVWF3VDKHW620D9YNYN28F4M5U7NRD9XYXJNTV9VYUVRRD5UKVCNDGE69556FXEYK6MR5T9TKGMZFD9MKJCJ8X4G4JKRVGAV4S4N2TFV9Y42E2A3KJNMFFFX9VKRGDDYKJAMFV3VYUMRRDSUHWK2CD3NXY46KXPS5WWTTF94X76TZGU6NZCMDWA5KV5F9XDZZ2V6YYENXZATRV46976RPWD5R6ENRW30KGSJXVF5YX5R4XPS56KPJ23CHXVJ6X9MXU3TJXVS3AT2F"

it("I can decode a lnurl address", () => {
  const decoded = bech32.decode(lnurl1, 1024)
  const url = Buffer.from(bech32.fromWords(decoded.words)).toString()

  // FIXME what is the goal of this test?
  expect(url).toContain("https://lnpay")
})
