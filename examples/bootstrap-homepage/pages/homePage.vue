<template>
    <div>
        <div class="jumbotron">
            <HeroContainer />
        </div>
        <div class="container">
            <div class="row">
                <SecondaryContainer/>
                <SecondaryContainer/>
                <SecondaryContainer/>
            </div>
            <DropZone name="secondary"/>
        </div>
        <hr/>
    </div>
</template>
<script>
    import Vue from 'vue';
    import { CmsDynamicPage, CmsStaticPage } from 'crownpeak-dxm-vuejs-sdk';
    import HeroContainer from '../components/heroContainer';
    import SecondaryContainer from '../components/secondaryContainer';
    import DropZone from "../components/dropZone";

    Vue.prototype.$cmsAssetId = 266437;

    export default {
        extends: CmsDynamicPage,
        name: "HomePage",
        components: {
            DropZone,
            HeroContainer,
            SecondaryContainer
        }
    };
</script>