<template>
  <div>
    <h3 v-if="items.length > 0">Passenger Information for {{ title }} Trip</h3>
    <b-table striped hover :items="items"></b-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Passenger } from "@/views/MapView.vue";

@Component
export default class HelloWorld extends Vue {
  @Prop() public items!: Passenger[];
  @Prop() public title!: string[];
}
</script>

<style scoped lang="scss"></style>
