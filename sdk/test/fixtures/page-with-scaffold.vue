<template>
    <div v-if="isLoaded">
        <h1><SimpleComponent /></h1>
        <p>Before</p>
        <!-- cp-scaffold 
        <h2>{Heading:Text}</h2>
        else -->
        <h2>{ "not present" }</h2>
        <!-- /cp-scaffold -->
        <p>Between</p>
        <!-- cp-scaffold 
        {SupplementaryField:Text}
        /cp-scaffold -->
        <p>After</p>
    </div>
</template>
<script>
    import Vue from 'vue';
    import { CmsStaticPage } from 'crownpeak-dxm-vuejs-sdk';
    import SimpleComponent from './simple-component';

    export default {
        extends: CmsStaticPage,
        name: "PageWithScaffold",
        components: {
            SimpleComponent
        }
    };
</script>