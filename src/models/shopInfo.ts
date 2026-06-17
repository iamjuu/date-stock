import { Schema, model, models } from 'mongoose';

const ShopInfoSchema = new Schema({
  name: { type: String, required: true, default: 'My Shop' },
  contactNumber: { type: String, default: '' },
});

export const ShopInfo = models.ShopInfo || model('ShopInfo', ShopInfoSchema);
