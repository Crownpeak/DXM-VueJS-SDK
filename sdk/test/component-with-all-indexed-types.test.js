const assert = require('assert');
const parser = require('../classes/parsers/component');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/component-with-all-indexed-types.vue');
const content = fs.readFileSync(file, 'utf8');
const { components, uploads } = parser.parse(content, file);

describe('Component With All Indexed Types', () => {
    if (components.length > 0 && components[0].content && components[0].content.replace) {
        components[0].content = components[0].content.replace(/(?<!\r)\n/g, "\r\n");
    }
    it('should find no uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find one component', () => {
        assert.strictEqual(components.length, 1);
        assert.strictEqual(components[0].name, "ComponentWithAllIndexedTypes");
    });
    it('should add a dependency on SomethingElse', () => {
        assert.strictEqual(components[0].dependencies.length, 1);
        assert.strictEqual(components[0].dependencies[0], "SomethingElse");
    });
    it('should find twelve fields', () => {
        assert.strictEqual(components[0].content.indexOf("<h1>{Field1:Text}</h1>"), 11);
        assert.strictEqual(components[0].content.indexOf("<h2>{Field2:Text:IndexedString}</h2>"), 39);
        assert.strictEqual(components[0].content.indexOf("<h3>{Field3:Text:IndexedText}</h3>"), 81);
        assert.strictEqual(components[0].content.indexOf("<h4>{Field4:Text:IndexedDateTime}</h4>"), 121);
        assert.strictEqual(components[0].content.indexOf("<h5>{Field5:Text:IndexedInteger}</h5>"), 165);
        assert.strictEqual(components[0].content.indexOf("<h6>{Field6:Text:IndexedLong}</h6>"), 208);
        assert.strictEqual(components[0].content.indexOf("<h7>{Field7:Text:IndexedDouble}</h7>"), 248);
        assert.strictEqual(components[0].content.indexOf("<h8>{Field8:Text:IndexedFloat}</h8>"), 290);
        assert.strictEqual(components[0].content.indexOf("<h9>{Field9:Text:IndexedBoolean}</h9>"), 331);
        assert.strictEqual(components[0].content.indexOf("<h1>{Field10:Text:IndexedLocation}</h1>"), 374);
        assert.strictEqual(components[0].content.indexOf("<h2>{Field11:Text:IndexedCurrency}</h2>"), 419);
        assert.strictEqual(components[0].content.indexOf("<h3>{Field12:SomethingElse:IndexedString}</h3>"), 464);
    });
});