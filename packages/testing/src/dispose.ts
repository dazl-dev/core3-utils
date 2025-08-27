import {
    createDisposables,
    DEFAULT_GROUP,
    type DisposableOptions,
    type DisposableItem,
    type GroupConstraints,
} from '@dazl/patterns';
import { _afterEach } from './mocha-helpers.js';

const disposables = createDisposables('global afterDispose');
export const DEFAULT_DISPOSAL_GROUP = DEFAULT_GROUP;

/**
 * @deprecated create new Disposables and use them instead with afterEach
 *
 * Disposes of test resources after the test is done
 * @example
 * ```ts
 * it('test', () => {
 *      const listener = () =>{}
 *      someService.on('event', listener)
 *      disposeAfter(() => someService.off('event', listener), {name: 'remove listener', timeout:100})
 * })
 * ```
 */
export function disposeAfter(disposable: DisposableItem, options: string | Omit<DisposableOptions, 'dispose'>) {
    if (typeof options === 'string') {
        disposables.add({ name: options, dispose: disposable });
    } else {
        disposables.add({ ...options, dispose: disposable });
    }
}

/**
 * Creates a new disposal group
 * @example
 * ```ts
 * it('test', () => {
 *      createDisposalGroup('group1', { before: DisposalGroups.DEFAULT_GROUP })
 *      disposeAfter(() => {}) // will be disposed in default group
 *      disposeAfter(() => {}, 'group1') // will be disposed before the default group
 * })
 * ```
 *
 * @param name disposal group name, must be unique
 * @param constraints disposal group must have constrains, either before or after another group(s)
 */
export function createDisposalGroup(name: string, constraints: GroupConstraints[] | GroupConstraints) {
    disposables.registerGroup(name, constraints);
}

/**
 * @deprecated just call init and add to test disposables
 * Runs target.init and disposes of it after the test is done
 *  * @example
 * ```ts
 * it('test', async () => {
 *      const myService = {
 *         init: (a:string) => {console.log(a)},
 *         dispose: () => {console.log('disposed')}
 *      }
 *      await initAndDisposeAfter(myService, 'hello') // logs 'hello'
 * })
 * // logs 'disposed' after the test is done
 * ```
 * @returns init result
 */
export async function initAndDisposeAfter<T extends (...args: any[]) => any>(
    target: { init: T } & DisposableItem,
    options: string | Omit<DisposableOptions, 'dispose'>,
    ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>> {
    disposeAfter(target, options);
    const res = target.init(...args) as ReturnType<T>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await Promise.resolve(res);
}

_afterEach('disposing', async function () {
    const list = disposables.list();
    this.timeout(list.totalTimeout);
    try {
        await disposables.dispose();
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(list);
        throw e;
    }
});
