import { Form } from '@base-ui/react';
import { useCallback, useState } from 'react';
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
    <Form errors={errors} onFormSubmit={onSubmit}>
      <Field.Root name="name">
        <Field.Label>Имя</Field.Label>
        <Field.Control placeholder="Введите имя" className="font-mono" />
        <Field.Error />
      </Field.Root>
      <Field.Root name="password">
        <Field.Label>Пароль</Field.Label>
        <Field.Control placeholder="Qwerty12" />
        <Field.Error />
      </Field.Root>
      <Button type="submit">Войти</Button>
    </Form>
  );
}
