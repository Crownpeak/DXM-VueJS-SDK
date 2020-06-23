import { RouteConfigSingleView } from "vue-router/types/router";

export default interface ICmsRouteConfigSingleView extends RouteConfigSingleView {
    cmsassetid?: number;
}