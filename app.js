// Configurações do estabelecimento
const CONFIG = {
  whatsappNumber: '5511999999999', // Substitua pelo número real do WhatsApp do estabelecimento
  deliveryTime: '30 a 50 min'
};

// ==========================================================================
// ESTADO GLOBAL DO APLICATIVO
// ==========================================================================
let cart = [];
let checkoutStep = 'cart'; // 'cart' ou 'checkout'

// Estado do Construtor "Monte seu Açaí"
let builderState = {
  sizeId: null,
  baseIds: [],
  freeToppingIds: [],
  premiumToppings: {} // formato: { toppingId: quantidade }
};

let currentBuilderStep = 1;

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa os ícones do Lucide
  lucide.createIcons();
  
  // Carrega carrinho e formulário persistidos do LocalStorage
  loadCartFromStorage();
  loadCustomerInfoFromStorage();
  
  // Renderiza componentes
  renderSizes();
  renderBases();
  renderFreeToppings();
  renderPremiumToppings();
  renderPremadeProducts();
  renderDrinks();
  populateNeighborhoods();
  
  // Atualiza contadores e UI geral
  updateCartUI();
  updateBuilderUI();
  
  // Adiciona Listeners de Eventos
  setupEventListeners();
});

// ==========================================================================
// EVENT LISTENERS & NAVEGAÇÃO
// ==========================================================================
function setupEventListeners() {
  // Tabs de Categorias
  const tabs = document.querySelectorAll('.category-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const category = tab.getAttribute('data-category');
      
      // Esconde todos os containers de tabs
      document.getElementById('builder-container').classList.remove('active');
      document.getElementById('combos-container').classList.remove('active');
      document.getElementById('bebidas-container').classList.remove('active');
      
      // Mostra o selecionado
      if (category === 'custom') {
        document.getElementById('builder-container').classList.add('active');
      } else if (category === 'combos') {
        document.getElementById('combos-container').classList.add('active');
      } else if (category === 'bebidas') {
        document.getElementById('bebidas-container').classList.add('active');
      }
    });
  });

  // Wizard "Monte seu Açaí" - Controles de Navegação
  document.getElementById('next-step-btn').addEventListener('click', nextBuilderStep);
  document.getElementById('prev-step-btn').addEventListener('click', prevBuilderStep);
  document.getElementById('add-custom-to-cart-btn').addEventListener('click', addCustomBowlToCart);

  // Cart Drawer toggling
  const cartOverlay = document.getElementById('cart-overlay');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const floatingCartBtn = document.getElementById('floating-cart-btn');
  const startShoppingBtn = document.getElementById('start-shopping-btn');

  const openCart = () => {
    cartOverlay.classList.add('active');
    cartDrawer.classList.add('active');
  };

  const closeCart = () => {
    cartOverlay.classList.remove('active');
    cartDrawer.classList.remove('active');
  };

  cartToggleBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  floatingCartBtn.addEventListener('click', openCart);
  startShoppingBtn.addEventListener('click', () => {
    closeCart();
    document.getElementById('menu-section').scrollIntoView({ behavior: 'smooth' });
  });

  // Checkout Flow Navigation
  document.getElementById('proceed-to-checkout-btn').addEventListener('click', showCheckoutForm);
  document.getElementById('back-to-cart-btn').addEventListener('click', showCartItems);
  document.getElementById('submit-order-btn').addEventListener('click', handleOrderSubmission);

  // Delivery Method toggling
  const deliveryRadios = document.querySelectorAll('input[name="delivery-method"]');
  deliveryRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const parentLabel = e.target.closest('.radio-card');
      document.querySelectorAll('.radio-group-delivery .radio-card').forEach(c => c.classList.remove('active'));
      parentLabel.classList.add('active');
      
      const deliveryFields = document.getElementById('delivery-fields');
      const neighborhoodSelect = document.getElementById('customer-neighborhood');
      const addressInput = document.getElementById('customer-address');
      const numberInput = document.getElementById('customer-address-number');
      const deliveryFeeRow = document.getElementById('delivery-fee-row');

      if (e.target.value === 'pickup') {
        deliveryFields.classList.add('hidden');
        neighborhoodSelect.removeAttribute('required');
        addressInput.removeAttribute('required');
        numberInput.removeAttribute('required');
        deliveryFeeRow.classList.add('hidden');
      } else {
        deliveryFields.classList.remove('hidden');
        neighborhoodSelect.setAttribute('required', '');
        addressInput.setAttribute('required', '');
        numberInput.setAttribute('required', '');
        deliveryFeeRow.classList.remove('hidden');
      }
      calculateCartTotals();
    });
  });

  // Payment Method toggling (dinheiro / troco)
  const paymentSelect = document.getElementById('payment-method');
  paymentSelect.addEventListener('change', (e) => {
    const changeField = document.getElementById('change-field');
    const cashChangeInput = document.getElementById('cash-change');
    if (e.target.value === 'dinheiro') {
      changeField.classList.remove('hidden');
    } else {
      changeField.classList.add('hidden');
      cashChangeInput.value = '';
    }
  });

  // Neighborhood selection dynamic fee update
  document.getElementById('customer-neighborhood').addEventListener('change', calculateCartTotals);

  // Floating Cart Button Visibility Scroll Listener
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300 && cart.length > 0) {
      floatingCartBtn.classList.add('visible');
    } else {
      floatingCartBtn.classList.remove('visible');
    }
  });
}

// ==========================================================================
// RENDERERS (RENDERIZADORES HTML DINÂMICOS)
// ==========================================================================

// 1. Renderiza os tamanhos (Passo 1 do Construtor)
function renderSizes() {
  const container = document.getElementById('sizes-options');
  container.innerHTML = MENU_DATA.sizes.map(size => `
    <div class="size-card" data-size-id="${size.id}" onclick="selectSize('${size.id}')">
      <img src="${size.image}" alt="${size.name}" class="size-card-image">
      <h4 class="size-name">${size.name}</h4>
      <p class="size-limit-info">Até ${size.maxFreeToppings} acompanhamentos grátis</p>
      <div class="size-price">R$ ${size.price.toFixed(2).replace('.', ',')}</div>
      <div class="size-badge-checked">
        <i data-lucide="check" class="icon-sm"></i>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

// 2. Renderiza as bases (Passo 2 do Construtor)
function renderBases() {
  const container = document.getElementById('bases-options');
  container.innerHTML = MENU_DATA.bases.map(base => `
    <div class="base-card" data-base-id="${base.id}" onclick="toggleBase('${base.id}')">
      <div class="base-checkbox-indicator">
        <i data-lucide="check" class="icon-sm"></i>
      </div>
      <div class="base-info">
        <h5>${base.name}</h5>
        <p>${base.description}</p>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

// 3. Renderiza acompanhamentos gratuitos (Passo 3 do Construtor)
function renderFreeToppings() {
  const container = document.getElementById('free-toppings-options');
  container.innerHTML = MENU_DATA.freeToppings.map(topping => `
    <div class="topping-checkbox-card" data-free-id="${topping.id}" onclick="toggleFreeTopping('${topping.id}')">
      <div class="topping-checkbox-indicator">
        <i data-lucide="check" class="icon-sm"></i>
      </div>
      <span class="topping-name">${topping.name}</span>
    </div>
  `).join('');
  lucide.createIcons();
}

// 4. Renderiza adicionais premium (Passo 4 do Construtor)
function renderPremiumToppings() {
  const container = document.getElementById('premium-toppings-options');
  container.innerHTML = MENU_DATA.premiumToppings.map(topping => `
    <div class="premium-card" data-premium-id="${topping.id}">
      <div class="premium-info">
        <div class="premium-name">${topping.name}</div>
        <div class="premium-price">+ R$ ${topping.price.toFixed(2).replace('.', ',')}</div>
      </div>
      <div class="quantity-control">
        <button class="qty-btn" onclick="adjustPremiumQuantity('${topping.id}', -1)" aria-label="Remover">
          <i data-lucide="minus" class="icon-sm"></i>
        </button>
        <span class="qty-val" id="qty-premium-${topping.id}">0</span>
        <button class="qty-btn" onclick="adjustPremiumQuantity('${topping.id}', 1)" aria-label="Adicionar">
          <i data-lucide="plus" class="icon-sm"></i>
        </button>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

// 5. Renderiza os Combinados Prontos (Cardápio Fixo)
function renderPremadeProducts() {
  const container = document.getElementById('combos-grid');
  container.innerHTML = MENU_DATA.premadeProducts.map(product => {
    // Tamanho padrão é o primeiro
    const defaultOption = product.options[0];
    
    // Gera botões de seleção de tamanho
    const sizeSelectors = product.options.map((opt, index) => `
      <button class="prod-size-btn ${index === 0 ? 'active' : ''}" 
              onclick="selectPremadeSize(this, '${product.id}', '${opt.size}', ${opt.price})">
        ${opt.size}
      </button>
    `).join('');

    return `
      <div class="product-card" id="card-${product.id}">
        <div class="product-image-container">
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <div class="product-image-overlay"></div>
        </div>
        <div class="product-body">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.description}</p>
          
          <div class="product-sizes-selector">
            ${sizeSelectors}
          </div>
          
          <div class="product-footer">
            <span class="product-price" id="price-${product.id}">R$ ${defaultOption.price.toFixed(2).replace('.', ',')}</span>
            <button class="add-to-cart-simple-btn" 
                    onclick="addPremadeToCart('${product.id}')"
                    data-selected-size="${defaultOption.size}"
                    data-selected-price="${defaultOption.price}"
                    id="btn-add-${product.id}"
                    aria-label="Adicionar ao carrinho">
              <i data-lucide="plus" class="icon-sm"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

// 6. Renderiza as bebidas
function renderDrinks() {
  const container = document.getElementById('drinks-grid');
  container.innerHTML = MENU_DATA.drinks.map(drink => `
    <div class="product-card">
      <div class="product-image-container">
        <img src="${drink.image}" alt="${drink.name}" class="product-image">
        <div class="product-image-overlay"></div>
      </div>
      <div class="product-body">
        <h3 class="product-title">${drink.name}</h3>
        <p class="product-desc">${drink.description}</p>
        
        <div class="product-footer">
          <span class="product-price">R$ ${drink.price.toFixed(2).replace('.', ',')}</span>
          <button class="add-to-cart-simple-btn" 
                  onclick="addDrinkToCart('${drink.id}')"
                  aria-label="Adicionar ao carrinho">
            <i data-lucide="plus" class="icon-sm"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

// 7. Popula a lista de bairros de entrega
function populateNeighborhoods() {
  const select = document.getElementById('customer-neighborhood');
  MENU_DATA.deliveryFees.forEach(item => {
    const option = document.createElement('option');
    option.value = item.neighborhood;
    option.textContent = `${item.neighborhood} - R$ ${item.fee.toFixed(2).replace('.', ',')}`;
    option.dataset.fee = item.fee;
    select.appendChild(option);
  });
}

// ==========================================================================
// CONSTRUTOR "MONTE SEU AÇAÍ" - AÇÕES E LOGICA DO WIZARD
// ==========================================================================

// Seleciona o tamanho no Passo 1
function selectSize(sizeId) {
  builderState.sizeId = sizeId;
  
  // Limpa acompanhamentos gratuitos se mudar de tamanho e exceder
  const sizeObj = MENU_DATA.sizes.find(s => s.id === sizeId);
  if (builderState.freeToppingIds.length > sizeObj.maxFreeToppings) {
    builderState.freeToppingIds = [];
    document.querySelectorAll('#free-toppings-options .topping-checkbox-card').forEach(el => {
      el.classList.remove('active');
    });
  }

  // Atualiza classe ativa dos copos
  document.querySelectorAll('#sizes-options .size-card').forEach(el => {
    el.classList.remove('active');
    if (el.getAttribute('data-size-id') === sizeId) {
      el.classList.add('active');
    }
  });

  updateBuilderUI();
  nextBuilderStep(); // Avança automaticamente ao selecionar o tamanho
}

// Liga/Desliga Cremes no Passo 2 (máximo 2)
function toggleBase(baseId) {
  const index = builderState.baseIds.indexOf(baseId);
  if (index > -1) {
    // Remove se já existir
    builderState.baseIds.splice(index, 1);
  } else {
    // Adiciona se não estourar o limite de 2
    if (builderState.baseIds.length < 2) {
      builderState.baseIds.push(baseId);
    } else {
      showToast('⚠️ Você pode escolher no máximo 2 cremes base!', 'warning');
      return;
    }
  }

  // Atualiza classe ativa dos cards
  document.querySelectorAll('#bases-options .base-card').forEach(el => {
    const id = el.getAttribute('data-base-id');
    if (builderState.baseIds.includes(id)) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  updateBuilderUI();
}

// Liga/Desliga acompanhamentos gratuitos no Passo 3
function toggleFreeTopping(toppingId) {
  if (!builderState.sizeId) {
    showToast('⚠️ Selecione um tamanho no Passo 1 primeiro!', 'warning');
    return;
  }

  const sizeObj = MENU_DATA.sizes.find(s => s.id === builderState.sizeId);
  const maxLimit = sizeObj.maxFreeToppings;

  const index = builderState.freeToppingIds.indexOf(toppingId);
  if (index > -1) {
    builderState.freeToppingIds.splice(index, 1);
  } else {
    if (builderState.freeToppingIds.length < maxLimit) {
      builderState.freeToppingIds.push(toppingId);
    } else {
      showToast(`⚠️ Limite de ${maxLimit} acompanhamentos gratuitos atingido! Para adicionar mais, vá para o passo 4.`, 'warning');
      return;
    }
  }

  // Atualiza classe ativa dos cards de adicionais grátis
  document.querySelectorAll('#free-toppings-options .topping-checkbox-card').forEach(el => {
    const id = el.getAttribute('data-free-id');
    if (builderState.freeToppingIds.includes(id)) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  updateBuilderUI();
}

// Ajusta a quantidade dos adicionais premium no Passo 4
function adjustPremiumQuantity(toppingId, amount) {
  const currentQty = builderState.premiumToppings[toppingId] || 0;
  const newQty = Math.max(0, currentQty + amount);

  if (newQty === 0) {
    delete builderState.premiumToppings[toppingId];
  } else {
    builderState.premiumToppings[toppingId] = newQty;
  }

  // Atualiza visualizador numérico
  document.getElementById(`qty-premium-${toppingId}`).textContent = newQty;

  updateBuilderUI();
}

// Cálculos de Preço e Passos na interface
function updateBuilderUI() {
  const totalPrice = calculateBuilderPrice();
  document.getElementById('builder-total-price').textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;

  // Atualiza contadores do Passo 3
  if (builderState.sizeId) {
    const sizeObj = MENU_DATA.sizes.find(s => s.id === builderState.sizeId);
    document.getElementById('free-toppings-limit').textContent = sizeObj.maxFreeToppings;
    document.getElementById('free-toppings-limit-badge').textContent = sizeObj.maxFreeToppings;
    document.getElementById('free-toppings-counter').textContent = builderState.freeToppingIds.length;
  } else {
    document.getElementById('free-toppings-limit').textContent = '0';
    document.getElementById('free-toppings-limit-badge').textContent = '0';
    document.getElementById('free-toppings-counter').textContent = '0';
  }
}

// Calcula preço do construtor
function calculateBuilderPrice() {
  if (!builderState.sizeId) return 0;
  
  const sizeObj = MENU_DATA.sizes.find(s => s.id === builderState.sizeId);
  let price = sizeObj.price;

  // Soma os adicionais premium multiplicados pelas suas quantidades
  Object.keys(builderState.premiumToppings).forEach(id => {
    const toppingObj = MENU_DATA.premiumToppings.find(t => t.id === id);
    const qty = builderState.premiumToppings[id];
    price += toppingObj.price * qty;
  });

  return price;
}

// Avançar Passo do Wizard
function nextBuilderStep() {
  if (currentBuilderStep === 1 && !builderState.sizeId) {
    showToast('⚠️ Por favor, selecione um tamanho de copo!', 'warning');
    return;
  }
  if (currentBuilderStep === 2 && builderState.baseIds.length === 0) {
    showToast('⚠️ Escolha pelo menos 1 creme base!', 'warning');
    return;
  }

  if (currentBuilderStep < 4) {
    currentBuilderStep++;
    renderBuilderStepChange();
  }
}

// Voltar Passo do Wizard
function prevBuilderStep() {
  if (currentBuilderStep > 1) {
    currentBuilderStep--;
    renderBuilderStepChange();
  }
}

// Trata transição de UI de passos
function renderBuilderStepChange() {
  // Esconde passos
  document.querySelectorAll('.builder-step').forEach(el => el.classList.remove('active'));
  // Mostra passo ativo
  document.querySelector(`.builder-step[data-step="${currentBuilderStep}"]`).classList.add('active');

  // Atualiza indicadores de progresso
  document.getElementById('current-step-num').textContent = currentBuilderStep;
  document.getElementById('builder-progress').style.width = `${currentBuilderStep * 25}%`;

  // Habilita / Desabilita botões
  document.getElementById('prev-step-btn').disabled = currentBuilderStep === 1;

  const nextBtn = document.getElementById('next-step-btn');
  const addCartBtn = document.getElementById('add-custom-to-cart-btn');

  if (currentBuilderStep === 4) {
    nextBtn.classList.add('hidden');
    addCartBtn.classList.remove('hidden');
  } else {
    nextBtn.classList.remove('hidden');
    addCartBtn.classList.add('hidden');
  }
}

// Reseta construtor para o padrão inicial
function resetBuilder() {
  builderState = {
    sizeId: null,
    baseIds: [],
    freeToppingIds: [],
    premiumToppings: {}
  };
  currentBuilderStep = 1;
  
  // Limpa seleções visuais
  document.querySelectorAll('#sizes-options .size-card').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#bases-options .base-card').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#free-toppings-options .topping-checkbox-card').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.quantity-control .qty-val').forEach(el => el.textContent = '0');

  renderBuilderStepChange();
  updateBuilderUI();
}

// Adiciona o Açaí Customizado criado no Construtor ao Carrinho
function addCustomBowlToCart() {
  if (!builderState.sizeId || builderState.baseIds.length === 0) {
    showToast('⚠️ Monte seu açaí corretamente!', 'warning');
    return;
  }

  const sizeObj = MENU_DATA.sizes.find(s => s.id === builderState.sizeId);
  const selectedBases = builderState.baseIds.map(id => MENU_DATA.bases.find(b => b.id === id).name);
  const selectedFreeToppings = builderState.freeToppingIds.map(id => MENU_DATA.freeToppings.find(t => t.id === id).name);
  
  const selectedPremium = [];
  Object.keys(builderState.premiumToppings).forEach(id => {
    const toppingObj = MENU_DATA.premiumToppings.find(t => t.id === id);
    selectedPremium.push({
      id: id,
      name: toppingObj.name,
      price: toppingObj.price,
      qty: builderState.premiumToppings[id]
    });
  });

  const cartItem = {
    id: 'custom_' + Date.now(), // ID único temporal
    type: 'custom',
    name: 'Açaí Customizado',
    size: sizeObj.name,
    bases: selectedBases,
    freeToppings: selectedFreeToppings,
    premiumToppings: selectedPremium,
    price: calculateBuilderPrice(),
    quantity: 1
  };

  cart.push(cartItem);
  saveCartToStorage();
  updateCartUI();
  resetBuilder();
  
  showToast('🎉 Açaí personalizado adicionado ao carrinho!');
  
  // Abre o carrinho para visualização imediata
  document.getElementById('cart-overlay').classList.add('active');
  document.getElementById('cart-drawer').classList.add('active');
}

// ==========================================================================
// AÇÕES DE ADICIONAR PRODUTOS PADRÕES (COMBOS E BEBIDAS) ao carrinho
// ==========================================================================

// Mudança de tamanho em produtos combinados prontos (combos)
function selectPremadeSize(btn, productId, size, price) {
  // Atualiza botões ativos no card específico
  const card = document.getElementById(`card-${productId}`);
  card.querySelectorAll('.prod-size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Atualiza preço visualmente
  const priceSpan = document.getElementById(`price-${productId}`);
  priceSpan.textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;

  // Atualiza o botão de compra correspondente
  const buyBtn = document.getElementById(`btn-add-${productId}`);
  buyBtn.setAttribute('data-selected-size', size);
  buyBtn.setAttribute('data-selected-price', price);
}

// Adiciona Combinado Pronto (Combo) ao carrinho
function addPremadeToCart(productId) {
  const product = MENU_DATA.premadeProducts.find(p => p.id === productId);
  const buyBtn = document.getElementById(`btn-add-${productId}`);
  const selectedSize = buyBtn.getAttribute('data-selected-size');
  const selectedPrice = parseFloat(buyBtn.getAttribute('data-selected-price'));

  const itemId = `${productId}_${selectedSize}`;
  
  // Verifica se o item com o mesmo tamanho já está no carrinho
  const existingItemIndex = cart.findIndex(item => item.id === itemId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: itemId,
      type: 'standard',
      name: product.name,
      size: selectedSize,
      price: selectedPrice,
      quantity: 1
    });
  }

  saveCartToStorage();
  updateCartUI();
  showToast(`🎉 ${product.name} (${selectedSize}) adicionado ao carrinho!`);
}

// Adiciona bebida ao carrinho
function addDrinkToCart(drinkId) {
  const drink = MENU_DATA.drinks.find(d => d.id === drinkId);
  const existingItemIndex = cart.findIndex(item => item.id === drinkId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: drinkId,
      type: 'standard',
      name: drink.name,
      size: null,
      price: drink.price,
      quantity: 1
    });
  }

  saveCartToStorage();
  updateCartUI();
  showToast(`🎉 ${drink.name} adicionado ao carrinho!`);
}

// ==========================================================================
// OPERAÇÕES DO CARRINHO (QUANTIDADE, REMOÇÃO, RENDER DO CARRINHO)
// ==========================================================================

function updateCartQuantity(itemId, amount) {
  const index = cart.findIndex(item => item.id === itemId);
  if (index === -1) return;

  const newQty = cart[index].quantity + amount;
  if (newQty <= 0) {
    cart.splice(index, 1);
    showToast('🗑️ Item removido do carrinho.', 'warning');
  } else {
    cart[index].quantity = newQty;
  }

  saveCartToStorage();
  updateCartUI();
}

function removeCartItem(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  saveCartToStorage();
  updateCartUI();
  showToast('🗑️ Item removido do carrinho.', 'warning');
}

// Renderiza a interface do carrinho
function updateCartUI() {
  // Contadores globais do header e floating btn
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  document.getElementById('cart-count').textContent = totalCount;
  document.getElementById('floating-cart-count').textContent = totalCount;

  const emptyCartState = document.getElementById('empty-cart');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartFooter = document.getElementById('cart-footer');
  const proceedBtn = document.getElementById('proceed-to-checkout-btn');

  if (cart.length === 0) {
    emptyCartState.classList.remove('hidden');
    cartItemsList.classList.add('hidden');
    cartFooter.classList.add('hidden');
    
    // Se o carrinho esvaziar, volta para o passo inicial
    showCartItems();
    return;
  }

  emptyCartState.classList.add('hidden');
  cartItemsList.classList.remove('hidden');
  cartFooter.classList.remove('hidden');

  // Renderiza itens
  cartItemsList.innerHTML = cart.map(item => {
    let detailsHtml = '';
    
    if (item.type === 'custom') {
      const basesInfo = item.bases.join(', ');
      const freeInfo = item.freeToppings.length > 0 
        ? `<br><strong>Grátis:</strong> ${item.freeToppings.join(', ')}` 
        : '';
      const premiumInfo = item.premiumToppings.length > 0 
        ? `<br><strong>Premium:</strong> ${item.premiumToppings.map(t => `${t.qty}x ${t.name}`).join(', ')}` 
        : '';
      
      detailsHtml = `
        <div class="cart-item-details">
          Tamanho: ${item.size} <br>
          <strong>Cremes:</strong> ${basesInfo}
          ${freeInfo}
          ${premiumInfo}
        </div>
      `;
    } else {
      // Standard item
      detailsHtml = item.size 
        ? `<div class="cart-item-details">Tamanho: ${item.size}</div>`
        : '';
    }

    return `
      <div class="cart-item">
        <button class="cart-item-remove" onclick="removeCartItem('${item.id}')" aria-label="Remover item">
          <i data-lucide="trash-2" class="icon-sm"></i>
        </button>
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.name}</h4>
          ${detailsHtml}
          <div class="cart-item-meta">
            <span class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            <div class="quantity-control">
              <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)" aria-label="Diminuir">
                <i data-lucide="minus" class="icon-sm"></i>
              </button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)" aria-label="Aumentar">
                <i data-lucide="plus" class="icon-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
  calculateCartTotals();
}

// Calcula os totais do carrinho
function calculateCartTotals() {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Taxa de entrega baseada na seleção
  let deliveryFee = 0;
  const isDelivery = document.querySelector('input[name="delivery-method"]:checked').value === 'delivery';
  
  if (isDelivery) {
    const select = document.getElementById('customer-neighborhood');
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption && selectedOption.dataset.fee) {
      deliveryFee = parseFloat(selectedOption.dataset.fee);
    }
  }

  const grandTotal = subtotal + deliveryFee;

  document.getElementById('cart-subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  document.getElementById('cart-delivery-fee').textContent = `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
  document.getElementById('cart-total').textContent = `R$ ${grandTotal.toFixed(2).replace('.', ',')}`;
}

// ==========================================================================
// CHECKOUT E SUBMISSÃO DO PEDIDO PARA WHATSAPP
// ==========================================================================

// Mostra o formulário de entrega e checkout no drawer do carrinho
function showCheckoutForm() {
  checkoutStep = 'checkout';
  
  // Troca de seções no body do carrinho
  document.getElementById('cart-items-list').classList.add('hidden');
  document.getElementById('checkout-form-section').classList.remove('hidden');
  
  // Troca botões de ação do footer
  document.getElementById('proceed-to-checkout-btn').classList.add('hidden');
  document.getElementById('submit-order-btn').classList.remove('hidden');
  document.getElementById('back-to-cart-btn').classList.remove('hidden');
}

// Retorna para visualização dos itens do carrinho
function showCartItems() {
  checkoutStep = 'cart';
  
  // Troca de seções no body do carrinho
  document.getElementById('cart-items-list').classList.remove('hidden');
  document.getElementById('checkout-form-section').classList.add('hidden');
  
  // Troca botões de ação do footer
  document.getElementById('proceed-to-checkout-btn').classList.remove('hidden');
  document.getElementById('submit-order-btn').classList.add('hidden');
  document.getElementById('back-to-cart-btn').classList.add('hidden');
}

// Trata envio final do pedido
function handleOrderSubmission(e) {
  e.preventDefault();
  
  const form = document.getElementById('checkout-form');
  
  // Força validação padrão do HTML5
  if (!form.reportValidity()) {
    showToast('⚠️ Preencha todos os campos obrigatórios!', 'warning');
    return;
  }

  // Captura dados do formulário
  const customerName = document.getElementById('customer-name').value.trim();
  const customerPhone = document.getElementById('customer-phone').value.trim();
  const deliveryMethod = document.querySelector('input[name="delivery-method"]:checked').value;
  
  let neighborhood = '';
  let address = '';
  let addressNumber = '';
  let reference = '';
  let deliveryFee = 0;

  if (deliveryMethod === 'delivery') {
    const neighborhoodSelect = document.getElementById('customer-neighborhood');
    const selectedOption = neighborhoodSelect.options[neighborhoodSelect.selectedIndex];
    neighborhood = neighborhoodSelect.value;
    address = document.getElementById('customer-address').value.trim();
    addressNumber = document.getElementById('customer-address-number').value.trim();
    reference = document.getElementById('customer-reference').value.trim();
    deliveryFee = parseFloat(selectedOption.dataset.fee || 0);
  }

  const paymentMethod = document.getElementById('payment-method').value;
  const cashChange = document.getElementById('cash-change').value;

  // Persiste informações do cliente no LocalStorage
  const customerInfoObj = {
    name: customerName,
    phone: customerPhone,
    deliveryMethod: deliveryMethod,
    neighborhood: neighborhood,
    address: address,
    addressNumber: addressNumber,
    reference: reference,
    paymentMethod: paymentMethod
  };
  localStorage.setItem('acai_top_customer_info', JSON.stringify(customerInfoObj));

  // GERAÇÃO DA MENSAGEM DO WHATSAPP
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const grandTotal = subtotal + (deliveryMethod === 'delivery' ? deliveryFee : 0);

  let message = `*🍦 NOVO PEDIDO - AÇAÍ TOP*\n`;
  message += `------------------------------------------\n`;
  message += `👤 *Cliente:* ${customerName}\n`;
  message += `📞 *WhatsApp:* ${customerPhone}\n\n`;
  message += `🛵 *Tipo:* ${deliveryMethod === 'delivery' ? 'Entrega em Casa' : 'Retirada no Local'}\n`;
  
  if (deliveryMethod === 'delivery') {
    message += `📍 *Endereço:* ${address}, nº ${addressNumber}\n`;
    message += `🏘️ *Bairro:* ${neighborhood}\n`;
    if (reference) message += `🔍 *Referência:* ${reference}\n`;
  }
  message += `------------------------------------------\n\n`;
  
  message += `🛒 *ITENS DO PEDIDO:*\n\n`;
  
  cart.forEach((item, index) => {
    message += `${item.quantity}x *${item.name}*`;
    if (item.size) message += ` (${item.size})`;
    message += ` - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    
    if (item.type === 'custom') {
      message += `   • _Cremes:_ ${item.bases.join(', ')}\n`;
      if (item.freeToppings.length > 0) {
        message += `   • _Acomp. Grátis:_ ${item.freeToppings.join(', ')}\n`;
      }
      if (item.premiumToppings.length > 0) {
        message += `   • _Premium:_ ${item.premiumToppings.map(t => `${t.qty}x ${t.name}`).join(', ')}\n`;
      }
    }
    message += `\n`;
  });
  
  message += `------------------------------------------\n`;
  message += `💵 *Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
  if (deliveryMethod === 'delivery') {
    message += `🛵 *Taxa de Entrega:* R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n`;
  }
  message += `💰 *TOTAL DO PEDIDO:* R$ ${grandTotal.toFixed(2).replace('.', ',')}\n\n`;

  // Mapeamento legível das formas de pagamento
  const paymentLabels = {
    pix: 'Pix',
    cartao_credito: 'Cartão de Crédito (na entrega)',
    cartao_debito: 'Cartão de Débito (na entrega)',
    dinheiro: 'Dinheiro'
  };

  message += `💳 *Forma de Pagamento:* ${paymentLabels[paymentMethod]}\n`;
  
  if (paymentMethod === 'dinheiro') {
    if (cashChange) {
      const changeVal = parseFloat(cashChange);
      const changeDue = changeVal - grandTotal;
      message += `   • Precisa de troco para: R$ ${changeVal.toFixed(2).replace('.', ',')}\n`;
      if (changeDue > 0) {
        message += `   • *Troco necessário:* R$ ${changeDue.toFixed(2).replace('.', ',')}\n`;
      } else {
        message += `   • _Sem necessidade de troco (valor exato)_\n`;
      }
    } else {
      message += `   • Não precisa de troco.\n`;
    }
  }

  message += `------------------------------------------\n`;
  message += `⏳ *Tempo estimado:* ${CONFIG.deliveryTime}\n`;
  message += `Obrigado pela preferência! 😊`;

  // URL Encode e redirecionamento
  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${CONFIG.whatsappNumber}&text=${encodedText}`;
  
  // Limpa carrinho após envio bem sucedido
  cart = [];
  saveCartToStorage();
  updateCartUI();
  showCartItems();
  
  // Abre o WhatsApp numa nova aba
  window.open(whatsappUrl, '_blank');
  
  // Fecha o drawer do carrinho
  document.getElementById('cart-overlay').classList.remove('active');
  document.getElementById('cart-drawer').classList.remove('active');
}

// ==========================================================================
// LOCAL STORAGE PERSISTENCE (PERSISTÊNCIA DE DADOS)
// ==========================================================================

function saveCartToStorage() {
  localStorage.setItem('acai_top_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
  const savedCart = localStorage.getItem('acai_top_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  }
}

function loadCustomerInfoFromStorage() {
  const savedInfoObj = localStorage.getItem('acai_top_customer_info');
  if (savedInfoObj) {
    try {
      const info = JSON.parse(savedInfoObj);
      
      // Popula campos se existirem no HTML
      if (info.name) document.getElementById('customer-name').value = info.name;
      if (info.phone) document.getElementById('customer-phone').value = info.phone;
      
      if (info.deliveryMethod) {
        const radio = document.querySelector(`input[name="delivery-method"][value="${info.deliveryMethod}"]`);
        if (radio) {
          radio.checked = true;
          // Dispara evento para reconfigurar a visualização
          radio.dispatchEvent(new Event('change'));
        }
      }
      
      if (info.neighborhood) document.getElementById('customer-neighborhood').value = info.neighborhood;
      if (info.address) document.getElementById('customer-address').value = info.address;
      if (info.addressNumber) document.getElementById('customer-address-number').value = info.addressNumber;
      if (info.reference) document.getElementById('customer-reference').value = info.reference;
      
      if (info.paymentMethod) {
        const select = document.getElementById('payment-method');
        select.value = info.paymentMethod;
        select.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.error("Erro ao carregar informações persistidas", e);
    }
  }
}

// ==========================================================================
// NOTIFICAÇÕES TOAST
// ==========================================================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'check-circle';
  if (type === 'warning') icon = 'alert-triangle';
  if (type === 'error') icon = 'x-circle';

  toast.innerHTML = `
    <div class="toast-icon"><i data-lucide="${icon}"></i></div>
    <div class="toast-body">${message}</div>
  `;
  
  container.appendChild(toast);
  lucide.createIcons();
  
  // Animação de entrada
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}
