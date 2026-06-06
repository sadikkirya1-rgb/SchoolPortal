/**
 * UGANDA SCHOOL ERP - SIDEBAR CONTROLLER
 * Handles navigation, role-based visibility, search, favorites, and more
 */

class SidebarController {
  constructor() {
    this.menuStructure = null;
    this.currentUser = null;
    this.favorites = this.loadFavorites();
    this.collapsedGroups = this.loadCollapsedGroups();
    this.isDarkMode = this.loadDarkModePreference();
    this.init();
    window.sidebarInstance = this;
  }

  async init() {
    // Load menu structure
    await this.loadMenuStructure();
    // Initialize event listeners
    this.attachEventListeners();
    // Render sidebar
    this.renderSidebar();
    // Apply dark mode if enabled
    if (this.isDarkMode) {
      this.enableDarkMode();
    }
  }

  async loadMenuStructure() {
    try {
      const response = await fetch('./menu-structure.json');
      const data = await response.json();
      this.menuStructure = data;
    } catch (error) {
      console.error('Failed to load menu structure:', error);
    }
  }

  // Load current user from localStorage
  loadCurrentUser() {
    const session = localStorage.getItem('edumasterAdminSession');
    if (session) {
      try {
        this.currentUser = JSON.parse(session);
        return this.currentUser;
      } catch (error) {
        console.error('Failed to parse user session:', error);
      }
    }
    return null;
  }

  // Filter menu items based on user role
  filterMenuByRole(menuItems, userRole) {
    return menuItems.filter(item => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.includes(userRole);
    }).map(item => ({
      ...item,
      children: item.children ? this.filterMenuByRole(item.children, userRole) : []
    }));
  }

  // Render the sidebar menu
  renderSidebar() {
    const user = this.loadCurrentUser();
    if (!user) {
      console.warn('No user session found');
      return;
    }

    const userRole = this.getUserRoleId(user.role);
    const mainMenu = document.getElementById('mainMenu');
    
    if (!mainMenu || !this.menuStructure) return;

    mainMenu.innerHTML = '';

    // Update user info display
    this.updateUserDisplay(user);

    // Filter menu by role
    const filteredMenu = this.filterMenuByRole(this.menuStructure.navigation, userRole);

    // Render menu items
    filteredMenu.forEach(item => {
      const menuGroup = this.createMenuGroup(item, userRole);
      if (menuGroup) {
        mainMenu.appendChild(menuGroup);
      }
    });

    // Attach click handlers to collapsed groups
    this.attachCollapsibleHandlers();
  }

  // Create menu group element
  createMenuGroup(item, userRole) {
    const menuItem = document.createElement('li');
    menuItem.className = 'menu-item';
    
    if (item.children && item.children.length > 0) {
      menuItem.classList.add('has-submenu');
      if (this.collapsedGroups.includes(item.id)) {
        menuItem.classList.add('expanded');
      }

      const link = this.createMenuLink(item);
      link.appendChild(this.createToggleButton());
      
      menuItem.appendChild(link);
      menuItem.appendChild(this.createSubmenu(item.children, userRole));
    } else {
      const link = this.createMenuLink(item);
      menuItem.appendChild(link);
    }

    return menuItem;
  }

  // Create menu link element
  createMenuLink(item) {
    const link = document.createElement('a');
    link.href = item.href || '#';
    link.className = 'menu-item-link';

    // Icon
    const icon = document.createElement('span');
    icon.className = 'menu-item-icon';
    icon.innerHTML = `<i class="${item.icon}"></i>`;
    link.appendChild(icon);

    // Label
    const label = document.createElement('span');
    label.className = 'menu-item-label';
    label.textContent = item.label;
    link.appendChild(label);

    // Badge if applicable
    if (item.badge) {
      const badge = document.createElement('span');
      badge.className = 'menu-item-badge';
      badge.dataset.badgeKey = item.badge;
      badge.textContent = this.getBadgeCount(item.badge);
      link.appendChild(badge);
    }

    return link;
  }

  // Create toggle button for collapsible items
  createToggleButton() {
    const toggle = document.createElement('span');
    toggle.className = 'menu-item-toggle';
    toggle.innerHTML = '<i class="fas fa-chevron-right"></i>';
    return toggle;
  }

  // Create submenu
  createSubmenu(children, userRole) {
    const submenu = document.createElement('ul');
    submenu.className = 'submenu';

    children.forEach(child => {
      if (!child.roles || child.roles.includes(userRole)) {
        const submenuItem = document.createElement('li');
        submenuItem.className = 'submenu-item';

        const link = document.createElement('a');
        link.href = child.href || '#';
        link.className = 'submenu-link';

        const icon = document.createElement('span');
        icon.className = 'submenu-icon';
        icon.innerHTML = `<i class="${child.icon}"></i>`;
        link.appendChild(icon);

        const label = document.createElement('span');
        label.textContent = child.label;
        link.appendChild(label);

        if (child.badge) {
          const badge = document.createElement('span');
          badge.className = 'menu-item-badge';
          badge.dataset.badgeKey = child.badge;
          badge.textContent = this.getBadgeCount(child.badge);
          link.appendChild(badge);
        }

        submenuItem.appendChild(link);
        submenu.appendChild(submenuItem);
      }
    });

    return submenu;
  }

  // Get badge count (mock data)
  getBadgeCount(badgeKey) {
    const badgeData = {
      'pending_count': 5,
      'new_count': 8,
      'scheduled_count': 3,
      'waiting_count': 2,
      'pending_transfer': 1,
      'unread_count': 12,
      'upcoming_count': 4,
      'urgent_count': 1,
      'low_stock_count': 7,
      'open_count': 2,
      'unsent_count': 10,
      'active_count': 3,
      'live_count': 1,
      'unpaid_count': 15
    };
    return badgeData[badgeKey] || 0;
  }

  // Update user display info
  updateUserDisplay(user) {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) userName.textContent = user.name || user.userId || 'Administrator';
    if (userRole) userRole.textContent = user.role || 'User';
    if (userAvatar) {
      userAvatar.src = this.getAvatarUrl(user.userId);
      userAvatar.alt = user.name || 'User';
    }
  }

  // Get avatar URL based on user ID
  getAvatarUrl(userId) {
    const avatars = {
      'Admin': 'https://i.pravatar.cc/48?img=1&u=admin',
      'Principal': 'https://i.pravatar.cc/48?img=2&u=principal',
      'Teacher': 'https://i.pravatar.cc/48?img=3&u=teacher',
      'Bursar': 'https://i.pravatar.cc/48?img=4&u=bursar'
    };
    return avatars[userId] || `https://i.pravatar.cc/48?u=${userId}`;
  }

  // Attach event listeners
  attachEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => this.toggleSidebar());
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    }

    // Menu search
    const menuSearch = document.getElementById('menuSearch');
    if (menuSearch) {
      menuSearch.addEventListener('keyup', (e) => this.searchMenu(e.target.value));
    }

    // Favorites toggle
    const favoritesBtn = document.getElementById('favoritesBtn');
    if (favoritesBtn) {
      favoritesBtn.addEventListener('click', () => this.toggleFavoritesMode());
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Sidebar overlay (mobile)
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => this.closeMobileSidebar());
    }
  }

  // Attach collapsible menu handlers
  attachCollapsibleHandlers() {
    const menuItems = document.querySelectorAll('.menu-item.has-submenu');
    menuItems.forEach(item => {
      const link = item.querySelector('.menu-item-link');
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleMenuGroup(item);
        });
      }
    });

    // Active state handling
    const allLinks = document.querySelectorAll('.menu-item-link, .submenu-link');
    allLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-item-toggle')) {
          allLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    });
  }

  // Toggle menu group
  toggleMenuGroup(item) {
    const isExpanded = item.classList.contains('expanded');
    if (isExpanded) {
      item.classList.remove('expanded');
      const id = this.getMenuItemId(item);
      this.collapsedGroups = this.collapsedGroups.filter(g => g !== id);
    } else {
      item.classList.add('expanded');
      const id = this.getMenuItemId(item);
      if (!this.collapsedGroups.includes(id)) {
        this.collapsedGroups.push(id);
      }
    }
    this.saveCollapsedGroups();
  }

  // Get menu item ID
  getMenuItemId(item) {
    const link = item.querySelector('.menu-item-link');
    if (link && link.href) {
      return link.href.split('/').pop();
    }
    return null;
  }

  // Toggle sidebar
  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar-wrapper');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
  }

  // Toggle dark mode
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
    this.saveDarkModePreference();
  }

  // Enable dark mode
  enableDarkMode() {
    document.body.classList.add('dark-mode');
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.querySelector('i').className = 'fas fa-sun';
    }
  }

  // Disable dark mode
  disableDarkMode() {
    document.body.classList.remove('dark-mode');
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.querySelector('i').className = 'fas fa-moon';
    }
  }

  // Search menu
  searchMenu(query) {
    const allItems = document.querySelectorAll('.menu-item-link, .submenu-link');
    query = query.toLowerCase().trim();

    allItems.forEach(item => {
      const label = item.querySelector('.menu-item-label')?.textContent || 
                   item.textContent;
      const matches = label.toLowerCase().includes(query);
      
      const parentItem = item.closest('.menu-item');
      if (parentItem) {
        parentItem.style.display = matches ? 'block' : 'none';
      }
    });

    // Show parent groups if any child matches
    const menuItems = document.querySelectorAll('.menu-item.has-submenu');
    menuItems.forEach(item => {
      const submenu = item.querySelector('.submenu');
      if (submenu) {
        const visibleChildren = Array.from(submenu.querySelectorAll('.submenu-item'))
          .some(child => child.style.display !== 'none');
        
        if (visibleChildren || query === '') {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      }
    });
  }

  // Toggle favorites mode
  toggleFavoritesMode() {
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu) {
      mainMenu.classList.toggle('favorites-mode');
      const favoritesBtn = document.getElementById('favoritesBtn');
      if (favoritesBtn) {
        favoritesBtn.style.color = mainMenu.classList.contains('favorites-mode') 
          ? '#fbbf24' 
          : '#475569';
      }
    }
  }

  // Add to favorites
  addToFavorites(menuId) {
    if (!this.favorites.includes(menuId)) {
      this.favorites.push(menuId);
      this.saveFavorites();
    }
  }

  // Remove from favorites
  removeFromFavorites(menuId) {
    this.favorites = this.favorites.filter(id => id !== menuId);
    this.saveFavorites();
  }

  // Save favorites to localStorage
  saveFavorites() {
    localStorage.setItem('sidebarFavorites', JSON.stringify(this.favorites));
  }

  // Load favorites from localStorage
  loadFavorites() {
    const stored = localStorage.getItem('sidebarFavorites');
    return stored ? JSON.parse(stored) : [];
  }

  // Save collapsed groups to localStorage
  saveCollapsedGroups() {
    localStorage.setItem('sidebarCollapsedGroups', JSON.stringify(this.collapsedGroups));
  }

  // Load collapsed groups from localStorage
  loadCollapsedGroups() {
    const stored = localStorage.getItem('sidebarCollapsedGroups');
    return stored ? JSON.parse(stored) : [];
  }

  // Save dark mode preference
  saveDarkModePreference() {
    localStorage.setItem('sidebarDarkMode', this.isDarkMode);
  }

  // Load dark mode preference
  loadDarkModePreference() {
    const stored = localStorage.getItem('sidebarDarkMode');
    return stored === 'true';
  }

  // Get user role ID from role name
  getUserRoleId(roleName) {
    const roleMap = {
      'Super Admin': 'super_admin',
      'Director': 'director',
      'Head Teacher': 'head_teacher',
      'Deputy Head Teacher': 'deputy_head',
      'Bursar': 'bursar',
      'Teacher': 'teacher',
      'Librarian': 'librarian',
      'HR Officer': 'hr_officer',
      'Store Manager': 'store_manager',
      'Parent': 'parent',
      'Student': 'student',
      'Deputy Head Teacher': 'deputy_head'
    };
    return roleMap[roleName] || 'student';
  }

  // Close mobile sidebar
  closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar-wrapper');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('active');
  }

  // Logout
  logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('edumasterAdminSession');
      window.location.href = '#/login';
    }
  }
}

// Initialize sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SidebarController();
});
