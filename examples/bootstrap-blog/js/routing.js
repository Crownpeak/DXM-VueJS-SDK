import BlogPage from "../pages/blogPage.vue";
import Vue from "vue";
import VueRouter from "vue-router";
import App from "../apps/app.vue";

export default class Routing {
    static get routes()
    {
        return this._routes || [];
    }

    static set routes(r)
    {
        this._routes = r;
    }

    static processRoutes()
    {
        const componentRegistry = {
            "BlogPage": BlogPage
        };

        fetch('/routes.json')
            .then(res => res.json())
            .then((routeData) => {

                let routes = [];
                Object.keys(routeData).forEach(function(key) {
                    const route = {
                        "path": routeData[key].path,
                        "component": componentRegistry[routeData[key].component],
                        "cmsassetid": routeData[key].cmsassetid
                    };
                    routes.push(route);
                });

                const router = new VueRouter({routes});
                Vue.use(VueRouter);

                new Vue({
                    el: "#app",
                    router,
                    template: "<App/>",
                    components: { App }
                });
            })
            .catch(console.log);
    }
}

Routing.routes = [];