import Widget from './widget';

new Widget({
	amount: 5,
	currency: '$',
	amountText: '#amountText',
	currencyText: '#currencyText',
	checkoutText: '#checkoutWith',
	errorText: '.errorText',
	paymentForm: '#paymentForm',
	paymentMethods: '#paymentMethods',
	cardHolder: '#cardHolder',
	cardHolderErrText: '#cardHolderErrText',
	cardNumber: '#cardNumber',
	cardNumberErrText: '#cardNumberErrText',
	expireMonth: '#expireMonth',
	expireYear: '#expireYear',
	cvv: '#cvv',
	cvvErrText: '#cvvErrText',
	country: '#country',
	preloader: '#preloader',
	onSuccess: function (message) {
		alert(message);
	}
});