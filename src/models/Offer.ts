import mongoose, { Schema, model, models } from 'mongoose';

export interface IOffer {
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  buttonText: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

const OfferSchema = new Schema<IOffer>({
  title: {
    type: String,
    required: [true, 'Please provide an offer title.'],
  },
  subtitle: {
    type: String,
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL.'],
  },
  link: {
    type: String,
    default: '/shop',
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default models.Offer || model<IOffer>('Offer', OfferSchema);
