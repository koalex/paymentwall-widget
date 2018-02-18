import './reset.css';
import './index.css';
import 'flag-icon-css/css/flag-icon.css';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js';

import Widget from './widget';

var form                = document.querySelector('#form');
var submitBtn           = document.querySelector('#submitBtn');
var allControls         = document.querySelectorAll('input, button');
var paymentsContainer   = document.querySelector('#paymentMethods');
var countriesContainer  = document.querySelector('#countries');
var paymentTypeTitle    = document.querySelector('#paymentTypeTitle');
var cardHolder          = document.querySelector('#cardHolder');
var cardHolderFg        = document.querySelector('#cardHolderFg');
var cardNumber          = document.querySelector('#cardNumber');
var cardNumberFg        = document.querySelector('#cardNumberFg');
var expireMonth         = document.querySelector('#expireMonth');
var expireMonthFg       = document.querySelector('#expireMonthFg');
var expireYear          = document.querySelector('#expireYear');
var expireYearFg        = document.querySelector('#expireYearFg');
var cvv                 = document.querySelector('#cvv');
var cvvFg               = document.querySelector('#cvvFg');
var countryBtn          = document.querySelector('#countryBtn');
var cardIcon            = document.querySelector('#cardIcon');
var countryLabel        = document.querySelector('#selectedCountryLabel');
var successAlert        = document.querySelector('.alert-success');


function paymentHandle (ev) {
	if (ev.currentTarget.tagName.toUpperCase() != 'BUTTON') return;
	var paymentData = JSON.parse(ev.currentTarget.dataset.data);
	paymentTypeTitle.textContent = 'Checkout with: ' + paymentData.name;
	enableControls(allControls);
}

function removePayments () {
	while (paymentsContainer.firstChild) {
		paymentsContainer.firstChild.removeEventListener('click', paymentHandle);
		paymentsContainer.removeChild(paymentsContainer.firstChild);
	}
}

function addPayments (paymentMethods) {
	var fragment = document.createDocumentFragment();
	paymentMethods.forEach(function (pm) {
		var btn = document.createElement('BUTTON');
		btn.dataset.data = JSON.stringify(pm);
		btn.className = 'btn btn-default';

		var img = new Image();
		img.src = pm.img_url;

		btn.appendChild(img);

		btn.addEventListener('click', paymentHandle);

		fragment.appendChild(btn);
	});

	paymentsContainer.appendChild(fragment);
}

function enableControls (controls) {
	for (var i = 0, l = controls.length; i < l; i++) {
		controls[i].removeAttribute('disabled');
	}
}

function disableControls (controls) {
	for (var i = 0, l = controls.length; i < l; i++) {
		controls[i].setAttribute('disabled', true);
	}
}
disableControls(allControls);

var widget = new Widget({
	api_key: '6c5c00977c27c085864348d14a8de42f',
	amount: 5,
	currency: '$',
	cardHolder: '#cardHolder',
	cardNumber: '#cardNumber',
	cvv: '#cvv',
	expireMonth: '#expireMonth',
	expireYear: '#expireYear',
	// country: '#country',
	onPaymentMethodsLoadEnd: function (paymentMethods) {
		if (Array.isArray(paymentMethods) && paymentMethods.length) {
			paymentTypeTitle.textContent = 'Select payment type please';
			addPayments(paymentMethods);
		} else if (false == paymentMethods) {
			paymentTypeTitle.textContent = 'There is no accepted payment methods for your state :(';
		} else {
			paymentTypeTitle.textContent = String.fromCharCode(160);
		}
		countryBtn.removeAttribute('disabled');
	},
	onError: function (err) {
		if (err.error && ('string' == typeof err.error)) {
			paymentTypeTitle.textContent = err.error;
		}
		countryBtn.removeAttribute('disabled');
	}
});

submitBtn.textContent += (widget.amount + widget.currency)

cardNumber.addEventListener('input', function (ev) {
	cardIcon.className = 'card ' + (widget.cardName || '');
});

widget.countries.forEach(function (country) {
	var countryItem = document.createElement('LI');
	var countryItemIn = document.createElement('A');
	countryItemIn.textContent = country.name;


	var cardIcon = document.createElement('SPAN');
	cardIcon.className = 'flag-icon flag-icon-' + country.alpha2.toLowerCase() + ' pull-right';

	countryItem.addEventListener('click', function (ev) {
		paymentTypeTitle.textContent = 'Loading...';
		disableControls(allControls);
		removePayments();
		countryLabel.textContent = country.name;
		widget.setCountry(country.alpha2);
		widget.loadPaymentMethods();
	});

	countryItemIn.appendChild(cardIcon);
	countryItem.appendChild(countryItemIn);

	countriesContainer.appendChild(countryItem);
});

function clearErrors () { // TODO: before clear checking if has err
	[
		cardHolderFg,
		cardNumberFg,
		expireMonthFg,
		expireYearFg,
		cvvFg
	].forEach(function (elem) {
		elem.classList.remove('has-error');
		elem.querySelector('.help-block').textContent = String.fromCharCode(160);
	});
}

function clearFieldError (ev) { // TODO: before clear checking if has err
	switch (ev.target.id) {
		case 'cardHolder':
			cardHolderFg.classList.remove('has-error');
			cardHolderFg.querySelector('.help-block').textContent = String.fromCharCode(160);
			break;

		case 'cardNumber':
			cardNumberFg.classList.remove('has-error');
			cardNumberFg.querySelector('.help-block').textContent = String.fromCharCode(160);
			break;

		case 'expireMonth':
			expireMonthFg.classList.remove('has-error');
			expireMonthFg.querySelector('.help-block').textContent = String.fromCharCode(160);
			break;

		case 'expireYear':
			expireYearFg.classList.remove('has-error');
			expireYearFg.querySelector('.help-block').textContent = String.fromCharCode(160);
			break;

		case 'cvv':
			cvvFg.classList.remove('has-error');
			cvvFg.querySelector('.help-block').textContent = String.fromCharCode(160);
			break;
	}
}

[
	cardHolder,
	cardNumber,
	expireMonth,
	expireYear,
	cvv
].forEach(function (elem) {
	elem.addEventListener('input', clearFieldError);
});

function showSuccess (msg) {
	successAlert.textContent = msg;
	successAlert.style.display = 'block';
	setTimeout(function () {
		successAlert.style.display = 'none';
		successAlert.textContent = '';
	}, 2000);
}


form.addEventListener('submit', function (ev) {
	ev.preventDefault();
	var validationErrors = widget.validationErrors();
	if (validationErrors) {
		validationErrors.forEach(function (err) {
			switch (err.field) {
				case 'cardHolder':
					cardHolderFg.classList.add('has-error');
					cardHolderFg.querySelector('.help-block').textContent = err.message;
					break;

				case 'cardNumber':
					cardNumberFg.classList.add('has-error');
					cardNumberFg.querySelector('.help-block').textContent = err.message;
					break;

				case 'expireMonth':
					expireMonthFg.classList.add('has-error');
					expireMonthFg.querySelector('.help-block').textContent = err.message;
					break;

				case 'expireYear':
					expireYearFg.classList.add('has-error');
					expireYearFg.querySelector('.help-block').textContent = err.message;
					break;

				case 'cvv':
					cvvFg.classList.add('has-error');
					cvvFg.querySelector('.help-block').textContent = err.message;
					break;
			}
		});
	} else {
		clearErrors();
		showSuccess('SUCCESS');
		// request to server...
	}
});