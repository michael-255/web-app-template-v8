// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  compatibilityDate: "2025-02-17",
  modules: ["nuxt-quasar-ui", "@pinia/nuxt"],
  quasar: {
    plugins: [],
    extras: {
      font: "roboto-font",
    },
    components: {},
  },
});
