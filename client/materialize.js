import 'materialize-css/dist/css/materialize.css';
import 'flag-icon-css/css/flag-icon.css';
import 'materialize-css/dist/js/materialize.js';
import './materialize.styl';

import Widget from './widget';

new Widget({
	materializeCSS: true,
	amount: 5,
	currency: 'PLN',
	amountText: '#amountText',
	currencyText: '#currencyText',
	checkoutText: '#checkoutWith',
	errorText: '.errorText',
	paymentForm: '#paymentForm',
	paymentMethods: '#paymentMethods',
	cardHolder: '#cardHolder',
	cardHolderErrText: null,
	cardNumber: '#cardNumber',
	cardNumberErrText: null,
	expireMonth: '#expireMonth',
	expireYear: '#expireYear',
	cvv: '#cvv',
	cvvErrText: null,
	country: '#country',
	preloader: '#preloader',
	onSuccess: function (message) {
		Materialize.toast(message, 4000)
	}
});