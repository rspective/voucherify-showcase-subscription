## Voucherify showcase - subcsription-level discounts

[Voucherify](http://voucherify.io?utm_source=github&utm_medium=demo&utm_campaign=acq) is an API-first platform for software developers who are dissatisfied with high-maintenance custom coupon software. Our product is a coupon infrastructure through API that provides a quicker way to build coupon generation, distribution and tracking. Unlike legacy coupon software we have:

* an API-first SaaS platform that enables customisation of every aspect of coupon campaigns
* a management console that helps cut down maintenance and reporting overhead
* an infrastructure to scale up coupon activity in no time

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
