<template>
    <div>
        <h1>{{ field1 }}</h1>
        <img src="./logo.png"/>
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "ComponentWithUpload",
        props: ['data'],
        data: function() {
            return {
                field1: new CmsField("Field1", CmsFieldTypes.TEXT)
            }
        }
    };
</script>
