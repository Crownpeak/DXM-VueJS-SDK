<script>
import CmsPage from "./cmsPage";
import CmsDynamicDataProvider from "../../classes/dataProviders/cmsDynamicDataProvider";

export default {
    extends: CmsPage,
    beforeCreate() {
        this.cmsDataProvider = CmsDynamicDataProvider;
    }
}
</script>