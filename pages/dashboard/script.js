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

  // Guard: only build Date objects when the values are non-null, non-empty strings.
  // Without this guard, `null + 'T00:00:00'` → "nullT00:00:00" → Invalid Date,
  // which causes Math.ceil(NaN / ...) = NaN and shows "NaN Days Remaining".
  const hasActivation = profile.activtionDate && String(profile.activtionDate).trim() !== '';
  const hasExpiry     = profile.expiryDate     && String(profile.expiryDate).trim()     !== '';
  console.log('MyNet date check:', profile.name, profile.activtionDate, profile.expiryDate);

  const activation = hasActivation ? new Date(profile.activtionDate + 'T00:00:00') : null;
  const expiry     = hasExpiry     ? new Date(profile.expiryDate     + 'T00:00:00') : null;

  // ── Fixed 30-day billing cycle countdown ──────────────────────────────
  // Source of truth: activtionDate only. expiryDate is displayed in the UI
  // but is NOT used for the countdown — it may be saved inconsistently
  // (e.g. activtionDate + 31 instead of activtionDate + 30).
  //
  // Day 0 (activation date) → 30 days remaining, bar = 0 %
  // Day 1                   → 29 days remaining, bar ≈ 3 %
  // Day 30                  →  0 days remaining, bar = 100 % → "Expires today"
  // Day 31+                 → negative, bar clamped at 100 % → "Expired N day(s) ago"
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const totalDays = 30;

const remainingDays = activation && !isNaN(activation.getTime())
  ? 30 - Math.floor((today - activation) / MS_PER_DAY)
  : null;
function formatRemainingDays(days) {
  if (days === null) return 'Dates not assigned';
  if (days > 1) return `${days} Days Remaining`;
  if (days === 1) return '1 Day Remaining';
  if (days === 0) return 'Expires today';
  return 'Expired';
}
const validity = document.getElementById('validity-status');
if (validity) validity.textContent = formatRemainingDays(remainingDays);

const elapsedDays = activation && !isNaN(activation.getTime())
  ? Math.floor((today - activation) / MS_PER_DAY)
  : null;

const progress = totalDays > 0 && remainingDays !== null
  ? Math.round(
      (Math.min(totalDays, Math.max(0, totalDays - remainingDays)) / totalDays) * 100
    )
  : 0;
const progressBar = document.getElementById('billing-progress-bar');
const progressPercent = document.getElementById('billing-progress-percent');
const progressLabel = document.getElementById('billing-progress-label');
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  if (progressPercent) {
    progressPercent.textContent = remainingDays === null
      ? 'Dates not assigned'
      : remainingDays > 0
        ? `${remainingDays} Days Remaining`
        : '0 Days Remaining';
  }

  if (progressLabel) {
    progressLabel.textContent = totalDays > 0 && remainingDays !== null
      ? `Remaining Days (${Math.max(0, remainingDays)} of ${totalDays} days)`
      : 'Billing Cycle Progress';
  }  const activeStatus = document.getElementById('status-active');
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