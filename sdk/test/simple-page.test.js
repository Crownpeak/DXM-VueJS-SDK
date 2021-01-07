const assert = require('assert');
const parser = require('../classes/parsers/page');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/simple-page.vue');
const content = fs.readFileSync(file, 'utf8');
const { pages, uploads } = parser.parse(content, file);

describe('Simple Page', () => {
    it('should not find any uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find one page', () => {
        assert.strictEqual(pages.length, 1);
        assert.strictEqual(pages[0].name, "SimplePage");
        assert.strictEqual(pages[0].wrapper, "SimpleWrapper");
        assert.strictEqual(pages[0].useTmf, true);
        assert.strictEqual(pages[0].useMetadata, true);
        assert.strictEqual(pages[0].suppressFolder, true);
        assert.strictEqual(pages[0].suppressModel, true);
    });
    it('should find two components', () => {
        assert.strictEqual(pages[0].content.indexOf("<h1>{SimpleComponent}</h1>"), 11);
        assert.strictEqual(pages[0].content.indexOf("<h2>{SimpleComponent_2:SimpleComponent}</h2>"), 43);
    });
});