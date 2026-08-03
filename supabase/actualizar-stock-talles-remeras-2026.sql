update public.products
set
  stock = 60,
  description = 'Camiseta de fútbol calidad premium. Talles disponibles: S, M, L, XL y XXL. Precio especial por cantidad. Para 500 unidades o más, consultá por una cotización mejorada.',
  colors = '[{"color":"S","stock":12},{"color":"M","stock":12},{"color":"L","stock":12},{"color":"XL","stock":12},{"color":"XXL","stock":12}]'::jsonb
where id like 'cam-fut-%';
