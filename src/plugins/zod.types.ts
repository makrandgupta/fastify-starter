import { z, ZodTypeAny } from 'zod';

export const asArray = <T extends ZodTypeAny>(type: T) => 
  z.any().transform<z.infer<typeof type>[]>((value: unknown) => 
    Array.isArray(value) ? value.map(el => type.parse(el)) : [type.parse(value)]);
