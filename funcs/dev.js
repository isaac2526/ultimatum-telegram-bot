const NetworkSpeed = require('network-speed');
const testNetworkSpeed = new NetworkSpeed();
const { exec } = require('child_process');
const util = require('util');

// Get Network Download Speed
async function getNetworkDownloadSpeed(bot, chatId) {
   console.log('Calculating Download Speed...');
   bot.sendMessage(chatId, 'Calculating Download Speed...').catch((err) => console.error(err));
   
   const baseUrl = 'https://eu.httpbin.org/stream-bytes/100000';
   const fileSizeInBytes = 100000;
   try {
      const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
      bot.sendMessage(chatId, `Download Speed: ${speed.mbps} Mbps`).catch((err) => console.error(err));
      console.log(`Download Speed: ${speed.mbps} Mbps`);
   } catch (err) {
      console.error('Error calculating download speed:', err);
      bot.sendMessage(chatId, 'Failed to calculate download speed. Please try again later.');
   }
}

// Get Network Upload Speed
async function getNetworkUploadSpeed(bot, chatId) {
   console.log('Calculating Upload Speed...');
   bot.sendMessage(chatId, 'Calculating Upload Speed...').catch((err) => console.error(err));
   
   const options = {
      hostname: 'www.google.com',
      port: 80,
      path: '/catchers/544b09b4599c1d0200000289',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
   };
   const fileSizeInBytes = 2000000;
   try {
      const speed = await testNetworkSpeed.checkUploadSpeed(options, fileSizeInBytes);
      bot.sendMessage(chatId, `Upload Speed: ${speed.mbps} Mbps`).catch((err) => console.error(err));
      console.log(`Upload Speed: ${speed.mbps} Mbps`);
   } catch (err) {
      console.error('Error calculating upload speed:', err);
      bot.sendMessage(chatId, 'Failed to calculate upload speed. Please try again later.');
   }
}

// Evaluate JavaScript Code (Warning: Avoid using eval in production environments)
async function evaluateBot(bot, chatId, input) {
   if (!input) return bot.sendMessage(chatId, 'What do you want to do?');
   
   try {
      const result = /await/i.test(input) 
         ? await eval("(async() => { " + input + " })()") 
         : eval(input);
      bot.sendMessage(chatId, util.format(result), { parse_mode: 'Markdown' });
   } catch (err) {
      bot.sendMessage(chatId, `Error: ${err}`, { parse_mode: 'Markdown' });
   }
}

// Execute system commands (be cautious with input)
async function executeBot(bot, chatId, input) {
   if (!input) return bot.sendMessage(chatId, 'What do you want to do?');
   
   exec(input, async (err, stdout, stderr) => {
      if (err) {
         return bot.sendMessage(chatId, `Error: ${err.message}`);
      }
      if (stderr) {
         return bot.sendMessage(chatId, `stderr: ${stderr}`);
      }
      if (stdout) {
         await bot.sendMessage(chatId, util.format(stdout));
      }
   });
}

module.exports = {
   getNetworkDownloadSpeed,
   getNetworkUploadSpeed,
   evaluateBot,
   executeBot
}