// Function to get the base API URL
export const imageUrl = "https://trakingsystem.vercel.app";
export const url = `${imageUrl}/api/v1`;

export const getBaseUrl = () => {
  return url;
};

// Function to get the image base URL
export const getImageBaseUrl = () => {
  return imageUrl;
};

// get up
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }
  if (imagePath.includes("http")) {
    return imagePath;
  }
  return `${imageUrl}${imagePath}`;
};
