<template>
    <div class="col-md-4">
        <h2>{{ heading }}</h2>
        <span v-html="description"/>
        <p><a class="btn btn-secondary" href="#" role="button">{{ button_text }}</a></p>
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "SecondaryContainer",
        data() {
            return {
                heading: new CmsField("Heading", CmsFieldTypes.TEXT),
                description: new CmsField("Description", CmsFieldTypes.WYSIWYG),
                button_text: new CmsField("Button_Text", CmsFieldTypes.TEXT)
            }
        }
    };
</script>