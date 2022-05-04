const assert = require('assert');
const parser = require('../classes/parsers/page');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/page-with-upload.vue');
const content = fs.readFileSync(file, 'utf8');
const { pages, uploads } = parser.parse(content, file);

describe('Page With Upload', () => {
    if (pages.length > 0 && pages[0].content && pages[0].content.replace) {
        pages[0].content = pages[0].content.replace(/(?<!\r)\n/g, "\r\n");
    }
    it('should find one upload', () => {
        assert.strictEqual(uploads.length, 1);
        assert.strictEqual(uploads[0].name, "logo.png");
        assert.strictEqual(uploads[0].destination, "test/fixtures/");
        assert.strictEqual(fs.existsSync(uploads[0].source), true);
    });
    it('should find one page', () => {
        assert.strictEqual(pages.length, 1);
        assert.strictEqual(pages[0].name, "PageWithUpload");
    });
    it('should find one components', () => {
        assert.strictEqual(pages[0].content.indexOf("<h1>{SimpleComponent}</h1>"), 11);
    });
    it('should remap the image path', () => {
        assert.strictEqual(pages[0].content.indexOf("<img src=\"<%= Asset.Load(Asset.GetSiteRoot(asset).AssetPath + \"/test/fixtures/logo.png\").GetLink(LinkType.Include) %>\"/>"), 43);
    });
});