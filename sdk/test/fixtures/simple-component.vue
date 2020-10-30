<template>
    <div>
        <h1>{{ field1 }}</h1>
        <h1>{{ this.field2 }}</h1>
        <h1>{{ field3 }}</h1>
        <h1>{{ field4 }}</h1>
        <h1>{{ this.field5 }}</h1>
        <h1>{{ field6 }}</h1>
        <h1>{{/* field7 */}}</h1>
        <h1>{{/* this.field8 */}}</h1>
        <h1>{{/* field9 */}}</h1>
        <h1>{{/* field10 */}}</h1>
        <h1>{{/* this.field11 */}}</h1>
        <h1>{{/* field12 */}}</h1>
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes, CmsIndexedField } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "SimpleComponent",
        props: ['data'],
        cmsFolder: "Simple Subfolder",
        cmsZones: ["simple-zone"],
        data: function() {
            return {
                field1: new CmsField("Field1", CmsFieldTypes.TEXT),
                field2: new CmsField("Field2", CmsFieldTypes.TEXT, null),
                field3: new CmsField("Field3", CmsFieldTypes.TEXT, null, CmsIndexedField.STRING),
                field4: new CmsField("Field4", "Text"),
                field5: new CmsField("Field5", "Text", null),
                field6: new CmsField("Field6", "Text", null, CmsIndexedField.STRING),
                field7: new CmsField("Field7", CmsFieldTypes.TEXT),
                field8: new CmsField("Field8", CmsFieldTypes.TEXT, null),
                field9: new CmsField("Field9", CmsFieldTypes.TEXT, null, CmsIndexedField.STRING),
                field10: new CmsField("Field10", "Text"),
                field11: new CmsField("Field11", "Text", null),
                field12: new CmsField("Field12", "Text", null, CmsIndexedField.STRING),
            }
        }
    };
</script>
