"use client";

import { useEffect, useRef } from "react";

export function LightweightCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high density Retina displays
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const nodeCount = 15; // Extremely lightweight limit
    const nodes: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    
    // Spawn nodes within initial boundary
    const parent = canvas.parentElement;
    const width = parent?.clientWidth || 400;
    const height = parent?.clientHeight || 600;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: 1.0 + Math.random() * 1.5,
      });
    }

    // Capture mouse moves inside canvas container
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const container = canvas.parentElement;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove, { passive: true });
      container.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    }

    let frameId: number;

    const loop = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      // Render glowing nodes mesh
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        
        nodeA.x += nodeA.vx;
        nodeA.y += nodeA.vy;

        // Bounce back at container limits
        if (nodeA.x < 0 || nodeA.x > w) nodeA.vx *= -1;
        if (nodeA.y < 0 || nodeA.y > h) nodeA.vy *= -1;

        // Connect nearby nodes together
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 85) {
            ctx.lineWidth = 0.8;
            ctx.strokeStyle = `rgba(255, 63, 108, ${0.07 * (1 - dist / 85)})`;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }

        // Draw node wire line to mouse
        if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
          const dxMouse = nodeA.x - mouseRef.current.x;
          const dyMouse = nodeA.y - mouseRef.current.y;
          const distMouse = Math.hypot(dxMouse, dyMouse);

          if (distMouse < 90) {
            ctx.lineWidth = 0.9;
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.14 * (1 - distMouse / 90)})`;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.stroke();
          }
        }

        // Draw dot
        ctx.fillStyle = i % 2 === 0 ? "rgba(255, 63, 108, 0.45)" : "rgba(6, 182, 212, 0.45)";
        ctx.beginPath();
        ctx.arc(nodeA.x, nodeA.y, nodeA.size, 0, Math.PI * 2);
        ctx.fill();
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block pointer-events-none z-0"
    />
  );
}
