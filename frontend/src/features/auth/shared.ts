import { Form } from '@base-ui/react';
import { z } from 'zod';

export type Errors<T extends z.ZodType> = {
  [P in keyof z.core.output<T>]?: string[] | undefined;
};

export type ValidationResult<T extends z.ZodType> =
  | { ok: true; data: z.core.output<T> }
  | { ok: false; errors: Errors<T> };

export function validateForm<T extends z.ZodType>(
  schema: T,
  formValues: Form.Values,
): ValidationResult<T> {
  const result = schema.safeParse(formValues);

  if (!result.success) {
    return { ok: false, errors: z.flattenError(result.error).fieldErrors };
  }

  return { ok: true, data: result.data };
}
