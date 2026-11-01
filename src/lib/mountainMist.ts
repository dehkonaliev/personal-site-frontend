const NOISE_SIZE = 128;
const MAX_RENDER_WIDTH = 220;
const MIN_RENDER_WIDTH = 140;

interface MistLayer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  noise: Uint8Array;
  image: ImageData;
  speed: number;
  threshold: number;
  opacity: number;
  color: readonly [number, number, number];
  foreground: boolean;
}

const createNoise = (seed: number) => {
  const noise = new Uint8Array(NOISE_SIZE * NOISE_SIZE);
  let state = seed;

  for (let index = 0; index < noise.length; index += 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    noise[index] = state & 255;
  }

  return noise;
};

const smooth = (value: number) => value * value * (3 - 2 * value);

const sampleNoise = (noise: Uint8Array, x: number, y: number) => {
  const floorX = Math.floor(x);
  const floorY = Math.floor(y);
  const x0 = ((floorX % NOISE_SIZE) + NOISE_SIZE) % NOISE_SIZE;
  const y0 = ((floorY % NOISE_SIZE) + NOISE_SIZE) % NOISE_SIZE;
  const x1 = (x0 + 1) % NOISE_SIZE;
  const y1 = (y0 + 1) % NOISE_SIZE;
  const tx = smooth(x - floorX);
  const ty = smooth(y - floorY);
  const top = noise[y0 * NOISE_SIZE + x0] * (1 - tx) +
    noise[y0 * NOISE_SIZE + x1] * tx;
  const bottom = noise[y1 * NOISE_SIZE + x0] * (1 - tx) +
    noise[y1 * NOISE_SIZE + x1] * tx;

  return (top * (1 - ty) + bottom * ty) / 255;
};

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return amount * amount * (3 - 2 * amount);
};

const renderLayer = (layer: MistLayer, time: number) => {
  const { width, height } = layer.canvas;
  const pixels = layer.image.data;
  let offset = 0;

  for (let y = 0; y < height; y += 1) {
    const vertical = y / height;
    for (let x = 0; x < width; x += 1) {
      const horizontal = (x / width) * 5;
      const drift = time * layer.speed;
      const warpX = sampleNoise(
        layer.noise,
        horizontal * 0.42 + drift * 0.35,
        vertical * 1.8 + time * 0.006,
      );
      const warpY = sampleNoise(
        layer.noise,
        horizontal * 0.3 + time * 0.004,
        vertical * 1.4 - drift * 0.16,
      );
      const noiseX = horizontal + (warpX - 0.5) * 1.7 + drift;
      const noiseY =
        vertical * 2.8 + (warpY - 0.5) * 1.3 +
        Math.sin(time * 0.035 + horizontal * 0.45) * 0.09;
      const broad = sampleNoise(layer.noise, noiseX, noiseY);
      const medium = sampleNoise(
        layer.noise,
        noiseX * 2.03 + 17,
        noiseY * 2.03 - time * 0.012,
      );
      const fine = sampleNoise(
        layer.noise,
        noiseX * 4.07 - 31,
        noiseY * 4.07 + time * 0.018,
      );
      const cloud = broad * 0.58 + medium * 0.29 + fine * 0.13;
      const cloudAlpha = smoothstep(layer.threshold, layer.threshold + 0.2, cloud);
      const heightMask = layer.foreground
        ? smoothstep(0.08, 0.48, vertical) *
          (1 - smoothstep(0.88, 1, vertical) * 0.25)
        : 1 - smoothstep(0.48, 0.72, vertical);
      const alpha = cloudAlpha * heightMask * layer.opacity;

      pixels[offset] = layer.color[0];
      pixels[offset + 1] = layer.color[1];
      pixels[offset + 2] = layer.color[2];
      pixels[offset + 3] = alpha * 255;
      offset += 4;
    }
  }

  layer.context.putImageData(layer.image, 0, 0);
};

export function animateMountainMist(
  container: HTMLElement,
  canvases: readonly [HTMLCanvasElement, HTMLCanvasElement],
) {
  const configurations = [
    {
      seed: 7823,
      speed: 0.018,
      threshold: 0.48,
      opacity: 0.34,
      color: [225, 233, 241] as const,
      foreground: false,
    },
    {
      seed: 19457,
      speed: 0.031,
      threshold: 0.46,
      opacity: 0.5,
      color: [239, 244, 249] as const,
      foreground: true,
    },
  ] as const;
  const layers: (MistLayer | null)[] = canvases.map((canvas, index) => {
    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      console.error("Could not initialize a mountain mist canvas context.");
      return null;
    }

    const config = configurations[index];
    return {
      canvas,
      context,
      noise: createNoise(config.seed),
      image: new ImageData(1, 1),
      speed: config.speed,
      threshold: config.threshold,
      opacity: config.opacity,
      color: config.color,
      foreground: config.foreground,
    };
  });

  const activeLayers = layers.filter((layer): layer is MistLayer => layer !== null);
  if (activeLayers.length !== canvases.length) {
    return () => {};
  }
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let elapsed = 0;
  let lastFrame = 0;
  let frameId = 0;

  const render = (time: number) => {
    for (const layer of activeLayers) renderLayer(layer, time);
  };

  const resize = () => {
    const bounds = container.getBoundingClientRect();
    const width = Math.max(
      MIN_RENDER_WIDTH,
      Math.min(MAX_RENDER_WIDTH, Math.round(bounds.width * 0.22)),
    );
    const height = Math.max(90, Math.round(width * bounds.height / bounds.width));

    for (const layer of activeLayers) {
      layer.canvas.width = width;
      layer.canvas.height = height;
      layer.image = layer.context.createImageData(width, height);
    }
    render(elapsed);
  };

  const stop = () => {
    cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = 0;
  };

  const tick = (timestamp: number) => {
    if (document.visibilityState === "hidden") {
      stop();
      return;
    }

    if (lastFrame) elapsed += Math.min((timestamp - lastFrame) / 1000, 0.05);
    lastFrame = timestamp;
    render(elapsed);
    frameId = requestAnimationFrame(tick);
  };

  const start = () => {
    stop();
    if (motionQuery.matches || document.visibilityState === "hidden") {
      render(elapsed);
      return;
    }
    frameId = requestAnimationFrame(tick);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();
  start();

  const onVisibilityChange = () => start();
  document.addEventListener("visibilitychange", onVisibilityChange);
  motionQuery.addEventListener("change", start);

  return () => {
    stop();
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibilityChange);
    motionQuery.removeEventListener("change", start);
  };
}
