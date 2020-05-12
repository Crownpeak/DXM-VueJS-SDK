<template>
    <div class="nav-scroller py-1 mb-2">
        <nav class="nav d-flex justify-content-between">
            <a v-for="topic in topics" :key="topic" class="p-2 text-muted" href="#">{{ topic }}</a>
        </nav>
    </div>
</template>
<script>
    import { CmsComponent, CmsStaticDataProvider } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "TopicList",
        data() {
            return {
                topics: CmsStaticDataProvider.getCustomData("topics.json")
            }
        }
    };
</script>