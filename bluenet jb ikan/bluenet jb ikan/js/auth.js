document.addEventListener('DOMContentLoaded', () => {
  const API_URL = "http://localhost:3000/users";

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Toggle password visibility buttons (jika ada di halaman)
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁️' : '🙈';
    });
  });

  // ================================
  // LOGIN
  // ================================
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;
      const loginErrorEl = document.getElementById('loginError');
      loginErrorEl.textContent = '';

      if (!username || !password) {
        loginErrorEl.textContent = 'Isi username dan password.';
        return;
      }

      try {
        // coba login dengan username + password
        let res = await fetch(`${API_URL}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
        let data = await res.json();

        // jika tidak ada, coba email + password
        if (!data || data.length === 0) {
          res = await fetch(`${API_URL}?email=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
          data = await res.json();
        }

        if (!data || data.length === 0) {
          loginErrorEl.textContent = "Username atau password salah.";
          return;
        }

        const user = data[0];
        // simpan user dari server (mencakup id)
        localStorage.setItem("currentUser", JSON.stringify(user));
        loginErrorEl.classList.remove('error');
        loginErrorEl.classList.add('success');
        loginErrorEl.textContent = 'Login berhasil. Mengalihkan...';
        setTimeout(() => { window.location.href = "dashboard.html"; }, 600);
      } catch (err) {
        console.error(err);
        loginErrorEl.textContent = "Server error.";
      }
    });
  }

  // ================================
  // REGISTER
  // ================================
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const username = document.getElementById('regUsername').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const password2 = document.getElementById('regPassword2').value;
      const regErrorEl = document.getElementById('regError');
      regErrorEl.textContent = '';

      if (!username || !email || !password || !password2) {
        regErrorEl.textContent = 'Isi semua field.';
        return;
      }
      if (password !== password2) {
        regErrorEl.textContent = "Password dan konfirmasi tidak sama.";
        return;
      }

      try {
        // cek username & email sudah dipakai atau belum
        let res = await fetch(`${API_URL}?username=${encodeURIComponent(username)}`);
        let exists = await res.json();
        if (exists.length > 0) {
          regErrorEl.textContent = "Username sudah digunakan.";
          return;
        }

        res = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`);
        let existsEmail = await res.json();
        if (existsEmail.length > 0) {
          regErrorEl.textContent = "Email sudah digunakan.";
          return;
        }

        // buat user baru (json-server akan mengembalikan object termasuk id)
        const newUser = { username, email, password };
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser)
        });

        if (!res.ok) throw new Error("Gagal membuat akun.");
        const created = await res.json();

        // login otomatis dengan user dari server
        localStorage.setItem("currentUser", JSON.stringify(created));
        regErrorEl.classList.remove('error');
        regErrorEl.classList.add('success');
        regErrorEl.textContent = 'Pendaftaran berhasil. Mengalihkan...';
        setTimeout(() => { window.location.href = "dashboard.html"; }, 700);
      } catch (err) {
        console.error(err);
        regErrorEl.textContent = "Server error.";
      }
    });
  }

  // focus first input for UX
  const firstInput = document.querySelector('.auth-container input');
  if (firstInput) firstInput.focus();
});
