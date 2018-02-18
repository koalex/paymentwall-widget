var _inputs = {};
var currentDate = new Date();
var currentYear = currentDate.getFullYear();
var currentMonth = currentDate.getMonth();
var selectedCountry;

var LuhnAlgorithm = function (val) {
	if (/[^0-9-\s]+/.test(val)) return false;

	var nCheck = 0, nDigit = 0, bEven = false, val = val.replace(/\D/g, '');

	for (var n = val.length - 1; n >= 0; n--) {
		var cDigit = val.charAt(n),
			nDigit = parseInt(cDigit, 10);

		if (bEven) {
			if ((nDigit *= 2) > 9) nDigit -= 9;
		}

		nCheck += nDigit;
		bEven = !bEven;
	}

	return (nCheck % 10) == 0;
};

var isObject = function (val) {
	return (val && typeof val === 'object' && val.constructor === Object);
};

var isPositiveNumber = function (val) {
	if (0 === val) return true;
	if (!val || (val === Infinity) || isNaN(val)) return false;
	if ('number' === typeof val && val >= 0) return true;
	if ('string' === typeof val) {
		var valToNum = Number(val);
		if (isNaN(valToNum) || valToNum < 0) return false;
		return true;
	}
	return false;
};

/*var isDOMElement = function (val) {
	return (
		typeof HTMLElement === 'object' ? val instanceof HTMLElement :
		val && typeof val === 'object' && val !== null && val.nodeType === 1 && typeof val.nodeName === 'string'
	);
}*/

var isInputElement = function (val) {
	return val instanceof HTMLInputElement;
};

var isSelectElement = function (val) {
	return val instanceof HTMLSelectElement;
};

function cardHolderHandle (ev) {
	if (!/^[a-zA-Z\s]+$/.test(ev.target.value)) {
		ev.target.value = ev.target.value.slice(0, -1).toUpperCase();
	} else {
		ev.target.value = ev.target.value.toUpperCase();
	}
}

var cardName;
var cards = {
	uatp: {
		mask: 'XXXX XXXXX XXXXXX',
		re: /^(?!1800)1\d{0,14}/
	},
	amex: {
		mask: 'XXXX XXXXXX XXXXX',
		re: /^3[47]\d{0,13}/
	},
	diners: {
		mask: 'XXXX XXXXXX XXXX',
		re: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/
	},
	discover: {
		mask: 'XXXX XXXX XXXX XXXX',
		re: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/
	},
	mastercard: { // FIXME: 15 digit support
		mask: 'XXXX XXXX XXXX XXXX',
		re: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/
	},
	dankort: {
		mask: 'XXXX XXXX XXXX XXXX',
		re: /^(5019|4175|4571)\d{0,12}/
	},
	instapayment: {
		mask: 'XXXX XXXX XXXX XXXX',
		re: /^63[7-9]\d{0,13}/
	},
	jcb: {
		mask: 'XXXX XXXX XXXX XXXX',
		re: /^(?:2131|1800|35\d{0,2})\d{0,12}/
	},
	maestro: {
		mask: 'XXXX XXXX XXXX XXXX',
		re: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/
	},
	visa: {
		mask: 'XXXX XXXX XXXX XXXX',
		re: /^4\d{0,15}/
	},
	mir: {
		mask: 'XXXX XXXX XXXX XXXX',
		re: /^220[0-4]\d{0,12}/
	},
	unionPay: {
		mask: 'XXXX XXXX XXXX XXXX',
		re: /^62\d{0,14}/
	}
};

var cardNameFromNum = function (cardNums) {
	for (var card in cards) {
		if (cards[card].re.test(onlyNums)) {
			cardName = card;
			break;
		}
	}
};

var applyCardMask = function (onlyNums) {
	var mask = 'XXXX XXXX XXXX XXXXXXX';

	if (cardName) cardName = undefined;

	for (var card in cards) {
		if (cards[card].re.test(onlyNums)) {
			mask = cards[card].mask;
			cardName = card;
			break;
		}
	}

	var formattedString = '';
	var numberPos = 0;
	for (var i = 0, l = mask.length; i < l; i++) {
		var currentMaskChar = mask[i];

		if ('X' == currentMaskChar) {
			var digit = onlyNums.charAt(numberPos);
			if (!digit) break;
			formattedString += onlyNums.charAt(numberPos);
			numberPos++;
		} else {
			formattedString += currentMaskChar;
		}
	}

	return formattedString;
};

var _prevCardNum = '';
function cardNumberHandle (ev) {
	var val = ev.target.value.trim();
	var nums = val.match(/[0-9]/g);
	var modified = false;

	if ((!/^[0-9\s]+$/.test(val)) || (nums && nums.length > 19)) {
		modified = true;
		val = val.slice(0, -1);
	}

	if (_prevCardNum != val || !_prevCardNum || modified) {
		_prevCardNum = val;
	} else {
		return;
	}

	ev.target.value = applyCardMask(val.replace(/\s/g, ''));
}

function cvvHandle (ev) {
	var val = ev.target.value.trim();

	if ((!/^[0-9]+$/.test(val)) || (val.length > 4)) {
		val = val.slice(0, -1);
	}

	ev.target.value = val;
}

function expireYearHandle (ev) {
	var val = ev.target.value
	if (isSelectElement(ev.target)) {
		disableYearMonths(val);
	} else {
		var shortCurrentYearPrefix = currentYear.toString().substr(0, 2);
		var shortCurrentYear = currentYear.toString().substr(-2);

		var sliced;
		if ((!/^[0-9]+$/.test(val)) || (val.length > 2)) {
			sliced = true;
			val = val.slice(0, -1);
		}
		if (val.length === 2 && shortCurrentYear > val) val = shortCurrentYear;
		if (val.length === 2 && !sliced && _inputs.expireMonth.value) disableYearMonths(shortCurrentYearPrefix + val);

		ev.target.value = val;
	}
}

function createYears () {
	var fragment = document.createDocumentFragment();
	for (var i = 0; i <= 20; i++) {
		var yearOption = document.createElement('OPTION');
		yearOption.value = currentYear + i;
		yearOption.textContent = currentYear + i;

		fragment.appendChild(yearOption);
	}
	return fragment;
}


var monthNames = ['January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];
function createMonths () {
	var fragment = document.createDocumentFragment();

	for (var i = 0; i <= 11; i++) {

		var monthOption = document.createElement('OPTION');
		monthOption.value = i;
		monthOption.textContent = monthNames[i];

		fragment.appendChild(monthOption);
	}

	return fragment;
}

function disableYearMonths (fullYear) {
	if (isSelectElement(_inputs.expireMonth) && _inputs.expireMonth.options && _inputs.expireMonth.options.length == 12) {
		if (fullYear == currentYear) {
			for (var i = 0; i < 12; i++) {
				if (currentMonth > _inputs.expireMonth.options[i].value) {
					_inputs.expireMonth.options[i].setAttribute('disabled', true);
					if (_inputs.expireMonth.options[i].hasAttribute('selected')) {
						_inputs.expireMonth.options[i].removeAttribute('selected');
					}
				} else if (currentMonth == _inputs.expireMonth.options[i].value) {
					_inputs.expireMonth.options[i].selected = 'selected';
				}
			}
		} else if (fullYear > currentYear) {
			for (var i = 0; i < 12; i++) {
				if (_inputs.expireMonth.options[i].hasAttribute('disabled')) {
					_inputs.expireMonth.options[i].removeAttribute('disabled')
				}
			}

		}
	} else {
		var monthNum = shortMonthToNum(_inputs.expireMonth.value);
		if (_inputs.expireYear.value && fullYear == currentYear && monthNum < currentMonth) {
			_inputs.expireMonth.value = (currentMonth + 1) > 10 ? (currentMonth + 1) : '0' + (currentMonth + 1);
		}
	}
}

function shortMonthToNum (shortMonth) {
	var monthNum = Number(shortMonth) - 1;
	if (monthNum > 11) throw new Error('"'+ shortMonth +'" is wrong month.');
	return monthNum;
}

function expireMonthHandle (ev) {
	var val = ev.target.value;

	if ((!/^[0-9]+$/.test(val)) || (val.length > 2)) {
		val = val.slice(0, -1);
	}
	if (val.length == 2 && Number(val) > 12) {
		val = (currentMonth + 1) > 10 ? (currentMonth + 1) : '0' + (currentMonth + 1);
	}

	var monthNum = shortMonthToNum(val);

	if (monthNum > 11) {
		val = 12;
	}

	if (monthNum < currentMonth && val.toString().length == 2 && _inputs.expireYear.value) {
		val = (currentMonth + 1) > 10 ? (currentMonth + 1) : '0' + (currentMonth + 1);
	}

	_inputs.expireMonth.value = val;
}

function monthBlur (ev) {
	var val = ev.target.value;
	if (val.length === 1) {
		var monthNum = shortMonthToNum(val);
		ev.target.value = '0' + val;
	}
}

function enableMonths () {
	if (isSelectElement(_inputs.expireMonth) && _inputs.expireMonth.options) {
		if (_inputs.expireMonth.options.length == 12) {
			for (var i = 0; i < 12; i++) {
				if (_inputs.expireMonth.options[i].hasAttribute('disabled')) {
					_inputs.expireMonth.options[i].removeAttribute('disabled');
				}
			}
		}
	}
}

var countryLabel = 'Select your country';
var countries = [{name:"Afghanistan",alpha2:"AF"},{name:"Åland Islands",alpha2:"AX"},{name:"Albania",alpha2:"AL"},{name:"Algeria",alpha2:"DZ"},{name:"American Samoa",alpha2:"AS"},{name:"Andorra",alpha2:"AD"},{name:"Angola",alpha2:"AO"},{name:"Anguilla",alpha2:"AI"},{name:"Antarctica",alpha2:"AQ"},{name:"Antigua and Barbuda",alpha2:"AG"},{name:"Argentina",alpha2:"AR"},{name:"Armenia",alpha2:"AM"},{name:"Aruba",alpha2:"AW"},{name:"Australia",alpha2:"AU"},{name:"Austria",alpha2:"AT"},{name:"Azerbaijan",alpha2:"AZ"},{name:"Bahamas",alpha2:"BS"},{name:"Bahrain",alpha2:"BH"},{name:"Bangladesh",alpha2:"BD"},{name:"Barbados",alpha2:"BB"},{name:"Belarus",alpha2:"BY"},{name:"Belgium",alpha2:"BE"},{name:"Belize",alpha2:"BZ"},{name:"Benin",alpha2:"BJ"},{name:"Bermuda",alpha2:"BM"},{name:"Bhutan",alpha2:"BT"},{name:"Bolivia",alpha2:"BO"},{name:"Bonaire",alpha2:"BQ"},{name:"Bosnia and Herzegovina",alpha2:"BA"},{name:"Botswana",alpha2:"BW"},{name:"Bouvet Island",alpha2:"BV"},{name:"Brazil",alpha2:"BR"},{name:"British Indian O. Terr.",alpha2:"IO"},{name:"Brunei Darussalam",alpha2:"BN"},{name:"Bulgaria",alpha2:"BG"},{name:"Burkina Faso",alpha2:"BF"},{name:"Burundi",alpha2:"BI"},{name:"Cambodia",alpha2:"KH"},{name:"Cameroon",alpha2:"CM"},{name:"Canada",alpha2:"CA"},{name:"Cabo Verde",alpha2:"CV"},{name:"Cayman Islands",alpha2:"KY"},{name:"Central African Republic",alpha2:"CF"},{name:"Chad",alpha2:"TD"},{name:"Chile",alpha2:"CL"},{name:"China",alpha2:"CN"},{name:"Christmas Island",alpha2:"CX"},{name:"Cocos (Keeling) Islands",alpha2:"CC"},{name:"Colombia",alpha2:"CO"},{name:"Comoros",alpha2:"KM"},{name:"Congo",alpha2:"CG"},{name:"Congo (D. Republic)",alpha2:"CD"},{name:"Cook Islands",alpha2:"CK"},{name:"Costa Rica",alpha2:"CR"},{name:"Côte d'Ivoire",alpha2:"CI"},{name:"Croatia",alpha2:"HR"},{name:"Cuba",alpha2:"CU"},{name:"Curaçao",alpha2:"CW"},{name:"Cyprus",alpha2:"CY"},{name:"Czech Republic",alpha2:"CZ"},{name:"Denmark",alpha2:"DK"},{name:"Djibouti",alpha2:"DJ"},{name:"Dominica",alpha2:"DM"},{name:"Dominican Republic",alpha2:"DO"},{name:"Ecuador",alpha2:"EC"},{name:"Egypt",alpha2:"EG"},{name:"El Salvador",alpha2:"SV"},{name:"Equatorial Guinea",alpha2:"GQ"},{name:"Eritrea",alpha2:"ER"},{name:"Estonia",alpha2:"EE"},{name:"Ethiopia",alpha2:"ET"},{name:"Falkland Islands",alpha2:"FK"},{name:"Faroe Islands",alpha2:"FO"},{name:"Fiji",alpha2:"FJ"},{name:"Finland",alpha2:"FI"},{name:"France",alpha2:"FR"},{name:"French Guiana",alpha2:"GF"},{name:"French Polynesia",alpha2:"PF"},{name:"French Southern Ter.",alpha2:"TF"},{name:"Gabon",alpha2:"GA"},{name:"Gambia",alpha2:"GM"},{name:"Georgia",alpha2:"GE"},{name:"Germany",alpha2:"DE"},{name:"Ghana",alpha2:"GH"},{name:"Gibraltar",alpha2:"GI"},{name:"Greece",alpha2:"GR"},{name:"Greenland",alpha2:"GL"},{name:"Grenada",alpha2:"GD"},{name:"Guadeloupe",alpha2:"GP"},{name:"Guam",alpha2:"GU"},{name:"Guatemala",alpha2:"GT"},{name:"Guernsey",alpha2:"GG"},{name:"Guinea",alpha2:"GN"},{name:"Guinea-Bissau",alpha2:"GW"},{name:"Guyana",alpha2:"GY"},{name:"Haiti",alpha2:"HT"},{name:"Heard & McDonald Is.",alpha2:"HM"},{name:"Holy See",alpha2:"VA"},{name:"Honduras",alpha2:"HN"},{name:"Hong Kong",alpha2:"HK"},{name:"Hungary",alpha2:"HU"},{name:"Iceland",alpha2:"IS"},{name:"India",alpha2:"IN"},{name:"Indonesia",alpha2:"ID"},{name:"Iran",alpha2:"IR"},{name:"Iraq",alpha2:"IQ"},{name:"Ireland",alpha2:"IE"},{name:"Isle of Man",alpha2:"IM"},{name:"Israel",alpha2:"IL"},{name:"Italy",alpha2:"IT"},{name:"Jamaica",alpha2:"JM"},{name:"Japan",alpha2:"JP"},{name:"Jersey",alpha2:"JE"},{name:"Jordan",alpha2:"JO"},{name:"Kazakhstan",alpha2:"KZ"},{name:"Kenya",alpha2:"KE"},{name:"Kiribati",alpha2:"KI"},{name:"Korea (D. Republic)",alpha2:"KP"},{name:"Korea (Republic of)",alpha2:"KR"},{name:"Kuwait",alpha2:"KW"},{name:"Kyrgyzstan",alpha2:"KG"},{name:"Lao People's Republic",alpha2:"LA"},{name:"Latvia",alpha2:"LV"},{name:"Lebanon",alpha2:"LB"},{name:"Lesotho",alpha2:"LS"},{name:"Liberia",alpha2:"LR"},{name:"Libya",alpha2:"LY"},{name:"Liechtenstein",alpha2:"LI"},{name:"Lithuania",alpha2:"LT"},{name:"Luxembourg",alpha2:"LU"},{name:"Macao",alpha2:"MO"},{name:"Macedonia",alpha2:"MK"},{name:"Madagascar",alpha2:"MG"},{name:"Malawi",alpha2:"MW"},{name:"Malaysia",alpha2:"MY"},{name:"Maldives",alpha2:"MV"},{name:"Mali",alpha2:"ML"},{name:"Malta",alpha2:"MT"},{name:"Marshall Islands",alpha2:"MH"},{name:"Martinique",alpha2:"MQ"},{name:"Mauritania",alpha2:"MR"},{name:"Mauritius",alpha2:"MU"},{name:"Mayotte",alpha2:"YT"},{name:"Mexico",alpha2:"MX"},{name:"Micronesia",alpha2:"FM"},{name:"Moldova (Republic of)",alpha2:"MD"},{name:"Monaco",alpha2:"MC"},{name:"Mongolia",alpha2:"MN"},{name:"Montenegro",alpha2:"ME"},{name:"Montserrat",alpha2:"MS"},{name:"Morocco",alpha2:"MA"},{name:"Mozambique",alpha2:"MZ"},{name:"Myanmar",alpha2:"MM"},{name:"Namibia",alpha2:"NA"},{name:"Nauru",alpha2:"NR"},{name:"Nepal",alpha2:"NP"},{name:"Netherlands",alpha2:"NL"},{name:"New Caledonia",alpha2:"NC"},{name:"New Zealand",alpha2:"NZ"},{name:"Nicaragua",alpha2:"NI"},{name:"Niger",alpha2:"NE"},{name:"Nigeria",alpha2:"NG"},{name:"Niue",alpha2:"NU"},{name:"Norfolk Island",alpha2:"NF"},{name:"Northern Mariana Is.",alpha2:"MP"},{name:"Norway",alpha2:"NO"},{name:"Oman",alpha2:"OM"},{name:"Pakistan",alpha2:"PK"},{name:"Palau",alpha2:"PW"},{name:"Palestine, State of",alpha2:"PS"},{name:"Panama",alpha2:"PA"},{name:"Papua New Guinea",alpha2:"PG"},{name:"Paraguay",alpha2:"PY"},{name:"Peru",alpha2:"PE"},{name:"Philippines",alpha2:"PH"},{name:"Pitcairn",alpha2:"PN"},{name:"Poland",alpha2:"PL"},{name:"Portugal",alpha2:"PT"},{name:"Puerto Rico",alpha2:"PR"},{name:"Qatar",alpha2:"QA"},{name:"Réunion",alpha2:"RE"},{name:"Romania",alpha2:"RO"},{name:"Russian Federation",alpha2:"RU"},{name:"Rwanda",alpha2:"RW"},{name:"Saint Barthélemy",alpha2:"BL"},{name:"Saint Helena",alpha2:"SH"},{name:"Saint Kitts & Nevis",alpha2:"KN"},{name:"Saint Lucia",alpha2:"LC"},{name:"St. Martin (French)",alpha2:"MF"},{name:"St. Pierre & Miquelon",alpha2:"PM"},{name:"St. Vincent & Grenadines",alpha2:"VC"},{name:"Samoa",alpha2:"WS"},{name:"San Marino",alpha2:"SM"},{name:"Sao Tome and Principe",alpha2:"ST"},{name:"Saudi Arabia",alpha2:"SA"},{name:"Senegal",alpha2:"SN"},{name:"Serbia",alpha2:"RS"},{name:"Seychelles",alpha2:"SC"},{name:"Sierra Leone",alpha2:"SL"},{name:"Singapore",alpha2:"SG"},{name:"Sint Maarten (Dutch)",alpha2:"SX"},{name:"Slovakia",alpha2:"SK"},{name:"Slovenia",alpha2:"SI"},{name:"Solomon Islands",alpha2:"SB"},{name:"Somalia",alpha2:"SO"},{name:"South Africa",alpha2:"ZA"},{name:"South Georgia",alpha2:"GS"},{name:"South Sudan",alpha2:"SS"},{name:"Spain",alpha2:"ES"},{name:"Sri Lanka",alpha2:"LK"},{name:"Sudan",alpha2:"SD"},{name:"Suriname",alpha2:"SR"},{name:"Svalbard & Jan Mayen",alpha2:"SJ"},{name:"Swaziland",alpha2:"SZ"},{name:"Sweden",alpha2:"SE"},{name:"Switzerland",alpha2:"CH"},{name:"Syrian Arab Republic",alpha2:"SY"},{name:"Taiwan",alpha2:"TW"},{name:"Tajikistan",alpha2:"TJ"},{name:"Tanzania",alpha2:"TZ"},{name:"Thailand",alpha2:"TH"},{name:"Timor-Leste",alpha2:"TL"},{name:"Togo",alpha2:"TG"},{name:"Tokelau",alpha2:"TK"},{name:"Tonga",alpha2:"TO"},{name:"Trinidad and Tobago",alpha2:"TT"},{name:"Tunisia",alpha2:"TN"},{name:"Turkey",alpha2:"TR"},{name:"Turkmenistan",alpha2:"TM"},{name:"Turks and Caicos Islands",alpha2:"TC"},{name:"Tuvalu",alpha2:"TV"},{name:"Uganda",alpha2:"UG"},{name:"Ukraine",alpha2:"UA"},{name:"United Arab Emirates",alpha2:"AE"},{name:"UK of GB & Nort Ireland",alpha2:"GB"},{name:"United States of America",alpha2:"US"},{name:"Uruguay",alpha2:"UY"},{name:"Uzbekistan",alpha2:"UZ"},{name:"Vanuatu",alpha2:"VU"},{name:"Venezuela (Bolivarian)",alpha2:"VE"},{name:"Viet Nam",alpha2:"VN"},{name:"Virgin Islands (British)",alpha2:"VG"},{name:"Virgin Islands (U.S.)",alpha2:"VI"},{name:"Wallis and Futuna",alpha2:"WF"},{name:"Western Sahara",alpha2:"EH"},{name:"Yemen",alpha2:"YE"},{name:"Zambia",alpha2:"ZM"},{name:"Zimbabwe",alpha2:"ZW"}];
function createCountries () {
	var fragment = document.createDocumentFragment();
	var countryPreset = new Option(countryLabel, '', true, true);
	countryPreset.setAttribute('disabled', true);

	fragment.appendChild(countryPreset);

	for (var i = 0, l = countries.length; i < l; i++) {
		var countryOption = new Option(countries[i].name, countries[i].alpha2, false, false);
		fragment.appendChild(countryOption);
	}

	return fragment;
}

export default function Widget (props) {
	if (!(this instanceof Widget)) throw new Error('You must call function with "new".');

	if (!isObject(props)) {
		throw new Error('Widget options must be an object.');
	}

	if (!props.api_key || 'string' !== typeof props.api_key || !props.api_key.trim()) {
		throw new Error('"api_key" option is required and it must be an string');
	}

	Object.defineProperty(this, 'countries', {
		configurable: false,
		enumerable: false,
		get: function () { return countries; }
	});

	Object.defineProperty(this, 'cards', {
		configurable: false,
		enumerable: false,
		get: function () { return Object.keys(cards); }
	});

	Object.defineProperty(this, 'cardName', {
		configurable: false,
		enumerable: false,
		get: function () { return cardName; }
	});

	var currency = 'PLS';
	var amount;
	var paymentMethods;

	if (!props.cardHolder) {
		throw new Error('"cardHolder" option is required');
	}

	var inputNames = ['cardHolder', 'cardNumber', 'cvv'];
	for (var i = 0, l = inputNames.length; i < l; i++) {
		if (!props[inputNames[i]]) {
			throw new Error('"' + inputNames[i] + '" option is required');
		}

		if ('string' === typeof props[inputNames[i]]) {
			var elem = document.querySelector(props[inputNames[i]]);

			if (!isInputElement(elem)) {
				throw new Error('Element with selector ' + props[inputNames[i]] + ' must be an "input"');
			} else {
				_inputs[inputNames[i]] = elem;
			}
		} else if (isInputElement(props[inputNames[i]])) {
			_inputs[inputNames[i]] = props[inputNames[i]];
		} else {
			throw new Error('"' + inputNames[i] + '" option must be an "input" element or CSS-selector of "input" element.');
		}
	}

	var expires = ['expireMonth', 'expireYear'];
	for (var i = 0, l = expires.length; i < l; i++) {
		if ('string' === typeof props[expires[i]]) {
			var elem = document.querySelector(props[expires[i]]);

			if (isSelectElement(elem) || isInputElement(elem)) {
				_inputs[expires[i]] = elem;
			} else {
				throw new Error('Elememtn with CSS-selector "' + expires[i] + '" must be an "select" or "input".');
			}
		} else if (isSelectElement(props[expires[i]]) || isInputElement(props[expires[i]])) {
			_inputs[expires[i]] = props[expires[i]];
		} else {
			throw new Error('"' + expires[i] + '" must be an "select", "input" or CSS-selector for them.');
		}
	}
	if (!_inputs.expireMonth) throw new Error('You must set property "expireMonth".');
	if (!_inputs.expireYear) throw new Error('You must set property "expireYear".');
	_inputs.expireMonth.addEventListener(isSelectElement(_inputs.expireMonth) ? 'change' : 'input', expireMonthHandle);
	if (isInputElement(_inputs.expireMonth)) _inputs.expireMonth.addEventListener('blur', monthBlur);
	_inputs.expireYear.addEventListener(isSelectElement(_inputs.expireYear) ? 'change' : 'input', expireYearHandle);

	var country = 'country';
	if (props.country) {
		if ('string' === typeof props.country) {
			var elem = document.querySelector(props.country);

			if (!isSelectElement(elem)) {
				throw new Error('Element with selector ' + props.country + ' must be an "select".');
			} else {
				_inputs.country = elem;
			}
		} else if (isSelectElement(props.country)) {
			_inputs.country = props.country;
		}
	}
	if (_inputs.country) _inputs.country.appendChild(createCountries());

	Object.defineProperty(this, 'paymentMethods', {
		configurable: false,
		enumerable: false,
		get: function () {
			return paymentMethods;
		}
	});

	Object.defineProperty(this, 'emptyCountryLabel', {
		configurable: false,
		enumerable: false,
		get: function () {
			return countryLabel;
		},
		set: function (val) {
			if ('string' != typeof val) {
				throw new Error('emptyCountryLabel must be an string.');
			}

			countryLabel = val.trim();
			if (isSelectElement(_inputs.country) && _inputs.country.options) {
				if (_inputs.country.options.length) {
					for (var i = 0, l = _inputs.country.options.length; i < l; i++) {
						if (!_inputs.country.options[i].value) {
							_inputs.country.options[i].text = countryLabel;
							_inputs.country.options[i].value = '';
							break;
						}
					}
				}
			}
		}
	});

	if ('undefined' == typeof props.amount) {
		throw new Error('"amount" option is required.');
	} if (isPositiveNumber(props.amount) && props.amount > 0) {
		amount = props.amount;
	} else {
		throw new Error('"amount" option must be an positive number.');
	}

	Object.defineProperty(this, 'amount', {
		configurable: false,
		enumerable: false,
		get: function () {
			return amount
		}
	});

	Object.defineProperty(this, 'currency', {
		configurable: false,
		enumerable: false,
		get: function () {
			return currency
		}
	});

	if (props.currency) {
		if ('string' !== typeof props.currency) {
			throw new Error('"currency" option must be an string.');
		}
		props.currency = props.currency.trim();
		if (!props.currency) {
			throw new Error('"currency" option must be an is not empty string.');
		} else {
			currency = props.currency;
		}
	} else if ('' === props.currency) {
		throw new Error('"currency" option must be an is not empty string.');
	}

	if (props._csrf) {
		if ('string' === typeof props._csrf) {
			var elem = document.querySelector(props._csrf);

			if (!isInputElement(elem)) {
				throw new Error('Element with selector ' + props._csrf + ' must be an "input".');
			} else {
				_inputs._csrf = elem;
			}
		} else if (isInputElement(props._csrf)) {
			_inputs._csrf = props._csrf;
		} else {
			throw new Error('"_csrf" option must be an "input" element or CSS-selector of "input" element.');
		}
	} else if ('' === props._csrf) {
		throw new Error('"_csrf" option must be an is not empty string.');
	}

	_inputs.cardHolder.addEventListener('input', cardHolderHandle);
	_inputs.cardNumber.addEventListener('input', cardNumberHandle);
	_inputs.cvv.addEventListener('input', cvvHandle);

	if (_inputs.expireMonth) {
		_inputs.expireMonth.appendChild(createMonths());
		disableYearMonths(currentYear);
	}
	if (_inputs.expireYear) _inputs.expireYear.appendChild(createYears());

	Object.defineProperty(this, 'monthNames', {
		configurable: false,
		enumerable: false,
		get: function () {
			return monthNames
		},
		set: function (monthsArr) {
			if (!(Object.prototype.toString.call(monthsArr) === '[object Array]')) {
				throw new Error('Month names must be an array');
			}
			if (monthsArr.length != 12) {
				throw new Error('Month names must contains 12 monts');
			}

			monthNames = [].concat(monthNames);
			if (isSelectElement(_inputs.expireMonth) && _inputs.expireMonth.options) {
				if (_inputs.expireMonth.options.length == 12) {
					for (var i = 0; i < 12; i++) {
						_inputs.expireMonth.options[i].text = monthNames[i];
						_inputs.expireMonth.options[i].value = i;
					}
				}
			}
		}
	});

	Object.defineProperty(this, 'values', {
		configurable: false,
		enumerable: false,
		get: function () {
			var expireMonth = '';
			var expireYear = '';
			var country = selectedCountry;

			if (_inputs.expireMonth.value.trim()) {
				if (isInputElement(_inputs.expireMonth)) {
					expireMonth = shortMonthToNum(_inputs.expireMonth.value);
				} else {
					expireMonth = Number(_inputs.expireMonth.value);
				}
			}

			if (_inputs.expireYear.value.trim().length == 2) {
				if (isInputElement(_inputs.expireYear)) {
					expireYear = Number(currentYear.toString().substr(0, 2) + _inputs.expireYear.value);
				} else {
					expireYear = Number(_inputs.expireYear.value);
				}
			} else {
				expireYear = Number(_inputs.expireYear.value);
			}

			if (_inputs.country) country = _inputs.country.value;

			var values = {
				cardHolder: _inputs.cardHolder.value.trim(),
				cardNumber: _inputs.cardNumber.value.replace(/\s/g,''),
				cvv: _inputs.cvv.value.trim(),
				expireMonth: expireMonth,
				expireYear: expireYear,
				country: country,
				amount: amount,
				currency: currency
			};

			if (_inputs._csrf && _inputs._csrf.value) values._csrf = _inputs._csrf.value;

			return values;
		}
	});

	this.setCountry = function (alpha2) {
		if (!countries.some(function (v) { return v.alpha2 == alpha2; })) {
			throw new Error('Bad country alpha-2 code');
		}
		selectedCountry = alpha2;
	};

	this.validationErrors = function () {
		var values = this.values;
		var errors = [];

		if (!values.cardHolder) {
			errors.push({field: 'cardHolder', message: 'Card holder is empty'});
		}

		if (!values.cardNumber) {
			errors.push({field: 'cardNumber', message: 'Card number is empty'});
		} else if (!LuhnAlgorithm(values.cardNumber)) {
			errors.push({field: 'cardNumber', message: 'Invalid card number (Luhn Algorithm)'});
		}

		if (!values.cvv) {
			errors.push({field: 'cvv', message: 'CV is empty'});
		}

		if (values.cvv == 123) {
			errors.push({field: 'cvv', message: 'CV bad value'});
		}

		if (!values.expireYear) {
			errors.push({field: 'expireYear', message: 'Year is empty'});
		}

		if (values.expireYear && values.expireYear < currentYear) {
			errors.push({field: 'expireYear', message: 'Year: bad value'});
		}

		if (!values.expireMonth) {
			errors.push({field: 'expireMonth', message: 'Month is empty'});
		}

		if (values.expireMonth && values.expireMonth < currentMonth && values.expireYear && values.expireYear == currentYear) {
			errors.push({field: 'expireMonth', message: 'Month: bad value'});
		}

		if (values.country && !countries.some(function (v) { return v.alpha2 == values.country; })) {
			errors.push({field: 'country', message: 'Country: bad value'});
		}

		if (errors.length) return errors;
	};

	var XHR = ('onload' in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
	var xhr = new XHR();

	this.loadPaymentMethods = function () {
		var self = this;
		paymentMethods = null;

		var url = 'https://api.paymentwall.com/api/payment-systems/?key=' + props.api_key + '&sign_version=2';

		if (this.values.country) url += ('&country_code=' + this.values.country);

		xhr.open('GET', url, true);

		xhr.timeout = 10000;

		xhr.ontimeout = function () { this.onerror('Timeout'); };

		xhr.onload = function (ev) {
			if (!(200 <= xhr.status && xhr.status < 300)) return;

			try {
				paymentMethods = JSON.parse(this.response); // xhr.responseText
			} catch (err) {
				this.onerror(err);
			}
		};
		xhr.onerror = function (err) {
			if ('function' == typeof props.onError) props.onError(err);
		};
		xhr.onloadend = function (ev) {
			if (!(200 <= xhr.status && xhr.status < 300)) {
				if ('function' == typeof props.onError) {
					if (xhr.response) {
						try {
							props.onError(JSON.parse(xhr.response));
						} catch (err) {
							props.onError(new Error('Something goes wrong...'));
						}
					} else {
						props.onError(xhr.statusText);
					}
				}
			} else if ('function' == typeof props.onPaymentMethodsLoadEnd) props.onPaymentMethodsLoadEnd(self.paymentMethods);
		};
		xhr.send();
	};

	this.loadPaymentMethods();
}
