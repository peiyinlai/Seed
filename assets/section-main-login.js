class CustomerLogin {
  constructor() {
    this.form = document.querySelector('#login-customer-form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.handleTabSwitch();
    this.handleTogglePwdInput();

    const thirdLoginContainer = this.form.querySelector('#third-login-container');
    const loginOptions = thirdLoginContainer
      ? {
          thirdLogin: {
            container: thirdLoginContainer,
            handleSuccess: () => {
              window.location.href = window.routes.account_url;
            },
            handleError: (error) => {
              console.log(error);
            },
          },
        }
      : {};

    this.login = new window.Shopline.customerAccount.Login(this.form, loginOptions);
  }

  onSubmitHandler(e) {
    e.preventDefault();
    if (this.submitBtn.classList.contains('loading')) {
      return;
    }

    this.submitBtn.classList.add('loading');

    this.login
      .submit()
      .then(() => {
        this.handleSetErrorMsg(null);
        window.location.href = window.routes.account_url;
      })
      .catch((err) => {
        this.handleSetErrorMsg(err);
      })
      .finally(() => {
        this.submitBtn.classList.remove('loading');
      });
  }

  handleTabSwitch() {
    const tab = document.querySelector('#login-customer-tab');
    const email = document.querySelector('.field[data-type="email"]');
    const mobile = document.querySelector('.field[data-type="mobile"]');
    const emailTab = tab && tab.querySelector('a[data-type="email"]');
    const mobileTab = tab && tab.querySelector('a[data-type="mobile"]');

    const map = {
      email,
      mobile,
    };
    const tabMap = {
      email: emailTab,
      mobile: mobileTab,
    };

    function omitFormItem() {
      [email, mobile].forEach((field) => {
        const input = field.querySelector('input');
        if (!input.getAttribute('_name')) {
          input.setAttribute('_name', input.getAttribute('name'));
        }
        if (field.classList.contains('display-none')) {
          input.setAttribute('name', '_');
          input.removeAttribute('required');
          input.setAttribute('disabled', true);
        } else {
          input.setAttribute('name', input.getAttribute('_name'));
          input.setAttribute('required', true);
          input.removeAttribute('disabled');
        }
      });
    }

    if (tab) {
      mobile.classList.add('display-none');
      omitFormItem();

      tab.querySelectorAll('a[data-type]').forEach((el) => {
        el.addEventListener('click', (e) => {
          const type = e.currentTarget.getAttribute('data-type');
          if (map[type]) {
            Object.keys(map).forEach((t) => {
              if (t === type) {
                map[t].classList.remove('display-none');
                tabMap[t].classList.add('active');
              } else {
                map[t].classList.add('display-none');
                tabMap[t].classList.remove('active');
              }
            });
            omitFormItem();
          }
        });
      });
    }
  }

  handleTogglePwdInput() {
    const ctrl = this.form.querySelector('#toggle-password');
    const pwdInput = this.form.querySelector('#Password');
    if (ctrl) {
      const showBtn = ctrl.querySelector('#pwd--show');
      const hidenBtn = ctrl.querySelector('#pwd--hiden');
      ctrl.addEventListener('click', () => {
        if (pwdInput.type === 'password') {
          pwdInput.type = 'text';
          showBtn.classList.add('display-none');
          hidenBtn.classList.remove('display-none');
        } else {
          pwdInput.type = 'password';
          hidenBtn.classList.add('display-none');
          showBtn.classList.remove('display-none');
        }
      });
    }
  }

  handleSetErrorMsg(error) {
    if (!error) {
      this.form.querySelector('#customer-error-message').innerHTML = '';
      this.form.querySelector('#customer-error-message').removeAttribute('data-code');
      return;
    }
    if ('msg' in error) {
      this.form.querySelector('#customer-error-message').innerHTML = error.msg;
      return;
    }
    this.form.querySelector('#customer-error-message').innerHTML = error;
  }
}

window.Shopline.loadFeatures(
  [
    {
      name: 'customer-account-api',
      version: '0.3',
    },
  ],
  function callback(error) {
    if (error) {
      throw error;
    }

    new CustomerLogin();
  },
);
