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
            alert(`Transaction completed by ${details.payer.name.given_name}`);
          },
          onError: (err) => {
            console.error('PayPal Checkout Error:', err);
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