<template>
    <div>
        <h1>Non-Crownpeak Component</h1>
    </div>
</template>
<script>
    import Vue from 'vue';
    import Component from 'vue-class-component';
    export default {
        extends: Vue,
        name: "NonCrownpeakComponent",
        props: ['data']
    };
</script>
