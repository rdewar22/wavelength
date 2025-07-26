const allowedOriginsFrontend = process.env.NODE_ENV === 'production' ? [
    'https://wavelength-72dv.onrender.com'
] : ['http://localhost:3000'];

module.exports = allowedOriginsFrontend; 