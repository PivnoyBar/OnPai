// settings.js
const backgroundImages = document.querySelectorAll('.background-image');
const backButton = document.getElementById('backButton');

backgroundImages.forEach(image => {
  image.addEventListener('click', () => {
    const backgroundUrl = image.getAttribute('data-url');
    localStorage.setItem('canvasBackground', backgroundUrl);
    window.location.href = 'index.html';
  });
});

backButton.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Установка фона при загрузке страницы
window.onload = function() {
  const canvasBackground = localStorage.getItem('canvasBackground');
  if (canvasBackground) {
    document.body.style.backgroundImage = `url(${canvasBackground})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  }
}
