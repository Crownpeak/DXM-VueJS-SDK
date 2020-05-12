<template>
    <div>
        <div class="container">
            <Header month="this.props.match.params.month"/>
            <TopicList/>
            <div class="jumbotron p-3 p-md-5 text-white rounded bg-dark">
                <FeaturedPost/>
            </div>
            <div class="row mb-2">
                <div class="col-md-6">
                    <SecondaryPost/>
                </div>
                <div class="col-md-6">
                    <SecondaryPost/>
                </div>
            </div>
        </div>
        <main role="main" class="container">
            <div class="row">
                <div class="col-md-8 blog-main">
                    <h3 class="pb-3 mb-4 font-italic border-bottom">
                        From the Firehose
                    </h3>
                    <BlogPost/>
                </div>
                <aside class="col-md-4 blog-sidebar">
                    <PostArchives/>
                </aside>
            </div>
        </main>
        <Footer/>
    </div>
</template>
<script>
    import { CmsStaticPage, CmsDynamicPage } from 'crownpeak-dxm-vuejs-sdk';
    import Header from '../components/header.vue';
    import TopicList from '../components/topicList.vue';
    import FeaturedPost from '../components/featuredPost.vue';
    import SecondaryPost from '../components/secondaryPost.vue';
    import BlogPost from '../components/blogPost.vue';
    import PostArchives from '../components/postArchives.vue';
    import Footer from '../components/footer.vue';

    export default {
        extends: CmsDynamicPage,
        name: "BlogPage",
        components: {
            Header,
            TopicList,
            FeaturedPost,
            SecondaryPost,
            BlogPost,
            PostArchives,
            Footer
        }
    };
</script>