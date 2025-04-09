const formData = require('form-data');
const axios = require('axios');
const fs = require('fs');
let Tesseract = require("tesseract.js");

/*
   TelegraPh("./image.jpg") // File
*/
async function TelegraPh(Path) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(Path)) return reject(new Error("File not Found"));

        // Check if file is an image
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const fileExtension = Path.split('.').pop().toLowerCase();
        if (!validExtensions.includes(fileExtension)) return reject(new Error("Invalid file type. Only images are allowed."));

        try {
            const form = new formData();
            form.append("file", fs.createReadStream(Path));

            const response = await axios({
                url: "https://telegra.ph/upload",
                method: "POST",
                headers: {
                    ...form.getHeaders(),
                },
                data: form,
            });

            if (response.status === 200 && response.data[0]?.src) {
                return resolve("https://telegra.ph" + response.data[0].src);
            } else {
                return reject(new Error("Failed to upload image to Telegra.ph"));
            }
        } catch (err) {
            console.error("Error uploading to Telegra.ph:", err);
            return reject(new Error(String(err)));
        }
    });
}

/*
   Pomf2Lain("./image.jpg") // File
*/
async function Pomf2Lain(fileName) {
    const fileData = fs.readFileSync(fileName);
    try {
        const form = new formData();
        form.append("files[]", fileData, `${Date.now()}.jpg`);

        const { data } = await axios.post(`https://pomf2.lain.la/upload.php`, form);

        if (data && data.url) {
            return data.url;
        } else {
            throw new Error('Failed to upload image to Pomf2');
        }
    } catch (err) {
        console.error("Error uploading to Pomf2:", err);
        return String(err);
    }
}

/*
   ImageToText("https://telegra.ph/file/b848abd02be38defef44b.jpg") // Buffer URL
*/
async function ImageToText(url) {
    try {
        const ocr = await Tesseract.recognize(url, 'eng');
        return ocr.data.text || "No text found";
    } catch (err) {
        console.error("Error processing image:", err);
        return "Error extracting text";
    }
}

/*
   EnhanceImage("https://telegra.ph/file/b848abd02be38defef44b.jpg") // Buffer URL
*/
async function EnhanceImage(url, scale = 2) {
    try {
        const response = await axios.post(`https://toolsapi.spyne.ai/api/forward`, {
            image_url: url,
            scale,
            save_params: {
                extension: ".png",
                quality: 100,
            },
        }, {
            headers: {
                "content-type": "application/json",
                accept: "*/*",
            },
        });

        if (response.data) {
            return response.data;
        } else {
            throw new Error("Image enhancement failed");
        }
    } catch (err) {
        console.error("Error enhancing image:", err);
        return "Error enhancing image";
    }
}

module.exports = {
    TelegraPh,
    Pomf2Lain,
    ImageToText,
    EnhanceImage,
};