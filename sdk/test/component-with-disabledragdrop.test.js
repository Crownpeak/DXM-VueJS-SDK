const assert = require('assert');
const parser = require('../classes/parsers/component');
const fs = require('fs');
const path = require('path');

const file1 = path.resolve('./test/fixtures/component-with-disabledragdroptrue.vue');
const content1 = fs.readFileSync(file1, 'utf8');
const { components: components1, uploads: uploads1 } = parser.parse(content1, file1);

const file2 = path.resolve('./test/fixtures/component-with-disabledragdropfalse.vue');
const content2 = fs.readFileSync(file2, 'utf8');
const { components: components2, uploads: uploads2 } = parser.parse(content2, file2);

const file3 = path.resolve('./test/fixtures/component-with-disabledragdropundefined.vue');
const content3 = fs.readFileSync(file3, 'utf8');
const { components: components3, uploads: uploads3 } = parser.parse(content3, file3);

describe('Component With DisableDragDrop', () => {
    it('should find one component', () => {
        assert.strictEqual(components1.length, 1);
        assert.strictEqual(components1[0].name, "ComponentWithDisableDragDropTrue");
        assert.strictEqual(components2.length, 1);
        assert.strictEqual(components2[0].name, "ComponentWithDisableDragDropFalse");
        assert.strictEqual(components3.length, 1);
        assert.strictEqual(components3[0].name, "ComponentWithDisableDragDropUndefined");
    });
    it('should find no dependencies', () => {
        assert.strictEqual(components1[0].dependencies.length, 0);
        assert.strictEqual(components2[0].dependencies.length, 0);
        assert.strictEqual(components3[0].dependencies.length, 0);
    });
    it('should find disableDragDrop set correctly', () => {
        assert.strictEqual(components1[0].disableDragDrop, true);
        assert.strictEqual(components2[0].disableDragDrop, false);
        assert.strictEqual(components3[0].disableDragDrop, undefined);
    });
});