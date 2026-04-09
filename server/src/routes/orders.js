import express from 'express';
import Order from '../models/Order.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Récupérer toutes les commandes
router.get('/', authenticate, async (req, res) => {
  try {
    // Si caissier, ne voir que ses propres commandes
    const filter = req.user.role === 'caissier' 
      ? { created_by: req.user.id }
      : {};
    
    const orders = await Order.find(filter)
      .populate('created_by', 'full_name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer une commande avec ses items
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('created_by', 'full_name email');
    
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer une commande
router.post('/', authenticate, async (req, res) => {
  const { items, table_number, notes, payment_method, amount_paid } = req.body;
  
  try {
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const change_amount = payment_method ? Math.max(0, amount_paid - subtotal) : 0;
    
    const order = await Order.create({
      created_by: req.user.id,
      subtotal,
      total: subtotal,
      table_number: table_number || '',
      notes: notes || '',
      payment_method,
      amount_paid: amount_paid || 0,
      change_amount,
      status: payment_method ? 'completed' : 'pending',
      completed_at: payment_method ? new Date() : null,
      order_items: items
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une commande (admin/caissier)
router.put('/:id', authenticate, requireRole('admin', 'caissier'), async (req, res) => {
  const { status, payment_method, amount_paid } = req.body;
  
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    if (status) order.status = status;
    if (payment_method) order.payment_method = payment_method;
    if (amount_paid !== undefined) {
      order.amount_paid = amount_paid;
      order.change_amount = Math.max(0, amount_paid - order.total);
    }
    if (status === 'completed' && !order.completed_at) {
      order.completed_at = new Date();
    }
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistiques du dashboard
router.get('/stats/dashboard', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Filtre selon le rôle
    const baseFilter = req.user.role === 'caissier' 
      ? { created_by: req.user.id, status: 'completed' }
      : { status: 'completed' };
    
    const todayOrders = await Order.find({
      ...baseFilter,
      createdAt: { $gte: today }
    });
    
    const monthOrders = await Order.find({
      ...baseFilter,
      createdAt: { $gte: startOfMonth }
    });
    
    const today_revenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const month_revenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Calculer les top produits du mois
    const productStats = {};
    monthOrders.forEach(order => {
      order.order_items.forEach(item => {
        if (!productStats[item.product_name]) {
          productStats[item.product_name] = { count: 0, revenue: 0 };
        }
        productStats[item.product_name].count += item.quantity;
        productStats[item.product_name].revenue += item.subtotal;
      });
    });
    
    const top_products = Object.entries(productStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    res.json({
      today_revenue,
      today_orders: todayOrders.length,
      month_revenue,
      month_orders: monthOrders.length,
      top_products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
