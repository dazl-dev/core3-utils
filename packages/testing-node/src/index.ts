/**
 * @packageDocumentation
 * Utils for making mocha + chai testing easy and fun
 *
 * @remarks
 * [[[h 3 Test timeout manipulation]]]
 * - DEBUG=true env variable will set test timeouts and time dilation to infinity so tests (that don't explicitly override timeout) will not time out on breakpoints
 *
 * - {@link timeDilation} multiplies {@link step} timeouts when debugging or running on slow CI machines
 *
 * - {@link adjustTestTime} adjusts current test timeout (for use in non step async actions)
 *
 * - {@link locatorTimeout} creates a locator timeout and adjust the current test
 */

export * from './temp-test-dir.js';
