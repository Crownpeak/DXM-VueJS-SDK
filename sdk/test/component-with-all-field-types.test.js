const assert = require('assert');
const parser = require('../classes/parsers/component');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/component-with-all-field-types.vue');
const content = fs.readFileSync(file, 'utf8');
const { components, uploads } = parser.parse(content, file);

describe('Component With All Field Types', () => {
    if (components.length > 0 && components[0].content && components[0].content.replace) {
        components[0].content = components[0].content.replace(/(?<!\r)\n/g, "\r\n");
    }
    it('should find no uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find one component', () => {
        assert.strictEqual(components.length, 1);
        assert.strictEqual(components[0].name, "ComponentWithAllFieldTypes");
    });
    it('should find eight fields', () => {
        assert.strictEqual(components[0].content.indexOf("<h1>{Field1:Text}</h1>"), 11);
        assert.strictEqual(components[0].content.indexOf("<h2>{Field2:Wysiwyg}</h2>"), 39);
        assert.strictEqual(components[0].content.indexOf("<h3>{Field3:Date}</h3>"), 70);
        assert.strictEqual(components[0].content.indexOf("<h4>{Field4:Document}</h4>"), 98);
        assert.strictEqual(components[0].content.indexOf("<h5>{Field5:Src}</h5>"), 130);
        assert.strictEqual(components[0].content.indexOf("<h6>{Field6:Href}</h6>"), 157);
        assert.strictEqual(components[0].content.indexOf("<h7>{Field7:Widget}</h7>"), 185);
        assert.strictEqual(components[0].content.indexOf("<h8>{Field8:SomethingElse}</h8>"), 215);
    });
});