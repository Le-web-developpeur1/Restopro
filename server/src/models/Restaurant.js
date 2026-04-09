import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'RESTO SINGA'
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    enum: ['GNF', 'FCFA', 'EUR', 'USD'],
    default: 'GNF'
  },
  logo: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Restaurant', restaurantSchema);
