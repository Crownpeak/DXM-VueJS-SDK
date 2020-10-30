<template>
    <div>
        <!-- <List name="List" type="ListItem" itemName="Field"> -->
        {this.list.value.map(item => {
            return <ListItem data={item.ListItem} key={i++}/>
        })}
        <!-- </List> -->
    </div>
</template>
<script>
    import { CmsComponent, CmsField, CmsFieldTypes, CmsIndexedField } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "ComponentWithList",
        props: ['data'],
        data: function() {
            return {
                list: new CmsField("Field", "ListItem", null)
            }
        }
    };
</script>
