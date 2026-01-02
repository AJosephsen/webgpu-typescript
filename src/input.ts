/**
 * Input handling for touch and mouse events
 * Optimized for iOS Safari
 */

export interface TouchPoint {
  x: number; // Normalized to [-1, 1]
  y: number; // Normalized to [-1, 1]
  id: number;
}

export class InputHandler {
  private touches: Map<number, TouchPoint> = new Map();
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });

    // Mouse events (for desktop testing)
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
  }

  private normalizePosition(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    // Convert to [-1, 1] range
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((clientY - rect.top) / rect.height) * 2 - 1); // Flip Y axis
    return { x, y };
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const pos = this.normalizePosition(touch.clientX, touch.clientY);
      this.touches.set(touch.identifier, {
        x: pos.x,
        y: pos.y,
        id: touch.identifier,
      });
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const pos = this.normalizePosition(touch.clientX, touch.clientY);
      const existingTouch = this.touches.get(touch.identifier);
      if (existingTouch) {
        existingTouch.x = pos.x;
        existingTouch.y = pos.y;
      }
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touches.delete(touch.identifier);
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    const pos = this.normalizePosition(event.clientX, event.clientY);
    this.touches.set(-1, { x: pos.x, y: pos.y, id: -1 });
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.touches.has(-1)) {
      const pos = this.normalizePosition(event.clientX, event.clientY);
      this.touches.set(-1, { x: pos.x, y: pos.y, id: -1 });
    }
  }

  private handleMouseUp(): void {
    this.touches.delete(-1);
  }

  getTouches(): TouchPoint[] {
    return Array.from(this.touches.values());
  }

  getTouchCount(): number {
    return this.touches.size;
  }
}
