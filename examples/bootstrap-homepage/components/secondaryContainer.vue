<template>
    <div className="col-md-4">
        <h2>{ heading }</h2>
        { description }
        <p><a className="btn btn-secondary" href="#" role="button">{ button_text }</a></p>
    </div>
</template>
<script>
    export default {
        name: "SecondaryContainer",
        data() {
            return {
                heading: 'Heading',
                description: "Description",
                button_text: "Click here..."
            }
        }
    };
</script>