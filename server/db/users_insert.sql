INSERT INTO users (username, display_name, password_hash, salt) VALUES
  (
    'mona.beck',
    'Mona Beck',
    'b717f6d152c946d61045e01e2e713b5e28f51b9d9a627c467843fcc97da9c974',
    '257573e6957960d3238d1d10233e5559'
  ),
  (
    'zibra.karling',
    'Zibra Karling',
    'b010f47ea4770df2844b6129da24c7e213d192f1ddce265163e8bdd59f1110ce',
    '0706844169d1d1a818e67a565ea5f6a4'
  ),
  (
    'alfons.aberg',
    'Alfons Aberg',
    '2fec95a39edcc20b5238505a41866a69900a07bb97b13781fd76211ee8af957d',
    '92c01f91d5b2dd94d5592c7c61a1a432'
  ),
  (
    'alex.van.jager',
    'Alex Van Jager',
    '3c50d75f7eb5cd4874623bef4e9a31765649bb67dea23b51d8b713dec1a89332',
    '5c2532cd05af43bf10cd2273cb8d11d8'
  ),
  (
    'herman.carlsson',
    'Herman Carlsson',
    'd8c857d44b2d93c318daa6a275f178632284c611fb9ecfbf5ca5cb887fb3a642',
    'e927b5b898ef91faf451f4f248a23065'
  ),
  (
    'luca.gotti',
    'Luca Gotti',
    '09c47740449a61885d07d6eee804540f467edd5b1bab021cba9a207a460223d1',
    '10b34c4b624697838436049a17cfa2d7'
  ),
  (
    'lebron.james',
    'Lebron James',
    '2fb20891f6d97490bfca07e267d3cbbbf089be9fe82b3865e09a30a2d8532284',
    'fb668ef302277d5df632414291bb7ef0'
  ),
  (
    'tintin.sven',
    'Tintin sven',
    '264a744d0a93cb898c322eb9957749023d12520c5775f25eefe1990216fa7846',
    'b08b80cbaf7746cad4c0a9cdaea6aeae'
  )
ON CONFLICT(username) DO UPDATE SET
  display_name = excluded.display_name,
  password_hash = excluded.password_hash,
  salt = excluded.salt;
