"use strict";
// @ts-ignore
const stripe = require("stripe")(
  "sk_test_51OtzDUI6z8xnRUHVWrRrsHZiguuy7OO7nXHWNLCUfwDE5g4sVaasLHLMFmgBDmrc761eQM7fBRgJ48ThPySmouvm007kwgb8kY"
);

function calcDiscountPrice(price, discount) {
  if (!discount) return price;

  const discountAmount = (price * discount) / 100;
  const result = price - discountAmount;

  return result.toFixed(2);
}

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async paymentOrder(ctx) {
    const { token, products, idUser, shippingAddress } = ctx.request.body;

    // Validar campos requeridos
    if (!token || !products || !idUser || !shippingAddress) {
      return ctx.badRequest("Faltan campos requeridos");
    }

    let totalPayment = 0;
    products.forEach((product) => {
      const priceTemp = calcDiscountPrice(
        product.attributes.price,
        product.attributes.discount
      );
      totalPayment += Number(priceTemp) * product.quantity;
    });

    try {
      const charge = await stripe.charges.create({
        amount: Math.round(totalPayment * 100),
        currency: "eur",
        source: token.id,
        description: `User ID: ${idUser}`,
      });

      const data = {
        products,
        user: idUser,
        totalPayment,
        idPayment: charge.id,
        shippingAddress,
      };

      const model = strapi.contentTypes["api::order.order"];
      const validData = await strapi.entityValidator.validateEntityCreation(
        model,
        data
      );

      const entry = await strapi.db
        .query("api::order.order")
        .create({ data: validData });

      return entry;
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      return ctx.internalServerError("Error al procesar el pago");
    }
  },
}));
