<template>
    <div class="card flex-md-row mb-4 box-shadow h-md-250">
        <div class="card-body d-flex flex-column align-items-start">
            <strong class="d-inline-block mb-2 text-primary">World</strong>
            <h3 class="mb-0">
                <a class="text-dark" href="#">{{ post_title }}</a>
            </h3>
            <div class="mb-1 text-muted">{{ new Date(post_date).toLocaleDateString() }}</div>
            <p class="card-text mb-auto" v-html="post_content"></p>
            <a href="#">Continue reading</a>
        </div>
        <img class="card-img-right flex-auto d-none d-md-block"
                data-src="holder.js/200x250?theme=thumb" alt="Card image cap" />
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "SecondaryPost",
        data() {
            return {
                post_title: new CmsField("Post_Title", CmsFieldTypes.TEXT),
                post_date: new CmsField("Post_Date", CmsFieldTypes.DATE),
                post_content: new CmsField("Post_Content", CmsFieldTypes.WYSIWYG)
            }
        }
    };
</script>
