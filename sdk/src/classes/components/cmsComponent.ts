import Vue from 'vue';
import Component from 'vue-class-component';
import ICmsComponentOptions from "./ICmsComponentOptions";
import { CmsDataCache, CmsDataSource } from 'crownpeak-dxm-sdk-core';

@Component
export default class CmsComponent extends Vue {
    cmsFolder?: string = "";
    created(): void {
        CmsDataCache.cmsComponentName = (this.$options as ICmsComponentOptions)._componentTag;
        // TODO: pass in data source like props on React?

        const dataSource = CmsDataCache.get(CmsDataCache.cmsAssetId)[CmsDataCache.cmsComponentName] as CmsDataSource;
        CmsDataCache.dataSource = dataSource;
        if (Array.isArray(dataSource)) {
            let index = dataSource.index;
            if (typeof index === "undefined" || isNaN(index)) index = 0;
            else index++;
            dataSource.index = index;
        }
    }
}