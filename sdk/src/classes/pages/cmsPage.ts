import Vue from 'vue';
import Component from 'vue-class-component';
import ICmsRouteConfigSingleView from "./ICmsRouteConfigSingleView";
import ICmsRouter from "./ICmsRouterWithOptions";
import { CmsDataCache, ICmsDataProvider, CmsNullDataProvider } from "crownpeak-dxm-sdk-core";

@Component
export default class CmsPage extends Vue {
    cmsDataProvider?: ICmsDataProvider;
    $cmsAssetId?: number;
    cmsWrapper?: string;
    cmsUseTmf: boolean = false;
    cmsUseMetadata: boolean = false;
    cmsSuppressModel: boolean = false;
    cmsSuppressFolder: boolean = false;
    isLoaded: boolean = false;
    $cmsLoadDataTimeout?: number;
    $cmsDataLoaded?: (data: object, assetId: number) => object;
    $cmsDataError?: (exception: any, assetId: number) => void;
    $cmsBeforeLoadingData?: (options: XMLHttpRequest | RequestInit) => void;

    created (): void {
        if (!this.$cmsAssetId && this.$router && this.$route) {
            const router = this.$router as ICmsRouter;
            if (router && router.options && router.options.routes)
                this.$cmsAssetId = ((router.options.routes.find(r => r.path === this.$route.path) || {}) as ICmsRouteConfigSingleView).cmsassetid || -1;
        }
        if(this.$cmsAssetId) {
            const that = this;
            let isError = false;
            (this.cmsDataProvider || new CmsNullDataProvider()).setPreLoad(this.$cmsBeforeLoadingData);
            (this.cmsDataProvider || new CmsNullDataProvider()).getSingleAsset(this.$cmsAssetId, this.$cmsLoadDataTimeout).catch((ex) => {
                isError = true;
                if (that.$cmsDataError) that.$cmsDataError(ex, that.$cmsAssetId || -1);
                else console.error(ex);
            }).then(() => {
                if (!isError) {
                    if (that.$cmsDataLoaded) CmsDataCache.set(that.$cmsAssetId || -1, that.$cmsDataLoaded(CmsDataCache.get(that.$cmsAssetId || -1), that.$cmsAssetId || -1) || CmsDataCache.get(that.$cmsAssetId || -1));
                    that.isLoaded = true;
                }
            });
            CmsDataCache.cmsAssetId = this.$cmsAssetId;
        }
        else {
            console.error(`Cannot load content -- property $cmsAssetId on component ${this.$options.name} has no value`)
        }
    }
}