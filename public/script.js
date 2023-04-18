const sendBtn = document.getElementById('btnSend');
const histroyBtn = document.getElementById('btnHistory');
const customersDiv = document.querySelector('.customers');
const selectSender = document.querySelector('#selectSender');
const selectReceiptant = document.querySelector('#selectReceiptant');
const btnTransfer = document.querySelector('#btnTransfer');

let customers = [];

btnTransfer.addEventListener('click', async () => {
  const sender = selectSender.value;
  const receiver = selectReceiptant.value;
  const amount = document.querySelector('#amount').value;

  if (sender === receiver) {
    alert('Sender and Receiver cannot be same');
    return;
  }

  if (amount <= 0) {
    alert('Amount should be greater than 0');
    return;
  }

  // close the bootstrap modal without using jquery
  const sendModal = document.getElementById('myModal');
  const sendmodalI = bootstrap.Modal.getInstance(sendModal);
  sendmodalI.hide();

  const result = await transferMoney(sender, receiver, amount);
  if (result.status === 'success') {
    renderCustomers();
    alert(result.message);
  } else {
    alert(result.message);
  }
});

async function renderCustomers() {
  customers = await getCustomers();

  let options = '';
  // a default option which is not selectable

  customers.forEach((customer) => {
    options += `<option value="${customer._id}">${customer.name} <${customer.email}></option>`;
  });
  selectSender.innerHTML =
    `<option value="" disabled selected>Select Sender</option>` + options;
  selectReceiptant.innerHTML =
    `<option value="" disabled selected>Select Receiptant</option>` + options;

  let html = `<table class="table table-hover">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Name</th>
      <th scope="col">E-mail</th>
      <th scope="col">Balance</th>
    </tr>
  </thead>
  <tbody>
    ${customers
      .map((customer, index) => {
        return `<tr>
        <th scope="row">${index + 1}</th>
        <td>${customer.name}</td>
        <td>${customer.email}</td>
        <td>₹${customer.balance}</td>
      </tr>`;
      })
      .join('')}
  </tbody>
</table>`;
  customersDiv.innerHTML = html;
}

renderCustomers();

async function getCustomers() {
  const response = await fetch('/customers');
  const customers = await response.json();
  return customers;
}

async function transferMoney(sender, receiver, amount) {
  const response = await fetch('/transfer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sender, receiver, amount })
  });
  const result = await response.json();
  return result;
}
