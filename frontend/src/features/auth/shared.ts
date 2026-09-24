import { Form } from '@base-ui/react';
import { z } from 'zod';

export function validateForm<T extends z.ZodType>(
  schema: T,
  formValues: Form.Values,
) {
  const result = schema.safeParse(formValues);

  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  return { data: result.data };
}
