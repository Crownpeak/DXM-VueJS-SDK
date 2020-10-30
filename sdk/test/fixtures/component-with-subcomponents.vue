<template>
    <div>
        <h1>{{ field1 }}</h1>
        <h2><ComponentWithUpload /></h2>
        <h3><ComponentInFiles /></h3>
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-vuejs-sdk';
    import { ComponentWithUpload } from './component-with-upload';
    import { ComponentInFiles } from './ComponentInFiles';
    export default {
        extends: CmsComponent,
        name: "ComponentWithSubcomponents",
        props: ['data'],
        data: function() {
            return {
                field1: new CmsField("Field1", CmsFieldTypes.TEXT)
            }
        },
        components: {
            ComponentWithUpload,
            ComponentInFiles
        }
    };
</script>
