'use server';

import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  try {
    await dbConnect();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = Number(formData.get('price'));
    const category = formData.get('category') as string;
    const stock = Number(formData.get('stock'));

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
    });

    revalidatePath('/shop');
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getProducts() {
  try {
    await dbConnect();
    const products = await Product.find({}).lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}
