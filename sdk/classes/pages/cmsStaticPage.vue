<script>
import CmsPage from "./cmsPage";
import { CmsStaticDataProvider } from "crownpeak-dxm-sdk-core";

export default {
    extends: CmsPage,
    beforeCreate() {
        this.cmsDataProvider = CmsStaticDataProvider;
    }
}
</script>