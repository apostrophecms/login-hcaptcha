<template>
  <div
    class="h-captcha"
    :data-sitekey="sitekey"
  >
  </div>
</template>

<script>
export default {
  emits: [ 'done', 'block' ],
  props: {
    sitekey: String
  },
  data() {
    return {
      token: null
    };
  },
  mounted(){
    if (!window.hcaptcha) {
      this.addScript();
    }

    this.executeHcaptcha();
  },
  watch: {
    token(newVal) {
      if (newVal) {
        this.$emit('done', this.token);
      } else {
        this.$emit('block');
      }
    }
  },
  methods: {
    addScript() {
      let scriptElem = document.createElement('script');

      scriptElem.setAttribute('src', 'https://js.hcaptcha.com/1/api.js');
      scriptElem.setAttribute('async', true);
      scriptElem.setAttribute('defer', true);

      document.head.appendChild(scriptElem);
    },
    executeHcaptcha() {
      if (!window.hcaptcha) {
        setTimeout(this.executeHcaptcha, 100);
        return;
      }

      hcaptcha
        .execute(this.sitekey, { action: 'submit' })
        .then(token => {
          this.token = token;
        });
    }
  }
};
</script>

<style scoped></style>
