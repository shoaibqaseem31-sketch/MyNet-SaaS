
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
const totalUsersCount = document.getElementById('totalUsersCount');

if (totalUsersCount) {
  totalUsersCount.textContent = `${customers.length} Users`;
  const allUsersCount = document.getElementById('allUsersCount');
if (allUsersCount) {
  allUsersCount.textContent = customers.length;
}
}

function updateCustomerSummaryCounts() {
  const activeCount = (customers || []).filter(
    customer => customer.is_active === true
  ).length;

  const inactiveCount = (customers || []).filter(
    customer => customer.is_active !== true
  ).length;

  const activeElement = document.getElementById('activeUsersCount');
  const inactiveElement = document.getElementById('inactiveUsersCount');

  if (activeElement) {
    activeElement.textContent = `${activeCount} Active Users`;
  }

  if (inactiveElement) {
    inactiveElement.textContent = `${inactiveCount} Inactive Users`;
  }
}

updateCustomerSummaryCounts();

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
        updateCustomerSummaryCounts();
        statusText.textContent = newStatus ? 'Active' : 'Inactive';
        statusText.className = newStatus
          ? 'text-emerald-700'
          : 'text-red-600';

        console.log('Customer status saved:', newStatus);
      });

      details.append(avatar, info);
      card.append(details);
 card.style.cursor = 'default';
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

  const packageValue = document.getElementById('packageSelect')?.value;
  const priceValue = document.getElementById('packagePrice')?.value;
const updates = {
  packege: packageValue,
  paymentAmount: Number(priceValue)
};
  if (!packageValue || priceValue === '' || Number(priceValue) < 0) {
    alert('Please select a package and enter a valid monthly price.');
    return;
  }


  const editProfileModal = document.getElementById('editCustomerProfileModal');
  const isEditingProfile = editProfileModal && !editProfileModal.classList.contains('hidden');

  if (isEditingProfile) {
    const nameInput = document.getElementById('editCustomerName');
    const phoneInput = document.getElementById('editCustomerPhone');
    const addressInput = document.getElementById('editCustomerAddress');
    const activationInput = document.getElementById('editCustomerActivationDate');
    const expiryInput = document.getElementById('editCustomerExpiryDate');

    const name = nameInput?.value.trim() || (customer.name || '').trim();
    const phone = phoneInput?.value.trim() || customer.phone || '';
    const address = addressInput?.value.trim() || customer.address || '';
    const activationDate = activationInput?.value || customer.activtionDate || null;
    const expiryDate = expiryInput?.value || customer.expiryDate || null;

    if (!name) {
      alert('Customer name is required.');
      return;
    }

    if (activationDate && expiryDate && expiryDate < activationDate) {
      alert('Expiry Date cannot be before Activation Date.');
      return;
    }

    updates.name = name;
    updates.phone = phone;
    updates.address = address;
    updates.activtionDate = activationDate;
    updates.expiryDate = expiryDate;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', customer.id)
    .select('*');

  if (error || !data || data.length === 0) {
    console.error('Save failed:', error?.message || 'No customer row updated.');
    alert('Save failed. Check the browser Console.');
    return;
  }

  Object.assign(customer, data[0]);

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value || 'Not set';
  };

  setText('profileName', customer.name);
  setText('profileUserId', customer.user_id);
  setText('profilePhone', customer.phone);
  setText('profileAddress', customer.address);
  setText('profileActivationDate', customer.activtionDate);
  setText('profileExpiryDate', customer.expiryDate);

  const selectedLabel = document.getElementById('selectedCustomerLabel');
  if (selectedLabel) {
    selectedLabel.textContent =
      `${customer.name || 'Unnamed customer'} (ID: ${customer.user_id || 'Not set'})`;
  }

  document.getElementById('editCustomerProfileModal')?.classList.add('hidden');
  document.getElementById('editCustomerProfileModal')?.classList.remove('flex');

  alert('Customer details, package and monthly price saved successfully!');
});



/* ===== Connect Customer Profile Form Save ===== */
document.getElementById('editCustomerProfileForm')
  ?.addEventListener('submit', (event) => {
    event.preventDefault();

    document.getElementById('saveChangesBtn')?.click();
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

/* ===== Customer Profile Edit Button ===== */
const editProfileBtn = document.getElementById('editCustomerProfileBtn');
const editProfileModal = document.getElementById('editCustomerProfileModal');

function closeCustomerProfileModal() {
  editProfileModal?.classList.add('hidden');
  editProfileModal?.classList.remove('flex');
}

editProfileBtn?.addEventListener('click', () => {
  const customer = window.selectedMyNetCustomer;

  if (!customer) {
    alert('Please select a customer card first.');
    return;
  }

  document.getElementById('editCustomerName').value = customer.name || '';
  document.getElementById('editCustomerPhone').value = customer.phone || '';
  document.getElementById('editCustomerAddress').value = customer.address || '';
  document.getElementById('editCustomerActivationDate').value = customer.activtionDate || '';
  document.getElementById('editCustomerExpiryDate').value = customer.expiryDate || '';

  editProfileModal.classList.remove('hidden');
  editProfileModal.classList.add('flex');
});

document.getElementById('closeCustomerProfileModal')
  ?.addEventListener('click', closeCustomerProfileModal);

document.getElementById('cancelCustomerProfileEdit')
  ?.addEventListener('click', closeCustomerProfileModal);


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

/* ===== MyNet Unpaid Payments Card ===== */

async function refreshUnpaidPaymentsCard() {
  const { data: payments, error } = await supabase
    .from('payments')
    .select('customer_id, status');

  if (error) {
    console.error('Unpaid payments load failed:', error.message);
    return;
  }

  const unpaidIds = new Set(
    (payments || [])
      .filter(p => String(p.status).toLowerCase() === 'unpaid')
      .map(p => p.customer_id)
  );

  const count = unpaidIds.size;
  const countElement =
    document.getElementById('unpaidUsersCount') ||
    [...document.querySelectorAll('div')]
      .find(el => el.textContent.trim() === '18 Unpaid / Due');

  if (countElement) {
    countElement.textContent = `${count} Unpaid Users`;
  }

  window.myNetUnpaidIds = unpaidIds;
  window.myNetUnpaidCount = count;
}

function openUnpaidCustomersModal() {
  document.getElementById('myNetUnpaidModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'myNetUnpaidModal';
  modal.style.cssText = `
    position:fixed; inset:0; z-index:99999;
    background:rgba(0,0,0,.55);
    display:flex; align-items:center; justify-content:center;
    padding:16px;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background:white; color:#222; width:100%; max-width:520px;
    max-height:80vh; overflow:auto; border-radius:14px;
    padding:20px;
  `;

  const heading = document.createElement('h2');
  heading.textContent = 'Unpaid Customers';
  heading.style.cssText =
    'font-size:20px;font-weight:700;margin-bottom:14px';

  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '✕ Close';
  close.style.cssText =
    'float:right;padding:6px 10px;cursor:pointer';
  close.onclick = () => modal.remove();

  const list = document.createElement('div');
  list.textContent = 'Loading unpaid customers...';

  box.append(close, heading, list);
  modal.append(box);
  document.body.append(modal);

  modal.addEventListener('click', event => {
    if (event.target === modal) modal.remove();
  });

  (async () => {
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('customer_id, status');

    if (paymentError) {
      console.error(paymentError);
      list.textContent = 'Payments load nahi huin. Console check karein.';
      return;
    }

    const unpaidIds = new Set(
      (payments || [])
        .filter(p => String(p.status).toLowerCase() === 'unpaid')
        .map(p => p.customer_id)
    );

    const { data: customers, error: customerError } = await supabase
      .from('profiles')
      .select('id, name, user_id, phone, address, packege, activtionDate, expiryDate, paymentAmount')
      .in('id', [...unpaidIds]);

    if (customerError) {
      console.error(customerError);
      list.textContent = 'Customers load nahi huay. Console check karein.';
      return;
    }

    list.replaceChildren();

    if (!customers?.length) {
      list.textContent = 'Koi unpaid customer nahi hai.';
      return;
    }

    customers.forEach(customer => {
      const row = document.createElement('button');
      row.type = 'button';
      row.style.cssText = `
        display:block;width:100%;text-align:left;
        padding:12px;margin:6px 0;border:1px solid #ddd;
        border-radius:9px;background:white;cursor:pointer;
      `;

      const name = document.createElement('div');
      name.textContent = customer.name || 'Unnamed Customer';
      name.style.fontWeight = '700';

      const userId = document.createElement('div');
      userId.textContent = 'User ID: ' + (customer.user_id || 'Not set');

      const status = document.createElement('div');
      status.textContent = 'Status: Unpaid';
      status.style.color = '#b45309';

      row.append(name, userId, status);

      row.addEventListener('click', () => {
        window.selectedMyNetCustomer = customer;

        const setText = (id, value) => {
          const el = document.getElementById(id);
          if (el) el.textContent = value || 'Not set';
        };

        setText('profileName', customer.name);
        setText('profileUserId', customer.user_id);
        setText('profilePhone', customer.phone);
        setText('profileAddress', customer.address);
        setText('profileActivationDate', customer.activtionDate);
        setText('profileExpiryDate', customer.expiryDate);
        setText(
          'selectedCustomerLabel',
          `${customer.name || 'Unnamed customer'} (ID: ${customer.user_id || 'Not set'})`
        );

        const packageSelect = document.getElementById('packageSelect');
        if (packageSelect) {
          packageSelect.value = String(customer.packege || '');
        }

        const price = document.getElementById('packagePrice');
        if (price) price.value = customer.paymentAmount ?? '';

        modal.remove();

        loadPaymentHistory(customer);

        const history = document.getElementById(
          'monthlyPaymentHistorySection'
        ) || document.getElementById('paymentHistoryList');

        history?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });

      list.append(row);
    });
  })();
}

function connectUnpaidPaymentsCard() {
  const title = [...document.querySelectorAll('span')]
    .find(el => el.textContent.trim() === 'Unpaid Payments');

  if (!title) {
    console.error('Unpaid Payments card title nahi mila.');
    return;
  }

  const card = title.parentElement?.parentElement?.parentElement;

  if (!card) return;

  card.style.cursor = 'pointer';
  card.title = 'Click to view unpaid customers';

  card.addEventListener('click', event => {
    if (event.target.closest('button, a, input, select')) return;
    openUnpaidCustomersModal();
  });

  refreshUnpaidPaymentsCard();
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    connectUnpaidPaymentsCard,
    { once: true }
  );
} else {
  connectUnpaidPaymentsCard();
}

/* Keep summary cards non-clickable */
function disableSummaryCardClicks() {
  ['totalUsersCount', 'activeUsersCount', 'inactiveUsersCount']
    .forEach(id => {
      const countElement = document.getElementById(id);
      if (!countElement) return;

      const card = countElement.closest(
        '.bg-surface-container-lowest.rounded-xl'
      );

      if (!card) return;

      card.style.cursor = 'default';
      card.removeAttribute('onclick');

      card.addEventListener('click', event => {
        event.stopImmediatePropagation();
      }, true);
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', disableSummaryCardClicks, {
    once: true
  });
} else {
  disableSummaryCardClicks();
}
