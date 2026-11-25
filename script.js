// Student direction: the whole composition should fit the screen without stretching.
// AI-assisted: calculate a proportional display size and position the information button.
function fitCanvasToWindow() {
  const canvas = document.getElementById('owned-collage');
  if (!canvas) {
    return;
  }
  const ratio = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  canvas.style.width = `${1920 * ratio}px`;
  canvas.style.height = `${1080 * ratio}px`;
  positionInfoButton(canvas);
}

function positionInfoButton(canvas) {
  const button = document.getElementById('info-button');
  if (button) {
    const bounds = canvas.getBoundingClientRect();
    button.style.top = `${bounds.top + 16}px`;
    button.style.right = `${window.innerWidth - bounds.right + 16}px`;
  }
}
window.addEventListener('resize', fitCanvasToWindow);

// Student direction: retro project-information window with open/close controls, keyboard focus and input handling independent of p5.
const infoButton = document.getElementById('info-button');
const infoWindow = document.getElementById('info-window');
const infoClose = document.getElementById('info-close');
function openInfoWindow() {
  if (!infoWindow.hidden) return;
  infoWindow.hidden = false;
  fitInfoWindow();
  infoButton.setAttribute('aria-expanded', 'true');
  infoClose.focus({ preventScroll: true });
}
function closeInfoWindow() {
  if (infoWindow.hidden) return;
  stopInfoDrag();
  infoWindow.hidden = true;
  infoButton.setAttribute('aria-expanded', 'false');
  infoButton.focus({ preventScroll: true });
}
infoButton.addEventListener('click', openInfoWindow);
infoClose.addEventListener('click', closeInfoWindow);

for (const element of [infoButton, infoWindow]) {
  for (const type of [
    'pointerdown',
    'pointerup',
    'pointermove',
    'mousedown',
    'mouseup',
    'mousemove',
    'click',
    'dblclick',
    'touchstart',
    'touchmove',
    'touchend',
    'wheel',
    'keydown',
    'keyup',
  ]) {
    element.addEventListener(type, (event) => {
      if (type === 'keydown' && event.key === 'Escape') {
        event.preventDefault();
        closeInfoWindow();
      }
      event.stopPropagation();
    });
  }
}
document.addEventListener(
  'keydown',
  (event) => {
    if (event.key === 'Escape' && !infoWindow.hidden) {
      event.preventDefault();
      event.stopPropagation();
      closeInfoWindow();
    }
  },
  true,
);

// Student direction: title-bar dragging and bounds checks keep the window reachable after resizing.
const infoTitlebar = infoWindow.querySelector('.window-titlebar');
let infoDrag = null;
function clampInfoPosition(left, top) {
  const rect = infoWindow.getBoundingClientRect();
  const margin = 8;
  infoWindow.style.transform = 'none';
  infoWindow.style.left = `${Math.max(margin, Math.min(left, window.innerWidth - rect.width - margin))}px`;
  infoWindow.style.top = `${Math.max(margin, Math.min(top, window.innerHeight - rect.height - margin))}px`;
}
function fitInfoWindow() {
  if (infoWindow.hidden || !infoWindow.style.left) return;
  const rect = infoWindow.getBoundingClientRect();
  clampInfoPosition(rect.left, rect.top);
}
infoTitlebar.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button') || event.button !== 0) return;
  const rect = infoWindow.getBoundingClientRect();
  infoDrag = { id: event.pointerId, dx: event.clientX - rect.left, dy: event.clientY - rect.top };
  infoTitlebar.setPointerCapture(event.pointerId);
  infoTitlebar.classList.add('dragging');
  event.preventDefault();
  event.stopPropagation();
});
infoTitlebar.addEventListener('pointermove', (event) => {
  if (!infoDrag || event.pointerId !== infoDrag.id) return;
  clampInfoPosition(event.clientX - infoDrag.dx, event.clientY - infoDrag.dy);
  event.preventDefault();
  event.stopPropagation();
});
function stopInfoDrag() {
  if (infoDrag && infoTitlebar.hasPointerCapture(infoDrag.id)) infoTitlebar.releasePointerCapture(infoDrag.id);
  infoDrag = null;
  infoTitlebar.classList.remove('dragging');
}
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  infoTitlebar.addEventListener(type, stopInfoDrag);
}
window.addEventListener('resize', fitInfoWindow);
new ResizeObserver(fitInfoWindow).observe(infoWindow);

// AI-assisted: browser fullscreen controls and a fallback when access is unavailable.
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch (error) {
    console.warn('Fullscreen is unavailable in this browser.', error);
  }
}

document.getElementById('artwork').addEventListener('dblclick', toggleFullscreen);
document.addEventListener('fullscreenchange', fitCanvasToWindow);
