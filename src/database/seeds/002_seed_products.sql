INSERT INTO products (
  name,
  description,
  price,
  stock,
  image_url,
  category_id,
  active
)
VALUES
  (
    'Vela de Limpeza Espiritual Profunda',
    'Auxilia na purificação energética, proteção espiritual e renovação das vibrações do ambiente.',
    39.90,
    20,
    '/uploads/vela-limpeza-espiritual.jpg',
    (SELECT id FROM categories WHERE name = 'Velas' LIMIT 1),
    TRUE
  ),
  (
    'Incenso de Purificação e Harmonização',
    'Ideal para limpeza energética, equilíbrio do ambiente e preparação para rituais.',
    19.90,
    40,
    '/uploads/incenso-purificacao.jpg',
    (SELECT id FROM categories WHERE name = 'Incensos' LIMIT 1),
    TRUE
  ),
  (
    'Sabonete de Limpeza Espiritual Profunda',
    'Promove sensação de descarrego, proteção e renovação energética no banho.',
    24.90,
    30,
    '/uploads/sabonete-limpeza-espiritual.jpg',
    (SELECT id FROM categories WHERE name = 'Sabonetes' LIMIT 1),
    TRUE
  ),
  (
    'Kit Limpeza Espiritual Completa',
    'Kit com vela, incenso e sabonete para ritual completo de purificação energética.',
    79.90,
    15,
    '/uploads/kit-limpeza-espiritual.jpg',
    (SELECT id FROM categories WHERE name = 'Kits' LIMIT 1),
    TRUE
  );