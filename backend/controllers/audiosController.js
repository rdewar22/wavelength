const Audio = require('../model/Audio');

const getAllAudios = async (req, res) => {
    const audios = await Audio.find().populate("user", "username profilePicUri");
    if (!audios) return res.status(204).json({ 'message': 'No audios found' });
    res.json(audios);
}

const getAudiosByUserId = async (req, res) => {
    const { userId } = req.params;
    const audios = await Audio.find({ user: userId }).populate("user", "username profilePicUri");
    res.json(audios);
}

const saveAudioToMongo = async (req, res) => {
    const { userId } = req.params;
    const { title } = req.body;
    try {
        const audio = await Audio.create({
            user: userId,
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

const deleteAudioFromMongo = async (req, res) => {
    try {
        const audio = req.audioToDelete; // Use the audio record we already fetched
        if (!audio) {
            return res.status(404).json({ message: 'Audio not found' });
        }
        
        // Delete from MongoDB
        await Audio.findByIdAndDelete(audio._id);
        
        res.json({ 
            message: 'Audio deleted successfully',
            deletedAudio: audio 
        });
    } catch (error) {
        console.error('Error deleting audio from MongoDB:', error);
        res.status(500).json({ message: 'Failed to delete audio from database', error: error.message });
    }
}

module.exports = { getAllAudios, getAudiosByUserId, saveAudioToMongo, deleteAudioFromMongo };