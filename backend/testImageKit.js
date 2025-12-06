const imagekit = require('./config/imagekit');

// Test ImageKit configuration
console.log('Testing ImageKit configuration...');
console.log('Public Key:', process.env.IMAGEKIT_PUBLIC_KEY || 'Not set');
console.log('Private Key:', process.env.IMAGEKIT_PRIVATE_KEY ? 'Set' : 'Not set');
console.log('URL Endpoint:', process.env.IMAGEKIT_URL_ENDPOINT || 'Not set');

// Test upload functionality with a small base64 image
const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='; // 1x1 transparent PNG

async function testUpload() {
  try {
    console.log('Testing ImageKit upload...');
    
    const result = await imagekit.upload({
      file: testImage,
      fileName: 'test-image.png',
      folder: '/test'
    });
    
    console.log('Upload successful:', result);
    
    // Clean up by deleting the test image
    if (result.fileId) {
      await imagekit.deleteFile(result.fileId);
      console.log('Test image deleted successfully');
    }
  } catch (error) {
    console.error('ImageKit test failed:', error.message);
  }
}

// Only run the test if all credentials are set
if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT &&
    process.env.IMAGEKIT_PUBLIC_KEY !== 'your_public_key' && 
    process.env.IMAGEKIT_PRIVATE_KEY !== 'your_private_key' && 
    process.env.IMAGEKIT_URL_ENDPOINT !== 'https://ik.imagekit.io/your_imagekit_id') {
  testUpload();
} else {
  console.log('ImageKit credentials not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in your .env file.');
}