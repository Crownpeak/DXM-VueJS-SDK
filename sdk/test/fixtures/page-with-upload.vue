<template>
    <div v-if="isLoaded">
        <h1><SimpleComponent /></h1>
        <img src="./logo.png"/>
    </div>
</template>
<script>
    import Vue from 'vue';
    import { CmsStaticPage } from 'crownpeak-dxm-vuejs-sdk';
    import SimpleComponent from './simple-component';

    export default {
        extends: CmsStaticPage,
        name: "PageWithUpload",
        components: {
            SimpleComponent
        }
    };
</script>