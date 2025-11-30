import { useEffect, useRef } from "react";

const WaveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId: number;
    let time = 0;

    canvas.width = width;
    canvas.height = height;

    const waveCount = 5;
    const waveSpeed = 0.015;
    const startColorHex = "#7ed957";
    const endColorHex = "#0097b2";

    function hexToRgb(hex: string) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    }

    function generateGradient(colorStart: string, colorEnd: string, steps: number) {
      const start = hexToRgb(colorStart);
      const end = hexToRgb(colorEnd);
      const gradientColors: string[] = [];

      if (!start || !end) return gradientColors;

      for (let i = 0; i < steps; i++) {
        const r = Math.round(start.r + (end.r - start.r) * (i / (steps - 1)));
        const g = Math.round(start.g + (end.g - start.g) * (i / (steps - 1)));
        const b = Math.round(start.b + (end.b - start.b) * (i / (steps - 1)));
        gradientColors.push(`rgb(${r}, ${g}, ${b})`);
      }
      return gradientColors;
    }

    const waveColors = generateGradient(startColorHex, endColorHex, waveCount);

    function drawWave(
      amplitude: number,
      wavelength: number,
      speed: number,
      yOffset: number,
      currentTime: number,
      color: string,
      index: number
    ) {
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 5) {
        const y =
          amplitude * Math.sin(x / wavelength + currentTime * speed + index * 0.8) +
          yOffset;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();
    }

    function animate() {
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < waveCount; i++) {
        drawWave(
          50,
          600 + i * 30,
          10,
          height / 6 + i * ((height * 0.8) / waveCount),
          time,
          waveColors[i],
          i
        );
      }

      time += waveSpeed * 0.1;
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default WaveBackground;
