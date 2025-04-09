require('dotenv').config();
const axios = require('axios');

// Function to send media in batches
async function sendMediaBatch(bot, chatId, mediaList, caption, mediaType = 'photo') {
  let currentIndex = 0;
  while (currentIndex < mediaList.length) {
    let mediaToSend = mediaList.slice(currentIndex, currentIndex + 10); // Max 10 per message
    currentIndex += 10;
    
    if (mediaToSend.length > 0) {
      const sendFunc = mediaType === 'photo' ? bot.sendMediaGroup : bot.sendVideo;
      await sendFunc(chatId, mediaToSend, { caption });
    }
  }
}

// Retry logic to handle API failures
async function fetchMediaData(url, retries = 3) {
  try {
    const get = await axios.get(`https://api.threadsphotodownloader.com/v2/media?url=${url}`);
    return get.data;
  } catch (err) {
    if (retries > 0) {
      console.log(`Retrying... Attempts remaining: ${retries}`);
      return fetchMediaData(url, retries - 1); // Retry the request
    }
    throw new Error(`Failed to fetch media after 3 attempts: ${err.message}`);
  }
}

// Function to handle threads media download
async function threadsDownload(bot, chatId, url, userName, customCaption = 'Powered by ISAAC ARINOLA TECH™') {
  let load = await bot.sendMessage(chatId, 'Loading, please wait...');
  
  if (!url || !url.startsWith('https://')) {
    return bot.editMessageText('Invalid URL format. Please provide a valid thread URL.', { chat_id: chatId, message_id: load.message_id });
  }
  
  try {
    const data = await fetchMediaData(url); // Attempt to fetch media data with retry mechanism
    
    if (data.error) {
      // Handle API error responses
      return bot.editMessageText(`Error: ${data.error}. Please check the URL or try again later.`, { chat_id: chatId, message_id: load.message_id });
    }
    
    // Handle image URLs
    if (data.image_urls.length > 0 && !data.video_urls.length) {
      let mediaList = data.image_urls.map(url => ({ type: 'photo', media: url }));
      if (mediaList.length === 1) {
        await bot.sendPhoto(chatId, mediaList[0].media, { caption: customCaption });
      } else {
        await sendMediaBatch(bot, chatId, mediaList, customCaption);
      }
      return bot.deleteMessage(chatId, load.message_id);
    }
    
    // Handle video URLs
    if (data.video_urls.length > 0 && !data.image_urls.length) {
      await bot.sendVideo(chatId, data.video_urls[0].download_url, { caption: customCaption });
      return bot.deleteMessage(chatId, load.message_id);
    }
    
    // If no media found
    if (!data.image_urls.length && !data.video_urls.length) {
      return bot.editMessageText('No media found in this thread, or the URL is invalid. Please check and try again.', { chat_id: chatId, message_id: load.message_id });
    }
    
  } catch (err) {
    console.error('Error during media download:', err);
    await bot.sendMessage(String(process.env.DEV_ID), `[ ERROR MESSAGE ]\n\n• Username: @${userName}\n• File: funcs/threads.js\n• Function: threadsDownload()\n• Url: ${url}\n\n${err.message}`.trim());
    return bot.editMessageText('Failed to download media. Please ensure your link is valid and try again later.', { chat_id: chatId, message_id: load.message_id });
  }
}

module.exports = {
  threadsDownload
};