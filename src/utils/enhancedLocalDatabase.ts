
import { syncDB } from './syncDatabase';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'technician' | 'admin' | 'call_center';
  password: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  lastSync?: string;
}

interface CurrentUser {
  id: string;
  name: string;
  phone: string;
  role: 'technician' | 'admin' | 'call_center';
}

class EnhancedLocalDatabase {
  private generateCacheBuster(): string {
    return Date.now().toString() + Math.random().toString(36);
  }

  private getStorageKey(key: string): string {
    return `${key}_${this.generateCacheBuster()}`;
  }

  // Clear all cache and force refresh
  clearAllCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('_cache_') || key.includes('_temp_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Force page refresh without cache
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  // Get all registration requests with sync support
  async getRegistrationRequests(): Promise<User[]> {
    try {
      // Try to fetch from server first
      const serverData = await syncDB.fetchFromServer('/api/users');
      if (serverData) {
        localStorage.setItem('registrationRequests', JSON.stringify(serverData));
        return serverData;
      }
    } catch (error) {
      console.warn('Server fetch failed, using local data');
    }

    const localData = JSON.parse(localStorage.getItem('registrationRequests') || '[]');
    return localData;
  }

  // Get approved users only
  async getApprovedUsers(): Promise<User[]> {
    const requests = await this.getRegistrationRequests();
    return requests.filter(user => user.status === 'approved');
  }

  // Add new registration request with sync
  async addRegistrationRequest(userData: Omit<User, 'id' | 'createdAt' | 'status'>): Promise<User> {
    const requests = await this.getRegistrationRequests();
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      lastSync: new Date().toISOString()
    };
    
    requests.push(newUser);
    localStorage.setItem('registrationRequests', JSON.stringify(requests));

    // Try to sync to server
    try {
      await syncDB.syncToServer(newUser, '/api/users/register');
    } catch (error) {
      console.warn('Failed to sync new user to server');
    }

    return newUser;
  }

  // Update user status with sync
  async updateUserStatus(userId: string, status: 'approved' | 'rejected'): Promise<boolean> {
    const requests = await this.getRegistrationRequests();
    const userIndex = requests.findIndex(user => user.id === userId);
    
    if (userIndex === -1) return false;
    
    requests[userIndex].status = status;
    requests[userIndex].lastSync = new Date().toISOString();
    if (status === 'approved') {
      requests[userIndex].approvedAt = new Date().toISOString();
    }
    
    localStorage.setItem('registrationRequests', JSON.stringify(requests));

    // Try to sync to server
    try {
      await syncDB.syncToServer(
        { userId, status, timestamp: new Date().toISOString() },
        '/api/users/update-status'
      );
    } catch (error) {
      console.warn('Failed to sync user status to server');
    }

    return true;
  }

  // Delete user with sync
  async deleteUser(userId: string): Promise<boolean> {
    const requests = await this.getRegistrationRequests();
    const filteredRequests = requests.filter(user => user.id !== userId);
    
    if (filteredRequests.length === requests.length) return false;
    
    localStorage.setItem('registrationRequests', JSON.stringify(filteredRequests));

    // Try to sync deletion to server
    try {
      await syncDB.syncToServer({ userId }, '/api/users/delete');
    } catch (error) {
      console.warn('Failed to sync user deletion to server');
    }

    return true;
  }

  // Authenticate user with enhanced online support
  async authenticateUser(phone: string, password: string): Promise<CurrentUser | null> {
    try {
      // Try server authentication first
      const serverAuth = await syncDB.syncToServer(
        { phone, password },
        '/api/auth/login'
      );
      
      if (serverAuth && serverAuth.user) {
        this.setCurrentUser(serverAuth.user);
        return serverAuth.user;
      }
    } catch (error) {
      console.warn('Server authentication failed, trying local');
    }

    // Fallback to local authentication
    const approvedUsers = await this.getApprovedUsers();
    const user = approvedUsers.find(u => u.phone === phone && u.password === password);
    
    if (user) {
      const currentUser = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      };
      this.setCurrentUser(currentUser);
      return currentUser;
    }
    
    return null;
  }

  // Set current user with no-cache
  setCurrentUser(user: CurrentUser): void {
    const userData = {
      ...user,
      loginTime: new Date().toISOString(),
      sessionId: this.generateCacheBuster()
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Also set in session storage as backup
    sessionStorage.setItem('activeUser', JSON.stringify(userData));
  }

  // Get current user with cache bypass
  getCurrentUser(): CurrentUser | null {
    // Try session storage first (more reliable for active sessions)
    const sessionUser = sessionStorage.getItem('activeUser');
    if (sessionUser) {
      const userData = JSON.parse(sessionUser);
      return {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role
      };
    }

    // Fallback to localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      return {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role
      };
    }
    
    return null;
  }

  // Clear current user session completely
  clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('activeUser');
    
    // Clear any cached user data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('user_') || key.includes('session_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Check if phone is registered with server sync
  async isPhoneRegistered(phone: string): Promise<boolean> {
    const requests = await this.getRegistrationRequests();
    return requests.some(user => user.phone === phone);
  }

  // Force sync all data
  async forceSyncAll(): Promise<void> {
    try {
      const localUsers = JSON.parse(localStorage.getItem('registrationRequests') || '[]');
      await syncDB.syncToServer(localUsers, '/api/users/bulk-sync');
      console.log('تم مزامنة جميع البيانات بنجاح');
    } catch (error) {
      console.warn('فشل في مزامنة البيانات:', error);
    }
  }
}

export const enhancedLocalDB = new EnhancedLocalDatabase();
export type { User, CurrentUser };
