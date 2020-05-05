<template>
    <div>
        <div class="jumbotron">
            <HeroContainer />
        </div>
        <div class="container">
            <div className="row">
                <SecondaryContainer/>
                <SecondaryContainer/>
                <SecondaryContainer/>
            </div>
        </div>
        <hr/>
    </div>
</template>
<script>
    import HeroContainer from '../components/heroContainer.vue';
    import SecondaryContainer from '../components/secondaryContainer.vue';

    export default {
        name: "HomePage",
        components: {
            HeroContainer,
            SecondaryContainer
        }
    };
</script>