const assert = require('assert');
const parser = require('../classes/parsers/component');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/component-with-scaffold.vue');
const content = fs.readFileSync(file, 'utf8');
const { components, uploads } = parser.parse(content, file);

describe('Component With Scaffold', () => {
    if (components.length > 0 && components[0].content && components[0].content.replace) {
        components[0].content = components[0].content.replace(/(?<!\r)\n/g, "\r\n");
    }
    it('should find no uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find one component', () => {
        assert.strictEqual(components.length, 1);
        assert.strictEqual(components[0].name, "ComponentWithScaffold");
        assert.strictEqual(components[0].content, "<div>\r\n    <p>Before</p>\r\n    <h2>{Heading:Text}</h2>\r\n    <p>Between</p>\r\n    {SupplementaryField:Text}\r\n    <p>After</p>\r\n</div>\r\n");
    });
    it('should have no dependencies', () => {
        assert.strictEqual(components[0].dependencies.length, 0);
    });
});