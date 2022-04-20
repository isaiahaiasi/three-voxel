export function createRange(start: number, end: number, step = 1) {
  return {
    [Symbol.iterator]() {
      let counter = 0;
      let nextIndex = start;
      return {
        next: () => {
          if (nextIndex < end) {
            const result = { value: nextIndex, done: false };
            nextIndex += step;
            return result;
          } else {
            return { value: counter, done: true };
          }
        }
      };
    }
  };
}

export function deepLoop(ranges: Iterable<number>[], fn: any) {
  function recursiveLoop(
    values: number[],
    ranges: Iterable<number>[],
    fn: any
  ) {
    if (ranges.length === 1) {
      [...ranges[0]].forEach((i) => fn(...values, i));
    } else {
      [...ranges[0]].forEach((i) => {
        recursiveLoop([...values, i], ranges.slice(1), fn);
      });
    }
  }

  if (ranges.length === 0) {
    console.warn("Executed deep loop without a range.");
  } else if (ranges.length === 1) {
    console.warn("Executed deep loop with only a single range.");
    [...ranges[0]].forEach((i) => fn(i));
  } else {
    [...ranges[0]].forEach((i) => {
      recursiveLoop([i], ranges.slice(1), fn);
    });
  }
}
