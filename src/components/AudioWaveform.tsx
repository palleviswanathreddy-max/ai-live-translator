import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  color?: string;
  height?: number;
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  color = '#06b6d4',
  height = 64,
  barCount = 36
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const barWidth = width / barCount;
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth + barWidth / 2;
        
        let amplitude = 4;
        if (isActive) {
          // Dynamic sine wave math for active listening mode
          amplitude = Math.sin(i * 0.3 + phase) * Math.cos(i * 0.15 - phase) * (height * 0.42) + (height * 0.22);
          amplitude = Math.max(6, Math.abs(amplitude));
        } else {
          // Idle ambient resting wave
          amplitude = Math.sin(i * 0.2 + phase * 0.5) * 4 + 6;
        }

        const gradient = ctx.createLinearGradient(0, centerY - amplitude, 0, centerY + amplitude);
        if (isActive) {
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(0.5, color);
          gradient.addColorStop(1, '#10b981');
        } else {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x - (barWidth * 0.35), centerY - (amplitude / 2), barWidth * 0.7, amplitude, 4);
        ctx.fill();
      }

      phase += isActive ? 0.12 : 0.03;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, color, height, barCount]);

  return (
    <div className="w-full flex items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={380}
        height={height}
        className="w-full max-w-md h-16 rounded-xl overflow-hidden"
      />
    </div>
  );
};
