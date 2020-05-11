<script>
export default {
    created() {
        if (!window.cmsDataCache) window.cmsDataCache = {};
        window.cmsDataCache.cmsComponentName = this.$options._componentTag;
        // TODO: pass in data source like props on React?

        const dataSource = window.cmsDataCache[window.cmsDataCache.cmsAssetId][window.cmsDataCache.cmsComponentName];
        window.cmsDataCache.dataSource = dataSource;
        if (Array.isArray(dataSource)) {
            var index = dataSource.index;
            if (typeof index === "undefined") index = 0;
            else index++;
            dataSource.index = index;
        }
    }
}
</script>