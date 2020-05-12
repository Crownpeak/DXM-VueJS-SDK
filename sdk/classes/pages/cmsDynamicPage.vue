<script>
import CmsPage from "./cmsPage";
import { CmsDynamicDataProvider } from 'crownpeak-dxm-sdk-core';

export default {
    extends: CmsPage,
    beforeCreate() {
        this.cmsDataProvider = CmsDynamicDataProvider;
    }
}
</script>