import { expect, use } from 'chai';
import { codeMatchers } from '../code-matchers/index.js';

use(codeMatchers);

const CODE = `const a=1;`;
const EQUIVALENT = `const a = 1`;
const FORMATTED_CODE = `const a = 1;\n`;

const MULTILINE = `const a=1;
                   const b=2;`;
const MULTILINE_EQUIVALENT = `const a = 1;
                              const b = 2`;
const FORMATTED_MULTILINE = `const a = 1;\nconst b = 2;\n`;

describe('matchCode', () => {
    describe('sanity', () => {
        it('assert codes are equal', async () => {
            await expect(CODE).to.matchCode(CODE);
        });
        it('assert codes are equivalent', async () => {
            await expect(CODE).to.matchCode(EQUIVALENT);
        });
        it('assert codes are not equal', async () => {
            await expect(CODE).not.to.matchCode(`const some="random code";`);
        });
        it('throws when code is not a equivalent', async () => {
            const expectedCode = `const some="random code";`;
            const formattedExpectedCode = `const some = 'random code';`;
            await expect(expect(CODE).to.matchCode(expectedCode)).to.be.rejectedWith(
                `Actual code expected to match code:\n` +
                    `---- Actual code:\n${FORMATTED_CODE}\n` +
                    `---- Expected code:\n${formattedExpectedCode}`,
            );
        });
    });
    describe('multi line', () => {
        it('assert code are equal', async () => {
            await expect(MULTILINE).to.matchCode(MULTILINE);
        });
        it('assert code are equivalent', async () => {
            await expect(MULTILINE).to.matchCode(MULTILINE_EQUIVALENT);
        });
        it('assert code are not equal', async () => {
            await expect(MULTILINE).to.not.matchCode(`const a=1;
                                                const c=false;`);
        });
    });
});

describe('includeCode', () => {
    it('assert code is contained', async () => {
        await expect(MULTILINE).to.includeCode(`const a = 1;`);
        await expect(MULTILINE).to.includeCode(`const b = 2;`);
    });
    describe('when formatContained = true', () => {
        it('assert equivalent code is contained', async () => {
            await expect(MULTILINE).to.includeCode(MULTILINE, true);
            await expect(MULTILINE).to.includeCode(`const      b= 2;`, true);
        });
    });
    it('contained code is not formatted', async () => {
        await expect(`const a = {
            a: 1,
            b: 2
        }
        `).to.includeCode(`b: 2`);
    });
    it('assert equivalent code is not contained', async () => {
        await expect(MULTILINE).not.to.includeCode(`const NOT='included';`);
    });
    it('throws when code is not a equivalent', async () => {
        const expectedCode = `const some="random code";`;
        await expect(expect(MULTILINE).to.includeCode(expectedCode)).to.be.rejectedWith(
            `Actual code expected to include code:\n` +
                `---- Actual code:\n${FORMATTED_MULTILINE}\n` +
                `---- Expected code:\n${expectedCode}`,
        );
    });
});
