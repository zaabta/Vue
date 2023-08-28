<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.pac-container {
  background-color: #fff;
  z-index: 9999;
  position: fixed;
  display: inline-block;
  float: left;
  width: 100%;
}
</style>
