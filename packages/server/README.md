# server

## config

server.config.js `<- placed in root`

```js
export const services = {
  checkout: {
    payconiq: true,
    paypal: false,
    stripe: false,
    klarna: false,
    afterpay: false,
    ideal: false,
    creditcard: true,
    applepay: true,
    googlepay: true,
    sofort: false,
    sepa: true
  },
  shipping: {
    dhl: true,
    dpd: true,
    ups: true,
    fedex: true,
    tnt: true,
    postnl: true,
    gls: true,
    bpost: true
  },
  images: {
    imgur: true
  }
  // email: {
  //     sendgrid: true,
  //     mailgun: false,
  //     mailchimp: false
  // },
}
```