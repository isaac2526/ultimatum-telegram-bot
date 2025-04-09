require('dotenv').config()
const { search } = require('google-sr');

// Function to perform a Google search
async function googleSearch(bot, chatId, query, userName) {
  // If no query is provided, send a help message
  if (!query || typeof query !== 'string') {
    return bot.sendMessage(chatId, `Please enter your Google search query, e.g.:\n/google what is javascript`);
  }

  // Send typing indicator while waiting for results
  bot.sendChatAction(chatId, 'typing');

  try {
    // Perform the search
    const searchResults = await search({ query: query });

    // Construct the response message
    let resultS = `GOOGLE SEARCH RESULTS\n\n`;

    // Limit the results to a maximum of 5 (in case there are fewer than 5 results)
    for (let i = 0; i < Math.min(5, searchResults.length); i++) {
      resultS += `• Title: ${searchResults[i].title}\n• Link: ${searchResults[i].link}\n• Description: ${searchResults[i].description}\n\n`;
    }

    // Send the results to the user
    return bot.sendMessage(chatId, resultS);

  } catch (err) {
    // If there's an error, log it and send a generic error message
    await bot.sendMessage(String(process.env.DEV_ID), `[ ERROR MESSAGE ]\n\n• Username: @${userName}\n• File: funcs/google.js\n• Function: googleSearch()\n• Input: ${query}\n\n${err}`.trim());
    return bot.sendMessage(chatId, 'An error occurred while performing the search. Please try again later.');
  }
}

module.exports = {
  googleSearch
};