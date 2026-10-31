 export async function loadImageFromURL(imageURL) {
    console.log(`DEBUG: Loading image from URL=${imageURL}`);
    const response = await fetch(imageURL);
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("DEBUG: Image loaded successfully");
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }
