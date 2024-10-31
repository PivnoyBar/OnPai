const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearCanvas = document.getElementById('clearCanvas');
const freeDraw = document.getElementById('freeDraw');
const drawRectangle = document.getElementById('drawRectangle');
const drawCircle = document.getElementById('drawCircle');
const drawLine = document.getElementById('drawLine');
const settingsButton = document.getElementById('settingsButton');
const stickerButton = document.getElementById('stickerButton');
const stickerPanel = document.getElementById('stickerPanel');
const stickers = document.querySelectorAll('.sticker');

canvas.width = window.innerWidth - 200;
canvas.height = window.innerHeight - 120;

let painting = false;
let tool = "freeDraw"; // инструмент по умолчанию
let startX, startY;
let shapes = []; // Массив для хранения фигур
let currentSticker = null; // Переменная для текущей наклейки

// Получение координат мыши или касания
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

// Начало рисования
function startPosition(e) {
  e.preventDefault();
  painting = true;
  const pos = getPos(e);
  startX = pos.x;
  startY = pos.y;
  
  if (tool === "freeDraw") draw(e);
  if (tool === "sticker" && currentSticker) {
    addSticker(pos.x, pos.y);
  }
}

// Остановка рисования
function endPosition(e) {
  if (painting && tool !== "freeDraw" && tool !== "sticker") {
    drawShape(e);
  }
  painting = false;
  ctx.beginPath();
}

// Рисование для свободного рисования
function draw(e) {
  if (!painting || tool !== "freeDraw") return;

  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';
  ctx.strokeStyle = colorPicker.value;

  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

// Предпросмотр фигуры
function previewShape(e) {
  if (!painting || tool === "freeDraw") return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawShapes(); // Рисуем все фигуры из массива
  drawShape(e, true); // Предпросмотр текущей фигуры
}

// Рисование всех фигур из массива
function drawShapes() {
  shapes.forEach(shape => {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.size;

    if (shape.type === "rectangle") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape.type === "line") {
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
    } else if (shape.type === "sticker") {
      const img = new Image();
      img.src = shape.src;
      img.onload = () => ctx.drawImage(img, shape.x, shape.y, shape.width, shape.height);
    }
  });
}

// Рисование фигуры
function drawShape(e, isPreview = false) {
  const pos = getPos(e);
  const width = pos.x - startX;
  const height = pos.y - startY;

  if (isPreview) {
    ctx.save();
    ctx.globalAlpha = 0.5; // Прозрачность для предпросмотра
  }

  if (tool === "rectangle") {
    ctx.strokeRect(startX, startY, width, height);
  } else if (tool === "circle") {
    const radius = Math.sqrt(width * width + height * height);
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.stroke();
  } else if (tool === "line") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  if (!isPreview) {
    // Добавляем фигуру в массив при завершении рисования
    if (tool === "rectangle") {
      shapes.push({ type: "rectangle", x: startX, y: startY, width: width, height: height, color: colorPicker.value, size: brushSize.value });
    } else if (tool === "circle") {
      const radius = Math.sqrt(width * width + height * height);
      shapes.push({ type: "circle", x: startX, y: startY, radius: radius, color: colorPicker.value, size: brushSize.value });
    } else if (tool === "line") {
      shapes.push({ type: "line", startX: startX, startY: startY, endX: pos.x, endY: pos.y, color: colorPicker.value, size: brushSize.value });
    }
  }

  if (isPreview) {
    ctx.restore();
  }
}

// Добавление наклейки
function addSticker(x, y) {
  shapes.push({
    type: "sticker",
    src: currentSticker.src,
    x: x,
    y: y,
    width: 100, // Размеры наклейки по умолчанию
    height: 100
  });
  drawShapes();
}

// Показ/скрытие панели наклеек
stickerButton.addEventListener('click', () => {
  stickerPanel.style.display = stickerPanel.style.display === 'none' ? 'block' : 'none';
  tool = "sticker"; // Переключение на режим наклеек
});

// Выбор наклейки
stickers.forEach(sticker => {
  sticker.addEventListener('click', () => {
    currentSticker = sticker;
    stickerPanel.style.display = 'none';
  });
});

// Очистка холста
clearCanvas.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes = []; // Очищаем массив фигур
});

// Выбор инструмента
freeDraw.addEventListener('click', () => tool = "freeDraw");
drawRectangle.addEventListener('click', () => tool = "rectangle");
drawCircle.addEventListener('click', () => tool = "circle");
drawLine.addEventListener('click', () => tool = "line");

// Обработчики событий для рисования
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', e => {
  draw(e);
  previewShape(e);
});

// Обработка кнопки настроек
settingsButton.addEventListener('click', () => {
  window.location.href = 'settings.html';
});

// Установка фона при загрузке страницы
window.onload = function() {
  const canvasBackground = localStorage.getItem('canvasBackground');
  if (canvasBackground) {
    document.body.style.backgroundImage = `url(${canvasBackground})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  }
};

// Изменение размеров холста
function resizeCanvas() {
  if (window.innerWidth > 768) {
    canvas.width = window.innerWidth - 200;
    canvas.height = window.innerHeight - 120;
  } else {
    canvas.width = window.innerWidth - 20; // Отступы для мобильного
    canvas.height = window.innerHeight - 150; // Отступы для панели инструментов
  }
  drawShapes(); // Перерисовываем сохраненные формы на новом размере холста
}

// Вызываем resizeCanvas при загрузке страницы и изменении размеров окна
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Блокировка прокрутки
function disableScroll() {
  document.body.style.overflow = 'hidden';
}

function enableScroll() {
  document.body.style.overflow = 'auto';
}

// Добавляем блокировку при начале рисования
canvas.addEventListener('touchstart', (e) => {
  disableScroll();
  startPosition(e);
});

// Снимаем блокировку при завершении рисования
canvas.addEventListener('touchend', (e) => {
  enableScroll();
  endPosition(e);
});

// Поддержка рисования на мобильных с блокировкой прокрутки
canvas.addEventListener('touchmove', (e) => {
  draw(e);
  previewShape(e);
  e.preventDefault(); // Предотвращаем скроллинг во время рисования
});
