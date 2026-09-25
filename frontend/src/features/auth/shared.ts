import { Form } from '@base-ui/react';
import { z } from 'zod';

export type ErrorMessages<T extends z.ZodType> = {
  [P in keyof z.core.output<T>]?: string | undefined;
};

export type ValidationResult<T extends z.ZodType> =
  | { ok: true; data: z.core.output<T> }
  | { ok: false; errors: ErrorMessages<T> };

/**
 * Проверяет форму по схеме
 * @param schema схема
 * @param formValues данные формы
 * @returns последняя ошибка для каждого поля схемы
 */
export function validateForm<T extends z.ZodType>(
  schema: T,
  formValues: Form.Values,
): ValidationResult<T> {
  const result = schema.safeParse(formValues);

  if (result.success) {
    return { ok: true, data: result.data };
  }

  const errors = {} as ErrorMessages<T>;
  const issues = result.error.issues;

  // Идём с конца: первое встреченное сообщение для поля — последнее в порядке issues.
  for (let i = issues.length - 1; i >= 0; i--) {
    const issue = issues[i];
    const path = issue.path;
    if (path.length === 0) continue; // form-level, пропускаем

    const key = path[0] as keyof ErrorMessages<T>;
    if (errors[key] === undefined) {
      errors[key] = issue.message;
    }
  }

  return { ok: false, errors };
}
