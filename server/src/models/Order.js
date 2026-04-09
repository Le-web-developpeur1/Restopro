import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  product_name: {
    type: String,
    required: true
  },
  unit_price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema({
  order_number: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  payment_method: {
    type: String,
    enum: ['especes', 'mobile_money', 'carte', null]
  },
  amount_paid: {
    type: Number,
    default: 0
  },
  change_amount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  table_number: {
    type: String,
    default: ''
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completed_at: Date,
  order_items: [orderItemSchema]
}, {
  timestamps: true
});

// Auto-générer le numéro de commande
orderSchema.pre('save', async function(next) {
  if (!this.order_number) {
    const count = await mongoose.model('Order').countDocuments();
    this.order_number = `ORD-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
