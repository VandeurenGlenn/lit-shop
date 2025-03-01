const isProduction = process.env.NODE_ENV === 'production'

export const CREATE_PAYMENT = '/checkout/payconiq/createPayment'
export const CANCEL_PAYMENT = '/checkout/payconiq/cancelPayment'
export const CALLBACK_URL = isProduction
  ? 'https://api.hellonewme.be/checkout/payconiq/callbackUrl'
  : 'http://localhost:3005/checkout/payconiq/callbackUrl'

export const API_URL = isProduction
  ? 'https://api.payconiq.com/v3/payments'
  : 'http://localhost:9090/payconiq/v3/payments'
