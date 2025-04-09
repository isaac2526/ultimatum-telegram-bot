require('dotenv').config();
const axios = require('axios');
const { parse } = require('spotify-uri');
const { getBuffer, filterAlphanumericWithDash } = require('./functions');
const fs = require('fs').promises;

/*
** Endpoints **
https://api.spotifydown.com

* Download Song
/download/

* Metadata Playlist
/metadata/playlist/

* Track Playlist
/trackList/playlist/

*/

// General Spotify scraper function
async function spotifyScraper(id, endpoint) {
  try {
    const { data } = await axios.get(`https://api.spotifydown.com/${endpoint}/${id}`, {
      headers: {
        'Origin': 'https://spotifydown.com',
        'Referer': 'https://spotifydown.com/',
      }
    });
    return data;
  } catch (err) {
    console.error('Error in spotifyScraper:', err);
    return { success: false, message: 'Failed to fetch data from Spotify API.' };
  }
}

// Helper function to handle the song download
async function handleSongDownload(bot, chatId, songData, loadMessage) {
  const { title, artists, link } = songData.metadata;
  const fileName = `${filterAlphanumericWithDash(title)}-${filterAlphanumericWithDash(artists)}_${chatId}.mp3`;

  try {
    await bot.editMessageText(`Downloading song ${title} - ${artists}, please wait...`, { chat_id: chatId, message_id: loadMessage.message_id });
    const buffer = await getBuffer(link);
    await fs.writeFile(`content/${fileName}`, buffer);
    await bot.sendAudio(chatId, `content/${fileName}`, { caption: `Successfully downloaded ${title} - ${artists}` });
    await fs.unlink(`content/${fileName}`); // Clean up the file
    await bot.deleteMessage(chatId, loadMessage.message_id);
  } catch (err) {
    console.error('Error in handleSongDownload:', err);
    await bot.editMessageText('Failed to download song!', { chat_id: chatId, message_id: loadMessage.message_id });
  }
}

// Get playlist from Spotify
async function getPlaylistSpotify(bot, chatId, url, userName) {
  const pars = await parse(url);
  const loadMessage = await bot.sendMessage(chatId, 'Loading, please wait.');
  
  try {
    const playlistData = await spotifyScraper(pars.id, 'trackList/playlist');
    const trackList = playlistData.trackList.map(track => [
      { text: `${track.title} - ${track.artists}`, callback_data: 'spt ' + track.id }
    ]);
    
    const options = {
      caption: 'Please select the music you want to download by pressing one of the buttons below!',
      reply_markup: JSON.stringify({ inline_keyboard: trackList })
    };
    
    await bot.sendPhoto(chatId, 'https://telegra.ph/file/a41e47f544ed99dd33783.jpg', options);
    await bot.deleteMessage(chatId, loadMessage.message_id);
  } catch (err) {
    await bot.sendMessage(process.env.DEV_ID, `[ERROR] Playlist fetch failed for user: @${userName} | URL: ${url}\n${err}`);
    return bot.editMessageText('Error getting playlist data!', { chat_id: chatId, message_id: loadMessage.message_id });
  }
}

// Get album from Spotify
async function getAlbumsSpotify(bot, chatId, url, userName) {
  const pars = await parse(url);
  const loadMessage = await bot.sendMessage(chatId, 'Loading, please wait.');

  try {
    const albumData = await spotifyScraper(pars.id, 'trackList/album');
    const trackList = albumData.trackList.map(track => [
      { text: `${track.title} - ${track.artists}`, callback_data: 'spt ' + track.id }
    ]);

    const options = {
      caption: 'Please select the music you want to download by pressing one of the buttons below!',
      reply_markup: JSON.stringify({ inline_keyboard: trackList })
    };

    await bot.sendPhoto(chatId, 'https://telegra.ph/file/a41e47f544ed99dd33783.jpg', options);
    await bot.deleteMessage(chatId, loadMessage.message_id);
  } catch (err) {
    await bot.sendMessage(process.env.DEV_ID, `[ERROR] Album fetch failed for user: @${userName} | URL: ${url}\n${err}`);
    return bot.editMessageText('Error getting album data!', { chat_id: chatId, message_id: loadMessage.message_id });
  }
}

// Get individual song from Spotify
async function getSpotifySong(bot, chatId, url, userName) {
  const loadMessage = await bot.sendMessage(chatId, 'Loading, please wait.');
  
  try {
    let pars;
    if (url.includes('spotify.com')) {
      pars = await parse(url);
    }
    const songData = await spotifyScraper(pars.id || url, 'download');
    
    if (songData.success) {
      await handleSongDownload(bot, chatId, songData, loadMessage);
    } else {
      await bot.editMessageText('Error, failed to get song data', { chat_id: chatId, message_id: loadMessage.message_id });
    }
  } catch (err) {
    await bot.sendMessage(process.env.DEV_ID, `[ERROR] Song download failed for user: @${userName} | URL: ${url}\n${err}`);
    return bot.editMessageText('Failed to download song!', { chat_id: chatId, message_id: loadMessage.message_id });
  }
}

module.exports = {
  getPlaylistSpotify,
  getAlbumsSpotify,
  getSpotifySong
};