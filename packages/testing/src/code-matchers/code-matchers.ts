import { noIdents } from '@dazl/common';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import type * as prettier from 'prettier';
import * as esTreePlugin from 'prettier/plugins/estree';
import * as parserTypeScript from 'prettier/plugins/typescript';
import { format } from 'prettier/standalone';

use(chaiAsPromised);

const prettify = async (code: string, options?: prettier.Options | false) =>
    options === false
        ? code
        : await format(
              code,
              options || {
                  parser: 'typescript',
                  plugins: [esTreePlugin as prettier.Plugin, parserTypeScript],
                  endOfLine: 'lf',
                  singleQuote: true,
              },
          );

const regex = /(\/\*)([^/*]*)(\*\/)/g;

const mapper = (str: string, idx: number) => {
    if (idx % 4 === 2) {
        return str
            .split(/\s*([^\s]*)/g)
            .map((str, idx) => {
                if (idx % 2) {
                    return str.split(/[\n\r\s]*([^\s]*)/g).join(' ');
                }
                return str;
            })
            .join('');
    }
    return str;
};

/**
 * We align the comments using a regex because prettier does not
 */
const alignComments = (code: string) => code.split(regex).map(mapper).join('');

const validateToBeString: (testedExpression: unknown, semanticName?: string) => asserts testedExpression is string = (
    testedExpression,
    semanticName = 'Expression',
) => {
    if (typeof testedExpression !== 'string') {
        throw new Error(`${semanticName} is not a string: ${String(testedExpression)}`);
    }
};
export const codeMatchers: Chai.ChaiPlugin = (chai, utils) => {
    async function matchCode(this: Chai.AssertionStatic, expectedCode: string, options?: prettier.Options | false) {
        const testedExpression = utils.flag(this, 'object') as object;

        validateToBeString(testedExpression, 'Actual code');
        validateToBeString(expectedCode, 'Expected code');

        const actual = alignComments(await prettify(testedExpression, options));
        const expected = alignComments(await prettify(expectedCode, options));

        const codeBlocks = `---- Actual code:\n${actual}\n---- Expected code:\n${expected}`;

        this.assert(
            actual === expected,
            `Actual code expected to match code:\n${codeBlocks}`,
            `Actual code expected not to match code:\n${codeBlocks}`,
            expected,
            actual,
        );
    }

    async function includeCode(
        this: Chai.AssertionStatic,
        expectedCode: string,
        formatExpected = false,
        options?: prettier.Options | false,
    ) {
        const testedExpression = utils.flag(this, 'object') as object;

        validateToBeString(testedExpression, 'Actual code');
        validateToBeString(expectedCode, 'Expected code');

        const actual = noIdents(alignComments(await prettify(testedExpression, options)));
        const expected = formatExpected ? noIdents(alignComments(await prettify(expectedCode, options))) : expectedCode;

        const codeBlocks = `---- Actual code:\n${actual}\n---- Expected code:\n${expected}`;

        this.assert(
            actual.includes(expected),
            `Actual code expected to include code:\n${codeBlocks}`,
            `Actual code expected not to include code:\n${codeBlocks}`,
            expected,
            actual,
        );
    }

    chai.Assertion.addMethod('matchCode', matchCode);
    chai.Assertion.addMethod('matchesCode', matchCode);
    chai.Assertion.addMethod('includeCode', includeCode);
    chai.Assertion.addMethod('includesCode', includeCode);
};
