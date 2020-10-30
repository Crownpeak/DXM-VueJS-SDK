<template>
    <div v-if="isLoaded">
        <DropZone name="dropzone"/>
    </div>
</template>
<script>
    import Vue from 'vue';
    import { CmsStaticPage } from 'crownpeak-dxm-vuejs-sdk';

    export default {
        extends: CmsStaticPage,
        name: "PageWithDropZone"
    };
</script>