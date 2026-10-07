function pick<T>(list: readonly T[], index: number): T {
  const item = list[Math.min(Math.max(index, 0), list.length - 1)]
  if (item === undefined) throw new Error('Cannot pick from an empty list')
  return item
}

export { pick }
