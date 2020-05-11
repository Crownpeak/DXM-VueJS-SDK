export default class CmsStaticDataProvider
{
    static _getData(filename)
    {
        const request = new XMLHttpRequest(); //TODO: Replace with synchronous implementation of fetch, as XMLHttpRequest is deprecated.
        request.open('GET', window.cmsDataCache.cmsStaticDataLocation + '/'+ filename, false);
        request.send(null);

        if (request.status === 200) {
            return JSON.parse(request.responseText);
        }
    }

    static getSingleAsset(assetId)
    {
        const data = this._getData(assetId + ".json");

        if(!window.cmsDataCache) window.cmsDataCache = {};
        window.cmsDataCache[assetId] = data || {};
    }

    static getCustomData(filename)
    {
        return this._getData(filename);
    }
}