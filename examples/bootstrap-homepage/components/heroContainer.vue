<template>
    <div class="container">
        <h1 class="display-3">{{ heading }}</h1>
        <span v-html="description"/>
        <p><a class="btn btn-primary btn-lg" href="#" role="button">{{ button_text }}</a></p>
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "HeroContainer",
        data() {
            return {
                heading: new CmsField("Heading", CmsFieldTypes.TEXT, this._props && this._props.data ? this._props.data.Heading : null),
                description: new CmsField("Description", CmsFieldTypes.WYSIWYG, this._props && this._props.data ? this._props.data.Description : null),
                button_text: new CmsField("Button_Text", CmsFieldTypes.TEXT, this._props && this._props.data ? this._props.data.Button_Text : null)
            }
        }
    };
</script>