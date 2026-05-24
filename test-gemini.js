const testGemini = async () => {
  const apiKey = "AIzaSyBjERjC0Kycrf_cztUYCEF45avfcF0hJ3w";
  const prompt = "Hello!";
  
  let url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  let allModels = [];
  while (url) {
    const response = await fetch(url);
    const json = await response.json();
    if (json.models) allModels.push(...json.models);
    if (json.nextPageToken) {
      url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageToken=${json.nextPageToken}`;
    } else {
      url = null;
    }
  }
  console.log(allModels.filter(m => m.supportedGenerationMethods?.includes("generateContent")).map(m => m.name));
};

testGemini();
