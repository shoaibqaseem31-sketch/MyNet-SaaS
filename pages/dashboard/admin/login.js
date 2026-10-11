
import { supabase } from '../../../assets/js/auth.js';

const loginForm = document.getElementById('adminLoginForm');
const message = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  message.classList.remove('hidden', 'text-emerald-700');
  message.classList.add('text-red-600');
  message.textContent = 'Signing in...';

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    message.textContent = 'Login failed: ' + error.message;
    return;
  }

  const { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('id, name')
    .eq('id', data.user.id)
    .maybeSingle();

  if (adminError || !admin) {
    await supabase.auth.signOut();

    message.textContent = adminError
      ? 'Admin check error: ' + adminError.message
      : 'Admin record not found for this login.';

    console.error('Admin check:', { adminError, admin });
    return;
  }

  window.location.href = './index.html';
});
