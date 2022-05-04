const assert = require('assert');
const parser = require('../classes/parsers/wrapper');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/wrapper-with-css.html');
const content = fs.readFileSync(file, 'utf8');
const { wrapper, uploads } = parser.parse(file, content);

describe('Wrapper With CSS', () => {
    wrapper.head = wrapper.head.replace(/(?<!\r)\n/g, "\r\n");
    wrapper.foot = wrapper.foot.replace(/(?<!\r)\n/g, "\r\n");
    it('should find two uploads', () => {
        assert.strictEqual(uploads.length, 2);
        assert.strictEqual(uploads[0].name, "test.css");
        assert.strictEqual(uploads[0].destination, "test/fixtures/");
        assert.strictEqual(fs.existsSync(uploads[0].source), true);
        assert.strictEqual(uploads[1].name, "logo.png");
        assert.strictEqual(uploads[1].destination, "test/fixtures/");
        assert.strictEqual(fs.existsSync(uploads[1].source), true);
    });
    it('should find a wrapper', () => {
        assert.strictEqual(wrapper.name, "Wrapper With CSS");
    });
    it('should have the expected header and footer', () => {
        assert.strictEqual(wrapper.head.length, 356);
        assert.strictEqual(wrapper.head.indexOf("<h1>Wrapper With CSS</h1>"), 280);
        assert.strictEqual(wrapper.foot.length, 97);
        assert.strictEqual(wrapper.foot.indexOf("<h2>Wrapper With CSS</h2>"), 39);
    });
    it('should remap the CSS path', () => {
        assert.strictEqual(wrapper.head.indexOf("<link type=\"text/css\" rel=\"stylesheet\" href=\"<%= Asset.Load(Asset.GetSiteRoot(asset).AssetPath + \"/test/fixtures/test.css\").GetLink(LinkType.Include) %>\"/>"), 84);
    });
    it('should remap the image path inside the CSS', () => {
        assert.strictEqual(uploads[0].content, "p { background-image: url(\"<%= Asset.Load(Asset.GetSiteRoot(asset).AssetPath + \"/test/fixtures/logo.png\").GetLink() %>\")}");
    });
});