/**
 * Simple particle system game
 * Particles bounce around the screen and respond to touch input
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  g: number;
  b: number;
  size: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private readonly maxParticles = 100;
  private attractors: { x: number; y: number }[] = [];

  constructor(particleCount: number = 50) {
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(this.createRandomParticle());
    }
  }

  private createRandomParticle(): Particle {
    return {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      r: Math.random(),
      g: Math.random(),
      b: Math.random(),
      size: 0.02 + Math.random() * 0.03,
    };
  }

  update(deltaTime: number): void {
    const dt = Math.min(deltaTime / 16, 2); // Normalize to ~60fps, cap at 2x

    for (const particle of this.particles) {
      // Apply attractor forces
      for (const attractor of this.attractors) {
        const dx = attractor.x - particle.x;
        const dy = attractor.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0.01) {
          const force = 0.0005 * dt;
          particle.vx += (dx / dist) * force;
          particle.vy += (dy / dist) * force;
        }
      }

      // Update position
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      // Bounce off edges
      if (particle.x < -1 || particle.x > 1) {
        particle.vx *= -0.8;
        particle.x = Math.max(-1, Math.min(1, particle.x));
      }
      if (particle.y < -1 || particle.y > 1) {
        particle.vy *= -0.8;
        particle.y = Math.max(-1, Math.min(1, particle.y));
      }

      // Apply damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;
    }
  }

  setAttractors(positions: { x: number; y: number }[]): void {
    this.attractors = positions;
  }

  addParticle(x: number, y: number): void {
    if (this.particles.length < this.maxParticles) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.03,
        vy: (Math.random() - 0.5) * 0.03,
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        size: 0.02 + Math.random() * 0.03,
      });
    }
  }

  getVertexData(): Float32Array {
    // Each particle is rendered as 2 triangles (6 vertices)
    // Each vertex has 2 position floats + 4 color floats = 6 floats
    const data = new Float32Array(this.particles.length * 6 * 6);
    
    let offset = 0;
    for (const particle of this.particles) {
      const { x, y, size, r, g, b } = particle;
      
      // Triangle 1
      // Vertex 0 (top-left)
      data[offset++] = x - size;
      data[offset++] = y + size;
      data[offset++] = r;
      data[offset++] = g;
      data[offset++] = b;
      data[offset++] = 1.0;
      
      // Vertex 1 (top-right)
      data[offset++] = x + size;
      data[offset++] = y + size;
      data[offset++] = r;
      data[offset++] = g;
      data[offset++] = b;
      data[offset++] = 1.0;
      
      // Vertex 2 (bottom-left)
      data[offset++] = x - size;
      data[offset++] = y - size;
      data[offset++] = r;
      data[offset++] = g;
      data[offset++] = b;
      data[offset++] = 1.0;
      
      // Triangle 2
      // Vertex 3 (top-right)
      data[offset++] = x + size;
      data[offset++] = y + size;
      data[offset++] = r;
      data[offset++] = g;
      data[offset++] = b;
      data[offset++] = 1.0;
      
      // Vertex 4 (bottom-right)
      data[offset++] = x + size;
      data[offset++] = y - size;
      data[offset++] = r;
      data[offset++] = g;
      data[offset++] = b;
      data[offset++] = 1.0;
      
      // Vertex 5 (bottom-left)
      data[offset++] = x - size;
      data[offset++] = y - size;
      data[offset++] = r;
      data[offset++] = g;
      data[offset++] = b;
      data[offset++] = 1.0;
    }
    
    return data;
  }

  getParticleCount(): number {
    return this.particles.length;
  }
}
