import './widget.styl';

import Cleave  from 'cleave.js/src/Cleave.js';
import iso3166 from '../lib/iso-3166-2.json';

export default class Widget {
	constructor (props) {
		if (!props) throw new Error('options is required');
		if ('object' != typeof props) throw new Error('Widget options is required');
		if (!props.amount) throw new Error('amount option is required');
		if ('number' != typeof props.amount) throw new Error('amount not a number');

		this.amount = props.amount;
		this.currency = ('string' == typeof props.currency) ? props.currency : 'PLS';

		if (API_KEY) {
			this.API_KEY = API_KEY;
		}

		if (props.api_key) this.API_KEY = props.api_key;

		let fields = ['paymentForm', 'paymentMethods', 'cardHolder', 'cardNumber', 'expireMonth', 'expireYear', 'cvv', 'country', 'amountText', 'currencyText'];

		for (let i = 0, l = fields.length; i < l; i++) {
			if (!props[fields[i]] || ('string' != typeof props[fields[i]])) {
				throw new Error(`"${fields[i]}" selector not a string`);
			}
		}

		this.paymentForm         = document.querySelector(props.paymentForm);
		this.paymentMethods      = this.paymentForm.querySelector(props.paymentMethods);
		this.cardHolderFiled     = this.paymentForm.querySelector(props.cardHolder);
		this.cardNumberFiled     = this.paymentForm.querySelector(props.cardNumber);
		this.expireMonthSelector = this.paymentForm.querySelector(props.expireMonth);
		this.expireYearSelector  = this.paymentForm.querySelector(props.expireYear);
		this.cvvField            = this.paymentForm.querySelector(props.cvv);
		this.countrySelector     = this.paymentForm.querySelector(props.country);
		this.preloader           = document.querySelector(props.preloader);
		this.errorText           = document.querySelector(props.errorText);
		this.checkoutText        = document.querySelector(props.checkoutText);
		this.materializeCSS      = props.materializeCSS;
		this.cardHolderErrText   = document.querySelector(props.cardHolderErrText);
		this.cardNumberErrText   = document.querySelector(props.cardNumberErrText);
		this.cvvErrText          = document.querySelector(props.cvvErrText);

		if (props.onSuccess) {
			if ('function' != typeof props.onSuccess) {
				throw new Error(`"onSuccess" is not a function`);
			} else {
				this.onSuccess = props.onSuccess;
			}
		}
		if (this.preloader) this.preloader.classList.add('widget-preloader_hidden');

		document.querySelector(props.amountText).textContent = this.amount;
		document.querySelector(props.currencyText).textContent = this.currency;

		createCounties(this.countrySelector);
		this.countryHandle();

		createMonths(this.expireMonthSelector);

		createYears(this.expireYearSelector);
		this.expireYearHandle();

		if (this.materializeCSS) {
			$(this.expireMonthSelector).material_select();
			$(this.countrySelector).material_select();
			$(this.expireYearSelector).material_select();
		}

		this.cardHolderHandle();
		this.cardNumberHandle();
		this.cvvHandle();


		this.loadPaymentMethods();

		this.paymentForm.addEventListener('submit', ev => {
			ev.preventDefault();
			this.submit();
		});
	}

	countryHandle () {
		if (this.materializeCSS) {
			$(this.countrySelector).on('change', ev => { // w/o jquery materialize works incorrect
				this.countryCode = ev.target.value;
			});
		} else {
			this.countrySelector.addEventListener('change', ev => {
				this.countryCode = ev.target.value;
			});
		}
	}

	cardHolderHandle () {
		this.cardHolderFiled.addEventListener('input', ev => {
			if (!/^[a-zA-Z\s]+$/.test(ev.target.value)) {
				ev.target.value = ev.target.value.slice(0, -1);
			}
			if (this.cardHolderErrText && this.cardHolderErrText.textContent) {
				this.cardHolderErrText.textContent = '';
			} else if (this.materializeCSS) {
				this._onFieldBlur(ev.target);
			}
		});

		this.cardHolderFiled.addEventListener('blur', ev => {
			if (this.cardHolderErrText && this.cardHolderErrText.textContent) {
				this.cardHolderErrText.textContent = '';
			} else if (this.materializeCSS) {
				this._onFieldBlur(ev.target);
			}
		});
	}

	cardNumberHandle () {
		new Cleave(this.cardNumberFiled, {
			creditCard: true,
			delimiter: ' '
		});

		this.cardNumberFiled.addEventListener('input', ev => {
			if (this.cardNumberErrText && this.cardNumberErrText.textContent) {
				this.cardNumberErrText.textContent = '';
			} else if (this.materializeCSS) {
				this._onFieldBlur(ev.target);

			}
		});

		this.cardNumberFiled.addEventListener('blur', ev => {
			if (this.cardNumberErrText && this.cardNumberErrText.textContent) {
				this.cardNumberErrText.textContent = '';
			} else if (this.materializeCSS) {
				this._onFieldBlur(ev.target);
			}
		});
	}

	monthValidator () {
		let currentDate  = new Date();
		let currentYear  = currentDate.getFullYear();
		let selectedYear = Number(this.expireYearSelector.value) || currentYear;
		let currentMonth = currentDate.getMonth();
		let monthOptions = this.expireMonthSelector.querySelectorAll('option');

		if (selectedYear > currentYear) {
			for (let i = 0, l = monthOptions.length; i < l; i++) {
				if (i == 0 && monthOptions.length == 13) {
					monthOptions[i].setAttribute('disabled', true);
				} else {
					monthOptions[i].removeAttribute('disabled');
				}
			}

			if (this.materializeCSS) {
				$(this.expireMonthSelector).material_select('destroy');
				$(this.expireMonthSelector).material_select();
			}

			return;
		}

		if (selectedYear == currentYear) {
			for (let option of monthOptions) {

				if (option.hasAttribute('selected')) {
					option.removeAttribute('selected');
				}

				if (Number(option.value) < currentMonth) {
					option.setAttribute('disabled', true);
					if (option.hasAttribute('selected')) {
						option.removeAttribute('selected');
					}
				}

			}

			if (this.expireMonthSelector.value < currentMonth) this.expireMonthSelector.value = currentMonth;

			if (this.materializeCSS) {
				$(this.expireMonthSelector).material_select('destroy');
				$(this.expireMonthSelector).material_select();
			}
		}
	}

	expireYearHandle () {
		if (this.materializeCSS) {
			$(this.expireYearSelector).on('change', () => { // w/o jquery materialize works incorrect
				this.monthValidator()
			});
		} else {
			this.expireYearSelector.addEventListener('change', () => {
				this.monthValidator();
			});
		}
	}

	cvvHandle () {
		new Cleave(this.cvvField, {
			numeral: true,
			numeralPositiveOnly: true,
			numeralDecimalMark: '',
			delimiter: ''
		});

		this.cvvField.addEventListener('input', ev => {
			if (this.cvvErrText && this.cvvErrText.textContent) {
				this.cvvErrText.textContent = '';
			} else if (this.materializeCSS) {
				this._onFieldBlur(ev.target);

			}
		});

		this.cvvField.addEventListener('blur', ev => {
			if (this.cvvErrText && this.cvvErrText.textContent) {
				this.cvvErrText.textContent = '';
			} else if (this.materializeCSS) {
				this._onFieldBlur(ev.target);

			}
		});
	}

	set countryCode (val) {
		this._countryCode = val;
		this.loadPaymentMethods(val);
	}

	get countryCode () {
		return this._countryCode;
	}

	get selectedPayType () {
		let payType = this.paymentMethods.querySelectorAll('input');
		if (payType) {
			for (let pt of payType) {
				if (pt.checked) return pt.id;
			}
		}
	}

	paymentMethodHandle = ev => {
		if (this.checkoutText) this.checkoutText.textContent = 'Checkout with: ' + ev.target.dataset.name;
		if (this.errorText) this.errorText.innerHTML = ''
	};

	removePaymentListeners () {
		let methods = this.paymentMethods.querySelectorAll('input');
		for (let m of methods) {
			m.removeEventListener('change', this.paymentMethodHandle);
		}
	}

	clearErrors () {
		this.hideDefaultError();
		[
			this.cardHolderErrText,
			this.cardNumberErrText,
			this.cvvErrText
		].forEach(v => {
			if (v && v.textContent) v.textContent = '';
		});
	}

	async loadPaymentMethods (countryCode) {
		let url = new URL('https://api.paymentwall.com/api/payment-systems/');
			url.searchParams.append('key', this.API_KEY);
			url.searchParams.append('sign_version', 2);

		if (countryCode) url.searchParams.append('country_code', countryCode);


		this.disableFields();
		this.clearErrors();

		try {
			let response = await fetch(url.toString(), {
				method: 'GET',
				mode: 'cors',
				credentials: 'omit',
				cache: 'no-store'
			});

			let { status, headers } = response;

			let data = await response.json();

			this.removePaymentListeners();
			this.paymentMethods.innerHTML = '';

			let caption = document.querySelector('#checkoutWith');
			if (caption) caption.textContent = '';

			if (status >= 200 && status < 300) {
				if (Array.isArray(data) && data.length) {

					data.forEach(pm => {
						let container = document.createElement('DIV');
							container.className = 'payment-methods__item';

						let paymentMethodImg = new Image();
							paymentMethodImg.className = 'payment-method-logo';
							paymentMethodImg.src = pm.img_url;
							paymentMethodImg.alt = pm.name;
							paymentMethodImg.title = pm.name;

						container.appendChild(paymentMethodImg);

						let paymentMethodInput = document.createElement('INPUT');
							paymentMethodInput.name = 'payMethod';
							paymentMethodInput.id = pm.id;
							paymentMethodInput.setAttribute('type', 'radio');
							paymentMethodInput.dataset.name = pm.name;
							paymentMethodInput.addEventListener('change', this.paymentMethodHandle);

						// if (i == 0) paymentMethodInput.setAttribute('checked', 'checked');

						let paymentMethodLabel = document.createElement('LABEL');
							paymentMethodLabel.setAttribute('for', pm.id);
							paymentMethodLabel.textContent = pm.name;

						container.appendChild(paymentMethodInput);
						container.appendChild(paymentMethodLabel);

						this.paymentMethods.appendChild(container);
					});
				} else if (false == data) {
					this.paymentMethods.innerHTML = 'Sorry, there is no accepted payment methods for your state :(';
				}
			} else if (status >= 400) {
				this.showDefaultError(data.error);
				// TODO: logger
			}
		} catch (err) {
			if (__DEV__) {
				console.error(err);
			}
		}

		this.enableFields();
	}



	_onFieldBlur (field) {
		if (field.classList.contains('err')) {
			field.classList.remove('err');
			document.querySelector('#' + field.id + ' + label').removeAttribute('data-error');
		}
	}

	get allFileds () { return this.paymentForm.querySelectorAll('input, select, button'); }

	disableFields () { for (let field of this.allFileds) field.setAttribute('disabled', true); }
	enableFields ()  { for (let field of this.allFileds) field.removeAttribute('disabled'); }

	showDefaultError (text) { if (this.errorText) this.errorText.textContent = text; }
	hideDefaultError ()     { if (this.errorText) this.errorText.textContent = '';   }

	hidePreloader () { if (this.preloader) this.preloader.classList.add('widget-preloader_hidden'); }
	showPreloader () { if (this.preloader) this.preloader.classList.remove('widget-preloader_hidden'); }

	validate () {
		let valid = true;

		// TODO: remove copypaste
		if (!this.cardHolderFiled.value.trim()) {
			if (this.cardHolderErrText) {
				this.cardHolderErrText.textContent = 'This field is required';
			} else if (this.materializeCSS) {
				this.cardHolderFiled.classList.add('err');
				document.querySelector('#' + this.cardHolderFiled.id + ' + label').dataset.error = 'This field is required';
			}
			valid = false;
		}

		if (!this.cardNumberFiled.value.trim()) {
			if (this.cardNumberErrText) {
				this.cardNumberErrText.textContent = 'This field is required';
			} else if (this.materializeCSS) {
				this.cardNumberFiled.classList.add('err');
				document.querySelector('#' + this.cardNumberFiled.id + ' + label').dataset.error = 'This field is required';
			}
			valid = false;
		}

		if (!this.cvvField.value.trim()) {
			valid = false;

			if (this.cvvErrText) {
				this.cvvErrText.textContent = 'This field is required';
			} else if (this.materializeCSS) {
				this.cvvField.classList.add('err');
				document.querySelector('#' + this.cvvField.id + ' + label').dataset.error = '';
			}
		}

		let methods = this.paymentMethods.querySelectorAll('input');

		if (!Array.prototype.some.call(methods, m => m.checked)) {
			valid = false;
			this.showDefaultError('Select payment type please');
		}

		return valid;
	}

	async submit () {
		if (!this.validate()) return;

		this.disableFields();
		this.hideDefaultError();
		this.showPreloader();

		let body = {};
			body.amount         = this.amount;
			body.cardHolder     = this.cardHolderFiled.value;
			body.cardNumber     = this.cardNumberFiled.value;
			body.expireYear     = this.expireYearSelector.value;
			body.expireMonth    = this.expireMonthSelector.value;
			body.cvv            = this.cvvField.value;
			body.countryCode    = this.countrySelector.value;
			body._csrf          = this.paymentForm.querySelector('input[name="_csrf"]').value;

		let response;

		try {
			response = await  Promise.race([
				fetch('http://localhost:3000/submit', {
					headers: {
						'x-csrf-token': body._csrf,
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					method: 'POST',
					mode: 'cors',
					credentials: 'omit',
					body: JSON.stringify(body)
				}),
				new Promise((_, reject) => {
					setTimeout(function () {
						reject('timeout');
					}, 7000);
				})
			]);

			let res = await response.json();

			if (response.status >= 200 && 300 > response.status) {
				let message = res.message || JSON.stringify(res);
				this._onSuccess(message);
			} else {
				if (Array.isArray(res.message)) {
					res.message.forEach(m => {
						if ('cvv' == m.field) {
							if (this.cvvErrText) {
								this.cvvErrText.textContent = m.message;
							} else {
								this.showDefaultError(m.message);
							}
						}
					});
				}
			}

		} catch (err) {
			if (__DEV__) console.error(err);
		}

		this.hidePreloader();
		this.enableFields();
	}

	_onSuccess (message) {
		if ('function' == typeof this.onSuccess) {
			this.onSuccess(message);
		}
	}
}

function createCounties (countrySelector) {
	for (let i = 0, l = iso3166.length; i < l; i++) {
		let countryOption = document.createElement('OPTION');
			countryOption.className = 'left flag-icon flag-icon-' + iso3166[i]['alpha-2'].toLowerCase();
			countryOption.value = iso3166[i]['alpha-2'];
			countryOption.textContent = iso3166[i].name;
			countryOption.dataset.icon = '#!';

		countrySelector.appendChild(countryOption);
	}
}

function createMonths (monthsSelector) {
	let currentMonth = (new Date()).getMonth();

	for (let i = 0; i <= 11; i++) {
		let date      = new Date(1970, i, 1);
		let formatter = new Intl.DateTimeFormat('en', { month: 'long' });

		let monthOption = document.createElement('OPTION');
			monthOption.value = i;
			monthOption.textContent = formatter.format(date);

		if (currentMonth == monthOption.value) {
			monthOption.selected = 'selected';
		} else if (monthOption.value < currentMonth) {
			monthOption.setAttribute('disabled', true);
		}

		monthsSelector.appendChild(monthOption);
	}
}

function createYears (yearSelector) {
	for (let i = 0, year = (new Date()).getFullYear(); i <= 20; i++) {
		let yearOption = document.createElement('OPTION');
			yearOption.value = year + i;
			yearOption.textContent = year + i;

		yearSelector.appendChild(yearOption);
	}
}


/*function LuhnAlgorithm (value) {
	if (/[^0-9-\s]+/.test(value)) return false;

	// The Luhn Algorithm. It's so pretty.
	let nCheck = 0, nDigit = 0, bEven = false;
	value = value.replace(/\D/g, '');

	for (let n = value.length - 1; n >= 0; n--) {
		let cDigit = value.charAt(n),
			nDigit = parseInt(cDigit, 10);

		if (bEven) {
			if ((nDigit *= 2) > 9) nDigit -= 9;
		}

		nCheck += nDigit;
		bEven = !bEven;
	}

	return (nCheck % 10) == 0;
}*/
