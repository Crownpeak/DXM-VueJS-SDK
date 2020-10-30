<template>
    <div>
        <p>Before</p>
        <!-- cp-scaffold 
        <h2>{Heading:Text}</h2>
        else -->
        <h2>{ "not present" }</h2>
        <!-- /cp-scaffold -->
        <p>Between</p>
        <!-- cp-scaffold 
        {SupplementaryField:Text}
        /cp-scaffold -->
        <p>After</p>
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "ComponentWithScaffold",
        props: ['data'],
        data: function() {
            return {
                heading: new CmsField("Field", CmsFieldTypes.TEXT, null)
            }
        }
    };
</script>
