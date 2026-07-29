import { customAlphabet } from 'nanoid'

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const generate = customAlphabet(alphabet, 7)

export function generateCode(): string {
  return generate()
}
