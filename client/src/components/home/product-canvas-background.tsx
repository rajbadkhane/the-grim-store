"use client";

import { useEffect, useRef, useState } from "react";

type CarouselSlide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
};

type ThemeType = "audio" | "gaming" | "camera" | "phone" | "computer" | "general";

interface ProductCanvasBackgroundProps {
  activeSlide: CarouselSlide;
}

// ----------------------------------------------------
// Base Element Class for Canvas Items
// Handles position, velocity, sizing, fading, and custom updates.
// ----------------------------------------------------
abstract class AnimElement {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number = 0;
  targetAlpha: number = 1;
  fadeSpeed: number = 0.03;
  isDead: boolean = false;

  constructor(x: number, y: number, size: number, color: string, targetAlpha = 1) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.size = size;
    this.color = color;
    this.targetAlpha = targetAlpha;
  }

  update(width: number, height: number, mouseX: number, mouseY: number) {
    // Smooth fade in/out
    if (this.alpha < this.targetAlpha) {
      this.alpha = Math.min(this.targetAlpha, this.alpha + this.fadeSpeed);
    } else if (this.alpha > this.targetAlpha) {
      this.alpha = Math.max(0, this.alpha - this.fadeSpeed);
    }

    if (this.targetAlpha === 0 && this.alpha <= 0.01) {
      this.isDead = true;
    }

    // Move
    this.x += this.vx;
    this.y += this.vy;

    // Boundaries
    if (this.x < -100 || this.x > width + 100) this.vx *= -1;
    if (this.y < -100 || this.y > height + 100) this.vy *= -1;
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
}

// Interactive spark trail particles
class TrailParticle extends AnimElement {
  decay: number;

  constructor(x: number, y: number, color: string) {
    super(x, y, 2.5 + Math.random() * 3, color, 0.9);
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.decay = 0.015 + Math.random() * 0.015;
    this.fadeSpeed = 0.05;
  }

  update(width: number, height: number, mouseX: number, mouseY: number) {
    super.update(width, height, mouseX, mouseY);
    // Directly decay opacity
    this.alpha = Math.max(0, this.alpha - this.decay);
    if (this.alpha <= 0.01) {
      this.isDead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 1. Audio Theme Elements: Concentric Sound Rings & Equalizer Frequency Bars
class SoundRing extends AnimElement {
  maxRadius: number;
  currentRadius: number = 0;
  speed: number;

  constructor(x: number, y: number, maxRadius: number, color: string) {
    super(x, y, 1, color, 0.55);
    this.maxRadius = maxRadius;
    this.speed = 1.0 + Math.random() * 1.0;
  }

  update(width: number, height: number, mouseX: number, mouseY: number) {
    super.update(width, height, mouseX, mouseY);
    this.currentRadius += this.speed;
    if (this.currentRadius >= this.maxRadius) {
      this.targetAlpha = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = this.alpha * (1 - this.currentRadius / this.maxRadius);
    ctx.lineWidth = 2.0;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// 2. Gaming Theme Elements: D-pad shapes & floating retro pixel blocks
class GamingShape extends AnimElement {
  type: "dpad" | "crosshair" | "square";
  rotation: number = 0;
  rotSpeed: number;

  constructor(x: number, y: number, size: number, color: string) {
    super(x, y, size, color, 0.35);
    this.type = Math.random() > 0.6 ? "dpad" : Math.random() > 0.5 ? "crosshair" : "square";
    this.rotSpeed = (Math.random() - 0.5) * 0.02;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = -0.3 - Math.random() * 0.5; // Drift upwards
  }

  update(width: number, height: number, mouseX: number, mouseY: number) {
    super.update(width, height, mouseX, mouseY);
    this.rotation += this.rotSpeed;

    // Respawn at bottom if goes off top
    if (this.y < -this.size) {
      if (this.targetAlpha > 0) {
        this.y = height + this.size;
        this.x = Math.random() * width;
      } else {
        this.isDead = true;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.lineWidth = 1.5;

    if (this.type === "dpad") {
      // Draw wireframe D-Pad cross
      const w = this.size / 3;
      ctx.beginPath();
      ctx.moveTo(-w/2, -this.size/2);
      ctx.lineTo(w/2, -this.size/2);
      ctx.lineTo(w/2, -w/2);
      ctx.lineTo(this.size/2, -w/2);
      ctx.lineTo(this.size/2, w/2);
      ctx.lineTo(w/2, w/2);
      ctx.lineTo(w/2, this.size/2);
      ctx.lineTo(-w/2, this.size/2);
      ctx.lineTo(-w/2, w/2);
      ctx.lineTo(-this.size/2, w/2);
      ctx.lineTo(-this.size/2, -w/2);
      ctx.lineTo(-w/2, -w/2);
      ctx.closePath();
      ctx.stroke();
    } else if (this.type === "crosshair") {
      // Draw tactical crosshair
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-this.size / 1.5, 0);
      ctx.lineTo(-this.size / 4, 0);
      ctx.moveTo(this.size / 4, 0);
      ctx.lineTo(this.size / 1.5, 0);
      ctx.moveTo(0, -this.size / 1.5);
      ctx.lineTo(0, -this.size / 4);
      ctx.moveTo(0, this.size / 4);
      ctx.lineTo(0, this.size / 1.5);
      ctx.stroke();
    } else {
      // Retro glowing pixel block
      ctx.globalAlpha = this.alpha * 0.4;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.globalAlpha = this.alpha;
      ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }
    ctx.restore();
  }
}

// 3. Camera Theme Elements: Focus Brackets & Bokeh Circles
class FocusBracket extends AnimElement {
  trackX: number;
  trackY: number;
  lerpSpeed: number = 0.05;
  bracketSize: number;
  isFocused: boolean = false;
  focusTimer: number = 0;

  constructor(x: number, y: number, size: number, color: string) {
    super(x, y, size, color, 0.45);
    this.trackX = x + (Math.random() - 0.5) * 150;
    this.trackY = y + (Math.random() - 0.5) * 100;
    this.bracketSize = size;
  }

  update(width: number, height: number, mouseX: number, mouseY: number) {
    super.update(width, height, mouseX, mouseY);
    
    // Lerp towards track position
    this.x += (this.trackX - this.x) * this.lerpSpeed;
    this.y += (this.trackY - this.y) * this.lerpSpeed;

    // Simulate autofocus snap
    if (!this.isFocused) {
      if (Math.abs(this.x - this.trackX) < 1 && Math.abs(this.y - this.trackY) < 1) {
        this.isFocused = true;
        this.color = "#10b981"; // Snap to green!
        this.focusTimer = 60; // Stay focused for 60 frames
      }
    } else {
      this.focusTimer--;
      if (this.focusTimer <= 0) {
        this.targetAlpha = 0; // Fade out after snap
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.lineWidth = 1.5;

    const s = this.bracketSize;
    const offset = this.isFocused ? s * 0.4 : s * 0.55;

    // Draw corners
    // Top-left
    ctx.beginPath();
    ctx.moveTo(this.x - offset, this.y - offset + s/3);
    ctx.lineTo(this.x - offset, this.y - offset);
    ctx.lineTo(this.x - offset + s/3, this.y - offset);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(this.x + offset, this.y - offset + s/3);
    ctx.lineTo(this.x + offset, this.y - offset);
    ctx.lineTo(this.x + offset - s/3, this.y - offset);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(this.x - offset, this.y + offset - s/3);
    ctx.lineTo(this.x - offset, this.y + offset);
    ctx.lineTo(this.x - offset + s/3, this.y + offset);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(this.x + offset, this.y + offset - s/3);
    ctx.lineTo(this.x + offset, this.y + offset);
    ctx.lineTo(this.x + offset - s/3, this.y + offset);
    ctx.stroke();

    // Draw center tiny crosshair
    ctx.beginPath();
    ctx.moveTo(this.x - 3, this.y);
    ctx.lineTo(this.x + 3, this.y);
    ctx.moveTo(this.x, this.y - 3);
    ctx.lineTo(this.x, this.y + 3);
    ctx.stroke();

    ctx.restore();
  }
}

// Bokeh circle class for camera theme
class BokehBubble extends AnimElement {
  scaleSpeed: number;
  maxSize: number;

  constructor(x: number, y: number, size: number, color: string) {
    super(x, y, size, color, 0.15);
    this.maxSize = size * (1.2 + Math.random() * 0.5);
    this.scaleSpeed = 0.05 + Math.random() * 0.1;
    this.vy = -0.1 - Math.random() * 0.3;
  }

  update(width: number, height: number, mouseX: number, mouseY: number) {
    super.update(width, height, mouseX, mouseY);
    if (this.size < this.maxSize) this.size += this.scaleSpeed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 4. Phone/Mobile Theme Elements: Floating wireless signal arcs & linkable grid nodes
class AppIcon extends AnimElement {
  rot: number = 0;
  rotV: number;
  origSize: number;

  constructor(x: number, y: number, size: number, color: string) {
    super(x, y, size, color, 0.25);
    this.origSize = size;
    this.rotV = (Math.random() - 0.5) * 0.01;
  }

  update(width: number, height: number, mouseX: number, mouseY: number) {
    super.update(width, height, mouseX, mouseY);
    this.rot += this.rotV;

    // React to mouse proximity by expanding size
    if (mouseX > 0 && mouseY > 0) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        this.size += ((this.origSize * 1.35) - this.size) * 0.1;
      } else {
        this.size += (this.origSize - this.size) * 0.1;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.lineWidth = 1;

    // Rounded rectangle app container outline
    const r = 6;
    ctx.beginPath();
    ctx.moveTo(-this.size/2 + r, -this.size/2);
    ctx.lineTo(this.size/2 - r, -this.size/2);
    ctx.quadraticCurveTo(this.size/2, -this.size/2, this.size/2, -this.size/2 + r);
    ctx.lineTo(this.size/2, this.size/2 - r);
    ctx.quadraticCurveTo(this.size/2, this.size/2, this.size/2 - r, this.size/2);
    ctx.lineTo(-this.size/2 + r, this.size/2);
    ctx.quadraticCurveTo(-this.size/2, this.size/2, -this.size/2, this.size/2 - r);
    ctx.lineTo(-this.size/2, -this.size/2 + r);
    ctx.quadraticCurveTo(-this.size/2, -this.size/2, -this.size/2 + r, -this.size/2);
    ctx.closePath();
    ctx.stroke();

    // Subtle inner grid matrix
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha * 0.3;
    ctx.fillRect(-this.size/3, -this.size/3, this.size/6, this.size/6);
    ctx.fillRect(this.size/6, -this.size/3, this.size/6, this.size/6);
    ctx.fillRect(-this.size/3, this.size/6, this.size/6, this.size/6);
    ctx.fillRect(this.size/6, this.size/6, this.size/6, this.size/6);

    ctx.restore();
  }
}

class NetworkNode extends AnimElement {
  constructor(x: number, y: number, size: number, color: string) {
    super(x, y, size, color, 0.45);
    this.vx = (Math.random() - 0.5) * 1.1;
    this.vy = (Math.random() - 0.5) * 1.1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 5. Computer/General Tech Theme Elements: Binary columns & Circuit paths
class BinaryStream extends AnimElement {
  chars: string[];
  charIndex: number = 0;
  speed: number;
  fontSize: number;

  constructor(x: number, y: number, fontSize: number, color: string) {
    super(x, y, 1, color, 0.45);
    this.fontSize = fontSize;
    this.vx = 0;
    this.vy = 0.6 + Math.random() * 1.0; // Slowly falls down
    
    // Mix in coding characters/brackets to make it related to developer/tech products
    const codeChars = ["0", "1", "x", "y", "a", "b", "f", "c", "{", "}", "[", "]", "<", ">", "+", "-", "*", "/"];
    this.chars = Array.from({ length: 15 }, () => (Math.random() > 0.35 ? (Math.random() > 0.5 ? "1" : "0") : codeChars[Math.floor(Math.random() * codeChars.length)]));
    this.speed = Math.floor(Math.random() * 6) + 3; // Cycles character every X frames
  }

  update(width: number, height: number, mouseX: number, mouseY: number) {
    super.update(width, height, mouseX, mouseY);
    this.charIndex++;
    
    // Cycle characters to animate streams
    if (this.charIndex % this.speed === 0) {
      this.chars.pop();
      const codeChars = ["0", "1", "x", "y", "a", "b", "f", "c", "{", "}", "[", "]", "<", ">", "+", "-", "*", "/"];
      this.chars.unshift(Math.random() > 0.35 ? (Math.random() > 0.5 ? "1" : "0") : codeChars[Math.floor(Math.random() * codeChars.length)]);
    }

    if (this.y > height + this.chars.length * this.fontSize) {
      if (this.targetAlpha > 0) {
        this.y = -this.chars.length * this.fontSize;
        this.x = Math.random() * width;
      } else {
        this.isDead = true;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = `bold ${this.fontSize}px monospace`;
    ctx.textAlign = "center";
    
    // Draw columns of characters with glowing fades
    for (let i = 0; i < this.chars.length; i++) {
      const charY = this.y - i * this.fontSize;
      const charAlpha = this.alpha * (1 - i / this.chars.length);
      
      ctx.fillStyle = this.color;
      ctx.globalAlpha = charAlpha;
      
      // Give the lead character a glowing white neon look
      if (i === 0) {
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
      } else {
        ctx.shadowBlur = 0;
      }
      
      ctx.fillText(this.chars[i], this.x, charY);
    }
    ctx.restore();
  }
}

class CircuitPath extends AnimElement {
  points: { x: number; y: number }[] = [];
  maxSegments: number;
  segmentLength: number = 40;
  activeSegmentIdx: number = 0;
  pctDrawn: number = 0;
  pulseProgress: number = 0;

  constructor(x: number, y: number, color: string) {
    super(x, y, 2.5, color, 0.55);
    this.maxSegments = 4 + Math.floor(Math.random() * 3);
    this.points.push({ x, y });
    this.generatePath();
  }

  generatePath() {
    let curX = this.x;
    let curY = this.y;
    for (let i = 0; i < this.maxSegments; i++) {
      const isHorizontal = Math.random() > 0.5;
      const dir = Math.random() > 0.5 ? 1 : -1;
      
      if (isHorizontal) {
        curX += dir * this.segmentLength;
      } else {
        curY += dir * this.segmentLength;
      }
      this.points.push({ x: curX, y: curY });
    }
  }

  update(width: number, height: number, mouseX: number, mouseY: number) {
    super.update(width, height, mouseX, mouseY);
    
    // Draw speed of circuit lines
    this.pctDrawn += 0.02;
    if (this.pctDrawn >= 1) {
      this.pctDrawn = 0;
      this.activeSegmentIdx++;
      if (this.activeSegmentIdx >= this.points.length - 1) {
        this.activeSegmentIdx = 0;
        this.targetAlpha = 0; // Fade out once complete
      }
    }

    // Pulse dot speed
    this.pulseProgress += 0.025;
    if (this.pulseProgress > 1) this.pulseProgress = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.lineWidth = 1.8; // Thicker traces
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8; // Glowing trace lines!
    ctx.beginPath();
    
    // Draw fully completed segments
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 0; i < this.activeSegmentIdx; i++) {
      ctx.lineTo(this.points[i+1].x, this.points[i+1].y);
    }
    
    // Draw partially completed segment
    const start = this.points[this.activeSegmentIdx];
    const end = this.points[this.activeSegmentIdx + 1];
    if (start && end) {
      const curX = start.x + (end.x - start.x) * this.pctDrawn;
      const curY = start.y + (end.y - start.y) * this.pctDrawn;
      ctx.lineTo(curX, curY);
    }
    ctx.stroke();

    // Draw little circuit solder pads/dots at vertices
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    for (let i = 0; i <= this.activeSegmentIdx; i++) {
      ctx.beginPath();
      ctx.arc(this.points[i].x, this.points[i].y, 3.0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw a pulsing electron dot traveling along the active path
    if (start && end) {
      const pulseX = start.x + (end.x - start.x) * this.pulseProgress;
      const pulseY = start.y + (end.y - start.y) * this.pulseProgress;
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(pulseX, pulseY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// ----------------------------------------------------
// Main React Canvas Component
// ----------------------------------------------------
export default function ProductCanvasBackground({ activeSlide }: ProductCanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<ThemeType>("general");
  
  // Keep mouse tracking values
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const elementsRef = useRef<AnimElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Audio wave details (drawn procedurally)
  const audioPhaseRef = useRef(0);

  // Classify slide theme whenever slide changes
  useEffect(() => {
    const slideTheme = getSlideTheme(activeSlide);
    setTheme(slideTheme);
  }, [activeSlide]);

  // Set up elements and canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI retina display scaling
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

    // Set mouse event listeners relative to container
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      mouseRef.current.x = mouseX;
      mouseRef.current.y = mouseY;

      // Spawn trail particles matching active theme color
      const themeColors = {
        audio: "#ff3f6c",
        gaming: "#a855f7",
        camera: "#fbbf24",
        phone: "#06b6d4",
        computer: "#10b981",
        general: "#ff3f6c"
      };
      const color = themeColors[theme] || "#ff3f6c";
      
      // Control spark emission frequency
      if (Math.random() > 0.35) {
        elementsRef.current.push(new TrailParticle(mouseX, mouseY, color));
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const handleParentClick = (e: MouseEvent) => {
      // Audio click ripple effect
      if (theme === "audio") {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        elementsRef.current.push(new SoundRing(clickX, clickY, 150 + Math.random() * 120, "#ff3f6c"));
      }
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove, { passive: true });
      parent.addEventListener("mouseleave", handleMouseLeave, { passive: true });
      parent.addEventListener("click", handleParentClick, { passive: true });
    }

    return () => {
      resizeObserver.disconnect();
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
        parent.removeEventListener("click", handleParentClick);
      }
    };
  }, [theme]);

  // Initialize and spawn theme elements when theme changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Fade out all current elements
    elementsRef.current.forEach(el => {
      el.targetAlpha = 0;
      el.fadeSpeed = 0.06; // Fade out quickly
    });

    const newElements: AnimElement[] = [];

    // Colors matching brand palette
    const pink = "#ff3f6c";
    const purple = "#a855f7";
    const cyan = "#06b6d4";
    const yellow = "#fbbf24";

    // Spawn elements tailored to current theme
    if (theme === "audio") {
      // Spawn audio expanding ripple seeds
      for (let i = 0; i < 4; i++) {
        newElements.push(
          new SoundRing(
            Math.random() * width,
            Math.random() * height,
            100 + Math.random() * 120,
            i % 2 === 0 ? pink : cyan
          )
        );
      }
    } else if (theme === "gaming") {
      // Spawn game controllers and retro floating shapes
      const count = Math.min(12, Math.floor(width / 90));
      for (let i = 0; i < count; i++) {
        newElements.push(
          new GamingShape(
            Math.random() * width,
            Math.random() * height,
            24 + Math.random() * 20,
            i % 2 === 0 ? pink : purple
          )
        );
      }
    } else if (theme === "camera") {
      // Spawn camera focus brackets & soft bokeh blur dots
      const bracketCount = 3 + Math.floor(Math.random() * 2);
      for (let i = 0; i < bracketCount; i++) {
        newElements.push(
          new FocusBracket(
            width * 0.2 + Math.random() * (width * 0.6),
            height * 0.2 + Math.random() * (height * 0.6),
            22 + Math.random() * 10,
            yellow
          )
        );
      }
      // Floating soft bokeh
      const bokehCount = Math.min(15, Math.floor(width / 80));
      for (let i = 0; i < bokehCount; i++) {
        newElements.push(
          new BokehBubble(
            Math.random() * width,
            Math.random() * height,
            8 + Math.random() * 16,
            i % 3 === 0 ? pink : i % 3 === 1 ? purple : cyan
          )
        );
      }
    } else if (theme === "phone") {
      // Mobile app grids and wireless network nodes
      const appCount = Math.min(6, Math.floor(width / 180));
      for (let i = 0; i < appCount; i++) {
        newElements.push(
          new AppIcon(
            Math.random() * width,
            Math.random() * height,
            36 + Math.random() * 8,
            cyan
          )
        );
      }
      // Network nodes
      const nodeCount = Math.min(20, Math.floor(width / 60));
      for (let i = 0; i < nodeCount; i++) {
        newElements.push(
          new NetworkNode(
            Math.random() * width,
            Math.random() * height,
            1.5 + Math.random() * 2,
            pink
          )
        );
      }
    } else {
      // Computer / General Tech Theme: binary stream code columns & circuit board traces
      const streamCount = Math.min(18, Math.floor(width / 70));
      for (let i = 0; i < streamCount; i++) {
        newElements.push(
          new BinaryStream(
            Math.random() * width,
            Math.random() * height - height/2,
            10 + Math.random() * 4,
            "#10b981" // Tech green binary streams
          )
        );
      }
      // Circuit trace paths
      const circuitCount = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < circuitCount; i++) {
        newElements.push(
          new CircuitPath(
            Math.random() * width,
            Math.random() * height,
            pink
          )
        );
      }
    }

    elementsRef.current = [...elementsRef.current, ...newElements];
  }, [theme]);

  // Main animation loop inside canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localFrameId: number;

    const loop = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      // 1. Clear Canvas with high-contrast noir background
      ctx.clearRect(0, 0, width, height);

      // 2. Draw static background rules & shapes relative to theme
      drawThemeBackground(ctx, theme, width, height, mouseRef.current.x, mouseRef.current.y, audioPhaseRef);

      // 3. Update and draw all active custom elements
      const activeElements = elementsRef.current;
      for (let i = activeElements.length - 1; i >= 0; i--) {
        const el = activeElements[i];
        el.update(width, height, mouseRef.current.x, mouseRef.current.y);
        el.draw(ctx);

        // Remove elements that have fully faded out
        if (el.isDead) {
          activeElements.splice(i, 1);
        }
      }

      // 4. Periodically spawn background details if count is low
      maintainThemeElements(theme, activeElements, width, height);

      // 5. Connect Phone network nodes if applicable
      if (theme === "phone") {
        drawNetworkLinks(ctx, activeElements, mouseRef.current.x, mouseRef.current.y);
      }

      audioPhaseRef.current += 0.025;
      localFrameId = requestAnimationFrame(loop);
    };

    localFrameId = requestAnimationFrame(loop);
    animationFrameRef.current = localFrameId;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
      <canvas ref={canvasRef} className="absolute inset-0 block pointer-events-none" />
    </div>
  );
}

// ----------------------------------------------------
// Helper Functions for Custom Background Drawing
// ----------------------------------------------------

// Draws custom back-drop grid overlay details based on the current category theme
function drawThemeBackground(
  ctx: CanvasRenderingContext2D,
  theme: ThemeType,
  width: number,
  height: number,
  mouseX: number,
  mouseY: number,
  phaseRef: React.MutableRefObject<number>
) {
  ctx.save();

  if (theme === "audio") {
    // Renders overlapping horizontal audio sine waves flowing at the bottom half
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.18;

    const waveCount = 3;
    const colors = ["#ff3f6c", "#06b6d4", "#a855f7"];
    const speeds = [1, 1.4, 0.7];
    const amplitudes = [22, 14, 28];
    const frequencies = [0.006, 0.012, 0.004];

    for (let w = 0; w < waveCount; w++) {
      ctx.strokeStyle = colors[w];
      ctx.beginPath();
      const p = phaseRef.current * speeds[w];
      const yOffset = height * 0.65 + w * 12;

      for (let x = 0; x <= width; x += 4) {
        // Form: y = amp * sin(freq * x + phase)
        const y = yOffset + amplitudes[w] * Math.sin(frequencies[w] * x + p);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Bouncing simulated frequency spectrum bars at the absolute bottom
    const barWidth = 6;
    const barGap = 4;
    const totalBars = Math.floor(width / (barWidth + barGap));
    ctx.fillStyle = "#ff3f6c";
    ctx.globalAlpha = 0.08;
    for (let b = 0; b < totalBars; b++) {
      // Frequency values simulated with dynamic sine combination
      const freqVal = Math.sin(b * 0.12 + phaseRef.current * 1.5) * Math.cos(b * 0.05 - phaseRef.current * 0.8);
      const val = Math.max(8, (freqVal + 1) * 30 + Math.random() * 8);
      ctx.fillRect(b * (barWidth + barGap), height - val, barWidth, val);
    }

  } else if (theme === "gaming") {
    // Renders custom wireframe cross grid overlay
    ctx.strokeStyle = "rgba(255, 63, 108, 0.05)";
    ctx.lineWidth = 1;
    
    // Draw crosshair axes
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Subtle neon target loops in the center background
    ctx.strokeStyle = "rgba(168, 85, 247, 0.06)";
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 80, 0, Math.PI * 2);
    ctx.arc(width / 2, height / 2, 160, 0, Math.PI * 2);
    ctx.stroke();

  } else if (theme === "camera") {
    // Draws rule-of-thirds photography composition grid
    ctx.strokeStyle = "rgba(251, 191, 36, 0.04)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Verticals
    ctx.moveTo(width / 3, 0);
    ctx.lineTo(width / 3, height);
    ctx.moveTo((width * 2) / 3, 0);
    ctx.lineTo((width * 2) / 3, height);

    // Horizontals
    ctx.moveTo(0, height / 3);
    ctx.lineTo(width, height / 3);
    ctx.moveTo(0, (height * 2) / 3);
    ctx.lineTo(width, (height * 2) / 3);
    ctx.stroke();

    // Renders lens aperture ring rotating in the center back
    ctx.strokeStyle = "rgba(251, 191, 36, 0.035)";
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.5, 180, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.save();
    ctx.translate(width * 0.8, height * 0.5);
    ctx.rotate(phaseRef.current * 0.05);
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, 180);
      ctx.lineTo(120, 0);
      ctx.stroke();
    }
    ctx.restore();

  } else if (theme === "phone") {
    // Draws circular expanding radio transmitter waves (WiFi signal source)
    ctx.strokeStyle = "rgba(6, 182, 212, 0.08)";
    ctx.lineWidth = 1.5;
    
    // Wave transmitter point at top right corner
    const sourceX = width * 0.9;
    const sourceY = height * 0.15;
    const baseRadius = (phaseRef.current * 30) % 200;
    
    ctx.beginPath();
    ctx.arc(sourceX, sourceY, baseRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sourceX, sourceY, (baseRadius + 100) % 200, 0, Math.PI * 2);
    ctx.stroke();

  } else {
    // Computer / general tech: Renders a matrix dots grid
    ctx.fillStyle = "rgba(255, 63, 108, 0.05)";
    const dotSpacing = 30;
    const hoverRadius = 80;

    for (let x = dotSpacing / 2; x < width; x += dotSpacing) {
      for (let y = dotSpacing / 2; y < height; y += dotSpacing) {
        let size = 1;

        // Highlight dots close to mouse cursor
        if (mouseX > 0 && mouseY > 0) {
          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.hypot(dx, dy);
          if (dist < hoverRadius) {
            size = 2.5 * (1 - dist / hoverRadius);
            ctx.fillStyle = "rgba(255, 63, 108, 0.28)";
          } else {
            ctx.fillStyle = "rgba(255, 63, 108, 0.05)";
          }
        }
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

// Spawns replacement elements over time if current counts are low
function maintainThemeElements(theme: ThemeType, elements: AnimElement[], width: number, height: number) {
  // Filter active (not fading out) items
  const activeCount = elements.filter(el => el.targetAlpha > 0).length;

  const pink = "#ff3f6c";
  const purple = "#a855f7";
  const cyan = "#06b6d4";
  const yellow = "#fbbf24";

  if (theme === "audio") {
    if (activeCount < 4) {
      elements.push(new SoundRing(Math.random() * width, Math.random() * height, 100 + Math.random() * 120, Math.random() > 0.5 ? pink : cyan));
    }
  } else if (theme === "gaming") {
    const maxGaming = Math.min(12, Math.floor(width / 90));
    if (activeCount < maxGaming) {
      elements.push(new GamingShape(Math.random() * width, height + 30, 24 + Math.random() * 20, Math.random() > 0.5 ? pink : purple));
    }
  } else if (theme === "camera") {
    const maxBokeh = Math.min(15, Math.floor(width / 80));
    if (activeCount < maxBokeh) {
      elements.push(new BokehBubble(Math.random() * width, height + 20, 8 + Math.random() * 16, Math.random() > 0.5 ? pink : cyan));
    }
    if (elements.filter(el => el instanceof FocusBracket && el.targetAlpha > 0).length < 2) {
      elements.push(new FocusBracket(width * 0.2 + Math.random() * (width * 0.6), height * 0.2 + Math.random() * (height * 0.6), 22 + Math.random() * 10, yellow));
    }
  } else if (theme === "phone") {
    const maxApps = Math.min(6, Math.floor(width / 180));
    if (elements.filter(el => el instanceof AppIcon && el.targetAlpha > 0).length < maxApps) {
      elements.push(new AppIcon(Math.random() * width, Math.random() * height, 36 + Math.random() * 8, cyan));
    }
    const maxNodes = Math.min(20, Math.floor(width / 60));
    if (elements.filter(el => el instanceof NetworkNode && el.targetAlpha > 0).length < maxNodes) {
      elements.push(new NetworkNode(Math.random() * width, Math.random() * height, 1.5 + Math.random() * 2, pink));
    }
  } else {
    // Computer / general
    const maxStreams = Math.min(18, Math.floor(width / 70));
    if (elements.filter(el => el instanceof BinaryStream && el.targetAlpha > 0).length < maxStreams) {
      elements.push(new BinaryStream(Math.random() * width, -60, 10 + Math.random() * 4, "#10b981"));
    }
    if (elements.filter(el => el instanceof CircuitPath && el.targetAlpha > 0).length < 4) {
      elements.push(new CircuitPath(Math.random() * width, Math.random() * height, pink));
    }
  }
}

// Phone Theme: draws interconnected network wire lines between close nodes
function drawNetworkLinks(ctx: CanvasRenderingContext2D, elements: AnimElement[], mouseX: number, mouseY: number) {
  const nodes = elements.filter(el => el instanceof NetworkNode) as NetworkNode[];
  ctx.save();
  ctx.strokeStyle = "rgba(6, 182, 212, 0.08)";
  ctx.lineWidth = 1;

  for (let i = 0; i < nodes.length; i++) {
    const nodeA = nodes[i];
    
    // Connect to other nearby nodes
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeB = nodes[j];
      const dx = nodeA.x - nodeB.x;
      const dy = nodeA.y - nodeB.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 85) {
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 * (1 - dist / 85) * Math.min(nodeA.alpha, nodeB.alpha)})`;
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.stroke();
      }
    }

    // Connect to mouse if close
    if (mouseX > 0 && mouseY > 0) {
      const dxMouse = nodeA.x - mouseX;
      const dyMouse = nodeA.y - mouseY;
      const distMouse = Math.hypot(dxMouse, dyMouse);
      
      if (distMouse < 110) {
        ctx.strokeStyle = `rgba(255, 63, 108, ${0.22 * (1 - distMouse / 110) * nodeA.alpha})`;
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function getSlideTheme(slide: CarouselSlide): ThemeType {
  const text = `${slide.title} ${slide.subtitle} ${slide.description}`.toLowerCase();
  if (text.includes("audio") || text.includes("headphone") || text.includes("earbud") || text.includes("sound") || text.includes("speaker") || text.includes("acoustic")) {
    return "audio";
  }
  if (text.includes("game") || text.includes("gaming") || text.includes("play") || text.includes("controller") || text.includes("console") || text.includes("gamepad")) {
    return "gaming";
  }
  if (text.includes("camera") || text.includes("eos") || text.includes("photo") || text.includes("lens") || text.includes("photography") || text.includes("shutter")) {
    return "camera";
  }
  if (text.includes("phone") || text.includes("mobile") || text.includes("smartphone") || text.includes("iphone") || text.includes("cellular")) {
    return "phone";
  }
  if (text.includes("laptop") || text.includes("computer") || text.includes("keyboard") || text.includes("pc") || text.includes("monitor") || text.includes("screen") || text.includes("display")) {
    return "computer";
  }
  return "general";
}

