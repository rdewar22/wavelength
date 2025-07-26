const allowedOriginsBackend = process.env.NODE_ENV === 'production' 
    ? 'https://wavelength-backend-eq3t.onrender.com'
    : 'http://localhost:3500';

export default allowedOriginsBackend;