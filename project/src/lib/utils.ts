export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-GN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' GNF';
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'Date invalide';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Date invalide';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return 'Date invalide';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Date invalide';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatTime(dateStr: string): string {
  if (!dateStr) return 'Heure invalide';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Heure invalide';
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getRoleBadge(role: string): { label: string; color: string } {
  switch (role) {
    case 'admin':
      return { label: 'Administrateur', color: 'bg-red-100 text-red-700' };
    case 'caissier':
      return { label: 'Caissier', color: 'bg-amber-100 text-amber-700' };
    case 'serveur':
      return { label: 'Serveur', color: 'bg-blue-100 text-blue-700' };
    default:
      return { label: role, color: 'bg-gray-100 text-gray-700' };
  }
}

export function getPaymentLabel(method: string): string {
  switch (method) {
    case 'especes': return 'Espèces';
    case 'mobile_money': return 'Mobile Money';
    case 'carte': return 'Carte bancaire';
    default: return method;
  }
}

export function todayRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function monthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}
