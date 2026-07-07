const MENU_DATA = {
  // Tamanhos e limites de acompanhamentos gratuitos
  sizes: [
    { id: '300ml', name: 'Copo 300ml', price: 15.00, maxFreeToppings: 3, image: 'assets/acai-5.png' },
    { id: '500ml', name: 'Copo 500ml', price: 22.00, maxFreeToppings: 4, image: 'assets/acai-5.png' },
    { id: '700ml', name: 'Tigela 700ml', price: 28.00, maxFreeToppings: 5, image: 'assets/acai-5.png' },
    { id: '1l', name: 'Tigela 1 Litro', price: 38.00, maxFreeToppings: 6, image: 'assets/acai-5.png' }
  ],

  // Cremes e Bases
  bases: [
    { id: 'tradicional', name: 'Açaí Tradicional', description: 'O sabor clássico da Amazônia.' },
    { id: 'zero', name: 'Açaí Zero Açúcar', description: 'Adoçado naturalmente com stévia.' },
    { id: 'cupuacu', name: 'Creme de Cupuaçu', description: 'Creme cítrico e aveludado de cupuaçu.' },
    { id: 'ninho', name: 'Creme de Ninho', description: 'Creme doce e encorpado de leite Ninho.' },
    { id: 'morango', name: 'Creme de Morango', description: 'Creme suave com sabor de morango silvestre.' }
  ],

  // Acompanhamentos Gratuitos (limitados pelo tamanho do copo/tigela)
  freeToppings: [
    { id: 'banana', name: 'Banana fatiada' },
    { id: 'morango', name: 'Morango fatiado' },
    { id: 'granola', name: 'Granola artesanal' },
    { id: 'leite_po', name: 'Leite em Pó (Ninho)' },
    { id: 'pacoca', name: 'Paçoca triturada' },
    { id: 'flocos_arroz', name: 'Flocos de arroz' },
    { id: 'aveia', name: 'Aveia em flocos' },
    { id: 'leite_condensado', name: 'Leite condensado' },
    { id: 'calda_chocolate', name: 'Calda de chocolate' },
    { id: 'calda_morango', name: 'Calda de morango' },
    { id: 'calda_caramelo', name: 'Calda de caramelo' }
  ],

  // Adicionais Pagos
  premiumToppings: [
    { id: 'nutella', name: 'Nutella Original', price: 5.00, category: 'cremes' },
    { id: 'kitkat', name: 'Pedaços de KitKat', price: 3.50, category: 'chocolates' },
    { id: 'ouro_branco', name: 'Bombom Ouro Branco', price: 3.00, category: 'chocolates' },
    { id: 'sonho_valsa', name: 'Bombom Sonho de Valsa', price: 3.00, category: 'chocolates' },
    { id: 'bis', name: 'Bis picado', price: 2.50, category: 'chocolates' },
    { id: 'confeti', name: 'Confetes coloridos', price: 2.50, category: 'chocolates' },
    { id: 'kiwi', name: 'Kiwi fresco fatiado', price: 3.00, category: 'frutas' },
    { id: 'cereja', name: 'Cerejas em calda', price: 4.00, category: 'frutas' },
    { id: 'ninho_extra', name: 'Creme de Ninho Extra', price: 4.00, category: 'cremes' },
    { id: 'ovomaltine', name: 'Ovomaltine crocante', price: 2.50, category: 'doces' },
    { id: 'mms', name: 'M&Ms originais', price: 3.00, category: 'chocolates' }
  ],

  // Combinados Prontos (Cardápio Fixo)
  premadeProducts: [
    {
      id: 'combo_classico',
      name: 'Açaí Clássico',
      description: 'Açaí tradicional acompanhado de banana fresca fatiada, morango, granola crocante e leite condensado.',
      category: 'combos',
      options: [
        { size: '300ml', price: 18.00 },
        { size: '500ml', price: 25.00 },
        { size: '700ml', price: 32.00 }
      ],
      image: 'assets/acai-1.png'
    },
    {
      id: 'combo_ninhotella',
      name: 'Açaí Ninho & Nutella',
      description: 'Açaí tradicional montado em camadas com Creme de Ninho gourmet, leite em pó Ninho e muita Nutella original.',
      category: 'combos',
      options: [
        { size: '300ml', price: 22.00 },
        { size: '500ml', price: 30.00 },
        { size: '700ml', price: 37.00 }
      ],
      image: 'assets/acai-2.png'
    },
    {
      id: 'combo_sensacao',
      name: 'Açaí Divertido (M&Ms)',
      description: 'Açaí tradicional montado em camadas com rodelas de banana e muitos confetes coloridos M&Ms por cima.',
      category: 'combos',
      options: [
        { size: '300ml', price: 20.00 },
        { size: '500ml', price: 28.00 },
        { size: '700ml', price: 35.00 }
      ],
      image: 'assets/acai-4.png'
    },
    {
      id: 'combo_energia',
      name: 'Super Energia',
      description: 'Açaí energético batido com guaraná, acompanhado de banana, amendoim granulado, mel silvestre e granola.',
      category: 'combos',
      options: [
        { size: '300ml', price: 19.00 },
        { size: '500ml', price: 26.00 },
        { size: '700ml', price: 33.00 }
      ],
      image: 'assets/acai-3.png'
    }
  ],

  // Bebidas adicionais
  drinks: [
    { id: 'suco_laranja', name: 'Suco de Açaí com Laranja', description: 'Copo de 500ml de suco natural refrescante.', price: 12.00, category: 'bebidas', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=60' },
    { id: 'suco_morango', name: 'Suco de Açaí com Morango', description: 'Copo de 500ml de suco cremoso batido.', price: 13.00, category: 'bebidas', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60' },
    { id: 'refri_lata', name: 'Refrigerante Lata', description: 'Coca-Cola ou Guaraná Antarctica (350ml).', price: 6.00, category: 'bebidas', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60' },
    { id: 'agua_sem', name: 'Água Mineral sem Gás', description: 'Garrafa 500ml.', price: 4.00, category: 'bebidas', image: 'https://images.unsplash.com/photo-1608885898957-a599fb15e841?w=500&auto=format&fit=crop&q=60' },
    { id: 'agua_com', name: 'Água Mineral com Gás', description: 'Garrafa 500ml com gás.', price: 5.50, category: 'bebidas', image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=500&auto=format&fit=crop&q=60' }
  ],

  // Taxas de Entrega Simples baseadas no bairro
  deliveryFees: [
    { neighborhood: 'Centro', fee: 3.00 },
    { neighborhood: 'Jardim Alvorada', fee: 5.00 },
    { neighborhood: 'Vila Nova', fee: 4.50 },
    { neighborhood: 'Parque das Nações', fee: 6.00 },
    { neighborhood: 'Santa Rita', fee: 5.50 },
    { neighborhood: 'Outros bairros (Sob consulta)', fee: 7.00 }
  ]
};
