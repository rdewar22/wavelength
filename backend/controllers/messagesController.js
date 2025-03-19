const Message = require('../model/Message');

const sendMessage = async (req, res) => {
    const { recipient, sender, content } = req.body;
    if (!recipient || !sender || !content) return res.status(400).json({ 'message': 'sender, recipient, and content are required'});

    try {
        const result = await Message.create({
            "recipient": recipient,
            "sender": sender,
            "content": content,
        });

        res.status(201).json({ 'success': 'Message sent!'});
    } catch (err) {
        res.status(500).json({'message': err.message });
    }

}

const getMessagesForUserName = async (req, res) => {
    if (!req.params?.username) return res.status(400).json({ "message": 'username required'});
    const messages = await Message.find({ recipient: req.params.username });
    
    res.json(messages)
}

module.exports = {
    sendMessage,
    getMessagesForUserName
}