# Paymentwall widget

## Usage

1. Create basic markup:
  ```html
	<form id="paymentForm">
        <input type="hidden" name="_csrf" value="#!csrf" >  <!-- you can generate csrf token for input with name="_csrf" and it will sent to you in body. -->
        <div>
            <h5 id="checkoutWith"></h5>
            <div id="paymentMethods"></div>
            <div class="errorText"></div>
        </div>
        <div>
            <label>
                Card Holder Name
                <input id="cardHolder" type="text" >
            </label>
            <div id="cardHolderErrText"></div>
        </div>
        <div>
            <label>
                Credit Card Number
                <input id="cardNumber" type="text">
            </label>
            <div id="cardNumberErrText"></div>
        </div>
        <div>
            <select id="expireMonth">
                <option disabled>Month</option>
            </select>
        </div>
        <div>
            <select id="expireYear">
                <option disabled>Year</option>
            </select>
        </div>
        <div>
            <label>
                <input type="text" id="cvv">
            </label>
            <div id="cvvErrText"></div>
        </div>
        <div>
            <select id="country">
                <option disabled selected>Country</option>
            </select>
        </div>
        <div>
            <span>PAY:</span>
            <strong id="amountText"></strong>
            <em id="currencyText"></em>
        </div>
        <button type="submit">
            Confirm payment
        </button>
        <div id="preloader">Processing...</div>
    </form>
  ```

2. Add widget script:
  ```html
	<script src="dist/widget.js"></script>
  ```

3. Create a widget:
  ```javascript
	new Widget({
		api_key: 'YOUR_API_KEY',
		amount: 5,
		currency: 'PLN',
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
  ```

#### Options
|Name|Required|Description|
|:--:|:------:|:----------|
|**api_key**|true|You can get an API key by signing up at paymentwall.com as a merchant and going to [api documentation](https://api.paymentwall.com/developers/applications). Activate the Evaluation Mode. Signature is optional. By default no country_code parameter is passed (this way geolocated country is used). If the user changes his country - we pull the list of methods for that country.
|**amount**|true|Amount the user pays.
|**currency**|false|Currency (default PLN).
|**amountText**|true|CSS selector of a element in which you want to display amount.
|**currencyText**|true|CSS selector of a element in which you want to display currency value.
|**checkoutText**|true|CSS selector. In this element will be shown text (payment method name) when you choose payment method.
|**errorText**|true|CSS selector. In this element will be shown main error data.
|**paymentForm**|true|CSS selector of a payment form. !! This form must contain all elements below (except error text fields).
|**paymentMethods**|true|CSS selector. Container in which will be located payment methods (this container must be inside paymentForm element).
|**cardHolder**|true|CSS selector. Cardholder input.
|**cardHolderErrText**|false|CSS selector. Cardholder error text container.
|**cardNumber**|true|CSS selector. Cardnumber input.
|**cardNumberErrText**|false|CSS selector. Cardnumber error text container.
|**expireMonth**|true|CSS selector. Must be a **select** html tag.
|**expireYear**|true|CSS selector. Must be a **select** html tag.
|**cvv**|true|CSS selector. Must be a **select** html tag.
|**cvvErrText**|false|CSS selector. CVV error text container.
|**country**|true|CSS selector. Must be a **select** html tag.
|**preloader**|false|CSS selector of your preloader (if you want to showing preloader during processing or fetching payment methods).
|**onSuccess**|false|Callback function which take a succes message


## Demo

1. Install dependencies:
  ```bash
	npm install
  ```

2. Run demo-server:
  ```bash
	npm run demo
  ```

3. Go to [localhost:3000/materialize](http://localhost:3000/materialize)


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
###### If you want to build with your API_KEY
  ```bash
	API_KEY=your_api_key npm run build
  ```


