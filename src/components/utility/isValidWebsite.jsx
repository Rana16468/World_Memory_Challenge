import validExtensions from "./validExtensions";

 const isValidWebsite = (inputUrl) => {
    try {
      let processedUrl = inputUrl.trim();
      if (
        !processedUrl.startsWith("http://") &&
        !processedUrl.startsWith("https://")
      ) {
        processedUrl = "https://" + processedUrl;
      }

      const urlObj = new URL(processedUrl);

      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return {
          isValid: false,
          message: "Not a valid website URL - must use HTTP or HTTPS protocol",
        };
      }

      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        return {
          isValid: false,
          message: "Invalid hostname",
        };
      }

      if (!urlObj.hostname.includes(".")) {
        return {
          isValid: false,
          message: "Invalid domain format",
        };
      }

      const hasValidExtension = validExtensions.some((ext) =>
        urlObj.hostname.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        return {
          isValid: false,
          message: "Invalid domain extension. Must end with a valid TLD.",
        };
      }

      return {
        isValid: true,
        message: "Valid website URL format",
        processedUrl,
        details: {
          protocol: urlObj.protocol,
          hostname: urlObj.hostname,
          pathname: urlObj.pathname,
          fullUrl: urlObj.href,
        },
      };
    } catch (error) {
      console.log(error);

      return {
        isValid: false,
        message: "Invalid URL format",
      };
    }
  };

  export default isValidWebsite;