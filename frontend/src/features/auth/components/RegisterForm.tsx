'use client';

import { Form } from '@base-ui/react';
import { useCallback, useState } from 'react';
import { placeholder } from '../placeholders';
import { registerSchema } from '../schemas/register';
import { validateForm } from '../shared';
import { Button, Field } from '@/shared/components';

export default function RegisterForm() {
  const [errors, setErrors] = useState({});

  const onSubmit = useCallback(async (formValues: Form.Values) => {
    const result = validateForm(registerSchema, formValues);

    if (result.ok) {
      console.log(result.data);
    } else {
      setErrors(result.errors);
    }
  }, []);

  return (
    <Form
      errors={errors}
      onFormSubmit={onSubmit}
      className="flex w-75 flex-col gap-4"
    >
      <Field.Root name="email">
        <Field.Label>Почта</Field.Label>
        <Field.Control placeholder={placeholder.email} type="email" />
        <Field.Error />
      </Field.Root>
      <Field.Root name="name">
        <Field.Label>Имя</Field.Label>
        <Field.Control placeholder={placeholder.name} />
        <Field.Error />
      </Field.Root>
      <Field.Root name="password">
        <Field.Label>Пароль</Field.Label>
        <Field.Control placeholder={placeholder.password} type="password" />
        <Field.Error />
      </Field.Root>
      <Field.Root name="passwordRepeat">
        <Field.Label>Повтор пароля</Field.Label>
        <Field.Control placeholder={placeholder.password} type="password" />
        <Field.Error />
      </Field.Root>
      <Button type="submit">Зарегистрироваться</Button>
    </Form>
  );
}
