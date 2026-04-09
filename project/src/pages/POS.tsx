import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Printer, Search } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { Product, Order } from '../lib/types';
import { formatCurrency, getPaymentLabel, formatDate } from '../lib/utils';
import LoadingSpinner from '../components/shared/LoadingSpinner';

interface SaleItem {
  product: Product;
  quantity: number;
}

export default function POS() {
  const { profile } = useAuth();
  const toast = useToast();
  const { restaurant } = useRestaurant();
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'especes' | 'mobile_money' | 'carte'>('especes');
  const [amountPaid, setAmountPaid] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const canCreateSale = profile?.role === 'admin' || profile?.role === 'caissier';

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.available
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await api.getProducts();
      // Map MongoDB _id to id for consistency
      const mappedProducts = (data as any[]).map(p => ({
        ...p,
        id: p._id || p.id
      })).filter(p => p.available);
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
    setLoading(false);
  }

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setFilteredProducts([]);
    setQuantity('1');
  }

  function addItem() {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      toast.error('Veuillez sélectionner un produit et une quantité valide');
      return;
    }

    const qty = parseInt(quantity);
    const existing = saleItems.find(item => item.product.id === selectedProduct.id);

    if (existing) {
      setSaleItems(saleItems.map(item =>
        item.product.id === selectedProduct.id
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
    } else {
      setSaleItems([...saleItems, { product: selectedProduct, quantity: qty }]);
    }

    // Reset
    setSearchTerm('');
    setSelectedProduct(null);
    setQuantity('1');
    searchInputRef.current?.focus();
  }

  function removeItem(productId: string) {
    setSaleItems(saleItems.filter(item => item.product.id !== productId));
  }

  function updateItemQuantity(productId: string, newQty: number) {
    if (newQty <= 0) {
      removeItem(productId);
      return;
    }
    setSaleItems(saleItems.map(item =>
      item.product.id === productId ? { ...item, quantity: newQty } : item
    ));
  }

  const total = saleItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const amountPaidNum = parseFloat(amountPaid) || 0;
  const change = paymentMethod === 'especes' ? Math.max(0, amountPaidNum - total) : 0;

  async function handleSave() {
    if (saleItems.length === 0) {
      toast.error('Veuillez ajouter au moins un produit');
      return;
    }

    if (paymentMethod === 'especes' && amountPaidNum < total) {
      toast.error('Le montant payé est insuffisant');
      return;
    }

    setProcessing(true);

    try {
      const orderData = await api.createOrder({
        items: saleItems.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          unit_price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
          notes: ''
        })),
        table_number: tableNumber,
        notes: '',
        payment_method: paymentMethod,
        amount_paid: paymentMethod === 'especes' ? amountPaidNum : total
      });

      setLastOrder(orderData as Order);
      
      // Reset form mais garder lastOrder
      setSaleItems([]);
      setTableNumber('');
      setAmountPaid('');
      setSearchTerm('');
      setSelectedProduct(null);
      
      toast.success('Vente enregistrée avec succès ! Cliquez sur "Imprimer le reçu" pour imprimer.');
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }

    setProcessing(false);
  }

  function printReceipt() {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !lastOrder) return;

    const restaurantName = restaurant?.name || 'RESTO SINGA';
    const restaurantLogo = restaurant?.logo || '';
    const restaurantAddress = restaurant?.address || '';
    const restaurantPhone = restaurant?.phone || '';

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reçu - ${lastOrder.order_number}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0;
            padding: 10mm;
            font-size: 12px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 10px;
            border-radius: 8px;
            object-fit: cover;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .restaurant-info {
            font-size: 10px;
            color: #666;
            margin-top: 5px;
          }
          .info {
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .items {
            margin-bottom: 10px;
          }
          .item {
            margin-bottom: 8px;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
          }
          .item-detail {
            font-size: 10px;
            color: #666;
            padding-left: 10px;
          }
          .total {
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 10px;
            font-weight: bold;
            font-size: 14px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            border-top: 1px dashed #000;
            padding-top: 10px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${restaurantLogo ? `<img src="${restaurantLogo}" alt="Logo" class="logo" />` : ''}
          <div class="title">${restaurantName}</div>
          ${restaurantAddress ? `<div class="restaurant-info">${restaurantAddress}</div>` : ''}
          ${restaurantPhone ? `<div class="restaurant-info">Tél: ${restaurantPhone}</div>` : ''}
          <div style="font-size: 10px; margin-top: 5px;">
            ${formatDate(lastOrder.created_at || lastOrder.createdAt || new Date().toISOString())}
          </div>
        </div>

        <div class="info">
          <div><strong>N° Commande:</strong> ${lastOrder.order_number}</div>
          ${lastOrder.table_number ? `<div><strong>Table:</strong> ${lastOrder.table_number}</div>` : ''}
          ${lastOrder.payment_method ? `<div><strong>Mode de paiement:</strong> ${getPaymentLabel(lastOrder.payment_method)}</div>` : ''}
        </div>

        <div class="items">
          <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
            <strong>Articles</strong>
          </div>
          ${lastOrder.order_items?.map(item => `
            <div class="item">
              <div class="item-header">
                <span>${item.product_name}</span>
                <span>${formatCurrency(item.unit_price)}</span>
              </div>
              <div class="item-detail">
                ${item.quantity} x ${formatCurrency(item.unit_price)} = ${formatCurrency(item.subtotal)}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="total">
          <div class="total-row">
            <span>SOUS-TOTAL:</span>
            <span>${formatCurrency(lastOrder.subtotal)}</span>
          </div>
          <div class="total-row" style="font-size: 16px;">
            <span>TOTAL:</span>
            <span>${formatCurrency(lastOrder.total)}</span>
          </div>
          ${lastOrder.payment_method === 'especes' ? `
            <div class="total-row" style="margin-top: 5px; font-size: 12px;">
              <span>Montant reçu:</span>
              <span>${formatCurrency(lastOrder.amount_paid)}</span>
            </div>
            <div class="total-row" style="font-size: 12px;">
              <span>Monnaie:</span>
              <span>${formatCurrency(lastOrder.change_amount)}</span>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <div>Merci de votre visite !</div>
          <div>À bientôt</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!canCreateSale) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Seuls les administrateurs et caissiers peuvent accéder à la caisse.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle vente</h1>
        <p className="text-gray-600 mt-1">Saisissez les produits et enregistrez la vente</p>
      </div>

      {/* Formulaire d'ajout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900">Ajouter un produit</h2>
          {selectedProduct && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedProduct(null);
                setQuantity('1');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Effacer
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche produit */}
          <div className="md:col-span-2 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du produit
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
            
            {/* Liste déroulante */}
            {filteredProducts.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => selectProduct(product)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-amber-600 font-semibold">{formatCurrency(product.price)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Produit sélectionné */}
        {selectedProduct && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-900">{selectedProduct.name}</div>
                <div className="text-sm text-gray-600">{selectedProduct.description}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Prix unitaire</div>
                <div className="text-lg font-bold text-amber-600">{formatCurrency(selectedProduct.price)}</div>
                <div className="text-sm text-gray-900 font-semibold mt-1">
                  Total: {formatCurrency(selectedProduct.price * parseInt(quantity || '1'))}
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={addItem}
          disabled={!selectedProduct}
          className="mt-4 w-full md:w-auto px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Ajouter à la vente
        </button>
      </div>

      {/* Liste des articles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Articles de la vente {saleItems.length > 0 && `(${saleItems.length})`}
        </h2>
        
        {saleItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Aucun article ajouté
          </div>
        ) : (
          <div className="space-y-3">
            {saleItems.map(item => (
              <div key={item.product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.product.name}</div>
                  <div className="text-sm text-gray-600">{formatCurrency(item.product.price)} × {item.quantity}</div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItemQuantity(item.product.id, parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-center"
                  />
                  <div className="w-28 text-right font-bold text-gray-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-500 hover:text-red-600 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {saleItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-amber-600">{formatCurrency(total)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Paiement */}
      {saleItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Paiement</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de table (optionnel)
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Ex: Table 5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode de paiement
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              >
                <option value="especes">Espèces</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="carte">Carte bancaire</option>
              </select>
            </div>

            {paymentMethod === 'especes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant reçu
                </label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Montant"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {paymentMethod === 'especes' && amountPaidNum > 0 && (
            <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Monnaie à rendre</span>
                <span className="text-2xl font-bold text-emerald-600">{formatCurrency(change)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={processing || (paymentMethod === 'especes' && amountPaidNum < total)}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {processing ? 'Enregistrement...' : 'Enregistrer la vente'}
          </button>
        </div>
      )}

      {/* Bouton d'impression - toujours visible après une vente */}
      {lastOrder && (
        <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Dernière vente enregistrée</h2>
              <p className="text-sm text-gray-600">N° {lastOrder.order_number} - {formatCurrency(lastOrder.total)}</p>
            </div>
          </div>
          <button
            onClick={printReceipt}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={20} />
            Imprimer le reçu
          </button>
        </div>
      )}
    </div>
  );
}
