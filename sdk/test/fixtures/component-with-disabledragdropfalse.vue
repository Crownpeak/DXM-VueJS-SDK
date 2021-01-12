<template>
    <div>
        <h1>{{ field1 }}</h1>
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "ComponentWithDisableDragDropFalse",
        props: ['data'],
        cmsDisableDragDrop: false,
        data: function() {
            return {
                field1: new CmsField("Field1", CmsFieldTypes.TEXT)
            }
        }
    };
</script>
