const assert = require('assert');
const parser = require('../classes/parsers/component');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/component-with-subcomponents.vue');
const content = fs.readFileSync(file, 'utf8');
const { components, uploads } = parser.parse(content, file);

describe('Component With Subcomponents', () => {
    it('should find no uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find one component', () => {
        assert.strictEqual(components.length, 1);
        assert.strictEqual(components[0].name, "ComponentWithSubcomponents");
        assert.strictEqual(components[0].content, "<div>\r\n    <h1>{Field1:Text}</h1>\r\n    <h2>{ComponentWithUpload:ComponentWithUpload}</h2>\r\n    <h3>{ComponentInFiles:ComponentInFiles}</h3>\r\n</div>\r\n");
    });
    it('should find two dependencies', () => {
        assert.strictEqual(components[0].dependencies.length, 2);
        assert.strictEqual(components[0].dependencies[0], "ComponentWithUpload");
        assert.strictEqual(components[0].dependencies[1], "ComponentInFiles");
    });
});