<template>
    <div class="col-md-6 px-0">
        <h1 class="display-4 font-italic">{{ post_title }}</h1>
        <p class="lead my-3" v-html="post_leader"></p>
        <p class="lead mb-0"><a href="#" class="text-white font-weight-bold">Continue
            reading...</a></p>
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "FeaturedPost",
        data() {
            return {
                post_title: new CmsField("Post_Title", CmsFieldTypes.TEXT),
                post_leader: new CmsField("Post_Leader", CmsFieldTypes.WYSIWYG)
            }
        }
    };
</script>