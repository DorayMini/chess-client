import { createAccount } from "./account.js";

const form = document.getElementById("registerForm");

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const formEntries = Object.fromEntries(data.entries());

  try {
    const errors_response = await fetch(`${window.APP_CONFIG.API_URL}/api/auth/validate`, {
      method: 'POST',
      headers: {'Content-Type': "application/json"},
      body: JSON.stringify(formEntries)
    });
    
    const errors = await errors_response.json();
    if (errors.success == false) {
      errors_handler(errors.errors);
      return;
    }

    delete formEntries.repeat_password;
    const response = await fetch(`${window.APP_CONFIG.API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': "application/json"},
      body: JSON.stringify(formEntries)
    });
    
    const result = await response.json();

    console.log(result);
    register_handler(result);

  } catch (error) {
    console.error("Submition failed: ", error);
  }
});

const email = document.getElementById('email'); 
const password = document.getElementById('password');
const repeat_password = document.getElementById('repeat-password')

const header_error = document.querySelector('.header-error');
function register_handler(response) {
  if (response.success === true) {
    const user = createAccount(response.user_id);
    localStorage.setItem('user_session', JSON.stringify(user));
    window.location.href = "index.html"
  } else {
    header_error.innerHTML = response.message;
  } 
}
const email_error = document.getElementById('email-label').querySelector('.error');
const password_error = document.getElementById('password-label').querySelector('.error');
const repeat_error = document.getElementById('repeat-label').querySelector('.error');


function errors_handler(errors) {
  if (errors.email !== undefined) {
    email_error.innerHTML = errors.email;
    email.classList.add('input-error');
  }
  else {
    email_error.innerHTML = '';
    email.classList.remove('input-error');
  }

  if (errors.password !== undefined) {
    password_error.innerHTML = errors.password;
    password.classList.add('input-error');
  }
  else {
    password_error.innerHTML = '';
    password.classList.remove('input-error')
  };

  if (errors.repeat_password !== undefined) {
    repeat_error.innerHTML = errors.repeat_password;
    repeat_password.classList.add('input-error');
  }
  else {
    repeat_error.innerHTML = '';
    repeat_password.classList.remove('input-error'); 
  }
}

