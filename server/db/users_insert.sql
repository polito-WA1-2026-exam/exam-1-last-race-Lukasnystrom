INSERT INTO users (username, display_name, password_hash, salt) VALUES
  (
    'mona.beck',
    'Mona Beck',
    'e6ac46129c7f3e445f0bcbf67023e94c57e45a24ab4780815bc13000ae5a42cf',
    '257573e6957960d3238d1d10233e5559'
  ),
  (
    'zibra.karling',
    'Zibra Karling',
    '29be1c3afc36f201e649c669e945379ca11918b97fc5a730831f9ce0f1d5371b',
    '0706844169d1d1a818e67a565ea5f6a4'
  ),
  (
    'alfons.aberg',
    'Alfons Aberg',
    '3964ca64da2314f933c7bdb0ca2d8f7c56ba1af302af6f4ecf03816d60324040',
    '92c01f91d5b2dd94d5592c7c61a1a432'
  ),
  (
    'alex.van.jager',
    'Alex Van Jager',
    '61404d5a6b577402fc3156de272d46d50c6e0d16e1fca7c75e45087599c4da67',
    '5c2532cd05af43bf10cd2273cb8d11d8'
  ),
  (
    'herman.carlsson',
    'Herman Carlsson',
    '63c9cb2383a49cce0da0beb657a9f180555a7cc32256dd69efda2476f32d9956',
    'e927b5b898ef91faf451f4f248a23065'
  ),
  (
    'luca.gotti',
    'Luca Gotti',
    '25c329175b73b6f91cbb0a51c2fc89ed3be1a6c4925f071958cb428120a8bcc5',
    '10b34c4b624697838436049a17cfa2d7'
  ),
  (
    'lebron.james',
    'Lebron James',
    '18899dddb99b076179f44765236438dc7a5e73ae6d7aac4917fb9a02c952f8a3',
    'fb668ef302277d5df632414291bb7ef0'
  ),
  (
    'tintin.sven',
    'Tintin sven',
    '764ded7e0f60a29e90fedf0e55ecd6c1c6db8830cccd5e137e57fbf462ca9696',
    'b08b80cbaf7746cad4c0a9cdaea6aeae'
  )
ON CONFLICT(username) DO UPDATE SET
  display_name = excluded.display_name,
  password_hash = excluded.password_hash,
  salt = excluded.salt;
