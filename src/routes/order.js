var express     = require("express");
var router  = express.Router({ mergeParams: true });
var cfg = require("./../config");
var voucherify = require("voucherify")(cfg.voucherify);
var momment = require("moment");

//-- Customer details from CRM (e.g. Salesforce)  --
var repository = {
    customers: {
        "1": {
            email : "tom@voucherify.io",
            voucherify_customer_id: null
        },
        "2": {
            email : "it@voucherify.io",
            voucherify_customer_id: null
        }
    },
    orders: {
        "1": {
            voucher_code            : "BB_TEST",
            voucherify_tracking_id  : "track_3tM7KR57bbeIRtMcvpKYr2aAOrCpYBDZ",
            customer_name           : "Test Customer",
            customer_email          : "test@voucherify.io",
            customer                : "1",
            total                   : 30
        },
        "2": {
            voucher_code            : "BB_TEST",
            voucherify_tracking_id  : "track_vHnsXB2hK3Tw+Vj+VlOARh8Hw7qtMzlr",
            customer_name           : "Test IT VoucherifyCustomer",
            customer_email          : "it@voucherify.io",
            customer                : "2",
            total                   : 30
        }
    },
    payments: []
};

router.post("/order/insert", function(request, response) {
    var order = (request.body || {}).order;

    //-- Save Order in repository --
    repository.orders[order.id] = order;
    //--

    console.log("[insert-order] Order: %j", order);

    if (!order || !order.customer) {
        response.status(400).end();
        return;
    }

    //-- If CRM customer doesn't have link to voucherify customer then create new customer based on give tracking id --
    var customer = repository.customers[order.customer] || {};
    if (!customer.voucherify_customer_id) {
        voucherify.customer.create({
                source_id   : order.voucherify_tracking_id,
                name        : order.customer_name,
                email       : order.customer_email,
                metadata    : {
                    crm_id  : customer.id
                }
            })
            .then(function(result) {
                //-- Sample result --
                // {"id":"cust_ikfzmLdkSotgOD8tmQdqTdmH","source_id":"track_3tM7KR57bbeIRtMcvpKYr2aAOrCpYBDZ","name":"Test Customer","email":"test@voucherify.io","metadata":{"crm_id":1},"created_at":"2016-06-15T17:18:47Z","object":"customer"}
                console.log("[insert-order][create-voucherify-customer] Result: %j", result);

                //-- Save customer_id in CRM --
                customer.voucherify_customer_id = result.id;
                repository.customers[order.customer] = customer
            })
            .catch(function(error) {
                console.log("[error][insert-order][create-voucherify-customer] Customer not created Message: %s, Error: %j, Stack: %j",
                    error, error, (error || {}).stack);
            });
    }

    response.status(200).end();
});

router.post("/order/charge", function(request, response) {
    var order_id = (request.body || {}).order_id || "1";

    //-- Get order from CRM --
    var order = repository.orders[order_id];
    var customer = repository.customers[order.customer];
    var payment = repository.payments[repository.payments.length - 1] || {};
    var voucher_code = payment.voucher_code || order.voucher_code;

    //-- If voucher code then redeem and charge discounted value --
    if (voucher_code) {
        voucherify.redeem({
                voucher: voucher_code,
                //-- Voucherify customer id --
                customer: {
                    id: customer.voucherify_customer_id
                },
                order: {
                    amount: order.total
                }
            })
            .then(function(result) {
                //-- Sample result --
                // {"id":"r_m8d62rlmFMdvoiPcEpEq3hwB","object":"redemption","date":"2016-06-15T18:56:59Z","customer_id":"cust_ikfzmLdkSotgOD8tmQdqTdmH","tracking_id":"track_3tM7KR57bbeIRtMcvpKYr2aAOrCpYBDZ","voucher":{"code":"TEST","campaign":null,"category":"","discount":{"type":"AMOUNT","amount_off":1000},"start_date":"2016-05-31T22:00:00Z","expiration_date":"2016-06-30T21:59:59Z","publish":{"count":0,"entries":[]},"redemption":{"quantity":null,"redeemed_quantity":1,"redemption_entries":[{"id":"r_m8d62rlmFMdvoiPcEpEq3hwB","object":"redemption","date":"2016-06-15T18:56:59Z","customer_id":"cust_ikfzmLdkSotgOD8tmQdqTdmH","tracking_id":"track_3tM7KR57bbeIRtMcvpKYr2aAOrCpYBDZ"}]},"active":true,"additional_info":null,"metadata":{"recurring":true}}}
                console.log("[charge][redeem-voucher] Result: %j", result);

                //-- Check if voucher is recurring - contains discount for multiple subscription periods --
                var voucher_metadata = (result.voucher || {}).metadata || {};
                if (voucher_metadata.recurring) {
                    //-- Decrease "duration_period_count" --
                    var duration_period_count = (voucher_metadata.duration_period_count || 0) - 1;

                    //-- If it is recurring, we will create code for next payment --
                    if (duration_period_count > 0) {
                        var voucher = result.voucher;

                        //-- Create code for next payment --
                        return voucherify.create({
                            type: voucher.type,
                            discount: voucher.discount,
                            category: "recurring",
                            start_date: momment(),
                            redemption: {
                                quantity: 1 
                            },
                            metadata: {
                                customer: customer.voucherify_customer_id,
                                order_id: order_id,
                                origin_duration_period_count: voucher_metadata.origin_duration_period_count || voucher_metadata.duration_period_count,
                                duration_period_count: duration_period_count,
                                recurring: true,
                                parent_voucher: voucher.metadata.parent_voucher || voucher.code
                            },
                            code_config: {
                                pattern: "RECURRENT-######"
                            }
                        });
                    }
                }

                //-- Do charge through yout payment gateway --
                // PayPal, Braintree, Stripe etc.
            })
            .then(function(result) {
                if (result) {
                    console.log("[insert-order][create-voucherify-voucher-for-next-period] Result: %j", result);

                    //-- Save voucher code in next payment request --
                    repository.payments.push({
                        voucher_code: result.code
                    });
                }
            })
            .catch(function(error) {
                console.log("[error][charge][redeem-voucher] Voucher not redeemed Message: %s, Error: %j, Stack: %j",
                    error, error, (error || {}).stack);
            });
    }

    response.status(200).end();
});

module.exports = router;