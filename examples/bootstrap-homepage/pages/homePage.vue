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
        </div>
        <hr/>
    </div>
</template>
<script>
    import Vue from 'vue';
    import { CmsDynamicPage } from 'crownpeak-dxm-vuejs-sdk';
    import HeroContainer from '../components/heroContainer.vue';
    import SecondaryContainer from '../components/secondaryContainer.vue';

    Vue.prototype.$cmsAssetId = 266437;

    export default {
        extends: CmsDynamicPage,
        name: "HomePage",
        components: {
            HeroContainer,
            SecondaryContainer
        }
    };
</script>