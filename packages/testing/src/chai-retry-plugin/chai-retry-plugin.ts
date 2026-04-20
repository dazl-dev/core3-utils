import * as chai from 'chai';
import type { PromiseLikeAssertion } from '../types.js';
import { retryFunctionAndAssertions } from './helpers.js';
import type { Assertion, AssertionMethod, AssertionStackItem, FunctionToRetry, RetryOptions } from './types.js';

/**
 * @deprecated use `waitFor` from 'promise-assist' instead
 *
 * Plugin that allows to re-run function passed to `expect`, in order to achieve that use new `retry` method, retrying would be performed until
 * the result will pass the chained assertion or timeout exceeded or retries limit reached.
 * Should be applied through `chai.use` function, for example:
 * @example
 * ```ts
 * import chai from 'chai';
 * import { chaiRetryPlugin } from '@dazl/testing';
 *
 * chai.use(chaiRetryPlugin);
 * ```
 *
 * Examples of usage:
 * @example
 * ```ts
 * await expect(funcToRetry).retry().have.property('value').and.be.above(4);
 * ```
 * @example
 * ```ts
 * await expect(sometimesNullFunction).retry({ retries: 5, delay: 10, timeout: 2000 }).to.be.not.null;
 * ```
 * @example
 * ```ts
 * await expect(funcToRetry).retry().and.have.property('success').and.be.true;
 * ```
 */
export const chaiRetryPlugin = function (_: Chai.ChaiStatic, utils: Chai.ChaiUtils) {
    Object.defineProperty(chai.Assertion.prototype, 'retry', {
        value: function (retryOptions: RetryOptions = {}): PromiseLikeAssertion {
            const functionToRetry: FunctionToRetry = utils.flag(this as Chai.AssertStatic, 'object') as FunctionToRetry;
            const description = utils.flag(this as Chai.AssertStatic, 'message') as string;

            if (typeof functionToRetry !== 'function') {
                throw new TypeError(
                    `Please pass function to \`expect\` in order to use \`chaiRetryPlugin\`. ${utils.inspect(functionToRetry)} is not a function.`,
                );
            }

            const defaultRetryOptions: Required<RetryOptions> = { timeout: 8_000, retries: Infinity, delay: 0 };
            const options: Required<RetryOptions> = { ...defaultRetryOptions, ...retryOptions };

            const assertionStack: AssertionStackItem[] = [];
            // Fake assertion object for catching calls of chained methods
            const proxyTarget = new chai.Assertion({});

            const assertionProxy: PromiseLikeAssertion = Object.assign(
                new Proxy(proxyTarget, {
                    get: proxyGetter,
                }),
                {
                    then: (resolve: () => void, reject: () => void) => {
                        return retryFunctionAndAssertions({
                            functionToRetry,
                            options,
                            assertionStack,
                            description,
                        }).then(resolve, reject);
                    },
                },
            ) as unknown as PromiseLikeAssertion;

            return assertionProxy;

            function proxyGetter(target: Assertion, key: string, proxySelf: Assertion): Chai.Assertion {
                let value: Chai.Assertion | undefined;

                try {
                    // if `value` is a getter property that may immediately perform the assertion and throw the AssertionError
                    value = target[key as keyof Chai.Assertion] as Assertion;
                } catch {
                    //
                }

                const assertionStackItem: AssertionStackItem = {
                    propertyName: key as keyof Chai.Assertion,
                };
                if (typeof value === 'function') {
                    if (key !== 'then') {
                        assertionStack.push(assertionStackItem);
                    }
                    return new Proxy(value, {
                        get: function (target, key: string) {
                            return proxyGetter(target as Assertion, key, proxySelf);
                        },
                        apply: function (_, __, args: unknown[]) {
                            if (key === 'then') {
                                return (value as unknown as AssertionMethod)(...args);
                            }

                            assertionStackItem.method = value as unknown as AssertionMethod;
                            assertionStackItem.args = args;

                            return proxySelf;
                        },
                    });
                } else {
                    assertionStack.push(assertionStackItem);
                }

                return proxySelf;
            }
        },
        writable: false,
        configurable: false,
    });
};
