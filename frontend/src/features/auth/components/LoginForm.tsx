import { Button, Field, Form } from '@base-ui/react';
import { useCallback, useState } from 'react';
import { LoginSchema, loginSchema } from '../schemas/login';
import { validateForm } from '../shared';
import styles from './form.module.css';

function login(credentials: LoginSchema) {
  console.log(credentials);
}

export default function LoginForm() {
  const [errors, setErrors] = useState({});

  const onSubmit = useCallback(async (formValues: Form.Values) => {
    const result = validateForm(loginSchema, formValues);

    if (result.errors) {
      setErrors(result.errors);
    } else {
      login(result.data);
    }
  }, []);

  return (
    <Form className={styles.Form} errors={errors} onFormSubmit={onSubmit}>
      <Field.Root name="name" className={styles.Field}>
        <Field.Label className={styles.Label}>Имя</Field.Label>
        <Field.Control placeholder="Введите имя" className={styles.Input} />
        <Field.Error className={styles.Error} />
      </Field.Root>
      <Field.Root name="password" className={styles.Field}>
        <Field.Label className={styles.Label}>Пароль</Field.Label>
        <Field.Control placeholder="qwerty123" className={styles.Input} />
        <Field.Error className={styles.Error} />
      </Field.Root>
      <Button type="submit" className={styles.Button}>
        Submit
      </Button>
    </Form>
  );
}
