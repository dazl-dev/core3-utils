/**
 * @packageDocumentation
 * Utils for making mocha + chai testing easy and fun
 *
 * @remarks
 * [[[h 3 Env variables]]]
 * - DEBUG=true/positive number env variable will set test timeouts and time scale to infinity so tests (that don't explicitly override timeout) will not time out on breakpoints
 *
 * - TIMEOUT_MULTIPLIER=number env variable will multiply all test timeouts by the given number
 *
 * [[[h 3 Test timeout manipulation]]]
 *
 * - {@link scaleTimeout} multiplies timeouts when debugging or running on slow CI machines, based on TIMEOUT_MULTIPLIER and DEBUG env variables
 *
 * - {@link adjustTestTime} adjusts current test timeout (for use in non step async actions)
 *
 * - {@link locatorTimeout} creates a locator timeout and adjust the current test
 *
 */
export * from './safe-fake-timer.js';
export * from './dispose.js';
export * from './randomize-tests-order.js';
export * from './mocha-ctx.js';
export * from './chai-retry-plugin/index.js';
export * from './code-matchers/index.js';
export * from './timeouts.js';
