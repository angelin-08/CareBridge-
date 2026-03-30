import Tesseract from 'tesseract.js';

export const ocrService = {
    extractTextFromImage: async (imageFile, onProgress) => {
        try {
            const { data: { text } } = await Tesseract.recognize(
                imageFile,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text' && onProgress) {
                            onProgress(Math.floor(m.progress * 100));
                        }
                    }
                }
            );
            return text;
        } catch (error) {
            console.error('OCR Error:', error);
            throw new Error('Could not read the report. Please try a clearer photo.');
        }
    }
};
