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

module.exports = {
    sendMessage
}