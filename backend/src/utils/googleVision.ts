import axios from 'axios';

interface VisionResponse {
  text: string;
  confidence: number;
  language: string;
  error?: string;
}

// Extract text from image using Google Vision API
export const extractTextFromImage = async (
  imageBase64: string,
  apiKey: string
): Promise<VisionResponse> => {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Data
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1
            }
          ],
          imageContext: {
            languageHints: ['en']
          }
        }
      ]
    };

    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.responses[0];
    
    if (!result || !result.textAnnotations || result.textAnnotations.length === 0) {
      return {
        text: '',
        confidence: 0,
        language: 'en',
        error: 'No text detected in image'
      };
    }

    // Get the full text (first annotation contains the entire text)
    const fullText = result.textAnnotations[0].description;
    
    // Calculate average confidence from all text annotations
    const confidences = result.textAnnotations.slice(1).map((annotation: any) => 
      annotation.confidence || 0
    );
    const averageConfidence = confidences.length > 0 
      ? confidences.reduce((sum: number, conf: number) => sum + conf, 0) / confidences.length
      : 0.8; // Default confidence if no individual annotations

    return {
      text: fullText,
      confidence: averageConfidence,
      language: result.textAnnotations[0].locale || 'en'
    };

  } catch (error: any) {
    console.error('Google Vision API error:', error.response?.data || error.message);
    
    return {
      text: '',
      confidence: 0,
      language: 'en',
      error: error.response?.data?.error?.message || error.message
    };
  }
};

// Extract text from image URL (for external images)
export const extractTextFromImageUrl = async (
  imageUrl: string,
  apiKey: string
): Promise<VisionResponse> => {
  try {
    const requestBody = {
      requests: [
        {
          image: {
            source: {
              imageUri: imageUrl
            }
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1
            }
          ],
          imageContext: {
            languageHints: ['en']
          }
        }
      ]
    };

    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.responses[0];
    
    if (!result || !result.textAnnotations || result.textAnnotations.length === 0) {
      return {
        text: '',
        confidence: 0,
        language: 'en',
        error: 'No text detected in image'
      };
    }

    const fullText = result.textAnnotations[0].description;
    
    const confidences = result.textAnnotations.slice(1).map((annotation: any) => 
      annotation.confidence || 0
    );
    const averageConfidence = confidences.length > 0 
      ? confidences.reduce((sum: number, conf: number) => sum + conf, 0) / confidences.length
      : 0.8;

    return {
      text: fullText,
      confidence: averageConfidence,
      language: result.textAnnotations[0].locale || 'en'
    };

  } catch (error: any) {
    console.error('Google Vision API error:', error.response?.data || error.message);
    
    return {
      text: '',
      confidence: 0,
      language: 'en',
      error: error.response?.data?.error?.message || error.message
    };
  }
};

// Process handwritten notes with better accuracy
export const processHandwrittenNotes = async (
  imageBase64: string,
  apiKey: string
): Promise<VisionResponse> => {
  try {
    // First attempt with TEXT_DETECTION
    const textResult = await extractTextFromImage(imageBase64, apiKey);
    
    // If confidence is low, try with DOCUMENT_TEXT_DETECTION for better handwriting recognition
    if (textResult.confidence < 0.7) {
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const requestBody = {
        requests: [
          {
            image: {
              content: base64Data
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION'
              }
            ],
            imageContext: {
              languageHints: ['en']
            }
          }
        ]
      };

      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data.responses[0];
      
      if (result && result.textAnnotations && result.textAnnotations.length > 0) {
        const fullText = result.textAnnotations[0].description;
        
        const confidences = result.textAnnotations.slice(1).map((annotation: any) => 
          annotation.confidence || 0
        );
        const averageConfidence = confidences.length > 0 
          ? confidences.reduce((sum: number, conf: number) => sum + conf, 0) / confidences.length
          : 0.8;

        return {
          text: fullText,
          confidence: averageConfidence,
          language: result.textAnnotations[0].locale || 'en'
        };
      }
    }
    
    return textResult;

  } catch (error: any) {
    console.error('Error processing handwritten notes:', error);
    
    return {
      text: '',
      confidence: 0,
      language: 'en',
      error: error.message
    };
  }
}; 