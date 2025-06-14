
interface SyncConfig {
  serverUrl?: string;
  syncEnabled: boolean;
}

class SyncDatabase {
  private config: SyncConfig = {
    syncEnabled: false
  };

  // Initialize sync configuration
  initSync(serverUrl?: string) {
    this.config = {
      serverUrl,
      syncEnabled: !!serverUrl
    };
  }

  // Sync local data to server (if configured)
  async syncToServer(data: any, endpoint: string) {
    if (!this.config.syncEnabled || !this.config.serverUrl) {
      console.log('Sync disabled or no server URL configured');
      return data;
    }

    try {
      const response = await fetch(`${this.config.serverUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Sync to server failed, using local data:', error);
    }

    return data;
  }

  // Fetch data from server (if configured)
  async fetchFromServer(endpoint: string) {
    if (!this.config.syncEnabled || !this.config.serverUrl) {
      return null;
    }

    try {
      const response = await fetch(`${this.config.serverUrl}${endpoint}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Fetch from server failed:', error);
    }

    return null;
  }
}

export const syncDB = new SyncDatabase();
