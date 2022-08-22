<template>
  <div
    class="h-captcha"
    :data-sitekey="sitekey"
    @data-callback="verify"
    @data-expired-callback="expire"
    @data-error-callback="error"
  >
  </div>
</template>

<script>
export default {
  emits: [ 'done', 'block' ],
  props: {
    sitekey: String,
    url: {
      type: String,
      default: 'https://js.hcaptcha.com/1/api.js?render=explicit'
    }
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
      console.log('watch', newVal, this.token);
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
      scriptElem.setAttribute('src', this.url);
      scriptElem.setAttribute('async', true);
      scriptElem.setAttribute('defer', true);

      document.head.appendChild(scriptElem);
    },
    verify(...args) {
      console.log('verify', args);
    },
    expire(...args) {
      console.log('expire', args);
    },
    error(...args) {
      console.log('error', args);
    },
    executeHcaptcha() {
      if (!window.hcaptcha) {
        setTimeout(this.executeHcaptcha, 100);
        return;
      }

      // TODO careful with this & arrow function
      // console.log('!!', this.sitekey, hcaptcha, window.hcaptcha);
      // hcaptcha.execute();
      // hcaptcha.$on('verify', (token, eKey) => {
      //   console.log('Verified', {token, eKey});
      // });
      hcaptcha
        .execute();
        // .execute(undefined, { async: 'true' })
        // .then(token => {
        //   console.log('@@', token, this.token);
        //   this.token = token;
        // });
    }
  }
};
</script>

<style scoped>
</style>
