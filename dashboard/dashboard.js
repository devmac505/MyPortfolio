// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {


  // Initialize the login page
  checkAuth();

  // Authentication variables
  let isAuthenticated = false;
  let authToken = null;

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
      // For now, just accept any token
      authToken = token;
      isAuthenticated = true;
      showDashboard();
      loadAllData();
    } else {
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

  // Show login credentials helper
  function showLoginHelp() {
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');

    // Add placeholder text instead of value to prevent saving
    usernameField.placeholder = 'Username';
    passwordField.placeholder = 'Password';

    // No hint text is added anymore
  }

  // Custom modal functions
  function showModal(modalEl) {
    if (!modalEl) return;

    // Show the modal directly
    modalEl.style.display = 'block';
    modalEl.classList.add('show');

    // Don't add modal-open class to body to prevent scrolling issues
    // document.body.classList.add('modal-open');
  }

  function hideModal(modalEl) {
    if (!modalEl) return;

    // Hide modal manually
    modalEl.style.display = 'none';
    modalEl.classList.remove('show');

    // Remove any existing backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
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
    fetch(`${API_URL}/tools`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      return response.json();
    })
    .then(data => {
      // For now, just check if username and password match hardcoded values
      if (username === 'devmac' && password === 'devmac12') {
        // Set authentication state
        isAuthenticated = true;

        // Generate a simple token (not secure, just for testing)
        authToken = 'temp_token_' + Date.now();

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
      usernameField.placeholder = 'Username';
    }

    if (passwordField) {
      passwordField.value = '';
      passwordField.placeholder = 'Password';
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

  // API base URL
  const API_URL = 'http://localhost:5000/api';
  const AUTH_URL = `${API_URL}/auth`;

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
              <img src="../${tool.image}" alt="${tool.name}">
            </div>
            <div class="item-body">
              <h5 class="item-title">${tool.name}</h5>
              <div class="item-actions">
                <button class="btn btn-sm btn-primary btn-icon edit-tool" data-index="${index}">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-icon delete-tool" data-index="${index}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    toolsList.innerHTML = html;

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-tool').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        editTool(index);
      });
    });

    document.querySelectorAll('.delete-tool').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        confirmDelete('tool', index);
      });
    });
  }

  // Render services
  function renderServices() {
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
              <div class="item-actions">
                <button class="btn btn-sm btn-primary btn-icon edit-service" data-index="${index}">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-icon delete-service" data-index="${index}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    servicesList.innerHTML = html;

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-service').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        editService(index);
      });
    });

    document.querySelectorAll('.delete-service').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        confirmDelete('service', index);
      });
    });
  }

  // Render projects
  function renderProjects() {
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
              <img src="../${project.image}" alt="${project.title}">
            </div>
            <div class="item-body">
              <h5 class="item-title">${project.title}</h5>
              <p class="item-text">${project.description}</p>
              <div class="item-tags mb-3">
                ${project.tags.map(tag => `<span class="badge bg-primary bg-opacity-10 text-primary me-1">${tag}</span>`).join('')}
              </div>
              <div class="item-actions">
                <button class="btn btn-sm btn-primary btn-icon edit-project" data-index="${index}">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-icon delete-project" data-index="${index}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    projectsList.innerHTML = html;

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-project').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        editProject(index);
      });
    });

    document.querySelectorAll('.delete-project').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        confirmDelete('project', index);
      });
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
    const tool = tools[index];
    document.getElementById('toolModalLabel').textContent = 'Edit Tool';
    document.getElementById('tool-id').value = index;
    document.getElementById('tool-name').value = tool.name;
    document.getElementById('tool-image').value = tool.image;
    document.getElementById('tool-image-upload').value = '';
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
      alert('Please fill in all required fields');
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
            alert('Please provide a valid image');
          }
        }
      });
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
      alert('Please fill in all required fields');
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
      alert('Please fill in all required fields');
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
            alert('Please provide a valid image');
          }
        }
      });
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

    // Get the item ID based on type and index
    switch (type) {
      case 'tool':
        id = tools[index]._id;
        break;
      case 'service':
        id = services[index]._id;
        break;
      case 'project':
        id = projects[index]._id;
        break;
      case 'skill':
        id = skills[index]._id;
        break;
    }

    currentItemToDelete = { type, index, id };
    showModal(deleteConfirmModalEl);

    // Focus on the cancel button after a delay
    setTimeout(() => {
      const cancelBtn = document.getElementById('cancel-delete-btn');
      if (cancelBtn) cancelBtn.focus();
    }, 300);
  }

  // Delete item
  confirmDeleteBtn.addEventListener('click', function() {
    if (!currentItemToDelete) return;

    const { type, index, id } = currentItemToDelete;

    // If we have an ID, use the API to delete
    if (id) {
      deleteData(type + 's', id);
    } else {
      // Fallback to local deletion if no ID is available
      switch (type) {
        case 'tool':
          tools.splice(index, 1);
          loadTools();
          break;
        case 'service':
          services.splice(index, 1);
          loadServices();
          break;
        case 'project':
          projects.splice(index, 1);
          loadProjects();
          break;
        case 'skill':
          skills.splice(index, 1);
          loadSkills();
          break;
      }
    }

    hideModal(deleteConfirmModalEl);
    currentItemToDelete = null;
  });

  // Save data to MongoDB via API
  function saveData(type, item, isNew = false, itemId = null) {
    const endpoint = `${API_URL}/${type}${itemId ? `/${itemId}` : ''}`;
    const method = isNew ? 'POST' : itemId ? 'PUT' : 'POST';

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
          throw new Error(`Error saving ${type}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`);

        // Reload the data to get the updated list
        switch (type) {
          case 'tools':
            loadTools();
            break;
          case 'services':
            loadServices();
            break;
          case 'projects':
            loadProjects();
            break;
          case 'skills':
            loadSkills();
            break;
        }
      })
      .catch(error => {
        console.error(`Error saving ${type}:`, error);
        alert(`Error saving data. Please try again.`);
      });
  }

  // Delete data from MongoDB via API
  function deleteData(type, itemId) {
    const endpoint = `${API_URL}/${type}/${itemId}`;

    fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error deleting ${type}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);

        // Reload the data to get the updated list
        switch (type) {
          case 'tools':
            loadTools();
            break;
          case 'services':
            loadServices();
            break;
          case 'projects':
            loadProjects();
            break;
          case 'skills':
            loadSkills();
            break;
        }
      })
      .catch(error => {
        console.error(`Error deleting ${type}:`, error);
        alert(`Error deleting data. Please try again.`);
      });
  }

  // Handle file uploads
  function handleFileUpload(fileInput, callback) {
    const file = fileInput.files[0];
    if (!file) {
      callback(null);
      return;
    }

    // Check file type
    const fileType = file.type;
    if (!fileType.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      alert('Only JPEG, PNG, GIF, and WEBP files are allowed.');
      callback(null);
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      callback(null);
      return;
    }

    // Read the file and convert to data URL
    const reader = new FileReader();
    reader.onload = function(e) {
      // In a real MERN application, we would upload this to a server
      // For this demo, we'll use the data URL directly
      const imagePath = `data:${fileType};base64,${btoa(e.target.result)}`;
      callback(imagePath);
    };
    reader.onerror = function() {
      alert('Error reading file.');
      callback(null);
    };
    reader.readAsBinaryString(file);
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
              <div class="item-actions">
                <button class="btn btn-sm btn-primary btn-icon edit-skill-group" data-index="${index}">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-icon delete-skill-group" data-index="${index}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    skillsList.innerHTML = html;

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-skill-group').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        editSkillGroup(index);
      });
    });

    document.querySelectorAll('.delete-skill-group').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        confirmDelete('skill', index);
      });
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
      alert('Please fill in all required fields');
      return;
    }

    // Process skills (split by new line and remove empty lines)
    const skillsList = skillsText.split('\n')
      .map(skill => skill.trim())
      .filter(skill => skill !== '');

    if (skillsList.length === 0) {
      alert('Please add at least one skill');
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

  // Add event listeners for cancel buttons
  document.getElementById('cancel-tool-btn').addEventListener('click', function() {
    hideModal(toolModalEl);
  });

  document.getElementById('cancel-service-btn').addEventListener('click', function() {
    hideModal(serviceModalEl);
  });

  document.getElementById('cancel-project-btn').addEventListener('click', function() {
    hideModal(projectModalEl);
  });

  document.getElementById('cancel-skill-group-btn').addEventListener('click', function() {
    hideModal(skillGroupModalEl);
  });

  document.getElementById('cancel-delete-btn').addEventListener('click', function() {
    hideModal(deleteConfirmModalEl);
  });

  // Add event listeners for close buttons in modal headers
  toolModalEl.querySelector('.btn-close').addEventListener('click', function() {
    hideModal(toolModalEl);
  });

  serviceModalEl.querySelector('.btn-close').addEventListener('click', function() {
    hideModal(serviceModalEl);
  });

  projectModalEl.querySelector('.btn-close').addEventListener('click', function() {
    hideModal(projectModalEl);
  });

  skillGroupModalEl.querySelector('.btn-close').addEventListener('click', function() {
    hideModal(skillGroupModalEl);
  });

  deleteConfirmModalEl.querySelector('.btn-close').addEventListener('click', function() {
    hideModal(deleteConfirmModalEl);
  });

  // Initialize
  checkAuth();
});
