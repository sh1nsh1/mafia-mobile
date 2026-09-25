export function login(name: string, password: string) {
  const formData = new FormData();
  formData.append('username', name);
  formData.append('password', password);

  return fetch('/user/login', { method: 'POST', body: formData });
}

export function register(email: string, name: string, password: string) {
  return fetch('/user/register', {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, username: name, password }),
  });
}
