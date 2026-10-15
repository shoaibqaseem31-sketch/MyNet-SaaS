
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
    .select('id, name, user_id, phone, address, packege, activtionDate, expiryDate, paymentStatus, last_payment_date, paymentAmount, is_active')
    .order('created_at', { ascending: false });
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
      
      const statusRow = document.createElement('label');
      statusRow.className = 'flex items-center gap-2 mt-3 text-sm font-medium';
      statusRow.style.cursor = 'pointer';

      const activeCheckbox = document.createElement('input');
      activeCheckbox.type = 'checkbox';
      activeCheckbox.checked = customer.is_active === true;
      activeCheckbox.className = 'w-4 h-4';
      activeCheckbox.setAttribute('aria-label', 'Internet active status');

      const statusText = document.createElement('span');
      statusText.textContent = activeCheckbox.checked ? 'Active' : 'Inactive';
      statusText.className = activeCheckbox.checked
        ? 'text-emerald-700'
        : 'text-red-600';

      statusRow.append(activeCheckbox, statusText);
      info.append(statusRow);

      activeCheckbox.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      activeCheckbox.addEventListener('change', async () => {
        activeCheckbox.disabled = true;
        const newStatus = activeCheckbox.checked;

        const { error } = await supabase
          .from('profiles')
          .update({ is_active: newStatus })
          .eq('id', customer.id);

        activeCheckbox.disabled = false;

        if (error) {
          activeCheckbox.checked = !newStatus;
          console.error('Status save failed:', error.message);
          alert('Status save nahi hua. Console check karein.');
          return;
        }

        customer.is_active = newStatus;
        statusText.textContent = newStatus ? 'Active' : 'Inactive';
        statusText.className = newStatus
          ? 'text-emerald-700'
          : 'text-red-600';

        console.log('Customer status saved:', newStatus);
      });

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
  const year = new Date().getFullYear();

  if (tariff) {
    tariff.textContent =
      `Monthly Price: PKR ${monthlyPrice.toLocaleString('en-PK')}`;
  }

  historyList.textContent = 'Loading payment history...';

  const { data: payments, error } = await supabase
    .from('payments')
    .select('id, payment_month, amount, status, paid_at')
    .eq('customer_id', customer.id);

  if (error) {
    console.error('Payment history error:', error.message);
    historyList.textContent = 'Payment history load nahi hui.';
    return;
  }

  const paymentMap = new Map(
    (payments || []).map(payment => [
      payment.payment_month,
      payment
    ])
  );

  const months = Array.from({ length: 12 }, (_, index) => {
    const monthNumber = index + 1;
    const key =
      `${year}-${String(monthNumber).padStart(2, '0')}-01`;

    return {
      key,
      name: new Date(year, index, 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      }),
      payment: paymentMap.get(key) || null
    };
  });

  historyList.innerHTML = months.map(month => {
    const payment = month.payment;
    const status = payment
      ? String(payment.status || '').toLowerCase()
      : 'not_set';

    const validStatus = ['paid', 'unpaid'].includes(status)
      ? status
      : 'not_set';

    const amount = Number(payment?.amount ?? monthlyPrice);
    const isSet = validStatus !== 'not_set';

    return `
      <div class="flex flex-wrap items-center justify-between gap-3
                  p-3.5 border-b border-outline-variant/30"
           data-payment-row="${month.key}">

        <span class="font-medium text-sm">
          ${month.name}
        </span>

        <div class="flex flex-wrap items-center gap-3">
          <select
            class="payment-month-status border rounded-lg p-2 text-sm"
            data-month="${month.key}">
            <option value="not_set"
              ${validStatus === 'not_set' ? 'selected' : ''}>
              Not Set
            </option>
            <option value="paid"
              ${validStatus === 'paid' ? 'selected' : ''}>
              ✓ Paid
            </option>
            <option value="unpaid"
              ${validStatus === 'unpaid' ? 'selected' : ''}>
              ✕ Unpaid
            </option>
          </select>

          <span data-payment-details="${month.key}"
                class="text-sm ${isSet ? '' : 'hidden'}">
            PKR ${amount.toLocaleString('en-PK')}
          </span>
        </div>
      </div>
    `;
  }).join('');

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.textContent = 'Save Payment History';
  saveButton.className =
    'mt-4 px-4 py-2 rounded-lg bg-primary text-white font-semibold';

  historyList.append(saveButton);

  historyList.querySelectorAll('.payment-month-status').forEach(select => {
    select.addEventListener('change', () => {
      const details = historyList.querySelector(
        `[data-payment-details="${select.dataset.month}"]`
      );

      if (details) {
        details.classList.toggle('hidden', select.value === 'not_set');
      }
    });
  });

  saveButton.addEventListener('click', async () => {
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    try {
      for (const select of historyList.querySelectorAll(
        '.payment-month-status'
      )) {
        const paymentMonth = select.dataset.month;
        const newStatus = select.value;
        const existingPayment = paymentMap.get(paymentMonth);

        if (existingPayment?.status === newStatus) continue;
        if (!existingPayment && newStatus === 'not_set') continue;

        if (newStatus === 'not_set') {
          const { error: deleteError } = await supabase
            .from('payments')
            .delete()
            .eq('id', existingPayment.id);

          if (deleteError) throw deleteError;
          continue;
        }

        const paymentData = {
          amount: monthlyPrice,
          status: newStatus,
          paid_at: newStatus === 'paid'
            ? new Date().toISOString()
            : null
        };

        if (existingPayment) {
          const { error: updateError } = await supabase
            .from('payments')
            .update(paymentData)
            .eq('id', existingPayment.id);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('payments')
            .insert({
              customer_id: customer.id,
              payment_month: paymentMonth,
              ...paymentData
            });

          if (insertError) throw insertError;
        }
      }

      alert('Payment history saved successfully!');
      await loadPaymentHistory(customer);
    } catch (saveError) {
      console.error('Payment save error:', saveError.message);
      alert('Payment save nahi hui: ' + saveError.message);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Save Payment History';
    }
  });
}

checkAdmin();
supabase.auth.getUser().then(({ data, error }) => {
  console.log('Current user ID:', data.user?.id || null);
  console.log('Auth error:', error?.message || null);
});

/* ===== MyNet Admin Profile ===== */

const adminProfileModal = document.getElementById('adminProfileModal');
const editAdminProfileBtn = document.getElementById('editAdminProfileBtn');
const cancelAdminProfileBtn = document.getElementById('cancelAdminProfileBtn');
const saveAdminProfileBtn = document.getElementById('saveAdminProfileBtn');
const adminNameInput = document.getElementById('adminNameInput');
const adminProfileUpload = document.getElementById('adminProfileUpload');
const adminDisplayName = document.getElementById('adminDisplayName');
const adminProfileImage = document.getElementById('adminProfileImage');
const adminProfilePlaceholder = document.getElementById('adminProfilePlaceholder');

let currentAdminUser = null;

function closeAdminProfileModal() {
  adminProfileModal?.classList.add('hidden');
  adminProfileModal?.classList.remove('flex');
}

async function loadAdminProfile() {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) return;

  currentAdminUser = user;

  const { data: admin, error } = await supabase
    .from('admins')
    .select('name, avatar_path')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Admin profile load failed:', error.message);
    return;
  }

  if (adminDisplayName) {
    adminDisplayName.textContent = admin?.name || 'Network Operations';
  }

  if (adminNameInput) {
    adminNameInput.value = admin?.name || '';
  }

  if (admin?.avatar_path) {
    const { data, error: imageError } = await supabase.storage
      .from('admin-photos')
      .createSignedUrl(admin.avatar_path, 3600);

    if (!imageError && data?.signedUrl && adminProfileImage) {
      adminProfileImage.src = data.signedUrl;
      adminProfileImage.classList.remove('hidden');
      adminProfilePlaceholder?.classList.add('hidden');
    } else {
      console.error('Admin photo load failed:', imageError?.message);
    }
  }
}

editAdminProfileBtn?.addEventListener('click', async () => {
  await loadAdminProfile();

  adminProfileModal?.classList.remove('hidden');
  adminProfileModal?.classList.add('flex');
});

cancelAdminProfileBtn?.addEventListener('click', closeAdminProfileModal);

saveAdminProfileBtn?.addEventListener('click', async () => {
  if (!currentAdminUser) {
    alert('Admin login dobara verify nahi ho saka. Page refresh karein.');
    return;
  }

  const name = adminNameInput?.value.trim();

  if (!name) {
    alert('Please apna naam enter karein.');
    return;
  }

  saveAdminProfileBtn.disabled = true;

  try {
    const updates = { name };

    const file = adminProfileUpload?.files?.[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        throw new Error('Sirf image file upload karein.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Photo 5 MB se chhoti honi chahiye.');
      }

      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${currentAdminUser.id}/profile.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('admin-photos')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;
      if (uploadError) {
  console.error('PHOTO UPLOAD ERROR:', uploadError);
  throw uploadError;
}

      updates.avatar_path = filePath;
    }

    const { error: saveError } = await supabase
      .from('admins')
      .update(updates)
      .eq('id', currentAdminUser.id);

    if (saveError) throw saveError;

    if (adminDisplayName) {
      adminDisplayName.textContent = name;
    }

    await loadAdminProfile();
    closeAdminProfileModal();
    alert('Admin profile save ho gayi!');

  } catch (error) {
    console.error('Admin profile save failed:', error);
    alert('Profile save nahi hui: ' + error.message);
  } finally {
    saveAdminProfileBtn.disabled = false;
  }
});

loadAdminProfile();
