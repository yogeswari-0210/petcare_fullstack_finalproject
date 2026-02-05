document.getElementById('loginForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error');
  errorMsg.innerText = "";

  try {
    const response = await fetch('http://127.0.0.1:8000/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Store token and user info
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);

      alert("Login Successful!");

      if (data.role === 'admin') {
        window.location.href = './admin_dashboard.html';
      } else {
        window.location.href = '../index.html';
      }
    } else {
      errorMsg.innerText = data.detail || "Invalid login credentials";
    }
  } catch (error) {
    console.error("Error:", error);
    errorMsg.innerText = "An error occurred. Please check console.";
  }
});
