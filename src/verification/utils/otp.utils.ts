import * as crypto from 'crypto'

export function generateOTP(size: number = 6) {
    const max = Math.pow(10, size)
    const randomNum = crypto.randomInt(0, max)
    return randomNum.toString().padStart(size, '0')
}