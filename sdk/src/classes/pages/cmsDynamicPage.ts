import Component from 'vue-class-component';
import CmsPage from "./cmsPage";
import { CmsDynamicDataProvider } from 'crownpeak-dxm-sdk-core';

@Component
export default class CmsDynamicPage extends CmsPage {
    beforeCreate(): void {
        this.cmsDataProvider = new CmsDynamicDataProvider();
    }
}