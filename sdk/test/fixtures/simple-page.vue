<template>
    <div v-if="isLoaded">
        <h1><SimpleComponent /></h1>
        <h2><SimpleComponent /></h2>
    </div>
</template>
<script>
    import Vue from 'vue';
    import { CmsStaticPage } from 'crownpeak-dxm-vuejs-sdk';
    import SimpleComponent from './simple-component';

    Vue.prototype.$cmsAssetId = 12345;

    export default {
        extends: CmsStaticPage,
        cmsSuppressModel: true,
        cmsSuppressFolder: true,
        cmsUseTmf: true,
        cmsWrapper: "SimpleWrapper",
        name: "SimplePage",
        components: {
            SimpleComponent
        }
    };
</script>