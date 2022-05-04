const assert = require('assert');
const parser = require('../classes/parsers/page');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/page-with-scaffold.vue');
const content = fs.readFileSync(file, 'utf8');
const { pages, uploads } = parser.parse(content, file);

describe('Page With Scaffold', () => {
    if (pages.length > 0 && pages[0].content && pages[0].content.replace) {
        pages[0].content = pages[0].content.replace(/(?<!\r)\n/g, "\r\n");
    }
    it('should find no uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find one page', () => {
        assert.strictEqual(pages.length, 1);
        assert.strictEqual(pages[0].name, "PageWithScaffold");
        assert.strictEqual(pages[0].content, "<div>\r\n    <h1>{SimpleComponent}</h1>\r\n    <p>Before</p>\r\n    <h2>{Heading:Text}</h2>\r\n    <p>Between</p>\r\n    {SupplementaryField:Text}\r\n    <p>After</p>\r\n</div>\r\n");
    });
});