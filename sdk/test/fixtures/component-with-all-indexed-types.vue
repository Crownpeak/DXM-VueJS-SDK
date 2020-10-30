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
        <h9>{{ field9 }}</h9>
        <h1>{{ field10 }}</h1>
        <h2>{{ field11 }}</h2>
        <h3>{{ field12 }}</h3>
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes, CmsIndexedField } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "ComponentWithAllIndexedTypes",
        props: ['data'],
        data: function() {
            return {
                field1: new CmsField("Field1", CmsFieldTypes.TEXT, null),
                field2: new CmsField("Field2", CmsFieldTypes.TEXT, null, CmsIndexedField.STRING),
                field3: new CmsField("Field3", CmsFieldTypes.TEXT, null, CmsIndexedField.TEXT),
                field4: new CmsField("Field4", CmsFieldTypes.TEXT, null, CmsIndexedField.DATETIME),
                field5: new CmsField("Field5", CmsFieldTypes.TEXT, null, CmsIndexedField.INTEGER),
                field6: new CmsField("Field6", CmsFieldTypes.TEXT, null, CmsIndexedField.LONG),
                field7: new CmsField("Field7", CmsFieldTypes.TEXT, null, CmsIndexedField.DOUBLE),
                field8: new CmsField("Field8", CmsFieldTypes.TEXT, null, CmsIndexedField.FLOAT),
                field9: new CmsField("Field9", CmsFieldTypes.TEXT, null, CmsIndexedField.BOOLEAN),
                field10: new CmsField("Field10", CmsFieldTypes.TEXT, null, CmsIndexedField.LOCATION),
                field11: new CmsField("Field11", CmsFieldTypes.TEXT, null, CmsIndexedField.CURRENCY),
                field12: new CmsField("Field12", "SomethingElse", null, CmsIndexedField.STRING)
            }
        }
    };
</script>
