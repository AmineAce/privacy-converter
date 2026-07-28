import { describe, it, expect } from 'vitest'
import { ProgressTracker } from './progress'

describe('ProgressTracker', () => {
  it('initialises with given total', () => {
    const tracker = new ProgressTracker(10)
    expect(tracker.total).toBe(10)
    expect(tracker.completed).toBe(0)
    expect(tracker.errors).toBe(0)
  })

  it('increments completed count', () => {
    const tracker = new ProgressTracker(5)
    tracker.incrementCompleted()
    expect(tracker.completed).toBe(1)
    tracker.incrementCompleted(2)
    expect(tracker.completed).toBe(3)
  })

  it('increments errors count', () => {
    const tracker = new ProgressTracker(5)
    tracker.incrementErrors()
    expect(tracker.errors).toBe(1)
    tracker.incrementErrors(3)
    expect(tracker.errors).toBe(4)
  })

  it('calculates percentage as (completed + errors) / total * 100', () => {
    const tracker = new ProgressTracker(10)
    tracker.incrementCompleted(3)
    tracker.incrementErrors(1)
    expect(tracker.percentage).toBe(40)
  })

  it('returns 100 when completed equals total', () => {
    const tracker = new ProgressTracker(5)
    tracker.incrementCompleted(5)
    expect(tracker.percentage).toBe(100)
  })

  it('returns NaN for percentage when total is 0', () => {
    const tracker = new ProgressTracker(0)
    expect(tracker.percentage).toBeNaN()
  })

  it('rounds percentage to nearest integer', () => {
    const tracker = new ProgressTracker(3)
    tracker.incrementCompleted(1)
    expect(tracker.percentage).toBe(33)
  })
})
