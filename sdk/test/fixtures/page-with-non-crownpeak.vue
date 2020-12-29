<template>
    <div v-if="isLoaded">
        <SimpleComponent />
        <ComponentInFiles />
        <NonCrownpeakComponent />
    </div>
</template>
<script>
    import Vue from 'vue';
    import { CmsStaticPage } from 'crownpeak-dxm-vuejs-sdk';
    import SimpleComponent from './simple-component';
    import ComponentInFiles from './ComponentInFiles';
    import NonCrownpeakComponent from './non-crownpeak-component'

    export default {
        extends: CmsStaticPage,
        name: "PageWithNonCrownpeak",
        components: {
            SimpleComponent,
            ComponentInFiles,
            NonCrownpeakComponent
        }
    };
</script>