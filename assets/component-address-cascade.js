defineCustomElement(
  'address-cascade',
  () =>
    class AddressCascade extends HTMLElement {
      constructor() {
        super();
        this.countryEl = document.getElementById('AddressCountry');
        this.provinceEl = document.getElementById('AddressProvince');
        this.cityEl = document.getElementById('AddressCity');
        this.cityInputEl = document.getElementById('AddressCityInput');
        this.districtEl = document.getElementById('AddressDistrict');
        this.districtInputEl = document.getElementById('AddressDistrictInput');
        this.provinceContainer = document.getElementById('AddressProvinceContainer');
        this.cityContainer = document.getElementById('AddressCityContainer');
        this.cityInputContainer = document.getElementById('AddressCityInputContainer');
        this.districtContainer = document.getElementById('AddressDistrictContainer');
        this.districtInputContainer = document.getElementById('AddressDistrictInputContainer');

        this.initCountry();
        this.bindEvent();
        const hasNextLevel = this.createProvinceOptions();
        if (hasNextLevel) {
          this.initProvince();
          this.createCityOptions().then((hasDistrictLevel) => {
            if (hasDistrictLevel) {
              this.toggleCityInputContainer(false);
              this.toggleDistrictInputContainer(false);

              this.initCity();
              this.createDistrictOptions().then(() => {
                this.initDistrict();
              });
            } else {
              // If there are no city and district data
              // show the city and district input instead
              this.toggleCityInputContainer(true);
              this.toggleDistrictInputContainer(true);

              this.initCityInput();
              this.initDistrictInput();
            }
          });
        } else {
          // If there is no province data
          // show the city and district input
          this.toggleCityInputContainer(true);
          this.toggleDistrictInputContainer(true);

          this.initCityInput();
          this.initDistrictInput();
        }
      }

      bindEvent() {
        window.Shopline.addListener(this.countryEl, 'change', window.Shopline.bind(this.countryHandler, this));
        window.Shopline.addListener(this.provinceEl, 'change', window.Shopline.bind(this.provinceHandler, this));
        window.Shopline.addListener(this.cityEl, 'change', window.Shopline.bind(this.cityHandler, this));
      }

      initCountry() {
        this.backfillDefault(this.countryEl);
      }

      initProvince() {
        this.backfillDefault(this.provinceEl);
      }

      initCity() {
        this.backfillDefault(this.cityEl);
      }

      initCityInput() {
        this.backfillInputDefault(this.cityInputEl);
      }

      initDistrict() {
        this.backfillDefault(this.districtEl);
      }

      initDistrictInput() {
        this.backfillInputDefault(this.districtInputEl);
      }

      // backfill default value
      backfillDefault(selectElement) {
        const value = selectElement.getAttribute('data-default');
        if (value && selectElement.options.length > 0) {
          this.setSelectorByValue(selectElement, value);
        }
      }

      backfillInputDefault(selectElement) {
        const value = selectElement.getAttribute('data-default');
        if (value) {
          selectElement.value = value;
        }
      }

      // Obtain street information and create options according to the country, province and region
      createDistrictOptions() {
        const countryName = this.countryEl.value;
        const province = this.provinceEl.value;
        const city = this.cityEl.options[this.cityEl.selectedIndex].innerText;
        return this.fetchAddressNextLevel({
          countryName,
          province: [province, city].join(','),
        }).then((response) => {
          this.clearOptions(this.districtEl);
          if (!response.data.length) {
            this.districtContainer.style.display = 'none';
            return false;
          }
          response.data.forEach((cityOption) => {
            this.createOption(this.districtEl, {
              value: cityOption.code,
              innerHTML: cityOption.name,
            });
          });
          this.districtContainer.style.display = '';
          return true;
        });
      }

      cityHandler() {
        this.createDistrictOptions();
      }

      // Get street information based on country and province and create options
      createCityOptions() {
        const countryName = this.countryEl.value;
        const province = this.provinceEl.value;
        return this.fetchAddressNextLevel({
          countryName,
          province,
        }).then((response) => {
          this.clearOptions(this.cityEl);
          if (!response.data.length) {
            this.cityContainer.style.display = 'none';
            this.districtContainer.style.display = 'none';
            this.clearOptions(this.districtEl);
            return false;
          }
          response.data.forEach((city) => {
            this.createOption(this.cityEl, {
              value: city.code,
              innerHTML: city.name,
            });
          });
          this.cityContainer.style.display = '';
          return true;
        });
      }

      provinceHandler() {
        return this.createCityOptions().then((hasNextLevel) => {
          if (hasNextLevel) {
            this.toggleCityInputContainer(false);
            this.toggleDistrictInputContainer(false);

            this.createDistrictOptions();
          } else {
            // If there are no city and district data
            // show the city and district input instead
            this.toggleCityInputContainer(true);
            this.toggleDistrictInputContainer(true);
          }
        });
      }

      createProvinceOptions() {
        const opt = this.countryEl.options[this.countryEl.selectedIndex];
        const raw = opt.getAttribute('data-provinces');
        const provinces = JSON.parse(raw);

        this.clearOptions(this.provinceEl);
        if (provinces && provinces.length === 0) {
          this.provinceContainer.style.display = 'none';
          this.cityContainer.style.display = 'none';
          this.districtContainer.style.display = 'none';
          this.clearOptions(this.districtEl);
          this.clearOptions(this.cityEl);
          return false;
        }

        for (let i = 0; i < provinces.length; i++) {
          this.createOption(this.provinceEl, {
            value: provinces[i][0],
            innerHTML: provinces[i][1],
          });
        }

        this.provinceContainer.style.display = '';
        return true;
      }

      toggleDistrictInputContainer(show) {
        this.districtInputContainer.querySelector('input').value = '';
        if (show) {
          this.districtInputContainer.style.display = '';
        } else {
          this.districtInputContainer.style.display = 'none';
        }
      }

      toggleCityInputContainer(show) {
        this.cityInputContainer.querySelector('input').value = '';
        if (show) {
          this.cityInputContainer.style.display = '';
        } else {
          this.cityInputContainer.style.display = 'none';
        }
      }

      countryHandler() {
        const hasNextLevel = this.createProvinceOptions();
        if (hasNextLevel) {
          this.provinceHandler();
        } else {
          // If there is no province data
          // show the city and district input
          this.toggleCityInputContainer(true);
          this.toggleDistrictInputContainer(true);
        }
      }

      createOption(parentEl, option) {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.innerHTML = option.innerHTML;
        parentEl.appendChild(opt);
      }

      clearOptions(selector) {
        while (selector.firstChild) {
          selector.removeChild(selector.firstChild);
        }
      }

      setSelectorByValue(selector, value) {
        for (let i = 0, count = selector.options.length; i < count; i++) {
          const option = selector.options[i];
          if (value === option.value || value === option.innerHTML) {
            selector.selectedIndex = i;
            return i;
          }
        }
      }

      fetchAddressNextLevel(params) {
        const { countryName, province } = params;
        return fetch(
          `${window.routes.address_url}?countryName=${countryName}&addressNames=${province}&language=${window.Shopline.locale}`,
        ).then((response) => response.json());
      }
    },
);
