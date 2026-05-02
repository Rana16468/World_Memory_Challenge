// Configuration for scalability
export const CONFIG = {
  API_BASE_URL: "",
  BATCH_SIZE: 10,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  QUEUE_FLUSH_INTERVAL: 5000,
  WEATHER_API_KEY: "", // Replace with your actual API key
  ENABLE_OFFLINE_MODE: true,
  MAX_CONCURRENT_REQUESTS: 3
};
// Enhanced API service with retry logic, batching, and queue management
export class APIService {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
    this.activeRequests = 0;
    this.offlineQueue = [];
    this.retryQueue = [];
    
    // Start queue processor
    this.startQueueProcessor();
    
    // Listen for online/offline events
    this.setupNetworkListeners();
  }

  // Generate unique request ID
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add request to queue with priority
  enqueueRequest(endpoint, data, priority = 1) {
    const requestId = this.generateRequestId();
    const request = {
      id: requestId,
      endpoint,
      data,
      priority,
      timestamp: Date.now(),
      attempts: 0
    };

    this.requestQueue.push(request);
    this.requestQueue.sort((a, b) => b.priority - a.priority);
    
    return requestId;
  }

  // Process queue with concurrency control
  async startQueueProcessor() {
    setInterval(async () => {
      if (this.isProcessing || this.requestQueue.length === 0) return;
      
      this.isProcessing = true;
      
      try {
        // Process requests in batches
        const batch = this.requestQueue.splice(0, CONFIG.BATCH_SIZE);
        await this.processBatch(batch);
      } catch (error) {
        console.error('Queue processing error:', error);
      } finally {
        this.isProcessing = false;
      }
    }, CONFIG.QUEUE_FLUSH_INTERVAL);
  }

  // Process batch of requests with concurrency control
  async processBatch(batch) {
    const promises = batch.map(request => this.processRequest(request));
    
    // Use Promise.allSettled to handle partial failures
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const request = batch[index];
        this.handleRequestFailure(request, result.reason);
      }
    });
  }

  // Process individual request with retry logic
  async processRequest(request) {
    if (this.activeRequests >= CONFIG.MAX_CONCURRENT_REQUESTS) {
      // Re-queue for later processing
      this.requestQueue.unshift(request);
      return;
    }

    this.activeRequests++;
    
    try {
      const response = await this.makeRequest(request.endpoint, request.data);
      console.log(`Request ${request.id} completed successfully`);
      return response;
    } catch (error) {
        console.log(error)
    } finally {
      this.activeRequests--;
    }
  }

  // Make HTTP request with timeout and error handling
  async makeRequest(endpoint, data) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": this.generateRequestId(),
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Handle request failures with retry logic
  handleRequestFailure(request, error) {
    request.attempts++;
    
    if (request.attempts < CONFIG.RETRY_ATTEMPTS) {
      // Exponential backoff
      const delay = CONFIG.RETRY_DELAY * Math.pow(2, request.attempts - 1);
      
      setTimeout(() => {
        this.retryQueue.push(request);
      }, delay);
    } else {
      // Store in offline queue for later retry
      if (CONFIG.ENABLE_OFFLINE_MODE) {
        this.offlineQueue.push(request);
      }
      console.error(`Request ${request.id} failed after ${request.attempts} attempts:`, error);
    }
  }

  // Setup network listeners for offline/online handling
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('Connection restored. Processing offline queue...');
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost. Enabling offline mode...');
    });
  }

  // Process offline queue when connection is restored
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;
    
    const offlineRequests = [...this.offlineQueue];
    this.offlineQueue = [];
    
    // Reset attempt count for offline requests
    offlineRequests.forEach(request => request.attempts = 0);
    
    // Add back to main queue
    this.requestQueue.push(...offlineRequests);
  }

  // Public method to send data
  sendData(endpoint, data, priority = 1) {

    console.log({endpoint, data})
    if (!navigator.onLine && !CONFIG.ENABLE_OFFLINE_MODE) {
      console.warn('No internet connection and offline mode is disabled');
      return null;
    }
console.log("result");
    console.log(this.enqueueRequest(endpoint, data, priority))

    return this.enqueueRequest(endpoint, data, priority);
  }
}

// Data collection service with deduplication and validation
export class DataCollectionService {
  constructor(apiService) {
    this.apiService = apiService;
    this.collectedData = new Set();
    this.dataCache = new Map();
  }

  // Check if data already exists to prevent duplicates
  isDuplicate(endpoint, data) {
    const key = `${endpoint}_${JSON.stringify(data)}`;
    return this.collectedData.has(key);
  }

  // Mark data as collected
  markAsCollected(endpoint, data) {
    const key = `${endpoint}_${JSON.stringify(data)}`;
    this.collectedData.add(key);
  }

  // Validate data before sending
  validateData(data) {
    if (!data || typeof data !== 'object') return false;
    
    // Check for required fields based on data type
    if (data.visitorId && typeof data.visitorId !== 'string') return false;
    
    return true;
  }

  // Send data with validation and deduplication
  async sendData(endpoint, data, priority = 1) {
    if (!this.validateData(data)) {
      console.warn('Invalid data format:', data);
      return null;
    }

    if (this.isDuplicate(endpoint, data)) {
      console.log('Duplicate data detected, skipping:', endpoint);
      return null;
    }

    this.markAsCollected(endpoint, data);
    return this.apiService.sendData(endpoint, data, priority);
  }
}

