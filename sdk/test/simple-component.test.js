const assert = require('assert');
const parser = require('../classes/parsers/component');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/simple-component.vue');
const content = fs.readFileSync(file, 'utf8');
const { components, uploads } = parser.parse(content, file);

describe('Simple Component', () => {
    it('should not find any uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should not find any dependencies', () => {
        assert.strictEqual(components[0].dependencies.length, 0);
    });
    it('should find one component', () => {
        assert.strictEqual(components.length, 1);
        assert.strictEqual(components[0].name, "SimpleComponent");
        assert.strictEqual(components[0].folder, "Simple Subfolder");
        assert.strictEqual(components[0].zones.length, 1);
        assert.strictEqual(components[0].zones[0], "simple-zone");
    });
    it('should find six normal fields', () => {
        assert.strictEqual(components[0].content.indexOf("<h1>{Field1:Text}</h1>"), 11);
        assert.strictEqual(components[0].content.indexOf("<h1>{Field2:Text}</h1>"), 39);
        assert.strictEqual(components[0].content.indexOf("<h1>{Field3:Text:IndexedString}</h1>"), 67);
        assert.strictEqual(components[0].content.indexOf("<h1>{Field4:Text}</h1>"), 109);
        assert.strictEqual(components[0].content.indexOf("<h1>{Field5:Text}</h1>"), 137);
        assert.strictEqual(components[0].content.indexOf("<h1>{Field6:Text:IndexedString}</h1>"), 165);
    });
    it('should find six commented fields', () => {
        assert.strictEqual(components[0].content.indexOf("<h1><!-- {Field7:Text} --></h1>"), 207);
        assert.strictEqual(components[0].content.indexOf("<h1><!-- {Field8:Text} --></h1>"), 244);
        assert.strictEqual(components[0].content.indexOf("<h1><!-- {Field9:Text:IndexedString} --></h1>"), 281);
        assert.strictEqual(components[0].content.indexOf("<h1><!-- {Field10:Text} --></h1>"), 332);
        assert.strictEqual(components[0].content.indexOf("<h1><!-- {Field11:Text} --></h1>"), 370);
        assert.strictEqual(components[0].content.indexOf("<h1><!-- {Field12:Text:IndexedString} --></h1>"), 408);
    });
});