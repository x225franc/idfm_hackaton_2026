jest.mock('../config/db', () => ({ query: jest.fn() }));

const db = require('../config/db');
const User = require('./user.model');

afterEach(() => jest.clearAllMocks());

describe('User model', () => {
  it('findByEmail exécute la bonne requête SQL', async () => {
    db.query.mockImplementation((sql, values, cb) =>
      cb(null, [{ id: 1, email: 'test@test.com' }])
    );

    const result = await User.findByEmail('test@test.com');

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM compte_connect WHERE email = ?',
      ['test@test.com'],
      expect.any(Function)
    );
    expect(result).toHaveLength(1);
    expect(result[0].email).toBe('test@test.com');
  });

  it('create insère avec les bons paramètres', async () => {
    db.query.mockImplementation((sql, values, cb) =>
      cb(null, { insertId: 42 })
    );

    const result = await User.create('Jean', 'Dupont', 'jean@test.com', 'hashedpw', true);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO compte_connect'),
      ['Jean', 'Dupont', 'jean@test.com', 'hashedpw', 1],
      expect.any(Function)
    );
    expect(result.insertId).toBe(42);
  });

  it("findByEmail rejette en cas d'erreur DB", async () => {
    db.query.mockImplementation((sql, values, cb) =>
      cb(new Error('connexion perdue'), null)
    );

    await expect(User.findByEmail('x@x.com')).rejects.toThrow('connexion perdue');
  });
});
