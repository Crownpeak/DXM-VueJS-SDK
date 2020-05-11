<template>
    <div class="p-3">
        <h4 class="font-italic">Archives</h4>
        <ol class="list-unstyled mb-0">
            <li v-for="month in months" :key="month"><router-link :to="'posts/months/' + month.substr(0,7)">[{{ new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' }) }}]</router-link></li>
        </ol>
    </div>
</template>
<script>
    import { CmsComponent, CmsDynamicDataProvider } from 'crownpeak-dxm-vuejs-sdk';
    export default {
        extends: CmsComponent,
        name: "PostArchives",
        data() {
            return {
                months: []
            }
        },
        mounted() {
            const posts = CmsDynamicDataProvider.getDynamicQuery("q=*:*&fq=custom_s_type:\"Blog%20Page\"&rows=0&facet=true&facet.mincount=1&facet.range=custom_dt_created&f.custom_dt_created.facet.range.start=NOW/YEAR-1YEAR&f.custom_dt_created.facet.range.end=NOW/YEAR%2B1YEAR&f.custom_dt_created.facet.range.gap=%2B1MONTH");
            this.months = posts.facet_counts.facet_ranges.custom_dt_created.counts.filter((_c, i) => i%2 === 0);
        }
    };
</script>