<script>
    import { CmsDropZoneComponent } from 'crownpeak-dxm-vuejs-sdk';
    import HeroContainer from "./heroContainer";
    import SecondaryContainer from "./secondaryContainer";

    export default {
        extends: CmsDropZoneComponent,
        name: "DropZone",
        props: ['name'],
        render: function(h) {
            const componentRegistry = {
                "HeroContainer": HeroContainer,
                "SecondaryContainer": SecondaryContainer
            }
            return h('div', { className:'row'}, this.getComponents(h, componentRegistry))
        }
    };
</script>