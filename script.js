  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById('date-today').textContent = now.toLocaleDateString('en-VN', options);
