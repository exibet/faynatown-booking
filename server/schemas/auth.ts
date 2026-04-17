import { z } from 'zod'

export const LoginSchema = z.object({
  phoneNumber: z.string().regex(/^380\d{9}$/, 'must be 380XXXXXXXXX'),
  password: z.string().min(1, 'required'),
})

export type LoginInput = z.infer<typeof LoginSchema>
