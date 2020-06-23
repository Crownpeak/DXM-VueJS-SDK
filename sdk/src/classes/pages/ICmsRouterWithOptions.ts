import VueRouter, { RouterOptions } from "vue-router";

export default interface ICmsRouter extends VueRouter {
    options: RouterOptions;
}