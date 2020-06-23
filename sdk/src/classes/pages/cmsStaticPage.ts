import Component from 'vue-class-component';
import CmsPage from "./cmsPage";
import { CmsStaticDataProvider } from "crownpeak-dxm-sdk-core";

@Component
export default class CmsStaticPage extends CmsPage {
    beforeCreate(): void {
        this.cmsDataProvider = new CmsStaticDataProvider();
    }
}