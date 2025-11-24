const WAS_ADJUSTED = Symbol('__timeoutWasAdjusted');

export function isAdjustedTimeout<T extends object>(x: T): boolean {
    return !!(x as { [WAS_ADJUSTED]?: boolean })[WAS_ADJUSTED];
}

export function markAdjustedTimeout<T extends object>(x: T): T {
    x[WAS_ADJUSTED as keyof T] = true as T[keyof T];
    return x;
}
