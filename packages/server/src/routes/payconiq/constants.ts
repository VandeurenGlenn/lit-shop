const isProduction = process.env.NODE_ENV === 'production'

export const CREATE_PAYMENT = '/checkout/payconiq/createPayment'
export const CANCEL_PAYMENT = '/checkout/payconiq/cancelPayment'
export const CALLBACK_URL = 'https://api.hellonewme.be/checkout/payconiq/callbackUrl'
export const API_URL = `https://${!isProduction ? 'ext.' : ''}api.payconiq.com/v3/payments`
