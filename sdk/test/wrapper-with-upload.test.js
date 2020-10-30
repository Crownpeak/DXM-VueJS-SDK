const assert = require('assert');
const parser = require('../classes/parsers/wrapper');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/wrapper-with-upload.html');
const content = fs.readFileSync(file, 'utf8');
const { wrapper, uploads } = parser.parse(file, content);

describe('Wrapper With Upload', () => {
    it('should find one upload', () => {
        assert.strictEqual(uploads.length, 1);
        assert.strictEqual(uploads[0].name, "logo.png");
        assert.strictEqual(uploads[0].destination, "test/fixtures/");
        assert.strictEqual(fs.existsSync(uploads[0].source), true);
    });
    it('should find a wrapper', () => {
        assert.strictEqual(wrapper.name, "Wrapper With Upload");
    });
    it('should have the expected header and footer', () => {
        assert.strictEqual(wrapper.head.length, 329);
        assert.strictEqual(wrapper.head.indexOf("<h1>Wrapper With Upload</h1>"), 122);
        assert.strictEqual(wrapper.foot.length, 100);
        assert.strictEqual(wrapper.foot.indexOf("<h2>Wrapper With Upload</h2>"), 39);
    });
    it('should remap the image path', () => {
        assert.strictEqual(wrapper.head.indexOf("<img src=\"<%= Asset.Load(Asset.GetSiteRoot(asset).AssetPath + \"/test/fixtures/logo.png\").GetLink(LinkType.Include) %>\"/>"), 173);
    });
});