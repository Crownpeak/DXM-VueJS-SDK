import Vue from 'vue';
import { Component, VNode, VNodeData } from 'vue/types';
import CmsComponent from './cmsComponent';
import { CmsDataCache } from "crownpeak-dxm-sdk-core";

export default Vue.extend({
    extends: CmsComponent,
    name: "CmsDropZoneComponent",
    props: ['name'],
    methods: {
        getComponents: function(createElement: (tag?: Component, data?: VNodeData) => VNode, componentRegistry: {[key: string]: Component})
        {
            const data = (CmsDataCache.get(CmsDataCache.cmsAssetId).DropZones || {})[this.name] || [];

            const components : any[] = [];
            data.map((component: any) => {
                const key = Object.keys(component)[0]
                const instance = createElement(componentRegistry[key], {props: {data : component[key]}})
                components.push(instance)
            })

            return components;
        }
    }
})