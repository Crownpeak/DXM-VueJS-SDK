const assert = require('assert');
const parser = require('../classes/parsers/component');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/component-with-upload.vue');
const content = fs.readFileSync(file, 'utf8');
const { components, uploads } = parser.parse(content, file);

describe('Component With Upload', () => {
    if (components.length > 0 && components[0].content && components[0].content.replace) {
        components[0].content = components[0].content.replace(/(?<!\r)\n/g, "\r\n");
    }
    it('should find one upload', () => {
        assert.strictEqual(uploads.length, 1);
        assert.strictEqual(uploads[0].name, "logo.png");
        assert.strictEqual(uploads[0].destination, "test/fixtures/");
        assert.strictEqual(fs.existsSync(uploads[0].source), true);
    });
    it('should find one component', () => {
        assert.strictEqual(components.length, 1);
        assert.strictEqual(components[0].name, "ComponentWithUpload");
    });
    it('should remap the image path', () => {
        assert.strictEqual(components[0].content.indexOf("<img src=\"/cpt_internal/test/fixtures/logo.png\"/>"), 39);
    });
});