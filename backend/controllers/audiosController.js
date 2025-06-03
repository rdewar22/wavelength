const Audio = require('../model/Audio');

const getAllAudios = async (req, res) => {
    const audios = await Audio.find();
    if (!audios) return res.status(204).json({ 'message': 'No audios found' });
    res.json(audios);
}

const getAudiosByUserId = async (req, res) => {
    const { userId } = req.params;
    const audios = await Audio.find({ userId });
    res.json(audios);
}

const saveAudioToMongo = async (req, res) => {
    const { userId } = req.params;
    const { title } = req.body;
    try {
        const audio = await Audio.create({
            userId: userId,
            title: title
        });
        res.status(201).json({ 
            message: 'Audio saved to database successfully',
            audio 
        });
    } catch (error) {
        console.error('Error saving audio to MongoDB:', error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getAllAudios, getAudiosByUserId, saveAudioToMongo };