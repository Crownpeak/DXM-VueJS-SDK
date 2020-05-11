import Vue from "vue";
import HomePage from "../pages/homePage";

import { CmsCore } from 'crownpeak-dxm-vuejs-sdk';
CmsCore.init(process.env.CMS_STATIC_CONTENT_LOCATION, process.env.CMS_DYNAMIC_CONTENT_LOCATION);

new Vue({
    el: "#app",
    render: h => h(HomePage)
});