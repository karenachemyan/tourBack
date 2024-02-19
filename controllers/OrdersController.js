import { Categories, Destinations, Galleries, Orders, TourSchedules, TourSteps, Toures } from "../models";
import sequelize from "../services/sequelize";
import HttpError from "http-errors";
import stripeModule from 'stripe';

class OrdersController {

  static async order(req, res, next) {
    try {

      const { scheduleId, adult, children3to10, children11up, gid } = req.body;
      const { id } = req.params;
      const userId = req.userId;

      const tour = await Toures.findOne({
        where: { id },
        include: [
          {
            model: Categories,
            required: true,
            attributes: ['title']
          },
          {
            model: Destinations,
            required: true,
            attributes: ['title']
          },

          {
            model: Galleries,
            required: false,
            attributes: [[sequelize.literal(`CONCAT('toures/gallery/tour_${id}/', src)`), 'src']]
          },
          {
            model: TourSchedules,
            required: true,
            attributes: ['date']
          },
          {
            model: TourSteps,
            required: false,
            attributes: ['title', 'description']
          },

        ],
        attributes: ['id', 'title', 'description', 'price', 'duration', [sequelize.literal(`CONCAT('toures/', featuredImage)`), 'featuredImage'], [
          sequelize.literal(`(SELECT ROUND(AVG(rate), 0) FROM rates WHERE tourId = ${id})`),
          'rating']],

      })

      if (!tour) {
        throw HttpError(422, {
          errors: {
            error: 'No Tour found'
          }
        })
      }

      const orderExists = await Orders.findOne({
        where: { userId, tourScheduleId: scheduleId }
      })

      if (orderExists) {
        throw HttpError(409, {
          errors: {
            error: 'You are alreagy make order for this tour!'
          }
        })
      }

      const children3to10Price = children3to10 * (tour.price * 50) / 100

      const children11upPrice = children11up * (tour.price * 80) / 100

      let totalPrice = adult * tour.price + children3to10Price + children11upPrice

      const participants = adult + children11up + children3to10;

      if (gid) {
        totalPrice = totalPrice + 30000
      }

      const order = await Orders.create({
        totalAmount: totalPrice,
        userId,
        tourScheduleId: scheduleId,
        gid,
        adult,
        children3to10,
        children11up,
        participants
      })

      res.json({
        status: 'ok',
        order,
        totalPrice
      })

    }
    catch (e) {
      next(e)
    }

  }

  static async checkout(req, res, next) {
    try {
      const { STRIPE_SECRET_KEY } = process.env

      const userId = req.userId;

      const order = await Orders.findOne({ where: { userId } });

      if (!order) {
        throw HttpError(404, {
          errors: {
            error: 'Order not found'
          }
        });
      }

      const stripe = stripeModule(STRIPE_SECRET_KEY);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.totalAmount * 100,
        currency: 'amd',
        description: `Payment for Order #${order.id}`,
        metadata: {
          order_id: order.id,
          user_id: userId
        },
      });

      await order.update({
        status: 'active'
      });

      res.json({
        status: 'ok',
        clientSecret: paymentIntent.client_secret,
      });

    } catch (e) {
      next(e);
    }
  }

}

export default OrdersController