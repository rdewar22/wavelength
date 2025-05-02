const Message = require('../model/Message');

const sendMessage = async (req, res) => {
    const { to, from, message } = req.body;
    if (!to || !from || !message) return res.status(400).json({ 'message': 'sender, recipient, and content are required'});

    try {
        const result = await Message.create({
            "to": to,
            "from": from,
            "message": message,
        });

        res.status(201).json({ 'success': 'Message sent!'});
    } catch (err) {
        res.status(500).json({'message': err.message });
    }

}


const getMessagesForUserName = async (req, res) => {
    if (!req.params?.username) return res.status(400).json({ "message": 'username required'});
    
    const username = req.params.username;

    const messages = await Message.find({
        $or: [
            { from: username },
            { to: username }
        ]
    }).sort({ updatedAt: -1 });
    
    res.json({
        messages: messages
    });
}

module.exports = {
    sendMessage,
    getMessagesForUserName
}