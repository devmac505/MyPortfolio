// Portfolio JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Define inner if it's not defined (to fix potential error)
  if (typeof inner === 'undefined') {
    window.inner = {};
  }

  // Background animation elements are now pre-created in HTML

  // Email form submission
  const emailForm = document.getElementById('emailForm');
  if (emailForm) {
    emailForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const submitBtn = document.querySelector('.submit-btn');
      const submitText = document.querySelector('.submit-text');
      const spinner = document.querySelector('.spinner-border');

      // Show loading state
      submitText.textContent = 'Sending...';
      spinner.classList.remove('d-none');
      submitBtn.disabled = true;

      // Get form data
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      // Simulate sending email (replace with actual email sending logic)
      setTimeout(() => {
        // Reset form
        emailForm.reset();

        // Reset button state
        submitText.textContent = 'Send Message';
        spinner.classList.add('d-none');
        submitBtn.disabled = false;

        // Show success message
        alert('Thank you for your message! I will get back to you soon.');
      }, 1500);
    });
  }

  // API base URL
  const API_URL = 'http://localhost:5000/api';
  const SERVER_URL = 'http://localhost:5000';

  // Load data from JSON files
  loadTools();
  loadServices();
  loadProjects();
  loadSkills();

  // Load tools data
  function loadTools() {
    console.log('Fetching tools from API:', `${API_URL}/tools`);
    fetch(`${API_URL}/tools`)
      .then(response => {
        console.log('Tools API response status:', response.status);
        if (!response.ok) {
          throw new Error('Tools data not found');
        }
        return response.json();
      })
      .then(data => {
        console.log('Tools data received:', data);
        renderTools(data);
      })
      .catch(error => {
        console.error('Error loading tools:', error);
        document.getElementById('tools-container').innerHTML = '<div class="col-12 text-center py-5"><p>Error loading tools. Please try again later.</p></div>';
      });
  }

  // Load services data
  function loadServices() {
    fetch(`${API_URL}/services`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Services data not found');
        }
        return response.json();
      })
      .then(data => {
        renderServices(data);
      })
      .catch(error => {
        console.error('Error loading services:', error);
        document.getElementById('services-container').innerHTML = '<div class="col-12 text-center py-5"><p>Error loading services. Please try again later.</p></div>';
      });
  }

  // Load projects data
  function loadProjects() {
    fetch(`${API_URL}/projects`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Projects data not found');
        }
        return response.json();
      })
      .then(data => {
        renderProjects(data);
      })
      .catch(error => {
        console.error('Error loading projects:', error);
        document.getElementById('projects-container').innerHTML = '<div class="col-12 text-center py-5"><p>Error loading projects. Please try again later.</p></div>';
      });
  }

  // Render tools
  function renderTools(tools) {
    const toolsContainer = document.getElementById('tools-container');

    if (tools.length === 0) {
      toolsContainer.innerHTML = '<div class="col-12 text-center py-5"><p>No tools found.</p></div>';
      return;
    }

    let html = '';
    const rowSize = 4; // Number of tools per row

    // Create rows of tools
    for (let i = 0; i < tools.length; i += rowSize) {
      const rowTools = tools.slice(i, i + rowSize);

      rowTools.forEach(tool => {
        // Handle different image path formats
        let imagePath = tool.image;

        // If the image is a data URL, use it directly
        if (imagePath.startsWith('data:')) {
          // Use the data URL as is
        }
        // If the image path is a full URL, use it directly
        else if (imagePath.startsWith('http')) {
          // Use the URL as is
        }
        // If the image path starts with 'images/', prepend the server URL
        else if (imagePath.startsWith('images/')) {
          imagePath = `${SERVER_URL}/${imagePath}`;
        }
        // Otherwise, try to make it a relative path
        else {
          imagePath = `./${imagePath}`;
        }

        console.log(`Tool: ${tool.name}, Image path: ${imagePath}`);

        html += `
          <div class="col-6 col-md-3 tool-item">
            <div class="tool-icon">
              <img src="${imagePath}" alt="${tool.name}">
            </div>
            <h5>${tool.name}</h5>
          </div>
        `;
      });
    }

    toolsContainer.innerHTML = html;

    // Add animation classes to elements after rendering
    document.querySelectorAll('.tool-item').forEach((el, i) => {
      el.className += ' card-hidden animation-transition-card card-delay-' + Math.min(i, 10);
    });
  }

  // Render services
  function renderServices(services) {
    const servicesContainer = document.getElementById('services-container');

    if (services.length === 0) {
      servicesContainer.innerHTML = '<div class="col-12 text-center py-5"><p>No services found.</p></div>';
      return;
    }

    let html = '';

    // Create rows of services (3 per row)
    for (let i = 0; i < services.length; i += 3) {
      const rowServices = services.slice(i, i + 3);

      rowServices.forEach(service => {
        html += `
          <div class="col-md-4">
            <div class="service-card">
              <div class="service-icon">
                <i class="bi ${service.icon}"></i>
              </div>
              <h3>${service.title}</h3>
              <p>${service.description}</p>
            </div>
          </div>
        `;
      });
    }

    servicesContainer.innerHTML = html;

    // Add animation classes to elements after rendering
    document.querySelectorAll('.service-card').forEach((el, i) => {
      el.className += ' card-hidden animation-transition-card card-delay-' + Math.min(i, 10);
    });
  }

  // Render projects
  function renderProjects(projects) {
    const projectsContainer = document.getElementById('projects-container');

    if (projects.length === 0) {
      projectsContainer.innerHTML = '<div class="col-12 text-center py-5"><p>No projects found.</p></div>';
      return;
    }

    let html = '';

    projects.forEach(project => {
      // Create demo link if available
      const demoLink = project.demoUrl ?
        `<a href="${project.demoUrl}" class="project-link" target="_blank"><i class="bi bi-eye"></i></a>` :
        `<a href="#" class="project-link disabled"><i class="bi bi-eye-slash"></i></a>`;

      // Create GitHub link if available
      const githubLink = project.githubUrl ?
        `<a href="${project.githubUrl}" class="project-link" target="_blank"><i class="bi bi-github"></i></a>` :
        '';

      // Handle different image path formats
      let imagePath = project.image;

      // If the image is a data URL, use it directly
      if (imagePath.startsWith('data:')) {
        // Use the data URL as is
      }
      // If the image path is a full URL, use it directly
      else if (imagePath.startsWith('http')) {
        // Use the URL as is
      }
      // If the image path starts with 'images/', prepend the server URL
      else if (imagePath.startsWith('images/')) {
        imagePath = `${SERVER_URL}/${imagePath}`;
      }
      // Otherwise, try to make it a relative path
      else {
        imagePath = `./${imagePath}`;
      }

      console.log(`Project: ${project.title}, Image path: ${imagePath}`);

      html += `
        <div class="col-md-6 col-lg-3">
          <div class="project-card">
            <div class="project-img">
              <img src="${imagePath}" alt="${project.title}">
              <div class="project-overlay">
                <div class="project-links">
                  ${demoLink}
                  ${githubLink}
                </div>
              </div>
            </div>
            <div class="project-info">
              <h4>${project.title}</h4>
              <p>${project.description}</p>
              <div class="project-tags">
                ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    });

    projectsContainer.innerHTML = html;

    // Add animation classes to elements after rendering
    document.querySelectorAll('.project-card').forEach((el, i) => {
      el.className += ' card-hidden animation-transition-card card-delay-' + Math.min(i, 10);
    });
  }

  // Load skills data
  function loadSkills() {
    fetch(`${API_URL}/skills`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Skills data not found');
        }
        return response.json();
      })
      .then(data => {
        renderSkills(data);
      })
      .catch(error => {
        console.error('Error loading skills:', error);
        document.getElementById('skills-container').innerHTML = '<div class="text-center py-5"><p>Error loading skills. Please try again later.</p></div>';
      });
  }

  // Render skills
  function renderSkills(skills) {
    const skillsContainer = document.getElementById('skills-container');

    if (skills.length === 0) {
      skillsContainer.innerHTML = '<div class="text-center py-5"><p>No skills found.</p></div>';
      return;
    }

    let html = '';

    skills.forEach((skillGroup, groupIndex) => {
      html += `
        <div class="skill-group ${groupIndex > 0 ? 'mt-4' : 'mb-4'}">
          <div class="skill-group-header">
            <i class="bi ${skillGroup.icon} skill-icon"></i>
            <h4>${skillGroup.category}</h4>
          </div>
          <div class="skill-items">
      `;

      skillGroup.skills.forEach(skill => {
        html += `
          <div class="skill-item">
            <i class="bi bi-check-circle-fill text-primary me-2"></i>
            <span class="skill-name">${skill}</span>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    skillsContainer.innerHTML = html;

    // Add animation classes to elements after rendering
    document.querySelectorAll('.skill-group').forEach((el, i) => {
      el.className += ' card-hidden animation-transition-card group-delay-' + Math.min(i, 5);
    });

    document.querySelectorAll('.skill-item').forEach((el, i) => {
      el.className += ' skill-item-hidden skill-delay-' + Math.min(i, 15);
    });
  }

  // Enhanced scroll reveal animation
  const animateElements = () => {
    // Animate sections
    const sections = document.querySelectorAll('section:not(#landing)');
    sections.forEach(section => {
      section.classList.add('section-hidden');
    });

    // Animate skill groups
    document.querySelectorAll('.skill-group').forEach((el, i) => {
      el.className += ' card-hidden animation-transition-card group-delay-' + Math.min(i, 5);
    });

    // Animate skill items with a staggered effect
    document.querySelectorAll('.skill-item').forEach((el, i) => {
      el.className += ' skill-item-hidden skill-delay-' + Math.min(i, 15);
    });

    // Animate contact items
    document.querySelectorAll('.contact-item').forEach((el, i) => {
      el.className += ' card-hidden animation-transition-card card-delay-' + Math.min(i, 10);
    });

    // Animate highlight items
    document.querySelectorAll('.highlight-item').forEach((el, i) => {
      el.className += ' card-hidden animation-transition-card card-delay-' + Math.min(i, 10);
    });

    // Create intersection observer for sections
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            entry.target.classList.remove('section-hidden');
            sectionObserver.unobserve(entry.target);

            // Animate elements inside the visible section
            entry.target.querySelectorAll('.card-hidden').forEach(el => {
              el.className = el.className.replace('card-hidden', 'card-visible');
            });

            // Animate skill items when they become visible
            entry.target.querySelectorAll('.skill-item-hidden').forEach(el => {
              el.className = el.className.replace('skill-item-hidden', 'skill-item-visible');
            });
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  };

  // Initialize animations
  animateElements();

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });

        // Close navbar if it's open on mobile
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse.classList.contains('show')) {
          document.querySelector('.navbar-toggler').click();
        }
      }
    });
  });

  // Admin button added to navbar
});
