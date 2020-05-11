export default class CmsField extends String
{
    constructor(cmsFieldName, cmsFieldType) {
        super();
        this.cmsFieldName = cmsFieldName;
        this.cmsFieldType = cmsFieldType;
    }

    [Symbol.toPrimitive](hint)
    {
        const dataSource = window.cmsDataCache.dataSource;
        if (dataSource) {
            if (Array.isArray(dataSource)) {
                var index = dataSource.index;
                if (dataSource[index]) return dataSource[index][this.cmsFieldName];
            }
            if (dataSource) return dataSource[this.cmsFieldName];
        }
        return this.cmsFieldName;
    }
}