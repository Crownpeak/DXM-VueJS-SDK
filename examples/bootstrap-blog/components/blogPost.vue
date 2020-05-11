<template>
    <div class="blog-post">
        <h2 class="blog-post-title">{{ post_title }}</h2>
        <p class="blog-post-meta">Date: {{ new Date(this.post_date).toLocaleDateString() }}</p>
        <span v-html="post_content"/>
        {{ /*post_category*/ }}
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "BlogPost",
        data() {
            return {
                post_title: new CmsField("Post_Title", CmsFieldTypes.TEXT),
                post_date: new CmsField("Post_Date", CmsFieldTypes.DATE),
                post_content: new CmsField("Post_Content", CmsFieldTypes.WYSIWYG),
                post_category: new CmsField("Post_Category", CmsFieldTypes.DOCUMENT)
            }
        }
    };
</script>