import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-vuejs-sdk';
export default {
    extends: CmsComponent,
    name: "ComponentInFiles",
    props: ['data'],
    data: function() {
        return {
            heading: new CmsField("Field1", CmsFieldTypes.TEXT),
        }
    }
};
