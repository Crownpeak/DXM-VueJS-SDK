const assert = require('assert');
const parser = require('../classes/parsers/page');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/page-with-dropzone.vue');
const content = fs.readFileSync(file, 'utf8');
const { pages, uploads } = parser.parse(content, file);

describe('Page With DropZone', () => {
    it('should find no uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find one page', () => {
        assert.strictEqual(pages.length, 1);
        assert.strictEqual(pages[0].name, "PageWithDropZone");
    });
    it('should find one dropzone', () => {
        assert.strictEqual(pages[0].content.indexOf("<DropZone name=\"dropzone\"/>"), 11);
    });
});