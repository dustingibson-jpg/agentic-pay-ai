const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  userInput.value = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await response.json();

    appendMessage(data.reply, 'agent');

    if (data.item) {
      renderPayPalCard(data.item, data.paypalClientId);
    }
  } catch (err) {
    appendMessage("Error connecting to backend server.", 'agent');
  }
}

function appendMessage(text, sender) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function renderPayPalCard(item, clientId) {
  const containerId = `paypal-container-${Date.now()}`;
  const card = document.createElement('div');
  card.classList.add('offer-card');
  card.innerHTML = `
    <h4>${item.name}</h4>
    <p>Price: $${item.price} USD</p>
    <div id="${containerId}"></div>
  `;
  chatBox.appendChild(card);
  chatBox.scrollTop = chatBox.scrollHeight;

  const renderButtons = () => {
    const container = document.getElementById(containerId);
    if (window.paypal && container) {
      paypal.Buttons({
        createOrder: async () => {
          const res = await fetch('/api/create-paypal-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item })
          });
          const order = await res.json();
          return order.id;
        },
        onApprove: async (data) => {
          const res = await fetch('/api/capture-paypal-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: data.orderID })
          });
          const capture = await res.json();
          appendMessage(`Payment Successful! Transaction ID: ${capture.id}`, 'agent');
        }
      }).render(container);
    }
  };

  const activeClientId = clientId || 'sb';
  const existingScript = document.getElementById('paypal-sdk-script');

  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${activeClientId}&currency=USD`;
    script.onload = renderButtons;
    document.body.appendChild(script);
  } else {
    renderButtons();
  }
}