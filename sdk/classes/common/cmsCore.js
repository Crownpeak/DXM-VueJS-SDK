export default class CmsCore
{
    static init(cmsStaticDataLocation, cmsDynamicDataLocation)
    {
        window.cmsDataCache = {
            cmsStaticDataLocation:cmsStaticDataLocation,
            cmsDynamicDataLocation:cmsDynamicDataLocation
        };
    }
}