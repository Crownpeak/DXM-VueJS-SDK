<template>
    <div className="container">
        <h1 class="display-3">{ heading }</h1>
        { description }
        <p><a className="btn btn-primary btn-lg" href="#" role="button">{ button_text }</a></p>
    </div>
</template>
<script>
    export default {
        name: "HeroContainer",
        data() {
            return {
                heading: 'Heading',
                description: "Description",
                button_text: "Click here..."
            }
        }
    };
</script>