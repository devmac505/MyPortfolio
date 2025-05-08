// Dashboard JavaScript

// Global variables for function access from HTML
window.editTool = null;
window.editService = null;
window.editProject = null;
window.editSkillGroup = null;
window.confirmDelete = null;

document.addEventListener('DOMContentLoaded', function() {

  // API base URL - works for both local and production environments
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://myportfolio-backend-m49z.onrender.com/api';
  const AUTH_URL = `${API_URL}/auth`;

  // Initialize the login page
  checkAuth();

  // Authentication variables
  let isAuthenticated = false;
  let authToken = null;

  // Create alert container for notifications if it doesn't exist
  if (!document.getElementById('alert-container')) {
    const alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '20px';
    alertContainer.style.right = '20px';
    alertContainer.style.zIndex = '9999';
    document.body.appendChild(alertContainer);
  }

  // DOM Elements
  const loginContainer = document.getElementById('login-container');
  const dashboardContainer = document.getElementById('dashboard-container');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = document.querySelectorAll('.dashboard-section');

  // Modal elements
  const toolModalEl = document.getElementById('toolModal');
  const serviceModalEl = document.getElementById('serviceModal');
  const projectModalEl = document.getElementById('projectModal');
  const skillGroupModalEl = document.getElementById('skillGroupModal');
  const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');

  // Button elements
  const addToolBtn = document.getElementById('add-tool-btn');
  const addServiceBtn = document.getElementById('add-service-btn');
  const addProjectBtn = document.getElementById('add-project-btn');
  const addSkillGroupBtn = document.getElementById('add-skill-group-btn');
  const saveToolBtn = document.getElementById('save-tool-btn');
  const saveServiceBtn = document.getElementById('save-service-btn');
  const saveProjectBtn = document.getElementById('save-project-btn');
  const saveSkillGroupBtn = document.getElementById('save-skill-group-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

  // Data containers
  const toolsList = document.getElementById('tools-list');
  const servicesList = document.getElementById('services-list');
  const projectsList = document.getElementById('projects-list');
  const skillsList = document.getElementById('skills-list');

  // Data storage
  let tools = [];
  let services = [];
  let projects = [];
  let skills = [];
  let currentItemToDelete = null;

  // Check if user is already authenticated
  function checkAuth() {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      console.log('Found token in session storage');
      // Verify the token is valid by making a test request
      fetch(`${API_URL}/auth/test-auth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          console.log('Token is valid');
          authToken = token;
          isAuthenticated = true;
          showDashboard();
          loadAllData();
        } else {
          console.error('Token is invalid, showing login form');
          sessionStorage.removeItem('authToken');
          showLoginHelp();
          setupPasswordToggle();
        }
      })
      .catch(error => {
        console.error('Error verifying token:', error);
        sessionStorage.removeItem('authToken');
        showLoginHelp();
        setupPasswordToggle();
      });
    } else {
      console.log('No token found, showing login form');
      // No token found, show login form
      showLoginHelp();
      setupPasswordToggle();
    }
  }

  // Setup password toggle functionality
  function setupPasswordToggle() {
    const passwordField = document.getElementById('password');
    const toggleBtn = document.getElementById('password-toggle');

    if (toggleBtn && passwordField) {
      toggleBtn.addEventListener('click', function() {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);

        // Toggle icon
        const icon = this.querySelector('i');
        if (type === 'text') {
          icon.classList.remove('bi-eye');
          icon.classList.add('bi-eye-slash');
        } else {
          icon.classList.remove('bi-eye-slash');
          icon.classList.add('bi-eye');
        }
      });
    }
  }

  // Show login page
  function showLoginHelp() {
    // No hints or placeholders needed
    console.log('Showing login page');
  }

  // Custom modal functions
  function showModal(modalEl) {
    if (!modalEl) {
      console.error('Modal element is null or undefined');
      return;
    }

    console.log(`Showing modal:`, modalEl.id);

    // Ensure all form fields are enabled
    const formFields = modalEl.querySelectorAll('input, textarea, select, button');
    formFields.forEach(field => {
      field.disabled = false;
      field.readOnly = false;
      field.style.pointerEvents = 'auto';
    });

    // Show the modal using Bootstrap's modal method
    try {
      // First, make sure any existing instance is disposed
      const existingModal = bootstrap.Modal.getInstance(modalEl);
      if (existingModal) {
        existingModal.dispose();
      }

      // Create a new modal instance with proper options
      const bsModal = new bootstrap.Modal(modalEl, {
        backdrop: true,
        keyboard: true,
        focus: true
      });

      // Show the modal
      bsModal.show();

      // Ensure body has modal-open class
      document.body.classList.add('modal-open');

      // Make sure the modal is visible and interactive
      modalEl.style.display = 'block';
      modalEl.style.pointerEvents = 'auto';
      modalEl.style.zIndex = '1050';

      // Ensure the modal content is interactive
      const modalContent = modalEl.querySelector('.modal-content');
      if (modalContent) {
        modalContent.style.pointerEvents = 'auto';
      }

      // Ensure the modal footer is centered
      const modalFooter = modalEl.querySelector('.modal-footer');
      if (modalFooter) {
        modalFooter.style.display = 'flex';
        modalFooter.style.justifyContent = 'center';
        modalFooter.style.gap = '15px';
      }

      // Add backdrop if it doesn't exist
      if (!document.querySelector('.modal-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
      }
    } catch (error) {
      console.error('Error showing modal with Bootstrap:', error);

      // Fallback to manual showing
      modalEl.style.display = 'block';
      modalEl.classList.add('show');
      document.body.classList.add('modal-open');

      // Ensure the modal footer is centered
      const modalFooter = modalEl.querySelector('.modal-footer');
      if (modalFooter) {
        modalFooter.style.display = 'flex';
        modalFooter.style.justifyContent = 'center';
        modalFooter.style.gap = '15px';
      }

      // Add backdrop
      if (!document.querySelector('.modal-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
      }
    }
  }

  function hideModal(modalEl) {
    if (!modalEl) {
      console.error('Modal element is null or undefined');
      return;
    }

    console.log(`Hiding modal:`, modalEl.id);

    // Hide the modal using Bootstrap's modal method if available
    try {
      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) {
        bsModal.hide();
      } else {
        // Fallback to manual hiding
        modalEl.style.display = 'none';
        modalEl.classList.remove('show');
        document.body.classList.remove('modal-open');

        // Remove backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
      }
    } catch (error) {
      console.error('Error hiding modal with Bootstrap:', error);

      // Fallback to manual hiding
      modalEl.style.display = 'none';
      modalEl.classList.remove('show');
      document.body.classList.remove('modal-open');

      // Remove backdrop
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }

  // Login form submission
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';

    // Call the authentication API
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      return response.json();
    })
    .then(data => {
      if (data.success && data.token) {
        // Set authentication state
        isAuthenticated = true;

        // Save the JWT token
        authToken = data.token;

        // Save auth state to session storage
        sessionStorage.setItem('authToken', authToken);

        // Show dashboard and load data
        showDashboard();
        loadAllData();
      } else {
        throw new Error('Invalid credentials');
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      loginError.classList.remove('d-none');
      setTimeout(() => {
        loginError.classList.add('d-none');
      }, 3000);
    })
    .finally(() => {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    });
  });

  // Logout button
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    isAuthenticated = false;
    authToken = null;
    sessionStorage.removeItem('authToken');
    showLogin();
  });

  // Show dashboard after login
  function showDashboard() {
    loginContainer.classList.add('d-none');
    dashboardContainer.classList.remove('d-none');
  }

  // Show login after logout
  function showLogin() {
    dashboardContainer.classList.add('d-none');
    loginContainer.classList.remove('d-none');

    // Clear form fields
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');

    if (usernameField) {
      usernameField.value = '';
    }

    if (passwordField) {
      passwordField.value = '';
    }

    // Remove any existing help text
    const existingHelp = document.querySelector('.alert.alert-info');
    if (existingHelp) {
      existingHelp.remove();
    }

    showLoginHelp();
    setupPasswordToggle();
  }

  // Navigation between sections
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetSection = this.getAttribute('data-section');

      // Update active nav link
      navLinks.forEach(navLink => {
        navLink.classList.remove('active');
      });
      this.classList.add('active');

      // Show target section, hide others
      sections.forEach(section => {
        section.classList.add('d-none');
      });
      document.getElementById(`${targetSection}-section`).classList.remove('d-none');
    });
  });

  // Load all data
  function loadAllData() {
    loadTools();
    loadServices();
    loadProjects();
    loadSkills();
  }



  // Load tools data
  function loadTools() {
    fetch(`${API_URL}/tools`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Tools data not found');
        }
        return response.json();
      })
      .then(data => {
        tools = data;
        renderTools();
      })
      .catch(error => {
        console.error('Error loading tools:', error);
        tools = [];
        renderTools();
      });
  }

  // Load services data
  function loadServices() {
    fetch(`${API_URL}/services`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Services data not found');
        }
        return response.json();
      })
      .then(data => {
        services = data;
        renderServices();
      })
      .catch(error => {
        console.error('Error loading services:', error);
        services = [];
        renderServices();
      });
  }

  // Load projects data
  function loadProjects() {
    fetch(`${API_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Projects data not found');
        }
        return response.json();
      })
      .then(data => {
        projects = data;
        renderProjects();
      })
      .catch(error => {
        console.error('Error loading projects:', error);
        projects = [];
        renderProjects();
      });
  }

  // Render tools
  function renderTools() {
    if (!toolsList) {
      console.error('Tools list element not found');
      return;
    }

    if (tools.length === 0) {
      toolsList.innerHTML = '<div class="col-12 text-center py-5"><p>No tools found. Add your first tool!</p></div>';
      return;
    }

    let html = '';
    tools.forEach((tool, index) => {
      html += `
        <div class="col-md-6 col-lg-3 mb-4">
          <div class="item-card">
            <div class="item-img">
              <img src="${tool.image.startsWith('data:') ? tool.image : '../' + tool.image}" alt="${tool.name}">
            </div>
            <div class="item-body">
              <h5 class="item-title">${tool.name}</h5>
              <div class="item-actions" style="display: flex; justify-content: center; margin-top: 15px; gap: 10px;">
                <button class="btn btn-primary edit-tool" data-index="${index}" title="Edit Tool" style="min-width: 80px;" onclick="editTool(${index}); return false;">
                  <i class="bi bi-pencil-fill"></i> Edit
                </button>
                <button class="btn btn-danger delete-tool" data-index="${index}" title="Delete Tool" style="min-width: 80px;" onclick="confirmDelete('tool', ${index}); return false;">
                  <i class="bi bi-trash-fill"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    try {
      toolsList.innerHTML = html;
    } catch (error) {
      console.error('Error updating tools list HTML:', error);
    }

    // Add event listeners to edit and delete buttons
    console.log(`Setting up event listeners for ${document.querySelectorAll('.edit-tool').length} edit buttons`);

    // Add event listeners directly without cloning
    document.querySelectorAll('.edit-tool').forEach((btn, i) => {
      // Remove existing event listeners by cloning the button itself
      const newBtn = btn.cloneNode(true);
      if (btn.parentNode) {
        btn.parentNode.replaceChild(newBtn, btn);

        // Add new event listener
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const index = parseInt(this.getAttribute('data-index'));
          console.log(`Edit tool button clicked for index ${index}`);
          editTool(index);
        });

        // Add a visual indicator that the button is clickable
        newBtn.style.cursor = 'pointer';
        console.log(`Added event listener to edit button ${i}`);
      }
    });

    document.querySelectorAll('.delete-tool').forEach((btn, i) => {
      // Remove existing event listeners by cloning the button itself
      const newBtn = btn.cloneNode(true);
      if (btn.parentNode) {
        btn.parentNode.replaceChild(newBtn, btn);

        // Add new event listener
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const index = parseInt(this.getAttribute('data-index'));
          console.log(`Delete tool button clicked for index ${index}`);
          confirmDelete('tool', index);
        });

        // Add a visual indicator that the button is clickable
        newBtn.style.cursor = 'pointer';
        console.log(`Added event listener to delete button ${i}`);
      }
    });

    console.log('All event listeners have been set up');
  }

  // Render services
  function renderServices() {
    if (!servicesList) {
      console.error('Services list element not found');
      return;
    }

    if (services.length === 0) {
      servicesList.innerHTML = '<div class="col-12 text-center py-5"><p>No services found. Add your first service!</p></div>';
      return;
    }

    let html = '';
    services.forEach((service, index) => {
      html += `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="item-card">
            <div class="item-body text-center">
              <div class="item-icon mx-auto mb-3">
                <i class="bi ${service.icon}"></i>
              </div>
              <h5 class="item-title">${service.title}</h5>
              <p class="item-text">${service.description}</p>
              <div class="item-actions" style="display: flex; justify-content: center; margin-top: 15px; gap: 10px;">
                <button class="btn btn-primary edit-service" data-index="${index}" title="Edit Service" style="min-width: 80px;" onclick="editService(${index}); return false;">
                  <i class="bi bi-pencil-fill"></i> Edit
                </button>
                <button class="btn btn-danger delete-service" data-index="${index}" title="Delete Service" style="min-width: 80px;" onclick="confirmDelete('service', ${index}); return false;">
                  <i class="bi bi-trash-fill"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    try {
      servicesList.innerHTML = html;
    } catch (error) {
      console.error('Error updating services list HTML:', error);
    }

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-service').forEach((btn, i) => {
      // Remove existing event listeners by cloning the button itself
      const newBtn = btn.cloneNode(true);
      if (btn.parentNode) {
        btn.parentNode.replaceChild(newBtn, btn);

        // Add new event listener
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const index = parseInt(this.getAttribute('data-index'));
          console.log(`Edit service button clicked for index ${index}`);
          editService(index);
        });

        // Add a visual indicator that the button is clickable
        newBtn.style.cursor = 'pointer';
      }
    });

    document.querySelectorAll('.delete-service').forEach((btn, i) => {
      // Remove existing event listeners by cloning the button itself
      const newBtn = btn.cloneNode(true);
      if (btn.parentNode) {
        btn.parentNode.replaceChild(newBtn, btn);

        // Add new event listener
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const index = parseInt(this.getAttribute('data-index'));
          console.log(`Delete service button clicked for index ${index}`);
          confirmDelete('service', index);
        });

        // Add a visual indicator that the button is clickable
        newBtn.style.cursor = 'pointer';
      }
    });
  }

  // Render projects
  function renderProjects() {
    if (!projectsList) {
      console.error('Projects list element not found');
      return;
    }

    if (projects.length === 0) {
      projectsList.innerHTML = '<div class="col-12 text-center py-5"><p>No projects found. Add your first project!</p></div>';
      return;
    }

    let html = '';
    projects.forEach((project, index) => {
      html += `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="item-card">
            <div class="item-img">
              <img src="${project.image.startsWith('data:') ? project.image : '../' + project.image}" alt="${project.title}">
            </div>
            <div class="item-body">
              <h5 class="item-title">${project.title}</h5>
              <p class="item-text">${project.description}</p>
              <div class="item-tags mb-3">
                ${project.tags.map(tag => `<span class="badge bg-primary bg-opacity-10 text-primary me-1">${tag}</span>`).join('')}
              </div>
              <div class="item-actions" style="display: flex; justify-content: center; margin-top: 15px; gap: 10px;">
                <button class="btn btn-primary edit-project" data-index="${index}" title="Edit Project" style="min-width: 80px;" onclick="editProject(${index}); return false;">
                  <i class="bi bi-pencil-fill"></i> Edit
                </button>
                <button class="btn btn-danger delete-project" data-index="${index}" title="Delete Project" style="min-width: 80px;" onclick="confirmDelete('project', ${index}); return false;">
                  <i class="bi bi-trash-fill"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    try {
      projectsList.innerHTML = html;
    } catch (error) {
      console.error('Error updating projects list HTML:', error);
    }

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-project').forEach((btn, i) => {
      // Remove existing event listeners by cloning the button itself
      const newBtn = btn.cloneNode(true);
      if (btn.parentNode) {
        btn.parentNode.replaceChild(newBtn, btn);

        // Add new event listener
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const index = parseInt(this.getAttribute('data-index'));
          console.log(`Edit project button clicked for index ${index}`);
          editProject(index);
        });

        // Add a visual indicator that the button is clickable
        newBtn.style.cursor = 'pointer';
      }
    });

    document.querySelectorAll('.delete-project').forEach((btn, i) => {
      // Remove existing event listeners by cloning the button itself
      const newBtn = btn.cloneNode(true);
      if (btn.parentNode) {
        btn.parentNode.replaceChild(newBtn, btn);

        // Add new event listener
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const index = parseInt(this.getAttribute('data-index'));
          console.log(`Delete project button clicked for index ${index}`);
          confirmDelete('project', index);
        });

        // Add a visual indicator that the button is clickable
        newBtn.style.cursor = 'pointer';
      }
    });
  }

  // Add new tool
  addToolBtn.addEventListener('click', function() {
    document.getElementById('toolModalLabel').textContent = 'Add New Tool';
    document.getElementById('tool-id').value = '';
    document.getElementById('tool-name').value = '';
    document.getElementById('tool-image').value = '';
    document.getElementById('tool-image-upload').value = '';
    showModal(toolModalEl);

    // Focus on the name field after a delay
    setTimeout(() => {
      const nameField = document.getElementById('tool-name');
      if (nameField) nameField.focus();
    }, 300);
  });

  // Add new service
  addServiceBtn.addEventListener('click', function() {
    document.getElementById('serviceModalLabel').textContent = 'Add New Service';
    document.getElementById('service-id').value = '';
    document.getElementById('service-title').value = '';
    document.getElementById('service-icon').value = '';
    document.getElementById('service-description').value = '';
    showModal(serviceModalEl);

    // Focus on the title field after a delay
    setTimeout(() => {
      const titleField = document.getElementById('service-title');
      if (titleField) titleField.focus();
    }, 300);
  });

  // Add new project
  addProjectBtn.addEventListener('click', function() {
    document.getElementById('projectModalLabel').textContent = 'Add New Project';
    document.getElementById('project-id').value = '';
    document.getElementById('project-title').value = '';
    document.getElementById('project-image').value = '';
    document.getElementById('project-image-upload').value = '';
    document.getElementById('project-description').value = '';
    document.getElementById('project-demo-url').value = '';
    document.getElementById('project-github-url').value = '';
    document.getElementById('project-tags').value = '';
    showModal(projectModalEl);

    // Focus on the title field after a delay
    setTimeout(() => {
      const titleField = document.getElementById('project-title');
      if (titleField) titleField.focus();
    }, 300);
  });

  // Edit tool
  function editTool(index) {
    console.log(`Editing tool at index ${index}`);

    if (index < 0 || index >= tools.length) {
      console.error(`Invalid tool index: ${index}`);
      showErrorMessage('Error: Invalid tool index');
      return;
    }

    const tool = tools[index];
    console.log(`Tool data:`, tool);

    // Update modal title
    document.getElementById('toolModalLabel').textContent = 'Edit Tool';

    // Set form values
    document.getElementById('tool-id').value = index;
    document.getElementById('tool-name').value = tool.name;
    document.getElementById('tool-image').value = tool.image;
    document.getElementById('tool-image-upload').value = '';

    // Show the modal
    showModal(toolModalEl);

    // Focus on the name field after a delay
    setTimeout(() => {
      const nameField = document.getElementById('tool-name');
      if (nameField) {
        nameField.focus();
        // Place cursor at the end of the text
        const textLength = nameField.value.length;
        nameField.setSelectionRange(textLength, textLength);
      }
    }, 300);
  }

  // Edit service
  function editService(index) {
    const service = services[index];
    document.getElementById('serviceModalLabel').textContent = 'Edit Service';
    document.getElementById('service-id').value = index;
    document.getElementById('service-title').value = service.title;
    document.getElementById('service-icon').value = service.icon;
    document.getElementById('service-description').value = service.description;
    showModal(serviceModalEl);

    // Focus on the title field after a delay
    setTimeout(() => {
      const titleField = document.getElementById('service-title');
      if (titleField) {
        titleField.focus();
        // Place cursor at the end of the text
        const textLength = titleField.value.length;
        titleField.setSelectionRange(textLength, textLength);
      }
    }, 300);
  }

  // Edit project
  function editProject(index) {
    const project = projects[index];
    document.getElementById('projectModalLabel').textContent = 'Edit Project';
    document.getElementById('project-id').value = index;
    document.getElementById('project-title').value = project.title;
    document.getElementById('project-image').value = project.image;
    document.getElementById('project-image-upload').value = '';
    document.getElementById('project-description').value = project.description;
    document.getElementById('project-demo-url').value = project.demoUrl || '';
    document.getElementById('project-github-url').value = project.githubUrl || '';
    document.getElementById('project-tags').value = project.tags.join(', ');
    showModal(projectModalEl);

    // Focus on the title field after a delay
    setTimeout(() => {
      const titleField = document.getElementById('project-title');
      if (titleField) {
        titleField.focus();
        // Place cursor at the end of the text
        const textLength = titleField.value.length;
        titleField.setSelectionRange(textLength, textLength);
      }
    }, 300);
  }

  // Save tool
  saveToolBtn.addEventListener('click', function() {
    const id = document.getElementById('tool-id').value;
    const name = document.getElementById('tool-name').value;
    const image = document.getElementById('tool-image').value;
    const imageUpload = document.getElementById('tool-image-upload').files[0];

    if (!name || (!image && !imageUpload)) {
      showErrorMessage('Please fill in all required fields');
      return;
    }

    // Handle image upload if provided
    if (imageUpload) {
      handleFileUpload(document.getElementById('tool-image-upload'), function(imagePath) {
        if (imagePath) {
          saveTool(id, name, imagePath);
        } else {
          // If image upload failed but we have a fallback image path
          if (image) {
            saveTool(id, name, image);
          } else {
            showErrorMessage('Please provide a valid image');
          }
        }
      }, 'tools');
    } else {
      saveTool(id, name, image);
    }
  });

  function saveTool(id, name, imagePath) {
    const tool = {
      name: name,
      image: imagePath
    };

    const isNew = id === '';
    const itemId = isNew ? null : tools[parseInt(id)]._id;

    // Save to MongoDB via API
    saveData('tools', tool, isNew, itemId);

    // Close modal
    hideModal(toolModalEl);
  }

  // Save service
  saveServiceBtn.addEventListener('click', function() {
    const id = document.getElementById('service-id').value;
    const title = document.getElementById('service-title').value;
    const icon = document.getElementById('service-icon').value;
    const description = document.getElementById('service-description').value;

    if (!title || !icon || !description) {
      showErrorMessage('Please fill in all required fields');
      return;
    }

    const service = {
      title: title,
      icon: icon,
      description: description
    };

    const isNew = id === '';
    const itemId = isNew ? null : services[parseInt(id)]._id;

    // Save to MongoDB via API
    saveData('services', service, isNew, itemId);

    // Close modal
    hideModal(serviceModalEl);
  });

  // Save project
  saveProjectBtn.addEventListener('click', function() {
    const id = document.getElementById('project-id').value;
    const title = document.getElementById('project-title').value;
    const image = document.getElementById('project-image').value;
    const imageUpload = document.getElementById('project-image-upload').files[0];
    const description = document.getElementById('project-description').value;
    const demoUrl = document.getElementById('project-demo-url').value;
    const githubUrl = document.getElementById('project-github-url').value;
    const tagsInput = document.getElementById('project-tags').value;

    if (!title || (!image && !imageUpload) || !description || !tagsInput) {
      showErrorMessage('Please fill in all required fields');
      return;
    }

    // Process tags
    const tags = tagsInput.split(',').map(tag => tag.trim());

    // Handle image upload if provided
    if (imageUpload) {
      handleFileUpload(document.getElementById('project-image-upload'), function(imagePath) {
        if (imagePath) {
          saveProject(id, title, imagePath, description, demoUrl, githubUrl, tags);
        } else {
          // If image upload failed but we have a fallback image path
          if (image) {
            saveProject(id, title, image, description, demoUrl, githubUrl, tags);
          } else {
            showErrorMessage('Please provide a valid image');
          }
        }
      }, 'projects');
    } else {
      saveProject(id, title, image, description, demoUrl, githubUrl, tags);
    }
  });

  function saveProject(id, title, imagePath, description, demoUrl, githubUrl, tags) {
    const project = {
      title: title,
      image: imagePath,
      description: description,
      demoUrl: demoUrl,
      githubUrl: githubUrl,
      tags: tags
    };

    const isNew = id === '';
    const itemId = isNew ? null : projects[parseInt(id)]._id;

    // Save to MongoDB via API
    saveData('projects', project, isNew, itemId);

    // Close modal
    hideModal(projectModalEl);
  }

  // Confirm delete
  function confirmDelete(type, index) {
    let id = null;
    let itemName = '';
    let itemDetails = '';

    console.log(`Confirm delete called for ${type} at index ${index}`);

    // Validate index
    let itemArray;
    switch (type) {
      case 'tool': itemArray = tools; break;
      case 'service': itemArray = services; break;
      case 'project': itemArray = projects; break;
      case 'skill': itemArray = skills; break;
    }

    if (index < 0 || index >= itemArray.length) {
      console.error(`Invalid ${type} index: ${index}`);
      showErrorMessage(`Error: Invalid ${type} index`);
      return;
    }

    try {
      // Get the item ID and name based on type and index
      switch (type) {
        case 'tool':
          console.log(`Tool data:`, tools[index]);
          id = tools[index]._id;
          itemName = tools[index].name;
          break;
        case 'service':
          console.log(`Service data:`, services[index]);
          id = services[index]._id;
          itemName = services[index].title;
          break;
        case 'project':
          console.log(`Project data:`, projects[index]);
          id = projects[index]._id;
          itemName = projects[index].title;
          // Add details about the project
          if (projects[index].tags && projects[index].tags.length > 0) {
            itemDetails = `<p class="text-muted">Tags: ${projects[index].tags.join(', ')}</p>`;
          }
          break;
        case 'skill':
          console.log(`Skill data:`, skills[index]);
          id = skills[index]._id;
          itemName = skills[index].category;
          // Add details about the skills in this group
          if (skills[index].skills && skills[index].skills.length > 0) {
            itemDetails = `<p class="text-muted">This group contains ${skills[index].skills.length} skills.</p>`;
          }
          break;
      }

      // Update the confirmation modal with specific item details
      const modalTitle = document.getElementById('deleteConfirmModalLabel');
      if (modalTitle) {
        modalTitle.textContent = `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`;
      }

      // Set the confirmation message with the item name and details
      const messageEl = document.getElementById('deleteConfirmModal').querySelector('.modal-body');
      if (messageEl) {
        messageEl.innerHTML = `
          <p>Are you sure you want to delete "<strong>${itemName}</strong>"?</p>
          ${itemDetails}
          <p class="text-danger"><strong>This action cannot be undone.</strong></p>
        `;
      }

      console.log(`Item ID to delete: ${id}`);
      currentItemToDelete = { type, index, id, name: itemName };
      showModal(deleteConfirmModalEl);

      // Focus on the cancel button for safety
      setTimeout(() => {
        const cancelBtn = document.getElementById('cancel-delete-btn');
        if (cancelBtn) cancelBtn.focus();
      }, 300);
    } catch (error) {
      console.error('Error preparing delete confirmation:', error);
      showErrorMessage(`Error preparing delete confirmation: ${error.message}`);
    }
  }

  // Delete item
  confirmDeleteBtn.addEventListener('click', function() {
    console.log('Confirm delete button clicked');

    if (!currentItemToDelete) {
      console.error('No item to delete!');
      showErrorMessage('No item selected for deletion');
      return;
    }

    const { type, index, id, name } = currentItemToDelete;
    console.log(`Deleting ${type} at index ${index} with ID ${id}`);

    // Show loading state
    this.disabled = true;
    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';

    // If we have an ID, use the API to delete
    if (id) {
      console.log(`Using API to delete ${type} with ID ${id}`);

      // Hide the modal first for better UX
      hideModal(deleteConfirmModalEl);

      // Then delete the item
      deleteData(type + 's', id);
    } else {
      console.log(`No ID available, using local deletion for ${type} at index ${index}`);

      try {
        // Fallback to local deletion if no ID is available
        switch (type) {
          case 'tool':
            tools.splice(index, 1);
            renderTools();
            break;
          case 'service':
            services.splice(index, 1);
            renderServices();
            break;
          case 'project':
            projects.splice(index, 1);
            renderProjects();
            break;
          case 'skill':
            skills.splice(index, 1);
            renderSkills();
            break;
        }

        hideModal(deleteConfirmModalEl);
        showSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} "${name}" deleted successfully!`);
      } catch (error) {
        console.error(`Error with local deletion:`, error);
        showErrorMessage(`Error deleting ${type}: ${error.message}`);
      }
    }

    // Reset button state and clear current item
    setTimeout(() => {
      this.disabled = false;
      this.innerHTML = 'Delete';
      currentItemToDelete = null;
    }, 500);
  });

  // Save data to MongoDB via API
  function saveData(type, item, isNew = false, itemId = null) {
    const endpoint = `${API_URL}/${type}${itemId ? `/${itemId}` : ''}`;
    const method = isNew ? 'POST' : itemId ? 'PUT' : 'POST';

    // Show loading indicator
    const loadingId = 'saving-' + Date.now();
    showLoadingMessage(`Saving ${type.slice(0, -1)}...`, loadingId);

    fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(item)
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Error saving ${type}: ${text || response.statusText}`);
          });
        }
        return response.json();
      })
      .then(data => {
        // Remove loading message
        removeLoadingMessage(loadingId);

        // Show success message
        const itemName = getItemName(type, item);
        showSuccessMessage(`${capitalizeFirstLetter(type.slice(0, -1))} "${itemName}" ${isNew ? 'added' : 'updated'} successfully!`);

        // Update local data immediately for better UX
        if (isNew) {
          // For new items, add the returned item (with _id) to the local array
          updateLocalArray(type, null, data);
        } else {
          // For updated items, update the existing item in the local array
          updateLocalArray(type, itemId, data);
        }

        // Render the updated data
        renderUpdatedData(type);
      })
      .catch(error => {
        // Remove loading message
        removeLoadingMessage(loadingId);

        console.error(`Error saving ${type}:`, error);
        showErrorMessage(`Error saving ${type.slice(0, -1)}: ${error.message}`);
      });
  }

  // Helper function to get item name for display in messages
  function getItemName(type, item) {
    switch (type) {
      case 'tools':
        return item.name;
      case 'services':
        return item.title;
      case 'projects':
        return item.title;
      case 'skills':
        return item.category;
      default:
        return 'item';
    }
  }

  // Helper function to capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Update local array with new or updated item
  function updateLocalArray(type, itemId, data) {
    switch (type) {
      case 'tools':
        if (itemId) {
          // Update existing tool
          const index = tools.findIndex(t => t._id === itemId);
          if (index !== -1) {
            tools[index] = data;
          }
        } else {
          // Add new tool
          tools.push(data);
        }
        break;
      case 'services':
        if (itemId) {
          // Update existing service
          const index = services.findIndex(s => s._id === itemId);
          if (index !== -1) {
            services[index] = data;
          }
        } else {
          // Add new service
          services.push(data);
        }
        break;
      case 'projects':
        if (itemId) {
          // Update existing project
          const index = projects.findIndex(p => p._id === itemId);
          if (index !== -1) {
            projects[index] = data;
          }
        } else {
          // Add new project
          projects.push(data);
        }
        break;
      case 'skills':
        if (itemId) {
          // Update existing skill group
          const index = skills.findIndex(s => s._id === itemId);
          if (index !== -1) {
            skills[index] = data;
          }
        } else {
          // Add new skill group
          skills.push(data);
        }
        break;
    }
  }

  // Render updated data
  function renderUpdatedData(type) {
    switch (type) {
      case 'tools':
        renderTools();
        break;
      case 'services':
        renderServices();
        break;
      case 'projects':
        renderProjects();
        break;
      case 'skills':
        renderSkills();
        break;
    }
  }

  // Show loading message
  function showLoadingMessage(message, id) {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.id = id;
    alert.className = 'alert alert-info alert-dismissible fade show';
    alert.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="spinner-border spinner-border-sm me-2" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        ${message}
      </div>
    `;

    alertContainer.appendChild(alert);
  }

  // Remove loading message
  function removeLoadingMessage(id) {
    const loadingAlert = document.getElementById(id);
    if (loadingAlert) {
      loadingAlert.remove();
    }
  }

  // Delete data from MongoDB via API
  function deleteData(type, itemId) {
    const endpoint = `${API_URL}/${type}/${itemId}`;

    // Show loading indicator
    const loadingId = 'deleting-' + Date.now();
    showLoadingMessage(`Deleting ${type.slice(0, -1)}...`, loadingId);

    console.log(`Attempting to delete ${type} with ID: ${itemId}`);
    console.log(`Endpoint: ${endpoint}`);

    fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then(response => {
        console.log(`Delete response status: ${response.status}`);
        if (!response.ok) {
          return response.text().then(text => {
            console.error(`Error response body: ${text}`);
            throw new Error(`Error deleting ${type}: ${text || response.statusText}`);
          });
        }
        return response.json();
      })
      .then(data => {
        // Remove loading message
        removeLoadingMessage(loadingId);

        console.log(`Delete successful:`, data);

        // Find the name of the deleted item for the success message
        let itemName = 'item';
        switch (type) {
          case 'tools':
            const toolIndex = tools.findIndex(t => t._id === itemId);
            if (toolIndex !== -1) {
              itemName = tools[toolIndex].name;
              // Remove from local array
              tools.splice(toolIndex, 1);
              // Update UI
              renderTools();
            }
            break;
          case 'services':
            const serviceIndex = services.findIndex(s => s._id === itemId);
            if (serviceIndex !== -1) {
              itemName = services[serviceIndex].title;
              // Remove from local array
              services.splice(serviceIndex, 1);
              // Update UI
              renderServices();
            }
            break;
          case 'projects':
            const projectIndex = projects.findIndex(p => p._id === itemId);
            if (projectIndex !== -1) {
              itemName = projects[projectIndex].title;
              // Remove from local array
              projects.splice(projectIndex, 1);
              // Update UI
              renderProjects();
            }
            break;
          case 'skills':
            const skillIndex = skills.findIndex(s => s._id === itemId);
            if (skillIndex !== -1) {
              itemName = skills[skillIndex].category;
              // Remove from local array
              skills.splice(skillIndex, 1);
              // Update UI
              renderSkills();
            }
            break;
        }

        showSuccessMessage(`${capitalizeFirstLetter(type.slice(0, -1))} "${itemName}" deleted successfully!`);
      })
      .catch(error => {
        // Remove loading message
        removeLoadingMessage(loadingId);

        console.error(`Error deleting ${type}:`, error);
        showErrorMessage(`Error deleting ${type.slice(0, -1)}: ${error.message}`);
      });
  }

  // Handle file uploads
  function handleFileUpload(fileInput, callback, category = 'general') {
    const file = fileInput.files[0];
    if (!file) {
      callback(null);
      return;
    }

    // Check file type
    const fileType = file.type;
    if (!fileType.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      showErrorMessage('Only JPEG, PNG, GIF, and WEBP files are allowed.');
      callback(null);
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorMessage('File size exceeds 5MB limit.');
      callback(null);
      return;
    }

    // Convert to data URL with compression
    const reader = new FileReader();
    reader.onload = function(e) {
      // Compress the image before using it
      const img = new Image();
      img.onload = function() {
        // Create a canvas to resize and compress the image
        const canvas = document.createElement('canvas');

        // Calculate new dimensions (max 1200px width/height)
        let width = img.width;
        let height = img.height;
        const maxSize = 1200;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round(height * (maxSize / width));
            width = maxSize;
          } else {
            width = Math.round(width * (maxSize / height));
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress the image
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL with compression (0.7 quality)
        const compressedDataUrl = canvas.toDataURL(file.type, 0.7);

        // Use the compressed data URL
        callback(compressedDataUrl);
      };

      img.onerror = function() {
        showErrorMessage('Error processing image.');
        callback(null);
      };

      // Load the image from the FileReader result
      img.src = e.target.result;
    };

    reader.onerror = function() {
      showErrorMessage('Error reading file.');
      callback(null);
    };

    reader.readAsDataURL(file);
  }

  // Load skills data
  function loadSkills() {
    fetch(`${API_URL}/skills`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Skills data not found');
        }
        return response.json();
      })
      .then(data => {
        skills = data;
        renderSkills();
      })
      .catch(error => {
        console.error('Error loading skills:', error);
        skills = [];
        renderSkills();
      });
  }

  // Render skills
  function renderSkills() {
    if (!skillsList) {
      console.error('Skills list element not found');
      return;
    }

    if (skills.length === 0) {
      skillsList.innerHTML = '<div class="col-12 text-center py-5"><p>No skill groups found. Add your first skill group!</p></div>';
      return;
    }

    let html = '';
    skills.forEach((skillGroup, index) => {
      html += `
        <div class="col-md-6 mb-4">
          <div class="item-card">
            <div class="item-body">
              <div class="d-flex align-items-center mb-3">
                <div class="item-icon me-3">
                  <i class="bi ${skillGroup.icon}"></i>
                </div>
                <h5 class="item-title mb-0">${skillGroup.category}</h5>
              </div>
              <div class="skill-list mb-3">
                <ul class="list-group list-group-flush">
                  ${skillGroup.skills.map(skill => `
                    <li class="list-group-item bg-transparent">${skill}</li>
                  `).join('')}
                </ul>
              </div>
              <div class="item-actions" style="display: flex; justify-content: center; margin-top: 15px; gap: 10px;">
                <button class="btn btn-primary edit-skill-group" data-index="${index}" title="Edit Skill Group" style="min-width: 80px;" onclick="editSkillGroup(${index}); return false;">
                  <i class="bi bi-pencil-fill"></i> Edit
                </button>
                <button class="btn btn-danger delete-skill-group" data-index="${index}" title="Delete Skill Group" style="min-width: 80px;" onclick="confirmDelete('skill', ${index}); return false;">
                  <i class="bi bi-trash-fill"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    try {
      skillsList.innerHTML = html;
    } catch (error) {
      console.error('Error updating skills list HTML:', error);
    }

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-skill-group').forEach((btn, i) => {
      // Remove existing event listeners by cloning the button itself
      const newBtn = btn.cloneNode(true);
      if (btn.parentNode) {
        btn.parentNode.replaceChild(newBtn, btn);

        // Add new event listener
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const index = parseInt(this.getAttribute('data-index'));
          console.log(`Edit skill group button clicked for index ${index}`);
          editSkillGroup(index);
        });

        // Add a visual indicator that the button is clickable
        newBtn.style.cursor = 'pointer';
      }
    });

    document.querySelectorAll('.delete-skill-group').forEach((btn, i) => {
      // Remove existing event listeners by cloning the button itself
      const newBtn = btn.cloneNode(true);
      if (btn.parentNode) {
        btn.parentNode.replaceChild(newBtn, btn);

        // Add new event listener
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const index = parseInt(this.getAttribute('data-index'));
          console.log(`Delete skill group button clicked for index ${index}`);
          confirmDelete('skill', index);
        });

        // Add a visual indicator that the button is clickable
        newBtn.style.cursor = 'pointer';
      }
    });
  }

  // Add new skill group
  addSkillGroupBtn.addEventListener('click', function() {
    document.getElementById('skillGroupModalLabel').textContent = 'Add New Skill Group';
    document.getElementById('skill-group-id').value = '';
    document.getElementById('skill-group-category').value = '';
    document.getElementById('skill-group-icon').value = '';
    document.getElementById('skill-group-skills').value = '';
    showModal(skillGroupModalEl);

    // Focus on the category field after a delay
    setTimeout(() => {
      const categoryField = document.getElementById('skill-group-category');
      if (categoryField) categoryField.focus();
    }, 300);
  });

  // Edit skill group
  function editSkillGroup(index) {
    const skillGroup = skills[index];
    document.getElementById('skillGroupModalLabel').textContent = 'Edit Skill Group';
    document.getElementById('skill-group-id').value = index;
    document.getElementById('skill-group-category').value = skillGroup.category;
    document.getElementById('skill-group-icon').value = skillGroup.icon;
    document.getElementById('skill-group-skills').value = skillGroup.skills.join('\n');
    showModal(skillGroupModalEl);

    // Focus on the category field after a delay
    setTimeout(() => {
      const categoryField = document.getElementById('skill-group-category');
      if (categoryField) {
        categoryField.focus();
        // Place cursor at the end of the text
        const textLength = categoryField.value.length;
        categoryField.setSelectionRange(textLength, textLength);
      }
    }, 300);
  }

  // Save skill group
  saveSkillGroupBtn.addEventListener('click', function() {
    const id = document.getElementById('skill-group-id').value;
    const category = document.getElementById('skill-group-category').value;
    const icon = document.getElementById('skill-group-icon').value;
    const skillsText = document.getElementById('skill-group-skills').value;

    if (!category || !icon || !skillsText) {
      showErrorMessage('Please fill in all required fields');
      return;
    }

    // Process skills (split by new line and remove empty lines)
    const skillsList = skillsText.split('\n')
      .map(skill => skill.trim())
      .filter(skill => skill !== '');

    if (skillsList.length === 0) {
      showErrorMessage('Please add at least one skill');
      return;
    }

    const skillGroup = {
      category: category,
      icon: icon,
      skills: skillsList
    };

    const isNew = id === '';
    const itemId = isNew ? null : skills[parseInt(id)]._id;

    // Save to MongoDB via API
    saveData('skills', skillGroup, isNew, itemId);

    // Close modal
    hideModal(skillGroupModalEl);
  });

  // Add event listeners for cancel buttons - these now use data-bs-dismiss="modal"
  // but we'll keep the event listeners for any additional cleanup needed
  document.getElementById('cancel-tool-btn').addEventListener('click', function() {
    console.log('Cancel tool button clicked');
  });

  document.getElementById('cancel-service-btn').addEventListener('click', function() {
    console.log('Cancel service button clicked');
  });

  document.getElementById('cancel-project-btn').addEventListener('click', function() {
    console.log('Cancel project button clicked');
  });

  document.getElementById('cancel-skill-group-btn').addEventListener('click', function() {
    console.log('Cancel skill group button clicked');
  });

  document.getElementById('cancel-delete-btn').addEventListener('click', function() {
    console.log('Cancel delete button clicked');
  });

  // Add event listeners for Bootstrap modal events
  // This ensures our code knows when modals are hidden by Bootstrap
  [toolModalEl, serviceModalEl, projectModalEl, skillGroupModalEl, deleteConfirmModalEl].forEach(modal => {
    modal.addEventListener('hidden.bs.modal', function() {
      console.log(`Modal ${this.id} was hidden by Bootstrap`);
    });

    modal.addEventListener('shown.bs.modal', function() {
      console.log(`Modal ${this.id} was shown by Bootstrap`);

      // Focus on the first input field
      const firstInput = this.querySelector('input:not([type="hidden"]), textarea');
      if (firstInput) {
        firstInput.focus();
      }
    });
  });

  // Initialize Bootstrap modals
  const modals = [toolModalEl, serviceModalEl, projectModalEl, skillGroupModalEl, deleteConfirmModalEl];
  modals.forEach(modal => {
    // Make sure modals are properly initialized with Bootstrap
    if (modal) {
      new bootstrap.Modal(modal);
    }
  });

  // Show success message
  function showSuccessMessage(message) {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.innerHTML = `
      <i class="bi bi-check-circle-fill me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alert);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => alert.remove(), 300);
    }, 3000);
  }

  // Show error message
  function showErrorMessage(message) {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alert);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  }

  // Initialize authentication
  checkAuth();

  // Assign functions to global variables for access from HTML
  window.editTool = editTool;
  window.editService = editService;
  window.editProject = editProject;
  window.editSkillGroup = editSkillGroup;
  window.confirmDelete = confirmDelete;
});
