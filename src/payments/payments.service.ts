import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Response, Request } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;
    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // 20 USD = (2000/100 = 20.00)
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId: orderId,
        },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3003/payments/success',
      cancel_url: 'http://localhost:3003/payments/cancel',
    });

    return session;
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;
    const endpointSecret = 'secret_key';

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
      console.log({ event });
      switch (event.type) {
        case 'charge.succeeded':
          const chargeSucceeded = event.data.object;
          console.log({
            metadata: chargeSucceeded.metadata,
            orderId: chargeSucceeded.metadata.orderId,
          });
          break;

        default:
          console.log(`Event ${event.type} not handled`);
      }
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    return res.status(200).json({ sig });
  }
}
