let objectAssetPool = [];
let tongueAsset = null;

// Student direction: use photographic objects and the original tongue image.
// AI support: image loading, cropping and connector-point calculations in this file.
function fetchAsset(path, isTongue = false) {
  return new Promise((resolve) => {
    let finished = false;
    const finish = (asset) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      resolve(asset);
    };
    const timeout = setTimeout(() => finish(null), 12000);
    loadImage(
      path,
      (image) => {
        if (!finished) finish(readAsset(image, isTongue, path));
      },
      () => finish(null),
    );
  });
}

function readAsset(image, isTongue, path) {
  try {
    return prepareAsset(image, isTongue);
  } catch (error) {
    console.warn(path, error);
    return null;
  }
}

// Decode a few images at a time and show each successful load without placeholders.
async function loadAssets() {
  const tongueJob = fetchAsset(TONGUE_PATH, true).then((asset) => {
    tongueAsset = asset;
  });
  const queue = [...OBJECT_PATHS],
    loaded = [];
  // Limit simultaneous decoding of the original PNGs.
  await Promise.all([
    loadObjectQueue(queue, loaded),
    loadObjectQueue(queue, loaded),
    loadObjectQueue(queue, loaded),
    tongueJob,
  ]);
  objectAssetPool = loaded;
  arrangeObjects(loaded);
}

async function loadObjectQueue(queue, loaded) {
  while (queue.length) {
    const asset = await fetchAsset(queue.shift());
    if (!asset) continue;
    loaded.push(asset);
    objectAssetPool = loaded.slice();
    if (loaded.length === 1 || loaded.length === MAX_OBJECTS) arrangeObjects(loaded);
  }
}

// Reduce image size and crop transparent margins before placing each cutout.
function prepareAsset(image, isTongue) {
  const factor = Math.min(1, (isTongue ? 1000 : 650) / Math.max(image.width, image.height));
  const canvas = createSurface(Math.round(image.width * factor), Math.round(image.height * factor));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image.canvas, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bounds = findOpaqueBounds(pixels);
  if (!bounds) return null;
  if (isTongue) return { canvas };
  return cropObject(canvas, pixels, bounds);
}

function findOpaqueBounds({ data, width, height }) {
  let minX = width,
    minY = height,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] <= 100) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return minX > maxX ? null : { minX, minY, maxX, maxY };
}

function cropObject(canvas, pixels, bounds) {
  const { minX, minY, maxX, maxY } = bounds;
  const crop = createSurface(maxX - minX + 1, maxY - minY + 1);
  crop.getContext('2d').drawImage(canvas, minX, minY, crop.width, crop.height, 0, 0, crop.width, crop.height);
  return { canvas: crop, ...findObjectEndpoint(pixels, bounds, crop) };
}

// Find a solid pixel near the centre for the pointer to land on.
function findObjectEndpoint(pixels, bounds, crop) {
  const endpoint = { endX: 0.5, endY: 0.5, distance: Infinity };
  for (let y = bounds.minY; y <= bounds.maxY; y += 2) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 2) {
      updateEndpoint(endpoint, pixels, bounds, crop, x, y);
    }
  }
  return { endX: endpoint.endX, endY: endpoint.endY };
}

function updateEndpoint(endpoint, { data, width }, bounds, crop, x, y) {
  const offset = (y * width + x) * 4;
  const nx = (x - bounds.minX) / crop.width,
    ny = (y - bounds.minY) / crop.height;
  const distance = (nx - 0.5) ** 2 + (ny - 0.5) ** 2;
  if (data[offset + 3] <= 200 || Math.min(data[offset], data[offset + 1], data[offset + 2]) >= 220) return;
  if (distance >= endpoint.distance) return;
  Object.assign(endpoint, { endX: nx, endY: ny, distance });
}
