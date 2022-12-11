<template>
  <div ref="chart"></div>
</template>

<script>
  export default {
    props: ['symbol'],
    asyncData({ params }) {
      return fetch(`http://localhost:5000/?${params}`)
        .then( res => res.json())
    },
    data() {
      return {

      }
    },
    
    mounted() {

    }
  }
</script>
