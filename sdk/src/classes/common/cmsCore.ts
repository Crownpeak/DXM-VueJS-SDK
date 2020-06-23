import { CmsDataCache } from 'crownpeak-dxm-sdk-core';

export default class CmsCore {
    static init(cmsStaticDataLocation: string, cmsDynamicDataLocation: string) {
        CmsDataCache.init(cmsStaticDataLocation, cmsDynamicDataLocation);
    }
}