
import { supabase } from '../../../assets/js/auth.js';


async function loadCustomers() {
  const customerList = document.getElementById('customerList');
  const customerSearch = document.getElementById('customerSearch');

  if (!customerList) {
    console.error('Customer list container not found.');
    return;
  }

  customerList.innerHTML =
    '<p class="p-4 text-sm">Loading customers...</p>';

  const { data: customers, error } = await supabase
    .from('profiles')
.select('id, name, user_id, phone, address, packege, activtionDate, expiryDate, paymentStatus, last_payment_date, paymentAmount')    .order('created_at', { ascending: false });

  if (error) {
    console.error('Customer loading failed:', error.message);
    customerList.innerHTML =
      '<p class="p-4 text-sm text-red-600">Could not load customers. Check the browser console.</p>';
    return;
  }

  if (!customers || customers.length === 0) {
    customerList.innerHTML =
      '<p class="p-4 text-sm">No customers found in Supabase.</p>';
    return;
  }

  function renderCustomers(searchText = '') {
    const query = searchText.trim().toLowerCase();

    const filteredCustomers = customers.filter((customer) => {
      const searchableText = [
        customer.name,
        customer.user_id,
        customer.phone
      ].join(' ').toLowerCase();

      return searchableText.includes(query);
    });

    customerList.replaceChildren();

    if (filteredCustomers.length === 0) {
      customerList.innerHTML =
        '<p class="p-4 text-sm text-outline">No matching users found.</p>';
      return;
    }

    filteredCustomers.forEach((customer) => {
      const card = document.createElement('div');
      card.className =
        'p-4 rounded-lg border border-outline-variant/40 bg-surface-container-lowest transition-colors';

      if (query) {
        card.classList.add(
          'border-primary',
          'bg-primary/10',
          'ring-1',
          'ring-primary/30'
        );
      }

      const details = document.createElement('div');
      details.className = 'flex items-center gap-3';

      const avatar = document.createElement('div');
      avatar.className =
        'w-10 h-10 shrink-0 rounded-full bg-surface-container-high flex items-center justify-center font-bold';
      avatar.textContent =
        (customer.name || '?').trim().charAt(0).toUpperCase();

      const info = document.createElement('div');
      info.className = 'min-w-0';

      const name = document.createElement('p');
      name.className = 'font-semibold text-sm break-words';
      name.textContent = customer.name || 'Unnamed customer';

      const userId = document.createElement('p');
      userId.className = 'text-xs text-outline break-words';
      userId.textContent = 'User ID: ' + (customer.user_id || 'Not set');

      const phone = document.createElement('p');
      phone.className = 'text-xs text-outline break-words';
      phone.textContent = 'Phone: ' + (customer.phone || 'Not set');

      const packageName = document.createElement('p');
      packageName.className = 'text-xs text-outline break-words';
      packageName.textContent =
        'Package: ' + (customer.packege || 'Not assigned');

      info.append(name, userId, phone, packageName);
      details.append(avatar, info);
      card.append(details);
      card.style.cursor = 'pointer';

card.addEventListener('click', () => {
  window.selectedMyNetCustomer = customer;
  loadPaymentHistory(customer);
  const setProfileText = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.textContent = value || 'Not set';
};

setProfileText('profileName', customer.name);
setProfileText('profileUserId', customer.user_id);
setProfileText('profilePhone', customer.phone);
setProfileText('profileAddress', customer.address);
setProfileText('profileActivationDate', customer.activtionDate);
setProfileText('profileExpiryDate', customer.expiryDate);
const packageSelect = document.getElementById('packageSelect');

if (packageSelect) {
  packageSelect.value = String(customer.packege || '');
}
const packagePrice = document.getElementById('packagePrice');

if (packagePrice) {
  packagePrice.value = customer.paymentAmount ?? '';
}

  const selectedLabel = document.getElementById('selectedCustomerLabel');

  if (selectedLabel) {
    selectedLabel.textContent =
      `${customer.name || 'Unnamed customer'} (ID: ${customer.user_id || 'Not set'})`;
  }

  console.log('Selected customer:', customer);
});
      customerList.append(card);
    });
  }

  renderCustomers(customerSearch?.value || '');

  if (customerSearch && !customerSearch.dataset.searchConnected) {
    customerSearch.addEventListener('input', () => {
      renderCustomers(customerSearch.value);
    });

    customerSearch.dataset.searchConnected = 'true';
  }

  console.log('Customers loaded:', customers.length);
}

async function checkAdmin() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    window.location.replace('./login.html');
    return;
  }

  const { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (adminError || !admin) {
    await supabase.auth.signOut();
    window.location.replace('./login.html');
    return;
  }

  console.log('MyNet Admin Dashboard connected:', user.email);

  const signOutButton = [...document.querySelectorAll('button, a')]
    .find(element => element.textContent.trim().includes('Sign Out'));

  if (signOutButton) {
    signOutButton.addEventListener('click', async (event) => {
      event.preventDefault();
      signOutButton.disabled = true;

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error('Sign Out failed:', signOutError.message);
        signOutButton.disabled = false;
        alert('Sign Out failed. Please try again.');
        return;
      }

      window.location.replace('./login.html');
    });
  } else {
    console.warn('Sign Out button was not found.');
  }

  await loadCustomers();
}

document.getElementById('saveChangesBtn')?.addEventListener('click', async () => {
  const customer = window.selectedMyNetCustomer;

  if (!customer) {
    alert('Please select a customer first.');
    return;
  }

  const packageSelect = document.getElementById('packageSelect');
  const packagePrice = document.getElementById('packagePrice');

  const packageValue = packageSelect?.value;
  const priceValue = packagePrice?.value;

  if (!packageValue || priceValue === '' || Number(priceValue) < 0) {
    alert('Please select a package and enter a valid monthly price.');
    return;
  }


const { data, error } = await supabase
  .from('profiles')
  .update({
    packege: Number(packageValue),
    paymentAmount: Number(priceValue)
  })
  .eq('id', customer.id)
  .select('id, packege, paymentAmount');

console.log('Supabase update result:', data);

if (error || !data || data.length === 0) {
  console.error('Save failed:', error?.message || 'No customer row was updated.');
  alert('Save failed. Check the browser console.');
  return;
}

  if (error) {
    console.error('Save Changes failed:', error.message);
    alert('Could not save changes: ' + error.message);
    return;
  }

  customer.packege = Number(packageValue);
  customer.paymentAmount = Number(priceValue);

  alert('Package and monthly price saved successfully!');
  console.log('Customer changes saved:', customer);
});

async function loadPaymentHistory(customer) {
  const historyList = document.getElementById('paymentHistoryList');
  const tariff = document.getElementById('paymentTariff');

  if (!historyList || !customer) return;

  const monthlyPrice = Number(customer.paymentAmount ?? 0);

  if (tariff) {
    tariff.textContent =
      `Monthly Price: PKR ${monthlyPrice.toLocaleString('en-PK')}`;
  }

  historyList.innerHTML =
    '<div class="p-4 text-sm text-outline">Loading payment history...</div>';

  const { data: payments, error } = await supabase
    .from('payments')
    .select('id, payment_month, amount, status, paid_at')
    .eq('customer_id', customer.id)
    .order('payment_month', { ascending: false });

  if (error) {
console.error('Payment history error:', error);    historyList.innerHTML =
      '<div class="p-4 text-sm text-red-600">Payment history load nahi hui. Console check karein.</div>';
    return;
  }

  const paymentMap = new Map(
    (payments || []).map(payment => [payment.payment_month, payment])
  );

  const start = customer.activtionDate
    ? new Date(`${customer.activtionDate}T12:00:00`)
    : new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);

  const end = new Date();
  let month = new Date(start.getFullYear(), start.getMonth(), 1);
  const months = [];

  while (month <= new Date(end.getFullYear(), end.getMonth(), 1)) {
    months.push(new Date(month));
    month.setMonth(month.getMonth() + 1);
  }

  if (!months.length) {
    historyList.innerHTML =
      '<div class="p-4 text-sm text-outline">Is customer ke liye payment months available nahi hain.</div>';
    return;
  }

  historyList.innerHTML = months.reverse().map(date => {
    const monthKey =
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

    const payment = paymentMap.get(monthKey);
    const isPaid = payment?.status === 'paid';
    const amount = Number(payment?.amount ?? monthlyPrice);

    return `
      <label class="flex items-center justify-between gap-3 p-3.5
        ${isPaid ? 'hover:bg-surface-container-low/60' : 'bg-amber-50/40 hover:bg-amber-50'}
        cursor-pointer transition-colors">
        <div class="flex items-center gap-3 min-w-0">
          <input
            class="payment-status-checkbox w-4 h-4 rounded border-outline-variant text-primary"
            type="checkbox"
            data-month="${monthKey}"
            ${isPaid ? 'checked' : ''}
          />
          <span class="text-body-md font-body-md font-medium text-on-surface">
            ${date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-label-sm font-label-sm font-mono text-outline">
            PKR ${amount.toLocaleString('en-PK')}
          </span>
          <span class="payment-status-label text-label-sm font-semibold
            ${isPaid ? 'text-emerald-700' : 'text-amber-900'}">
            ${isPaid ? 'Paid' : 'Unpaid'}
          </span>
        </div>
      </label>
    `;
  }).join('');

  historyList.querySelectorAll('.payment-status-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
      checkbox.disabled = true;

      const paymentMonth = checkbox.dataset.month;
      const paid = checkbox.checked;

      const { error: saveError } = await supabase
        .from('payments')
        .upsert({
          customer_id: customer.id,
          payment_month: paymentMonth,
          amount: monthlyPrice,
          status: paid ? 'paid' : 'unpaid',
          paid_at: paid ? new Date().toISOString() : null
        }, {
          onConflict: 'customer_id,payment_month'
        });

      checkbox.disabled = false;

      if (saveError) {
        checkbox.checked = !paid;
        console.error('Payment save error:', saveError.message);
        alert('Payment save nahi hui: ' + saveError.message);
        return;
      }

      const statusLabel = checkbox
        .closest('label')
        ?.querySelector('.payment-status-label');

      if (statusLabel) {
        statusLabel.textContent = paid ? 'Paid' : 'Unpaid';
        statusLabel.className =
          `payment-status-label text-label-sm font-semibold ${
            paid ? 'text-emerald-700' : 'text-amber-900'
          }`;
      }

      console.log('Payment status saved:', paymentMonth, paid ? 'paid' : 'unpaid');
    });
  });
}

checkAdmin();
