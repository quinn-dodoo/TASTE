// SPDX-License-Identifier: GPL-3.0-only
const CANVAS_W = 1920,
  CANVAS_H = 1080;
const SEED = null; // null = new artwork each reload
const GLITCH_SPEED_MULTIPLIER = 3;
const OBJECT_REPOSITION_MIN = 180;
const OBJECT_REPOSITION_MAX = 300;
const POINTER_INTERVAL = 480;
const POINTER_HIDE_DURATION = 45;
const OBJECT_JUMP_DISTANCE = 360;
const POINTER_BOX_MIN = 38,
  POINTER_BOX_MAX = 84;
const OBJECT_SIZE_MIN = 170; // Longest edge, in canvas pixels.
const OBJECT_SIZE_MAX = 320;
const timed = (ms) => (ms * 3) / Math.max(0.1, GLITCH_SPEED_MULTIPLIER);
const MAX_OBJECTS = 8;
const PALETTE = ['#FFFF00', '#FF00B8', '#173BFF', '#FF1616', '#00FF20', '#000000', '#FFFFFF'];
const TONGUE_PATH = 'images/Tongue.PNG';
const OBJECT_PATHS = [
  'images/IMG_0460.PNG',
  'images/IMG_0477.PNG',
  'images/IMG_0478.PNG',
  'images/IMG_0479.PNG',
  'images/IMG_0480.PNG',
  'images/IMG_0481.PNG',
  'images/IMG_0482.PNG',
  'images/IMG_0483.PNG',
  'images/IMG_0484.PNG',
  'images/IMG_0485.PNG',
  'images/IMG_0486.PNG',
  'images/IMG_0487.PNG',
  'images/IMG_0488.PNG',
  'images/IMG_0489.PNG',
  'images/IMG_0490.PNG',
  'images/IMG_0491.PNG',
  'images/IMG_0492.PNG',
  'images/IMG_0493.PNG',
  'images/IMG_0494.PNG',
  'images/IMG_0495.PNG',
  'images/IMG_0496.PNG',
  'images/IMG_0497.PNG',
  'images/IMG_0498.PNG',
  'images/IMG_0499.PNG',
  'images/IMG_0500.PNG',
  'images/IMG_0501.PNG',
  'images/IMG_0502.PNG',
  'images/IMG_0503.PNG',
  'images/IMG_0504.PNG',
  'images/IMG_0505.PNG',
  'images/IMG_0506.PNG',
  'images/IMG_0507.PNG',
  'images/IMG_0508.PNG',
  'images/IMG_0509.PNG',
  'images/IMG_0510.PNG',
];
const TONGUE_REGION = [
  [0.35, 0.48],
  [0.65, 0.48],
  [0.62, 0.78],
  [0.55, 0.86],
  [0.45, 0.86],
  [0.35, 0.78],
];
