document.getElementById('signupForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const username = document.querySelector('input[placeholder="John Doe"]').value;
  const email = document.querySelector('input[placeholder="example@email.com"]').value;
  const password = document.querySelector('input[placeholder="Enter password"]').value;
  const confirmPassword = document.querySelector('input[placeholder="Re-enter password"]').value;
  const role = document.getElementById('role').value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        role: role
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Signup Successful!");

      // Optionally store token if your backend returns it on signup (auto-login)
      // localStorage.setItem('token', data.access_token);

      if (role === 'admin') {
        window.location.href = './admi.html';
      } else {
        window.location.href = '../index.html';
      }
    } else {
      alert("Signup Failed: " + (data.detail || "Unknown error"));
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
});
