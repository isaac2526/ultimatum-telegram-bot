const axios = require('axios');
async function getAiResponse(bot, chatId, input, userName) {
    if (!input) return bot.sendMessage(chatId, `[ Ultimatum Bot Help ]

Please ask your question after the /ai command.
Example: /ai What is JavaScript?
ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɪsᴀᴀᴄ ᴀʀɪɴᴏʟᴀ ᴛᴇᴄʜ™`);

    try {
        bot.sendChatAction(chatId, 'typing');

        let { data } = await axios.post("https://api.openai.com/v1/completions", {
            model: "text-davinci-003",
            prompt: input,
            max_tokens: 150,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json'
            }
        });

        if (data.choices && data.choices.length > 0) {
            await bot.sendMessage(chatId, `${data.choices[0].text.trim()}`, { parse_mode: 'Markdown' });
        } else {
            return bot.sendMessage(chatId, 'An error occurred!');
        }

    } catch (err) {
        await bot.sendMessage(String(chatId), `[ ERROR MESSAGE ]\n\n• Username: @${userName}\n• File: funcs/ai.js\n• Function: getAiResponse()\n• Input: ${input}\n\n${err}`);
        return bot.sendMessage(chatId, 'An error occurred!');
    }
}

module.exports = {
    getAiResponse
};