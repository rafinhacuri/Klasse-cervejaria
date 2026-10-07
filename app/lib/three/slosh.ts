class Slosh {
  value = 0
  velocity = 0

  step(force: number, dt: number): number {
    this.velocity += (force - this.value * 70 - this.velocity * 2.4) * dt
    this.value += this.velocity * dt
    return this.value
  }
}

export { Slosh }
