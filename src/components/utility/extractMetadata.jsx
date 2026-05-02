
const extractMetadata = (htmlContent) => {
    const metadata = {
      title: "",
      description: "",
      image: "",
      keywords: "",
      author: "",
      favicon: "",
      lang: "en",
      charset: "UTF-8",
    };

    // Extract title
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }

    // Extract meta tags
    const metaRegex = /<meta[^>]*>/gi;
    const metaTags = htmlContent.match(metaRegex) || [];

    metaTags.forEach((tag) => {
      const nameMatch = tag.match(/name=["']([^"']*)["']/i);
      const propertyMatch = tag.match(/property=["']([^"']*)["']/i);
      const contentMatch = tag.match(/content=["']([^"']*)["']/i);

      if (contentMatch) {
        const content = contentMatch[1];

        if (nameMatch) {
          const name = nameMatch[1].toLowerCase();
          if (name === "description") metadata.description = content;
          else if (name === "keywords") metadata.keywords = content;
          else if (name === "author") metadata.author = content;
        }

        if (propertyMatch) {
          const property = propertyMatch[1].toLowerCase();
          if (property === "og:title" && !metadata.title)
            metadata.title = content;
          else if (property === "og:description" && !metadata.description)
            metadata.description = content;
          else if (property === "og:image") metadata.image = content;
        }
      }
    });

    // Extract favicon
    const faviconMatch = htmlContent.match(
      /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i
    );
    if (faviconMatch) {
      metadata.favicon = faviconMatch[1];
    }

    // Extract language
    const htmlLangMatch = htmlContent.match(/<html[^>]*lang=["']([^"']*)["']/i);
    if (htmlLangMatch) {
      metadata.lang = htmlLangMatch[1];
    }

    return metadata;
  };

  export default  extractMetadata