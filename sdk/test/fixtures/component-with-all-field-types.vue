<template>
    <div>
        <h1>{{ field1 }}</h1>
        <h2>{{ field2 }}</h2>
        <h3>{{ field3 }}</h3>
        <h4>{{ field4 }}</h4>
        <h5>{{ field5 }}</h5>
        <h6>{{ field6 }}</h6>
        <h7>{{ field7 }}</h7>
        <h8>{{ field8 }}</h8>
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "ComponentWithAllFieldTypes",
        props: ['data'],
        data: function() {
            return {
                field1: new CmsField("Field1", CmsFieldTypes.TEXT, null),
                field2: new CmsField("Field2", CmsFieldTypes.WYSIWYG, null),
                field3: new CmsField("Field3", CmsFieldTypes.DATE, null),
                field4: new CmsField("Field4", CmsFieldTypes.DOCUMENT, null),
                field5: new CmsField("Field5", CmsFieldTypes.IMAGE, null),
                field6: new CmsField("Field6", CmsFieldTypes.HREF, null),
                field7: new CmsField("Field7", CmsFieldTypes.WIDGET, null),
                field8: new CmsField("Field8", "SomethingElse", null)
            }
        }
    };
</script>
