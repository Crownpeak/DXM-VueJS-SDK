const assert = require('assert');
const parser = require('../classes/parsers/component');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/component-with-list.vue');
const content = fs.readFileSync(file, 'utf8');
const { components, uploads } = parser.parse(content, file);

describe('Component With List', () => {
    if (components.length > 0 && components[0].content && components[0].content.replace) {
        components[0].content = components[0].content.replace(/(?<!\r)\n/g, "\r\n");
    }
    it('should find no uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find one component', () => {
        assert.strictEqual(components.length, 1);
        assert.strictEqual(components[0].name, "ComponentWithList");
    });
    it('should add a dependency on ListItem', () => {
        assert.strictEqual(components[0].dependencies.length, 1);
        assert.strictEqual(components[0].dependencies[0], "ListItem");
    });
    it('should replace the list code with cp-list', () => {
        assert.strictEqual(components[0].content.indexOf("<cp-list name=\"List\">\r\n      {Field:ListItem}\r\n    </cp-list>"), 11);
    });
});