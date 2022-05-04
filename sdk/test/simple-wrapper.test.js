const assert = require('assert');
const parser = require('../classes/parsers/wrapper');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/simple-wrapper.html');
const content = fs.readFileSync(file, 'utf8');
const { wrapper, uploads } = parser.parse(file, content);

describe('Simple Wrapper', () => {
    wrapper.head = wrapper.head.replace(/(?<!\r)\n/g, "\r\n");
    wrapper.foot = wrapper.foot.replace(/(?<!\r)\n/g, "\r\n");
    it('should not find any uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find a wrapper', () => {
        assert.strictEqual(wrapper.name, "Simple Wrapper");
    });
    it('should have the expected header and footer', () => {
        assert.strictEqual(wrapper.head.length, 191);
        assert.strictEqual(wrapper.head.indexOf("<h1>Simple Wrapper</h1>"), 117);
        assert.strictEqual(wrapper.foot.length, 95);
        assert.strictEqual(wrapper.foot.indexOf("<h2>Simple Wrapper</h2>"), 39);
    });
});