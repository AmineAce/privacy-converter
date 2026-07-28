export class ProgressTracker {
  completed = 0
  errors = 0
  total = 0

  constructor(total: number) {
    this.total = total
  }

  incrementCompleted(amount = 1) {
    this.completed += amount
  }

  incrementErrors(amount = 1) {
    this.errors += amount
  }

  get percentage() {
    return Math.round(((this.completed + this.errors) / this.total) * 100)
  }
}
