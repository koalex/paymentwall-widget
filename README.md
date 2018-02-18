<h1 align="center">Paymentwall widget</h1>

<p align="center">
  <img width="467" height="586" src="https://github.com/koalex/paymentwall-widget/blob/master/paymentwall_widget.jpg">
</p>

## Demo

1. Install dependencies:
  ```bash
  npm install
  ```

2. Run demo-server:
  ```bash
  npm run demo
  ```

3. Go to [localhost:3000/demo](http://localhost:3000/demo)


## Usage

1. Create basic markup:
  ```html
	<form id="form">
      <!-- you can generate csrf token for input with name="_csrf" and it will sent to you in body. -->
      <input id="_csrf" type="hidden" name="_csrf" value="_csrf_value" >
      <div>
          <label>
              Card Holder Name
              <input id="cardHolder" type="text" >
          </label>
      </div>
      <div>
          <label>
              Credit Card Number
              <input id="cardNumber" type="text">
          </label>
      </div>
      <div>
          <select id="expireMonth"></select>
      </div>
      <div>
          <select id="expireYear"></select>
      </div>
      <div>
          <label>
            CVV
              <input type="text" id="cvv">
          </label>
      </div>
      <div>
          <select id="country"></select>
      </div>
      <div>
          <span>PAY:</span>
          <strong id="amountText"></strong>
          <em id="currencyText"></em>
      </div>
      <button type="submit">
          Confirm payment
      </button>
  </form>
  ```

2. Add widget script:
  ```html
	<script src="dist/widget.js"></script>
  ```

3. Create a widget:
  ```javascript
	var widget = new Widget({
      api_key: 'YOUR_API_KEY',
      _csrf: '#_csrf',
      amount: 5,
      currency: '$',
      cardHolder: '#cardHolder',
      cardNumber: '#cardNumber',
      expireMonth: '#expireMonth',
      expireYear: '#expireYear',
            country: '#country',
      cvv: '#cvv',
      onPaymentMethodsLoadEnd: function (paymentMethods) {
        // Array of paymentMethods || false
      },
      onError: function (err) {
        // Error from api-server.
      }
  });
  document.querySelector('#amountText').textContent = widget.amount;
  document.querySelector('#currencyText').textContent = widget.currency;
  document.querySelector('#form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var validationErrors = widget.validationErrors();
    if (validationErrors) {
      // Validation error handle
    } else {
      var values = widget.values;
      // send values to server
    }
  });
  document.querySelector('#cardNumber').addEventListener('input', function (ev) {
    // parse card name from card number
    console.log(widget.cardName);
  });
  // countries array: [{name:"Albania",alpha2:"AL"},...]
  console.log(widget.countries);
  // need only if you use not "select" tag for countries. for example if you want to use dropdowns
  widget.setCountry('AL');
  widget.loadPaymentMethods();
  // payment methods from server
  console.log(widget.paymentMethods);
  // need only if you use "select" tag for month expire
  widget.monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  ```

#### Options
|Name|Required|Description|
|:--:|:------:|:----------|
|**api_key**|true|You can get an API key by signing up at paymentwall.com as a merchant and going to [api documentation](https://api.paymentwall.com/developers/applications). Activate the Evaluation Mode. Signature is optional. By default no country_code parameter is passed (this way geolocated country is used). If the user changes his country - we pull the list of methods for that country.
|**amount**|true|Amount the user pays.
|**currency**|false|Currency (default PLN).
|**cardHolder**|true|CSS selector or HTMLInputElement. Cardholder input.
|**cardNumber**|true|CSS selector or HTMLInputElement. Cardnumber input.
|**expireMonth**|true|CSS selector, HTMLInputElement or HTMLSelectElement. Must be a **input** or **select** html tag.
|**expireYear**|true|CSS selector, HTMLInputElement or HTMLSelectElement. Must be a **input** or **select** html tag.
|**cvv**|true|CSS selector or HTMLInputElement. Must be a **input** html tag.
|**onPaymentMethodsLoadEnd**|false|Callback function which take a payment methods or **false**.
|**onError**|false|Callback function which take error from api-server.


## Development

1. Install dependencies:
  ```bash
	npm install
  ```

2. Run demo-server:
  ```bash
	npm run dev
  ```

## Build

  ```bash
	npm run build
  ```

