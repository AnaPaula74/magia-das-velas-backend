INSERT INTO categories (name, description)
VALUES
  ('Velas', 'Velas artesanais, ritualísticas e decorativas.'),
  ('Incensos', 'Incensos para purificação, harmonização e proteção.'),
  ('Sabonetes', 'Sabonetes artesanais energéticos e espirituais.'),
  ('Kits', 'Combinações especiais de produtos para rituais.')
ON DUPLICATE KEY UPDATE
  description = VALUES(description);