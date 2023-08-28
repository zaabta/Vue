<template id="vue-autocomplete">
  <div
    class="autocomplete-form"
    @keydown.down="
      selectedIndex = selectedIndex < valuesShowing.length - 1 ? selectedIndex + 1 : selectedIndex
    "
    @keydown.up="selectedIndex = selectedIndex > -1 ? selectedIndex - 1 : selectedIndex"
    @keydown.enter="onEnterClicked"
    @focusin="visible = true"
    @focusout="
      visible = false;
      selectedIndex = 0;
    "
  >
    <div class="autocomplete-form-input-elements">
      <input
        id="autocomplete-form-input"
        autocomplete="off"
        class="w-100"
        @input="onInputHandler"
        v-model="text"
        type="text"
      />
    </div>
    <div class="list-group list-group-flush autocomplete-form-items" :class="{ hide: !visible }">
      <button
        v-for="(val, index) in valuesShowing"
        :key="index"
        :data-id="index"
        class="list-group-item list-group-item-action"
        :class="{ active: selectedIndex == index }"
        @click="onClickHandler"
        @mouseover="selectedIndex = index"
      >
        {{ val }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
@Component
export default class VueAutocomplete extends Vue {
  valuesShowing: string[] = [];
  visible: boolean = false;
  selectedIndex: number = 0;
  text: string = "";
  @Prop() private value!: string;
  @Prop() private values!: string[];
  @Prop() private google!: any[];

  onInputHandler(e: any) {
    this.$data.valuesShowing = this.$props.values
      .filter((a: any) => a.includes(e.target.value))
      .splice(0, 5);
    this.$emit("input", this.$data.text);
  }

  onClickHandler(e: any) {
    this.$data.text = e.target.innerHTML.trim();
    this.selectedIndex = e.target.dataset["id"];
    this.$emit("input", this.$data.text);
    e.target.blur();
  }

  onEnterClicked(e: any) {
    this.$data.text = this.$data.valuesShowing[this.$data.selectedIndex].trim();
    this.$emit("input", this.$data.text);
    e.target.blur();
  }
  @Watch("text")
  onChangeText(newText: string) {
    this.Autocomplete(newText);
  }

  Autocomplete(input: string) {
    let url = `https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.VUE_APP_GOOGLE_MAP_API}&address=`;
    fetch(url + input)
      .then((response) => response.json())
      .then((jsonResult) => {
        if (jsonResult.status === "OK") {
          console.log(
            jsonResult.results[0].address_components[0].long_name,
            jsonResult.results[0].geometry.location
          );
        }
        console.log(jsonResult);
      });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.autocomplete-form {
  margin: {
    top: 25px;
    left: 15px;
    right: 15px;
  }

  &-input-elements {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
  }

  &-items {
    position: absolute;
    width: inherit;
    border: {
      width: 1px;
      style: solid;
      color: lightgrey;
    }
  }

  input {
    margin-bottom: 1px;
  }
  .hide {
    display: none;
  }
}
</style>
