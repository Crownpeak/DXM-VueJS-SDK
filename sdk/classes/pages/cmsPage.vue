<script>
import Vue from 'vue';
import CmsCore from "../common/cmsCore";

export default {
    created ()
    {
        if (this.$router && this.$route) {
            this.$cmsAssetId = (this.$router.options.routes.find(r => r.path === this.$route.path) || {}).cmsassetid;
        }
        this.cmsAssetId = this.$cmsAssetId;
        this.cmsDataProvider.getSingleAsset(this.cmsAssetId);
        window.cmsDataCache.cmsAssetId = this.cmsAssetId;
    }
}
</script>