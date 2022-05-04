const assert = require('assert');
const parser = require('../classes/parsers/component');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/component-with-non-crownpeak.vue');
const content = fs.readFileSync(file, 'utf8');
const { components, uploads } = parser.parse(content, file);

describe('Simple Component With Non-Crownpeak', () => {
    if (components.length > 0 && components[0].content && components[0].content.replace) {
        components[0].content = components[0].content.replace(/(?<!\r)\n/g, "\r\n");
    }
    it('should not find any uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find two dependencies', () => {
        assert.strictEqual(components[0].dependencies.length, 2);
        assert.strictEqual(components[0].dependencies[1], "SimpleComponent");
        assert.strictEqual(components[0].dependencies[0], "ComponentInFiles");
    });
    it('should find one component', () => {
        assert.strictEqual(components.length, 1);
        assert.strictEqual(components[0].name, "ComponentWithNonCrownpeak");
        assert.strictEqual(components[0].content, "<div>\r\n    {Field1:Text}\r\n    {SimpleComponent:SimpleComponent}\r\n    {ComponentInFiles:ComponentInFiles}\r\n    <NonCrownpeakComponent />\r\n</div>\r\n");
    });
});