
interface User {
  id: string;
  name: string;
  phone: string;
  role: 'technician' | 'admin';
  password: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
}

interface CurrentUser {
  id: string;
  name: string;
  phone: string;
  role: 'technician' | 'admin';
}

class LocalDatabase {
  // Get all registration requests
  getRegistrationRequests(): User[] {
    return JSON.parse(localStorage.getItem('registrationRequests') || '[]');
  }

  // Get approved users only
  getApprovedUsers(): User[] {
    const requests = this.getRegistrationRequests();
    return requests.filter(user => user.status === 'approved');
  }

  // Add new registration request
  addRegistrationRequest(userData: Omit<User, 'id' | 'createdAt' | 'status'>): User {
    const requests = this.getRegistrationRequests();
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    requests.push(newUser);
    localStorage.setItem('registrationRequests', JSON.stringify(requests));
    return newUser;
  }

  // Update user status (approve/reject)
  updateUserStatus(userId: string, status: 'approved' | 'rejected'): boolean {
    const requests = this.getRegistrationRequests();
    const userIndex = requests.findIndex(user => user.id === userId);
    
    if (userIndex === -1) return false;
    
    requests[userIndex].status = status;
    if (status === 'approved') {
      requests[userIndex].approvedAt = new Date().toISOString();
    }
    
    localStorage.setItem('registrationRequests', JSON.stringify(requests));
    return true;
  }

  // Delete user completely
  deleteUser(userId: string): boolean {
    const requests = this.getRegistrationRequests();
    const filteredRequests = requests.filter(user => user.id !== userId);
    
    if (filteredRequests.length === requests.length) return false;
    
    localStorage.setItem('registrationRequests', JSON.stringify(filteredRequests));
    return true;
  }

  // Authenticate user
  authenticateUser(phone: string, password: string): CurrentUser | null {
    const approvedUsers = this.getApprovedUsers();
    const user = approvedUsers.find(u => u.phone === phone && u.password === password);
    
    if (user) {
      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      };
    }
    
    return null;
  }

  // Set current logged-in user
  setCurrentUser(user: CurrentUser): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Get current logged-in user
  getCurrentUser(): CurrentUser | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // Clear current user session
  clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
  }

  // Check if phone number is already registered
  isPhoneRegistered(phone: string): boolean {
    const requests = this.getRegistrationRequests();
    return requests.some(user => user.phone === phone);
  }
}

export const localDB = new LocalDatabase();
export type { User, CurrentUser };
