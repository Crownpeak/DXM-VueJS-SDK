<template>
    <div>
        {{ field1 }}
        <SimpleComponent />
        <ComponentInFiles />
        <NonCrownpeakComponent />
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-vuejs-sdk';
    import SimpleComponent from './simple-component';
    import ComponentInFiles from './ComponentInFiles';
    import NonCrownpeakComponent from './non-crownpeak-component';
    
    export default {
        extends: CmsComponent,
        name: "ComponentWithNonCrownpeak",
        props: ['data'],
        data: function() {
            return {
                field1: new CmsField("Field1", CmsFieldTypes.TEXT, null)
            }
        }
    };
</script>
