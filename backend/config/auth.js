module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_key_here',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 10,
};

