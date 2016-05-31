## Voucherify showcase - subcsription-level discounts

[Voucherify](http://voucherify.io?utm_source=inbound&utm_medium=github&utm_campaign=voucherify-showcase) has a new platform that will help your team automate voucher campaigns. It does this by providing composable API and the marketer-friendly interface that increases teams' productivity:

- **roll-out thousands** of vouchers **in minutes** instead of weeks,
- **check status** or disable **every single** promo code in real time,
- **track redemption** history and build reports on the fly.

Here you can find a library that makes it easier to integrate Voucherify with your Node.js server.

Full documentation is located at [voucherify.readme.io](https://voucherify.readme.io).

In this showcase we will present how to integrate voucherify into platform which delivers services in subscription based model.

### Features

- 


### Usage

#### Fill placeholders for your credentials to services

`src\config.js`

```javascript
    host: 'placeholder', // Address of your app visible from internet - Twilio needs it to configure properly routing
    voucherify: {
        'applicationId': 'placeholder',
        'clientSecretKey': 'placeholder'
    }
```

`src\server.js`



### Changelog

- **2016-04-01** - `0.1.0` - First version: insert orders with vouchers and tracking ids