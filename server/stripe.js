const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);


const charge = async (amount) => {
    try {
        console.log("checkout");
        const description = "Donation"
        const test = [{
            "price_data": {
                "currency": "usd", "product_data":
                    { "name": description },
                "unit_amount": parseInt(amount) * 100
            },
            "quantity": parseInt(1)
        }];
        const id = dt.getTime();
        const items = [{ charge_id: id, itemId: 1, quantity: 1 }]
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: lineItems,
            client_reference_id: items[0].charge_id,
            success_url: `${process.env.CLIENT_URL}/success/${items[0].charge_id}/2023`,
            cancel_url: `${process.env.CLIENT_URL}/cancel/${items[0].charge_id}/2023`,
        })
        res.redirect(session.url);
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
}
