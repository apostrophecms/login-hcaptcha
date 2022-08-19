const assert = require('assert').strict;
const testUtil = require('apostrophe/test-lib/test');

const getSiteConfig = function () {
  return {
    // TODO remove comment?
    // hCaptcha test keys
    // https://docs.hcaptcha.com/#integration-testing-test-keys
    site: '10000000-ffff-ffff-ffff-000000000001',
    secret: '0x0000000000000000000000000000000000000000'
  };
};

const getAppConfig = function (siteConfig = getSiteConfig()) {
  return {
    '@apostrophecms/express': {
      options: {
        port: 4242,
        // csrf: {
        //   exceptions: [ '/api/v1/@apostrophecms/form/submit' ]
        // },
        session: {
          secret: 'test-this-module'
        },
        apiKeys: {
          skeleton_key: { role: 'admin' }
        }
      }
    },
    '@apostrophecms/login-hcaptcha': {
      options: {
        testOption: 'surprise'
      }
    },
    '@apostrophecms/login': {
      options: {
        hcaptcha: {
          site: siteConfig.site,
          secret: siteConfig.secret
        }
      }
    }
  };
};

const getUserConfig = function () {
  return {
    username: 'marygold',
    pw: 'asdfjkl;'
  };
};

describe('Forms module', function () {
  let apos;

  this.timeout(25000);

  before(async function () {
    apos = await testUtil.create({
      shortname: 'loginTest',
      testModule: true,
      modules: getAppConfig()
    });
  });

  after(async function () {
    await testUtil.destroy(apos);
  });

  // Improving
  it.only('should improve the login module', function () {
    const login = apos.modules['@apostrophecms/login'];

    const actual = login.options.testOption;
    const expected = 'surprise';

    assert.equal(actual, expected);
  });

  it.only('should be able to insert test user', async function() {
    const mary = getUserConfig();

    const user = apos.user.newInstance();
    user.title = 'Mary Gold';
    user.username = mary.username;
    user.password = mary.pw;
    user.email = 'mary@gold.rocks';
    user.role = 'editor';

    const doc = await apos.user.insert(apos.task.getReq(), user);

    const actual = !!doc._id;
    const expected = true;

    assert.equal(actual, expected);
  });

  it('should not be able to login a user without meeting the beforeSubmit requirement', function() {
    const jar = apos.http.jar();
    const siteConfig = getSiteConfig();
    const mary = getUserConfig();

    const actual = async function () {
      // establish session
      let page = await apos.http.get('/', { jar });
      // assert.ok(page.match(/logged out/), 'page contains logged out in body');

      const context = await apos.http.post(
        '/api/v1/@apostrophecms/login/context',
        {
          method: 'POST',
          body: {},
          jar
        }
      );

      // assert.equal(context.requirementProps.AposHcaptcha.sitekey, siteConfig.site);

      await apos.http.post(
        '/api/v1/@apostrophecms/login/login',
        {
          method: 'POST',
          body: {
            username: mary.username,
            password: mary.pw,
            session: true
          },
          jar
        }
      );

      // Make sure it really didn't work
      page = await apos.http.get('/', { jar });
      // assert.ok(page.match(/logged out/), 'page contains logged out in body');
      console.log(siteConfig, page, context);
    };
    const expected = {
      status: 400,
      message: 'The hCaptcha token was missing while verifying login.',
      data: {
        requirement: 'AposHcaptcha'
      }
    };

    assert.rejects(actual, expected);
  });

  it.only('should log in with a hcaptcha token', async function() {
    const mary = getUserConfig();

    const jar = apos.http.jar();

    // establish session
    let page = await apos.http.get('/', { jar });
    assert.ok(page.match(/logged out/), 'page contains logged out in body');

    await apos.http.post(
      '/api/v1/@apostrophecms/login/login',
      {
        method: 'POST',
        body: {
          username: mary.username,
          password: mary.pw,
          session: true,
          requirements: {
            // The hCaptcha test keys accept any token value.
            AposHcaptcha: 'valid-token'
          }
        },
        jar
      }
    );

    page = await apos.http.get('/', { jar });
    assert.ok(page.match(/logged in/), 'page contains logged in in body');
  });
});
