module.exports = {
  improve: '@apostrophecms/login',
  requirements(self) {

    if (!self.options.hcaptcha || !self.options.hcaptcha.site || !self.options.hcaptcha.secret) {
      throw new Error('The login hCaptcha site key, secret key, or both are not configured');
    }

    return {
      add: {
        AposHcaptcha: {
          phase: 'beforeSubmit',
          async props(req) {
            return {
              sitekey: self.options.recaptcha.site
            };
          },
          async verify(req, data) {
            console.log('data', data);
            if (!data) {
              throw self.apos.error('invalid', req.t('AposHcaptcha:missingConfig'));
            }

            await self.checkHcaptcha(req, data);
          }
        }
      }
    };
  },
  methods(self) {
    return {
      async checkHcaptcha(req, token) {
        const { secret } = self.options.hcaptcha;

        if (!secret) {
          return;
        }

        try {
          const url = 'https://hcaptcha.com/siteverify';
          const hcaptchaUri = `${url}?secret=${secret}&response=${token}`;

          const response = await self.apos.http.post(hcaptchaUri);

          if (!response.success) {
            throw self.apos.error('invalid', req.t('AposHcaptcha:invalidToken'));
          }
        } catch (e) {
          self.apos.util.error(e);
          throw self.apos.error('error', req.t('AposHcaptcha:recaptchaErr'));
        }
      }
    };
  }
};
