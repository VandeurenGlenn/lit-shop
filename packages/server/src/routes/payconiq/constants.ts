const isProduction = process.env.NODE_ENV === 'production'

export const CREATE_PAYMENT = '/checkout/payconiq/createPayment'
export const CANCEL_PAYMENT = '/checkout/payconiq/cancelPayment'
export const CALLBACK_URL = '/checkout/payconiq/callbackUrl'
export const API_URL = `https://api.${!isProduction ? 'ext.' : ''}payconiq.com/v3/payments`
