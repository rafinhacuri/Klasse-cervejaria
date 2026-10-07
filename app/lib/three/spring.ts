export class Spring {
  value: number
  velocity = 0

  constructor(value: number) {
    this.value = value
  }

  step(target: number, dt: number, omega: number): number {
    const acceleration = omega * omega * (target - this.value) - 2 * omega * this.velocity
    this.velocity += acceleration * dt
    this.value += this.velocity * dt
    return this.value
  }

  snap(value: number): void {
    this.value = value
    this.velocity = 0
  }
}
