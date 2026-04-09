import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'caissier', 'serveur'],
    default: 'serveur'
  },
  avatar_url: String
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
