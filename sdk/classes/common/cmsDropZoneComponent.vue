<script>
    import CmsComponent from '../components/cmsComponent';

    export default {
        extends: CmsComponent,
        name: "CmsDropZoneComponent",
        props: ['name'],
        methods: {
            getComponents: function(h, componentRegistry)
            {
                const data = (window.cmsDataCache[window.cmsDataCache.cmsAssetId].DropZones || {})[this.name] || []

                const components = [];
                data.map((component) => {
                    const key = Object.keys(component)[0]
                    const instance = h(componentRegistry[key], {props: {data : component[key]}})
                    components.push(instance)
                })

                return components;
            }
        }
    };
</script>