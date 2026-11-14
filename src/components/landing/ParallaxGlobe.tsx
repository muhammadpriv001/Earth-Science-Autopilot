'use client';

import React, { useEffect, useRef } from 'react';

export function ParallaxGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      width = rect.width;
      height = rect.height;
    };

    updateSize();

    const ro = new ResizeObserver(() => {
      updateSize();
    });
    ro.observe(canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / (rect.width || 1) - 0.5;
      const relativeY = (e.clientY - rect.top) / (rect.height || 1) - 0.5;
      mouseRef.current.targetX = relativeX * 0.35;
      mouseRef.current.targetY = relativeY * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 1. TWINKLING STARS BACKGROUND
    const numStars = 90;
    const stars: { x: number; y: number; radius: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        radius: 0.7 + Math.random() * 1.5,
        speed: 0.02 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 2. CELESTIAL SATELLITE NETWORK NODES (Drifting & Interconnected with Dotted Lines)
    const numSatellites = 16;
    const satellites: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      orbitRadius: number;
      pulsePhase: number;
    }[] = [];
    for (let i = 0; i < numSatellites; i++) {
      satellites.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0006,
        vy: (Math.random() - 0.5) * 0.0006,
        orbitRadius: 2.5 + Math.random() * 2.5,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // 3. 3D SPHERICAL CONTINENTAL NODES (Frosted Mint/Emerald Matching Theme)
    const numPoints = 260;
    const points: { phi: number; theta: number; size: number; alpha: number; isLand: boolean }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / numPoints);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const isLand = Math.sin(phi * 2.8) * Math.cos(theta * 2.2) > -0.1;
      points.push({
        phi,
        theta,
        size: isLand ? 2.3 : 1.3,
        alpha: isLand ? 0.9 : 0.3,
        isLand,
      });
    }

    let time = 0;
    let globeRotation = 0;

    const render = () => {
      if (width <= 0 || height <= 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      // Smooth parallax interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // =========================================================================
      // A. RENDER TWINKLING STARS (Across Entire Hero Section)
      // =========================================================================
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const alpha = 0.2 + 0.65 * (0.5 + 0.5 * Math.sin(time * s.speed * 40 + s.phase));
        const px = s.x * width;
        const py = s.y * height;

        ctx.beginPath();
        ctx.arc(px, py, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(209, 250, 229, ${alpha})`; // Soft mint-pearl twinkle
        ctx.fill();
      }

      // =========================================================================
      // B. RENDER SATELLITE NETWORK DIAGRAM (Dotted Lines Connecting Nodes)
      // =========================================================================
      // Update satellite positions
      satellites.forEach(sat => {
        sat.x += sat.vx;
        sat.y += sat.vy;
        if (sat.x < 0.05) sat.vx = Math.abs(sat.vx);
        if (sat.x > 0.95) sat.vx = -Math.abs(sat.vx);
        if (sat.y < 0.05) sat.vy = Math.abs(sat.vy);
        if (sat.y > 0.95) sat.vy = -Math.abs(sat.vy);
      });

      // Draw dotted connection lines between nearby satellite nodes
      const maxDist = Math.min(width, height) * 0.32;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);

      for (let i = 0; i < satellites.length; i++) {
        const s1 = satellites[i];
        const x1 = s1.x * width;
        const y1 = s1.y * height;

        for (let j = i + 1; j < satellites.length; j++) {
          const s2 = satellites[j];
          const x2 = s2.x * width;
          const y2 = s2.y * height;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(52, 211, 153, ${lineAlpha})`; // Mint dotted network link
            ctx.stroke();
          }
        }
      }
      ctx.setLineDash([]); // Reset line dash

      // Draw satellite node beacons with radar rings
      satellites.forEach(sat => {
        const sx = sat.x * width;
        const sy = sat.y * height;
        const pulse = 0.5 + 0.5 * Math.sin(time * 3 + sat.pulsePhase);

        // Radar pulse ring
        ctx.beginPath();
        ctx.arc(sx, sy, sat.orbitRadius * (1 + pulse * 0.8), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.15 * (1 - pulse)})`;
        ctx.stroke();

        // Core satellite beacon (Orange/Amber Accent or Mint)
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = sat.pulsePhase > Math.PI ? '#f97316' : '#34d399';
        ctx.shadowColor = sat.pulsePhase > Math.PI ? '#ea580c' : '#10b981';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // =========================================================================
      // C. RENDER TRANSLUCENT FROSTED GLOBE (Center, Blurry Emerald Theme Glow)
      // =========================================================================
      // Strictly round circle: radius derived from min dimension
      const baseSize = Math.min(width, height);
      const radius = baseSize * 0.35;
      const centerX = width / 2 + mouseRef.current.x * 35;
      const centerY = height / 2 + mouseRef.current.y * 25;

      // 1. Blurry Atmospheric Frosted Glow Halo (Theme Green & Subtle Peach Accent)
      const outerGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.8,
        centerX,
        centerY,
        radius * 1.55
      );
      outerGlow.addColorStop(0, 'rgba(16, 185, 129, 0.32)'); // Luminous Emerald
      outerGlow.addColorStop(0.4, 'rgba(5, 150, 105, 0.18)'); // Deep Forest Mist
      outerGlow.addColorStop(0.75, 'rgba(249, 115, 22, 0.12)'); // Warm Coral Accent Edge
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.55, 0, Math.PI * 2);
      ctx.fill();

      // 2. Translucent Glassmorphic Sphere Body (Frosted Deep Pine Glass)
      const sphereGradient = ctx.createRadialGradient(
        centerX - radius * 0.32,
        centerY - radius * 0.32,
        radius * 0.05,
        centerX,
        centerY,
        radius
      );
      sphereGradient.addColorStop(0, 'rgba(236, 253, 245, 0.40)'); // Pearl highlight
      sphereGradient.addColorStop(0.35, 'rgba(6, 78, 59, 0.32)');  // Frosted Emerald
      sphereGradient.addColorStop(0.7, 'rgba(4, 30, 24, 0.50)');   // Deep Pine Glass
      sphereGradient.addColorStop(1, 'rgba(2, 18, 14, 0.80)');     // Shaded edge

      ctx.fillStyle = sphereGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Subtle Glass Rim
      ctx.strokeStyle = 'rgba(167, 243, 208, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // 3. Rotating Continental Nodes Inside Globe
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
      ctx.clip();

      globeRotation += 0.0035;
      const tiltedAngleX = 0.22;
      const tiltedAngleY = globeRotation;

      const projectedPoints = points.map(p => {
        const rotTheta = p.theta + tiltedAngleY;
        const x3d = Math.sin(p.phi) * Math.cos(rotTheta);
        const y3d = Math.cos(p.phi);
        const z3d = Math.sin(p.phi) * Math.sin(rotTheta);

        const tiltedY = y3d * Math.cos(tiltedAngleX) - z3d * Math.sin(tiltedAngleX);
        const tiltedZ = y3d * Math.sin(tiltedAngleX) + z3d * Math.cos(tiltedAngleX);

        return {
          x: centerX + x3d * radius,
          y: centerY + tiltedY * radius,
          z: tiltedZ,
          size: p.size,
          isLand: p.isLand,
        };
      });

      // Back-facing nodes: blurry soft depth
      projectedPoints
        .filter(p => p.z < 0)
        .forEach(p => {
          const depthAlpha = Math.max(0.04, 0.18 * (1 + p.z));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(110, 231, 183, ${depthAlpha})`;
          ctx.fill();
        });

      // Front-facing nodes: luminous mint & pearl white
      projectedPoints
        .filter(p => p.z >= 0)
        .forEach(p => {
          const depthRatio = 0.35 + 0.65 * p.z;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * depthRatio, 0, Math.PI * 2);

          if (p.isLand) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.75 + 0.25 * p.z})`;
            ctx.shadowColor = 'rgba(52, 211, 153, 0.8)';
            ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = `rgba(52, 211, 153, ${0.35 + 0.3 * p.z})`;
            ctx.shadowBlur = 0;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        });

      ctx.restore(); // End clipping

      // 4. Orbital Trajectory Ring (Warm Orange / Coral Accent)
      const orbitTilt = 0.40;
      const orbitRadiusX = radius * 1.34;
      const orbitRadiusY = radius * 0.46;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, orbitRadiusX, orbitRadiusY, orbitTilt, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.35)'; // Warm Coral
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.restore();

      // Satellite 1: Primary Sensor Beacon (Orange Beacon)
      const satTime1 = globeRotation * 1.4;
      const satX1 = centerX + Math.cos(satTime1) * orbitRadiusX * Math.cos(orbitTilt) - Math.sin(satTime1) * orbitRadiusY * Math.sin(orbitTilt);
      const satY1 = centerY + Math.cos(satTime1) * orbitRadiusX * Math.sin(orbitTilt) + Math.sin(satTime1) * orbitRadiusY * Math.cos(orbitTilt);

      ctx.save();
      ctx.beginPath();
      ctx.arc(satX1, satY1, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      ro.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-95"
      />
    </div>
  );
}
