document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    chatInput.value = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      appendMessage(data.reply, 'assistant');

      if (data.item) {
        renderPayPalCard(data.item, data.clientId);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      appendMessage('Sorry, something went wrong processing your request.', 'assistant');
    }
  });

  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendReceiptCard(details, itemName) {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.style.borderColor = '#10B981';
    
    const payerName = details.payer?.name?.given_name || 'Customer';
    const captureId = details.purchase_units?.[0]?.payments?.captures?.[0]?.id || details.id || 'N/A';
    
    card.innerHTML = `
      <h3 style="color: #10B981; margin-top: 0;">✅ Payment Successful!</h3>
      <p>Thank you, <strong>${payerName}</strong>! Your checkout for <strong>${itemName}</strong> was completed successfully.</p>
      <p style="font-size: 0.85rem; color: #a1a1aa; margin-bottom: 0;">Transaction ID: <code>${captureId}</code></p>
    `;
    chatMessages.appendChild(card);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function renderPayPalCard(item, clientId) {
    const card = document.createElement('div');
    card.classList.add('product-card');
    
    const buttonContainerId = `paypal-container-${Date.now()}`;
    const currencyCode = item.currency || 'USD';
    
    card.innerHTML = `
      <h3>${item.name}</h3>
      <p class="price">Price: $${item.price} ${currencyCode}</p>
      <div id="${buttonContainerId}"></div>
    `;
    chatMessages.appendChild(card);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const renderButtons = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                description: item.name,
                amount: {
                  currency_code: currencyCode,
                  value: item.price
                }
              }]
            });
          },
          onApprove: async (data, actions) => {
            const details = await actions.order.capture();
            card.style.display = 'none';
            appendReceiptCard(details, item.name);
          },
          onError: (err) => {
            console.error('PayPal Checkout Error:', err);
            appendMessage('An error occurred during payment. Please try again.', 'assistant');
          }
        }).render(`#${buttonContainerId}`);
      }
    };

    const validClientId = (clientId && !clientId.includes('_here') && clientId.trim() !== '') 
      ? clientId 
      : 'test';

    const scriptId = 'paypal-sdk-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${validClientId}&currency=${currencyCode}`;
      script.onload = () => renderButtons();
      script.onerror = () => console.error('Failed to load PayPal SDK script');
      document.body.appendChild(script);
    } else {
      renderButtons();
    }
  }
});