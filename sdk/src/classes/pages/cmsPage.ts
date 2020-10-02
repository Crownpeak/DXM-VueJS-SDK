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

    created (): void {
        if (!this.$cmsAssetId && this.$router && this.$route) {
            const router = this.$router as ICmsRouter;
            if (router && router.options && router.options.routes)
                this.$cmsAssetId = ((router.options.routes.find(r => r.path === this.$route.path) || {}) as ICmsRouteConfigSingleView).cmsassetid || -1;
        }
        if(this.$cmsAssetId) {
            (this.cmsDataProvider || new CmsNullDataProvider()).getSingleAsset(this.$cmsAssetId);
            CmsDataCache.cmsAssetId = this.$cmsAssetId;
        }
        else {
            console.error(`Cannot load content -- property $cmsAssetId on component ${this.$options.name} has no value`)
        }
    }
}