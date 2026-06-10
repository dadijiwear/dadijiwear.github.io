import mongoose, { Schema, model, models } from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Please provide a category name.'],
    unique: true,
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug.'],
    unique: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default models.Category || model<ICategory>('Category', CategorySchema);
