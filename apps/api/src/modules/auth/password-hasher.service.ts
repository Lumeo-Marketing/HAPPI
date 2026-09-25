import { Injectable } from '@nestjs/common'
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const keyLength = 64

@Injectable()
export class PasswordHasherService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('base64url')
    const derivedKey = (await scrypt(password, salt, keyLength)) as Buffer

    return `${salt}:${Buffer.from(derivedKey).toString('base64url')}`
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const [salt, encodedKey] = storedHash.split(':')

    if (!salt || !encodedKey) {
      return false
    }

    const derivedKey = (await scrypt(password, salt, keyLength)) as Buffer
    const storedKey = Buffer.from(encodedKey, 'base64url')
    const candidateKey = Buffer.from(derivedKey)

    return (
      storedKey.length === candidateKey.length &&
      timingSafeEqual(storedKey, candidateKey)
    )
  }
}
