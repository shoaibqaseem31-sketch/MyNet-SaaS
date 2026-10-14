import { supabase, getCurrentUser } from '../../assets/js/auth.js';
async function loadCustomerSubscription() {

const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  console.error('Customer session load nahi hui:', authError?.message);
  return;
}

  const { data: profile, error } = await supabase
    .from('profiles')
.select('name, packege, activtionDate, expiryDate, is_active, paymentAmount')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Subscription load nahi hui:', error.message);
    return;
  }

  if (!profile) {
    console.warn('Is login ke liye profile nahi mili.');
    return;
  }

document.getElementById('customer-package').textContent =
    profile.packege ? `${profile.packege} Mbps` : 'Package not assigned';
    console.log('Supabase package value:', profile.packege);

document.getElementById('activation-date').textContent =
    profile.activtionDate || 'Not assigned';

document.getElementById('expiry-date').textContent =
    profile.expiryDate || 'Not assigned';    
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activation = new Date(profile.activtionDate + 'T00:00:00');
  const expiry = new Date(profile.expiryDate + 'T00:00:00');

  const remainingDays = Math.ceil(
    (expiry - today) / (1000 * 60 * 60 * 24)
  );

  const validity = document.getElementById('validity-status');

  if (validity) {
    validity.textContent =
      remainingDays < 0
        ? `Expired ${Math.abs(remainingDays)} day(s) ago`
        : remainingDays === 0
        ? 'Expires today'
        : `${remainingDays} Days Remaining`;
  }

  
  const totalDays = 30;

  const daysSinceActivation = Math.max(
    0,
    Math.floor((today - activation) / (1000 * 60 * 60 * 24))
  );

  const elapsedDays = daysSinceActivation === 0
    ? 0
    : ((daysSinceActivation - 1) % totalDays) + 1;

  const remainingCycleDays = totalDays - elapsedDays;
  const progress = Math.round((elapsedDays / totalDays) * 100);

  const progressBar = document.getElementById('billing-progress-bar');
  const progressPercent = document.getElementById('billing-progress-percent');
  const progressLabel = document.getElementById('billing-progress-label');

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  if (progressPercent) {
    progressPercent.textContent = `${remainingCycleDays} Days Remaining`;
  }

  if (progressLabel) {
    progressLabel.textContent =
      `Remaining Days (${remainingCycleDays} of ${totalDays} days)`;
  }

  const activeStatus = document.getElementById('status-active');
  const expiringStatus = document.getElementById('status-expiring');
  const expiredStatus = document.getElementById('status-expired');

  if (expiringStatus) expiringStatus.style.display = 'none';
  if (expiredStatus) expiredStatus.style.display = 'none';

  if (activeStatus) {
    activeStatus.style.display = 'inline-flex';
    activeStatus.innerHTML = profile.is_active
      ? '<span class="material-symbols-outlined text-base">check_circle</span> Active'
      : '<span class="material-symbols-outlined text-base">cancel</span> Inactive';

    activeStatus.className = profile.is_active
      ? 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700'
      : 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700';
  }
}


async function loadCustomerPaymentHistory() {

const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  console.error('Customer session load nahi hui:', authError?.message);
  if (list) list.textContent = 'Please login karein.';
  return;
}

  const list = document.getElementById('payment-history-list');
  const paidCount = document.getElementById('paid-months-count');
  const unpaidCount = document.getElementById('unpaid-months-count');

  if (!list) {
    console.error('Payment history list element nahi mila.');
    return;
  }

  if (!user) {
    list.textContent = 'Please login karein.';
    return;
  }

  list.textContent = 'Payment history load ho rahi hai...';

  const { data: payments, error } = await supabase
    .from('payments')
    .select('payment_month, amount, status')
    .eq('customer_id', user.id);

  if (error) {
    console.error('Payment history error:', error.message);
    list.textContent = 'Payment history load nahi hui.';
    return;
  }

  const paymentMap = new Map(
    (payments || []).map(payment => [payment.payment_month, payment])
  );

  const year = new Date().getFullYear();
  let paid = 0;
  let unpaid = 0;

  list.replaceChildren();

  for (let index = 0; index < 12; index++) {
    const monthKey =
      `${year}-${String(index + 1).padStart(2, '0')}-01`;

    const monthName = new Date(year, index, 1).toLocaleDateString(
      'en-US',
      { month: 'long', year: 'numeric' }
    );

    const payment = paymentMap.get(monthKey);
    const status = String(payment?.status || '').toLowerCase();
    const isPaid = status === 'paid';
    const isUnpaid = status === 'unpaid';

    if (isPaid) paid++;
    if (isUnpaid) unpaid++;

    const row = document.createElement('div');
    row.className =
      'flex items-center justify-between gap-3 p-4 rounded-xl border';

    const month = document.createElement('span');
    month.className = 'font-semibold text-sm text-on-surface';
    month.textContent = monthName;

    row.append(month);

    if (isPaid || isUnpaid) {
      const details = document.createElement('div');
      details.className = 'flex items-center gap-3';

      const statusLabel = document.createElement('span');
      statusLabel.className = isPaid
        ? 'px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700'
        : 'px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800';

      statusLabel.textContent = isPaid ? '✓ Paid' : '✕ Unpaid';

      const amount = document.createElement('span');
      amount.className = 'font-bold text-sm text-on-surface';
      amount.textContent =
        'PKR ' + Number(payment.amount || 0).toLocaleString('en-PK');

      details.append(statusLabel, amount);
      row.append(details);
    }

    list.append(row);
  }

  if (paidCount) paidCount.textContent = paid + ' Months Paid';
  if (unpaidCount) unpaidCount.textContent = unpaid + ' Months Unpaid';
}

loadCustomerPaymentHistory();
loadCustomerSubscription();