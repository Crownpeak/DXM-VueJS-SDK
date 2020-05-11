<script>
import CmsPage from "./cmsPage";
import CmsStaticDataProvider from "../../classes/dataProviders/cmsStaticDataProvider";

export default {
    extends: CmsPage,
    beforeCreate() {
        this.cmsDataProvider = CmsStaticDataProvider;
    }
}
</script>