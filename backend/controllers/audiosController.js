const Audio = require('../model/Audio');

const getAudiosByUserId = async (req, res) => {
    const { userId } = req.params;
    const audios = await Audio.find({ userId });
    res.json(audios);
}

const uploadAudio = async (req, res) => {
    const { userId } = req.params;
    const { title } = req.body.title;
    try {
        const audio = await Audio.create({
            "userId": userId,
            "audioName": title
        });
        res.status(201).json({ message: 'Audio uploaded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getAudiosByUserId, uploadAudio };