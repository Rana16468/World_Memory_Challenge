import React, { useState } from 'react';
import { Globe, Check, X, AlertCircle, Shield, Clock, Zap, Info, Lock, Code, Image, FileText, Server, Eye } from 'lucide-react';





export default function WebsiteValidator() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkingStep, setCheckingStep] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const isValidWebsite = (inputUrl) => {
    try {
      let processedUrl = inputUrl.trim();
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }

      const urlObj = new URL(processedUrl);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          isValid: false,
          message: 'Not a valid website URL - must use HTTP or HTTPS protocol'
        };
      }

      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        return {
          isValid: false,
          message: 'Invalid hostname'
        };
      }

      if (!urlObj.hostname.includes('.')) {
        return {
          isValid: false,
          message: 'Invalid domain format'
        };
      }

      const validExtensions = [
        '.com', '.net', '.org', '.edu', '.gov', '.mil', '.int',
        '.ai', '.co', '.io', '.info', '.biz', '.name', '.pro',
        '.us', '.uk', '.ca', '.au', '.de', '.fr', '.jp', '.cn', '.in', '.br', '.mx', '.ru',
        '.it', '.es', '.nl', '.se', '.no', '.dk', '.fi', '.pl', '.tr', '.za', '.sg', '.nz',
        '.app', '.dev', '.tech', '.online', '.store', '.shop', '.blog', '.news', '.media'
      ];
      
      const hasValidExtension = validExtensions.some(ext => 
        urlObj.hostname.toLowerCase().endsWith(ext)
      );
      
      if (!hasValidExtension) {
        return {
          isValid: false,
          message: 'Invalid domain extension. Must end with a valid TLD.'
        };
      }

      return {
        isValid: true,
        message: 'Valid website URL format',
        processedUrl,
        details: {
          protocol: urlObj.protocol,
          hostname: urlObj.hostname,
          pathname: urlObj.pathname,
          fullUrl: urlObj.href
        }
      };
    } catch (error) {

         console.log(error);

      return {
        isValid: false,
        message: 'Invalid URL format'
      };
    }
  };

  const extractMetadata = (htmlContent) => {
    const metadata = {
      title: '',
      description: '',
      image: '',
      keywords: '',
      author: '',
      favicon: '',
      lang: 'en',
      charset: 'UTF-8'
    };

    // Extract title
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }

    // Extract meta tags
    const metaRegex = /<meta[^>]*>/gi;
    const metaTags = htmlContent.match(metaRegex) || [];
    
    metaTags.forEach(tag => {
      const nameMatch = tag.match(/name=["']([^"']*)["']/i);
      const propertyMatch = tag.match(/property=["']([^"']*)["']/i);
      const contentMatch = tag.match(/content=["']([^"']*)["']/i);
      
      if (contentMatch) {
        const content = contentMatch[1];
        
        if (nameMatch) {
          const name = nameMatch[1].toLowerCase();
          if (name === 'description') metadata.description = content;
          else if (name === 'keywords') metadata.keywords = content;
          else if (name === 'author') metadata.author = content;
        }
        
        if (propertyMatch) {
          const property = propertyMatch[1].toLowerCase();
          if (property === 'og:title' && !metadata.title) metadata.title = content;
          else if (property === 'og:description' && !metadata.description) metadata.description = content;
          else if (property === 'og:image') metadata.image = content;
        }
      }
    });

    // Extract favicon
    const faviconMatch = htmlContent.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i);
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

  const detectTechnologies = (htmlContent, headers = {}) => {
    const technologies = [];
    const htmlLower = htmlContent.toLowerCase();
    
    // Framework detection
    if (htmlLower.includes('react') || htmlLower.includes('_react') || htmlLower.includes('data-reactroot')) {
      technologies.push({ name: 'React', category: 'JavaScript Framework', confidence: 'high' });
    }
    
    if (htmlLower.includes('vue') || htmlLower.includes('v-if') || htmlLower.includes('v-for')) {
      technologies.push({ name: 'Vue.js', category: 'JavaScript Framework', confidence: 'medium' });
    }
    
    if (htmlLower.includes('angular') || htmlLower.includes('ng-') || htmlLower.includes('[ng')) {
      technologies.push({ name: 'Angular', category: 'JavaScript Framework', confidence: 'medium' });
    }
    
    if (htmlLower.includes('jquery') || htmlLower.includes('$.') || htmlLower.includes('$j(')) {
      technologies.push({ name: 'jQuery', category: 'JavaScript Library', confidence: 'high' });
    }

    // CMS detection
    if (htmlLower.includes('wp-content') || htmlLower.includes('wordpress')) {
      technologies.push({ name: 'WordPress', category: 'CMS', confidence: 'high' });
    }
    
    if (htmlLower.includes('drupal') || htmlLower.includes('sites/default/files')) {
      technologies.push({ name: 'Drupal', category: 'CMS', confidence: 'medium' });
    }
    
    if (htmlLower.includes('joomla') || htmlLower.includes('administrator/templates')) {
      technologies.push({ name: 'Joomla', category: 'CMS', confidence: 'medium' });
    }

    // CSS Frameworks
    if (htmlLower.includes('bootstrap') || htmlLower.includes('col-md-') || htmlLower.includes('btn-primary')) {
      technologies.push({ name: 'Bootstrap', category: 'CSS Framework', confidence: 'high' });
    }
    
    if (htmlLower.includes('tailwind') || htmlLower.includes('tw-')) {
      technologies.push({ name: 'Tailwind CSS', category: 'CSS Framework', confidence: 'medium' });
    }

    // Analytics & Tracking
    if (htmlLower.includes('google-analytics') || htmlLower.includes('gtag')) {
      technologies.push({ name: 'Google Analytics', category: 'Analytics', confidence: 'high' });
    }
    
    if (htmlLower.includes('facebook.com/tr') || htmlLower.includes('fbevents')) {
      technologies.push({ name: 'Facebook Pixel', category: 'Analytics', confidence: 'high' });
    }

    // Web Servers (from headers)
    if (headers['server']) {
      const server = headers['server'].toLowerCase();
      if (server.includes('nginx')) {
        technologies.push({ name: 'Nginx', category: 'Web Server', confidence: 'high' });
      } else if (server.includes('apache')) {
        technologies.push({ name: 'Apache', category: 'Web Server', confidence: 'high' });
      } else if (server.includes('cloudflare')) {
        technologies.push({ name: 'Cloudflare', category: 'CDN', confidence: 'high' });
      }
    }

    // E-commerce
    if (htmlLower.includes('shopify') || htmlLower.includes('shop.js')) {
      technologies.push({ name: 'Shopify', category: 'E-commerce', confidence: 'high' });
    }
    
    if (htmlLower.includes('woocommerce') || htmlLower.includes('wc-')) {
      technologies.push({ name: 'WooCommerce', category: 'E-commerce', confidence: 'high' });
    }

    return technologies;
  };

  const getSecurityInfo = (url, headers = {}) => {
    const security = {
      ssl: url.startsWith('https://'),
      hsts: headers['strict-transport-security'] ? true : false,
      csp: headers['content-security-policy'] ? true : false,
      xframe: headers['x-frame-options'] ? true : false,
      xss: headers['x-xss-protection'] ? true : false,
      score: 0
    };

    // Calculate security score
    if (security.ssl) security.score += 20;
    if (security.hsts) security.score += 20;
    if (security.csp) security.score += 20;
    if (security.xframe) security.score += 20;
    if (security.xss) security.score += 20;

    return security;
  };

  const fetchSiteData = async (url) => {
    setCheckingStep('Fetching site content...');
    
    try {
      const proxyUrl = `${import.meta.env.VITE_ALL_ORIGINS}/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const htmlContent = data.contents;
      
      setCheckingStep('Extracting metadata...');
      const metadata = extractMetadata(htmlContent);
      
      setCheckingStep('Detecting technologies...');
      const technologies = detectTechnologies(htmlContent, {});
      
      setCheckingStep('Analyzing security...');
      const security = getSecurityInfo(url, {});
      
      return {
        exists: true,
        method: 'Content Analysis',
        metadata,
        technologies,
        security,
        contentLength: htmlContent.length,
        htmlPreview: htmlContent.substring(0, 500) + '...'
      };
    } catch (error) {
      throw new Error(`Failed to fetch site data: ${error.message}`);
    }
  };

  const verifyWebsiteExists = async (url) => {
    try {
      // First try DNS resolution
      setCheckingStep('Checking DNS resolution...');
      const hostname = new URL(url).hostname;
      const dnsResponse = await fetch(`${import.meta.env.VITE_DNS_RESOLVE}/resolve?name=${hostname}&type=A`);
      
      if (dnsResponse.ok) {
        const dnsData = await dnsResponse.json();
        if (dnsData.Answer && dnsData.Answer.length > 0) {
          // DNS successful, now try to fetch content
          try {
            const siteData = await fetchSiteData(url);
            return {
              ...siteData,
              dns: {
                resolved: true,
                ip: dnsData.Answer[0].data
              }
            };
          } catch (fetchError) {
            console.log(fetchError)
            return {
              exists: true,
              method: 'DNS Check Only',
              message: 'Domain exists but content not accessible',
              dns: {
                resolved: true,
                ip: dnsData.Answer[0].data
              }
            };
          }
        }
      }
      
      // Fallback to basic existence check
      return {
        exists: false,
        method: 'All methods failed',
        message: 'Unable to verify website accessibility'
      };
    } catch (error) {
      return {
        exists: false,
        method: 'Error',
        message: error.message
      };
    }
  };

  const handleCheck = async () => {
    if (!url.trim()) {
      setResult({
        isValid: false,
        message: 'Please enter a URL to check'
      });
      return;
    }

    setIsChecking(true);
    setCheckingStep('Validating URL format...');
    
    try {
      const validation = isValidWebsite(url.trim());
      
      if (!validation.isValid) {
        setResult(validation);
        return;
      }

      const existsCheck = await verifyWebsiteExists(validation.processedUrl);
      
      setResult({
        isValid: validation.isValid && existsCheck.exists,
        message: existsCheck.exists ? 
          `✅ Website verified: ${existsCheck.message || 'Site is accessible'}` : 
          `❌ Website verification failed: ${existsCheck.message}`,
        details: validation.details,
        verification: existsCheck
      });
    } catch (error) {
      setResult({
        isValid: false,
        message: `❌ Verification error: ${error.message}`,
        verification: { exists: false, error: error.message }
      });
    } finally {
      setIsChecking(false);
      setCheckingStep('');
    }
  };

  const handleInputChange = (e) => {
    setUrl(e.target.value);
    setResult(null);
  };

  const getStatusIcon = () => {
    if (isChecking) return <AlertCircle className="w-5 h-5 text-blue-500 animate-spin" />;
    if (result?.isValid) return <Check className="w-5 h-5 text-green-500" />;
    if (result && !result.isValid) return <X className="w-5 h-5 text-red-500" />;
    return null;
  };

  const getStatusColor = () => {
    if (isChecking) return 'border-blue-300 bg-blue-50';
    if (result?.isValid) return 'border-green-300 bg-green-50';
    if (result && !result.isValid) return 'border-red-300 bg-red-50';
    return 'border-gray-300 bg-white';
  };

  const getSecurityColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // eslint-disable-next-line no-unused-vars
  const TabButton = ({ id, label, icon: Icon, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
   <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 opacity-10 animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 opacity-15 animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 text-white">
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <Globe className="w-8 h-8 text-white animate-pulse" />
                <Shield className="w-5 h-5 text-emerald-300 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold">Advanced Website Analyzer</h1>
                <p className="text-sm text-white/90">Complete website validation & security analysis</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 space-y-4">
            {/* Input Section */}
            <div className="relative group">
              <input
                type="text"
                value={url}
                onChange={handleInputChange}
                placeholder="Enter website URL (e.g., facebook.com, https://www.google.com)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all duration-300 text-sm bg-white/50 backdrop-blur-sm group-hover:bg-white/70"
              />
              {isChecking && (
                <div className="absolute right-3 top-3">
                  <Zap className="w-5 h-5 text-purple-500 animate-spin" />
                </div>
              )}
            </div>

            {/* Status & Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCheck}
                disabled={isChecking}
                className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/25"
              >
                {isChecking ? (
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Analyze Website
                  </div>
                )}
              </button>
            </div>

            {/* Progress Indicator */}
            {isChecking && checkingStep && (
              <div className="flex items-center justify-center gap-2 text-purple-600 bg-purple-50 p-3 rounded-xl">
                <Clock className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">{checkingStep}</span>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className={`rounded-xl border-2 transition-all duration-500 shadow-lg ${getStatusColor()}`}>
                <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                  {getStatusIcon()}
                  <div className="flex-1">
                    <span className={`font-semibold text-lg ${result.isValid ? 'text-emerald-700' : 'text-red-700'}`}>
                      {result.isValid ? 'Analysis Complete' : 'Analysis Failed'}
                    </span>
                    <p className={`text-sm ${result.isValid ? 'text-emerald-600' : 'text-red-600'}`}>
                      {result.message}
                    </p>
                  </div>
                </div>

                {result.isValid && result.verification && (
                  <div className="p-4 space-y-4">
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl">
                      <TabButton id="overview" label="Overview" icon={Info} active={activeTab === 'overview'} />
                      <TabButton id="metadata" label="Metadata" icon={FileText} active={activeTab === 'metadata'} />
                      <TabButton id="technologies" label="Tech" icon={Code} active={activeTab === 'technologies'} />
                      <TabButton id="security" label="Security" icon={Lock} active={activeTab === 'security'} />
                      <TabButton id="technical" label="Technical" icon={Server} active={activeTab === 'technical'} />
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                      {activeTab === 'overview' && (
                        <div className="p-4">
                          <h4 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                            <Globe className="w-5 h-5 mr-2 text-blue-600" />
                            Overview
                          </h4>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                              <div className="text-xs text-gray-600">Protocol</div>
                              <div className="text-sm font-semibold text-blue-600">{result.details.protocol}</div>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                              <div className="text-xs text-gray-600">Domain</div>
                              <div className="text-sm font-semibold text-green-600">{result.details.hostname}</div>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                              <div className="text-xs text-gray-600">SSL</div>
                              <div className="text-sm font-semibold text-purple-600">
                                {result.verification.security?.ssl ? '✅ Yes' : '❌ No'}
                              </div>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                              <div className="text-xs text-gray-600">IP Address</div>
                              <div className="text-sm font-semibold text-amber-600">{result.verification.dns?.ip}</div>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
                              <div className="text-xs text-gray-600">Method</div>
                              <div className="text-sm font-semibold text-pink-600">{result.verification.method}</div>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                              <div className="text-xs text-gray-600">Size</div>
                              <div className="text-sm font-semibold text-cyan-600">{result.verification.contentLength?.toLocaleString()} bytes</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'metadata' && (
                        <div className="p-4">
                          <h4 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-purple-600" />
                            Metadata
                          </h4>
                          {result.verification.metadata ? (
                            <div className="space-y-3">
                              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                <div className="text-xs text-gray-600">Title</div>
                                <div className="text-sm font-medium text-gray-800">{result.verification.metadata.title || 'Not found'}</div>
                              </div>
                              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                <div className="text-xs text-gray-600">Description</div>
                                <div className="text-sm text-gray-800">{result.verification.metadata.description || 'Not found'}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                                  <div className="text-xs text-gray-600">Language</div>
                                  <div className="text-sm font-semibold text-purple-600">{result.verification.metadata.lang}</div>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                                  <div className="text-xs text-gray-600">Charset</div>
                                  <div className="text-sm font-semibold text-amber-600">{result.verification.metadata.charset}</div>
                                </div>
                              </div>
                              {result.verification.metadata.image && (
                                <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
                                  <div className="text-xs text-gray-600 mb-2">Preview</div>
                                  <img src={result.verification.metadata.image} alt="Site preview" className="w-32 h-16 object-cover rounded-lg border border-gray-200" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">Metadata not available</p>
                          )}
                        </div>
                      )}

                      {activeTab === 'technologies' && (
                        <div className="p-4">
                          <h4 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                            <Code className="w-5 h-5 mr-2 text-green-600" />
                            Technologies
                          </h4>
                          {result.verification.technologies && result.verification.technologies.length > 0 ? (
                            <div className="space-y-2">
                              {result.verification.technologies.map((tech, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg hover:from-gray-100 hover:to-slate-100 transition-all duration-200">
                                  <div>
                                    <div className="font-semibold text-sm text-gray-900">{tech.name}</div>
                                    <div className="text-xs text-gray-600">{tech.category}</div>
                                  </div>
                                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                    tech.confidence === 'high' ? 'bg-green-100 text-green-700' :
                                    tech.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {tech.confidence}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No technologies detected</p>
                          )}
                        </div>
                      )}

                      {activeTab === 'security' && (
                        <div className="p-4">
                          <h4 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                            <Lock className="w-5 h-5 mr-2 text-red-600" />
                            Security
                          </h4>
                          {result.verification.security ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Security Score</span>
                                <span className={`text-xl font-bold ${getSecurityColor(result.verification.security.score)}`}>
                                  {result.verification.security.score}/100
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                  <span className="text-xs text-gray-600">SSL/TLS</span>
                                  <span className={`text-sm font-semibold ${result.verification.security.ssl ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.verification.security.ssl ? '✅' : '❌'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                                  <span className="text-xs text-gray-600">HSTS</span>
                                  <span className={`text-sm font-semibold ${result.verification.security.hsts ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.verification.security.hsts ? '✅' : '❌'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                                  <span className="text-xs text-gray-600">CSP</span>
                                  <span className={`text-sm font-semibold ${result.verification.security.csp ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.verification.security.csp ? '✅' : '❌'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
                                  <span className="text-xs text-gray-600">X-Frame</span>
                                  <span className={`text-sm font-semibold ${result.verification.security.xframe ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.verification.security.xframe ? '✅' : '❌'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">Security analysis not available</p>
                          )}
                        </div>
                      )}

                      {activeTab === 'technical' && (
                        <div className="p-4">
                          <h4 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                            <Server className="w-5 h-5 mr-2 text-indigo-600" />
                            Technical
                          </h4>
                          <div className="space-y-3">
                            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                              <div className="text-xs text-gray-600">Full URL</div>
                              <div className="text-sm font-medium text-blue-600 break-all">{result.details.fullUrl}</div>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                              <div className="text-xs text-gray-600">Content Length</div>
                              <div className="text-sm font-semibold text-green-600">{result.verification.contentLength?.toLocaleString()} bytes</div>
                            </div>
                            {result.verification.htmlPreview && (
                              <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
                                <div className="text-xs text-gray-600 mb-2">HTML Preview</div>
                                <pre className="text-xs p-2 bg-gray-900 text-green-400 rounded-lg overflow-x-auto font-mono max-h-32 overflow-y-auto">
                                  {result.verification.htmlPreview}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}