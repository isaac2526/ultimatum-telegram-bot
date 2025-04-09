require('dotenv').config();
let fs = require('fs');
let {
   TelegraPh,
   Pomf2Lain,
   ImageToText,
   EnhanceImage
} = require('./scraper_images.js');

// Upload image to Telegraph
async function telegraphUpload(bot, chatId, filePath, username) {
   let load = await bot.sendMessage(chatId, `Loading, please wait...`);
   try {
      let upload = await TelegraPh(filePath);
      await bot.editMessageText(`Successfully uploaded to Telegraph\n${upload}`, { chat_id: chatId, message_id: load.message_id, disable_web_page_preview: true });
      fs.unlinkSync(filePath);  // Remove the file after upload
   } catch (err) {
      await bot.editMessageText(`Failed to upload image to Telegraph. Please try again later.`, { chat_id: chatId, message_id: load.message_id });
      // Send detailed error to the developer for debugging
      return bot.sendMessage(String(process.env.DEV_ID), `[ ERROR MESSAGE ]\n\n• Username: @${username}\n• File: funcs/images.js\n• Function: telegraphUpload()\n• filePath: ${filePath}\n\n${err}`.trim());
   }
}

// Upload image to Pomf2.lain.la
async function Pomf2Upload(bot, chatId, filePath, username) {
   let load = await bot.sendMessage(chatId, `Loading, please wait...`);
   try {
      let upload = await Pomf2Lain(filePath);
      await bot.editMessageText(`Successfully uploaded to pomf2.lain.la\n${upload.files[0].url}`, { chat_id: chatId, message_id: load.message_id, disable_web_page_preview: true });
      fs.unlinkSync(filePath);  // Remove the file after upload
   } catch (err) {
      await bot.editMessageText(`Failed to upload image to pomf2.lain.la. Please try again later.`, { chat_id: chatId, message_id: load.message_id, disable_web_page_preview: true });
      // Send detailed error to the developer for debugging
      return bot.sendMessage(String(process.env.DEV_ID), `[ ERROR MESSAGE ]\n\n• Username: @${username}\n• File: funcs/images.js\n• Function: Pomf2Upload()\n• filePath: ${filePath}\n\n${err}`.trim());
   }
}

// Extract text from image using OCR
async function Ocr(bot, chatId, filePath, username) {
   let load = await bot.sendMessage(chatId, `Uploading and processing image, please wait...`);
   try {
      let upload = await TelegraPh(filePath);
      await bot.editMessageText(`Image uploaded, now extracting text...`, { chat_id: chatId, message_id: load.message_id });
      let ocrResult = await ImageToText(upload);
      await bot.editMessageText(`Extracted text from image:\n\n${ocrResult}`, { chat_id: chatId, message_id: load.message_id, disable_web_page_preview: true });
      fs.unlinkSync(filePath);  // Remove the file after processing
   } catch (err) {
      await bot.editMessageText(`Failed to extract text from the image. Please ensure the image contains readable text.`, { chat_id: chatId, message_id: load.message_id, disable_web_page_preview: true });
      // Send detailed error to the developer for debugging
      return bot.sendMessage(String(process.env.DEV_ID), `[ ERROR MESSAGE ]\n\n• Username: @${username}\n• File: funcs/images.js\n• Function: Ocr()\n• filePath: ${filePath}\n\n${err}`.trim());
   }
}

module.exports = {
   telegraphUpload,
   Pomf2Upload,
   Ocr
};