import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
//@ts-ignorets
import * as VueGoogleMaps from "vue2-google-maps";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.config.productionTip = false;

Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_GOOGLE_MAP_API,
    libraries: "places",
  },
  autobindAllEvents: true,
})
  .use(BootstrapVue)
  .use(IconsPlugin);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
