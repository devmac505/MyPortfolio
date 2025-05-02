// Freedom Wall JavaScript
// Execute immediately without waiting for DOMContentLoaded
(function() {
  console.log('Freedom Wall script starting...');

  // API base URL (not used in localStorage mode)
  const API_URL = 'http://localhost:5001/api';

  // DOM Elements - Get them after a small delay to ensure DOM is loaded
  let notesContainer, addNoteBtn, noteModalElement, viewNoteModalElement, saveNoteBtn;

  // Initialize Bootstrap modals
  let noteModal, viewNoteModal;

  // For drag and drop functionality
  let draggedNote = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let notePositions = {};

  // For resizing functionality
  let resizingNote = null;
  let resizeStartWidth = 0;
  let resizeStartHeight = 0;
  let resizeStartX = 0;
  let resizeStartY = 0;

  // Initialize the DOM elements and event listeners
  function initElements() {
    console.log('Initializing DOM elements...');

    notesContainer = document.getElementById('notes-container');
    addNoteBtn = document.getElementById('add-note-btn');
    noteModalElement = document.getElementById('noteModal');
    viewNoteModalElement = document.getElementById('viewNoteModal');
    saveNoteBtn = document.getElementById('save-note-btn');

    console.log('Notes container:', notesContainer);
    console.log('Add note button:', addNoteBtn);
    console.log('Note modal:', noteModalElement);
    console.log('View note modal:', viewNoteModalElement);
    console.log('Save note button:', saveNoteBtn);

    // Initialize Bootstrap modals
    if (typeof bootstrap !== 'undefined') {
      try {
        noteModal = new bootstrap.Modal(noteModalElement);
        viewNoteModal = new bootstrap.Modal(viewNoteModalElement);
        console.log('Modals initialized successfully with Bootstrap');
      } catch (err) {
        console.error('Error initializing Bootstrap modals:', err);
      }
    } else {
      console.warn('Bootstrap is not loaded, using fallback modal handling');
    }

    // Set up event listeners
    setupEventListeners();

    // Load saved note positions
    try {
      const savedPositions = localStorage.getItem('notePositions');
      if (savedPositions) {
        notePositions = JSON.parse(savedPositions);
        console.log('Loaded saved note positions:', notePositions);
      }
    } catch (err) {
      console.error('Error loading saved note positions:', err);
      notePositions = {};
    }

    // Load notes
    loadNotes();
  }

  // Set up all event listeners
  function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Add note button
    if (addNoteBtn) {
      console.log('Adding click event to add note button');
      addNoteBtn.addEventListener('click', handleAddNoteClick);
    } else {
      console.error('Add note button not found!');
    }

    // Save note button
    if (saveNoteBtn) {
      console.log('Adding click event to save note button');
      saveNoteBtn.addEventListener('click', handleSaveNoteClick);
    } else {
      console.error('Save note button not found!');
    }

    // Modal close buttons
    document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(button => {
      button.addEventListener('click', handleModalClose);
    });

    // Color select
    const colorSelect = document.getElementById('note-color');
    if (colorSelect) {
      console.log('Setting up color select');
      colorSelect.addEventListener('change', function() {
        updateColorPreview(this.value);
      });
    }

    // API toggle
    const apiToggle = document.getElementById('api-toggle');
    if (apiToggle) {
      console.log('Setting up API toggle');

      // Set initial state from localStorage
      const savedApiMode = localStorage.getItem('useApi');
      if (savedApiMode === 'true') {
        apiToggle.checked = true;
        useApi = true;
      }

      // Add change event listener
      apiToggle.addEventListener('change', function() {
        useApi = this.checked;
        localStorage.setItem('useApi', useApi);
        console.log('API mode changed:', useApi);

        // Reload notes with new mode
        loadNotes();

        // Show feedback
        const feedbackEl = document.createElement('div');
        feedbackEl.className = 'api-mode-feedback';
        feedbackEl.textContent = useApi ? 'Using API mode' : 'Using local storage mode';
        document.body.appendChild(feedbackEl);

        // Remove feedback after a delay
        setTimeout(() => {
          feedbackEl.classList.add('fade-out');
          setTimeout(() => {
            feedbackEl.remove();
          }, 500);
        }, 2000);
      });
    }
  }

  // Note colors
  const noteColors = ['yellow', 'blue', 'green', 'pink', 'purple'];

  // Sample notes for initial display if no data is available
  const sampleNotes = [
    {
      id: 'sample1',
      nickname: 'Visitor',
      message: 'Great portfolio! Love your projects.',
      color: 'yellow',
      date: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: 'sample2',
      nickname: 'WebDev',
      message: 'Your skills are impressive! Would love to collaborate sometime.',
      color: 'blue',
      date: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      id: 'sample3',
      nickname: 'Anonymous',
      message: 'Nice work on the MERN stack projects!',
      color: 'green',
      date: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    }
  ];

  // Flag to determine if we're using the API or localStorage
  let useApi = false;

  // Load notes from API or localStorage
  function loadNotes() {
    // Try to load from API first
    if (useApi) {
      console.log('Attempting to load notes from API...');

      fetch(`${API_URL}/notes`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          return response.json();
        })
        .then(notes => {
          console.log('Successfully loaded notes from API:', notes);
          renderNotes(notes);
        })
        .catch(error => {
          console.error('Error loading notes from API:', error);
          // Fall back to localStorage if API fails
          loadFromLocalStorage();
        });
    } else {
      // Use localStorage directly
      loadFromLocalStorage();
    }
  }

  // Load notes from localStorage
  function loadFromLocalStorage() {
    console.log('Loading notes from localStorage...');

    try {
      // Get notes from localStorage
      const savedNotes = JSON.parse(localStorage.getItem('freedomWallNotes') || '[]');

      if (savedNotes.length > 0) {
        console.log('Found notes in localStorage:', savedNotes);
        renderNotes(savedNotes);
      } else {
        console.log('No notes in localStorage, using sample notes');
        // If localStorage is empty, use sample notes
        renderNotes(sampleNotes);
        // Save sample notes to localStorage for future use
        localStorage.setItem('freedomWallNotes', JSON.stringify(sampleNotes));
      }
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
      // If there's an error, use sample notes
      console.log('Using sample notes due to error');
      renderNotes(sampleNotes);
      // Try to reset localStorage
      try {
        localStorage.setItem('freedomWallNotes', JSON.stringify(sampleNotes));
      } catch (e) {
        console.error('Could not save to localStorage:', e);
      }
    }
  }

  // Save note to API or localStorage
  function saveNote(note, isNew = true) {
    if (useApi) {
      // Determine if we're creating or updating
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? `${API_URL}/notes` : `${API_URL}/notes/${note._id || note.id}`;

      // Make API request
      fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(note)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        return response.json();
      })
      .then(savedNote => {
        console.log('Note saved to API:', savedNote);
        loadNotes(); // Reload notes from API
      })
      .catch(error => {
        console.error('Error saving note to API:', error);
        // Fall back to localStorage
        saveToLocalStorage(note, isNew);
      });
    } else {
      // Use localStorage directly
      saveToLocalStorage(note, isNew);
    }
  }

  // Save note to localStorage
  function saveToLocalStorage(note, isNew = true) {
    console.log('Saving note to localStorage:', note);
    const savedNotes = JSON.parse(localStorage.getItem('freedomWallNotes') || '[]');

    if (isNew) {
      // Add new note
      savedNotes.push(note);
    } else {
      // Update existing note
      const index = savedNotes.findIndex(n => (n._id || n.id) === (note._id || note.id));
      if (index !== -1) {
        savedNotes[index] = note;
      } else {
        console.error('Note not found for updating:', note);
      }
    }

    localStorage.setItem('freedomWallNotes', JSON.stringify(savedNotes));
    renderNotes(savedNotes);
  }

  // Delete note from API or localStorage
  function deleteNote(noteId) {
    if (useApi) {
      fetch(`${API_URL}/notes/${noteId}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        console.log('Note deleted from API');
        loadNotes(); // Reload notes from API
      })
      .catch(error => {
        console.error('Error deleting note from API:', error);
        // Fall back to localStorage
        deleteFromLocalStorage(noteId);
      });
    } else {
      // Use localStorage directly
      deleteFromLocalStorage(noteId);
    }
  }

  // Delete note from localStorage
  function deleteFromLocalStorage(noteId) {
    console.log('Deleting note from localStorage:', noteId);
    const savedNotes = JSON.parse(localStorage.getItem('freedomWallNotes') || '[]');
    const index = savedNotes.findIndex(n => (n._id || n.id) === noteId);

    if (index !== -1) {
      savedNotes.splice(index, 1);
      localStorage.setItem('freedomWallNotes', JSON.stringify(savedNotes));
      renderNotes(savedNotes);
    } else {
      console.error('Note not found for deletion:', noteId);
    }
  }

  // Render notes in the container
  function renderNotes(notes) {
    console.log('Rendering notes:', notes);

    if (!notesContainer) {
      console.error('Notes container element not found!');
      return;
    }

    // Clear the loading spinner
    notesContainer.innerHTML = '';

    if (!notes || notes.length === 0) {
      console.log('No notes to display');
      notesContainer.innerHTML = '<div class="text-center py-5"><p>No notes yet. Be the first to leave a note!</p></div>';
      return;
    }

    let html = '';

    notes.forEach(note => {
      try {
        const formattedDate = new Date(note.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        // Make sure color is valid, default to yellow if not
        const color = noteColors.includes(note.color) ? note.color : 'yellow';

        // Generate a random rotation between -5 and 5 degrees if not already set
        const rotation = note.rotation || Math.floor(Math.random() * 11) - 5;

        html += `
          <div class="sticky-note sticky-note-${color}" data-note-id="${note._id || note.id}" draggable="true">
            <div class="sticky-note-header">${note.nickname || 'Anonymous'}</div>
            <div class="sticky-note-content">${note.message}</div>
            <div class="sticky-note-date">${formattedDate}</div>
            <div class="sticky-note-actions">
              <button class="edit-note-btn" title="Edit"><i class="bi bi-pencil"></i></button>
              <button class="delete-note-btn" title="Delete"><i class="bi bi-trash"></i></button>
            </div>
            <div class="sticky-note-rotate">
              <button class="rotate-left-btn" title="Rotate Left"><i class="bi bi-arrow-counterclockwise"></i></button>
              <button class="rotate-right-btn" title="Rotate Right"><i class="bi bi-arrow-clockwise"></i></button>
            </div>
            <div class="resize-handle" title="Resize"></div>
          </div>
        `;
      } catch (err) {
        console.error('Error rendering note:', err, note);
      }
    });

    console.log('Setting HTML content for notes container');
    notesContainer.innerHTML = html;

    // Apply saved positions, rotations, and dimensions to notes
    document.querySelectorAll('.sticky-note').forEach(noteElement => {
      const noteId = noteElement.getAttribute('data-note-id');
      const position = notePositions[noteId];

      if (position) {
        // Apply position
        noteElement.style.position = 'absolute';
        noteElement.style.left = position.x + 'px';
        noteElement.style.top = position.y + 'px';
        noteElement.style.zIndex = position.zIndex || 1;

        // Apply dimensions if saved
        if (position.width && position.height) {
          noteElement.style.width = position.width + 'px';
          noteElement.style.height = position.height + 'px';
        }

        // Apply rotation if saved
        if (position.rotation !== undefined) {
          rotateNote(noteElement, position.rotation);
        } else {
          // Apply a random rotation between -5 and 5 degrees
          const randomRotation = Math.floor(Math.random() * 11) - 5;
          rotateNote(noteElement, randomRotation);
        }
      } else {
        // Apply a random rotation between -5 and 5 degrees for new notes
        const randomRotation = Math.floor(Math.random() * 11) - 5;
        rotateNote(noteElement, randomRotation);
      }
    });

    // Add click event to each note
    console.log('Adding click events to notes');
    document.querySelectorAll('.sticky-note').forEach(noteElement => {
      // View note when clicking on the note (except when clicking action buttons)
      noteElement.addEventListener('click', function(event) {
        // Don't trigger if clicking on action buttons
        if (event.target.closest('.sticky-note-actions') ||
            event.target.closest('.edit-note-btn') ||
            event.target.closest('.delete-note-btn')) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        console.log('Note clicked:', this);
        const noteId = this.getAttribute('data-note-id');
        console.log('Note ID:', noteId);

        // Find the note data
        const savedNotes = JSON.parse(localStorage.getItem('freedomWallNotes') || '[]');
        const noteData = savedNotes.find(n => (n._id || n.id) === noteId);

        if (noteData) {
          console.log('Found note data:', noteData);

          // Set the note data in the view modal
          const nicknameEl = document.getElementById('view-note-nickname');
          const messageEl = document.getElementById('view-note-message');
          const dateEl = document.getElementById('view-note-date');

          if (nicknameEl) nicknameEl.textContent = noteData.nickname || 'Anonymous';
          if (messageEl) messageEl.textContent = noteData.message;
          if (dateEl) {
            dateEl.textContent = new Date(noteData.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }

          // Show the view modal
          showModal('view');
        } else {
          console.error('Note data not found for ID:', noteId);
        }
      });

      // Add edit button click handler
      const editBtn = noteElement.querySelector('.edit-note-btn');
      if (editBtn) {
        editBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          const noteId = this.closest('.sticky-note').getAttribute('data-note-id');
          handleEditNote(noteId);
        });
      }

      // Add delete button click handler
      const deleteBtn = noteElement.querySelector('.delete-note-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          const noteId = this.closest('.sticky-note').getAttribute('data-note-id');
          handleDeleteNote(noteId);
        });
      }

      // Add rotation button handlers
      const rotateLeftBtn = noteElement.querySelector('.rotate-left-btn');
      if (rotateLeftBtn) {
        rotateLeftBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          const noteEl = this.closest('.sticky-note');
          // Get current rotation or default to 0
          const currentTransform = noteEl.style.transform || '';
          const currentRotation = currentTransform.match(/rotate\(([^)]+)\)/);
          const currentDegrees = currentRotation ?
            parseInt(currentRotation[1]) :
            0;

          // Rotate left by 5 degrees
          rotateNote(noteEl, currentDegrees - 5);
        });
      }

      const rotateRightBtn = noteElement.querySelector('.rotate-right-btn');
      if (rotateRightBtn) {
        rotateRightBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          const noteEl = this.closest('.sticky-note');
          // Get current rotation or default to 0
          const currentTransform = noteEl.style.transform || '';
          const currentRotation = currentTransform.match(/rotate\(([^)]+)\)/);
          const currentDegrees = currentRotation ?
            parseInt(currentRotation[1]) :
            0;

          // Rotate right by 5 degrees
          rotateNote(noteEl, currentDegrees + 5);
        });
      }

      // Add drag and drop functionality
      noteElement.addEventListener('dragstart', handleDragStart);
      noteElement.addEventListener('dragend', handleDragEnd);

      // Add touch support for mobile devices
      noteElement.addEventListener('touchstart', handleTouchStart);
      noteElement.addEventListener('touchmove', handleTouchMove);
      noteElement.addEventListener('touchend', handleTouchEnd);

      // Bring note to front when interacting with it
      noteElement.addEventListener('mousedown', function() {
        bringNoteToFront(this);
      });

      // Add resize handle events
      const resizeHandle = noteElement.querySelector('.resize-handle');
      if (resizeHandle) {
        resizeHandle.addEventListener('mousedown', handleResizeStart);
        resizeHandle.addEventListener('touchstart', handleResizeStart);
      }
    });

    // Make the container a drop target
    notesContainer.addEventListener('dragover', function(event) {
      event.preventDefault(); // Allow drop
    });

    notesContainer.addEventListener('drop', handleDrop);
  }

  // Bring a note to the front
  function bringNoteToFront(noteElement) {
    // Get all notes
    const notes = document.querySelectorAll('.sticky-note');

    // Find the highest z-index
    let maxZIndex = 0;
    notes.forEach(note => {
      const zIndex = parseInt(note.style.zIndex || 1);
      if (zIndex > maxZIndex) {
        maxZIndex = zIndex;
      }
    });

    // Set this note's z-index to be higher
    noteElement.style.zIndex = maxZIndex + 1;

    // Update the position in storage
    const noteId = noteElement.getAttribute('data-note-id');
    if (noteId && notePositions[noteId]) {
      notePositions[noteId].zIndex = maxZIndex + 1;
      localStorage.setItem('notePositions', JSON.stringify(notePositions));
    }
  }

  // Rotate a note
  function rotateNote(noteElement, degrees) {
    // Get current rotation
    const currentTransform = noteElement.style.transform || '';
    const currentRotation = currentTransform.match(/rotate\(([^)]+)\)/);

    // Set new rotation
    if (currentRotation) {
      // Replace existing rotation
      noteElement.style.transform = currentTransform.replace(
        /rotate\([^)]+\)/,
        `rotate(${degrees}deg)`
      );
    } else {
      // Add rotation to existing transform
      noteElement.style.transform = `${currentTransform} rotate(${degrees}deg)`;
    }

    // Update the position in storage
    const noteId = noteElement.getAttribute('data-note-id');
    if (noteId) {
      if (!notePositions[noteId]) {
        notePositions[noteId] = {};
      }
      notePositions[noteId].rotation = degrees;
      localStorage.setItem('notePositions', JSON.stringify(notePositions));
    }
  }

  // Handle drag start
  function handleDragStart(event) {
    draggedNote = this;

    // Store the initial mouse position relative to the note
    const rect = draggedNote.getBoundingClientRect();
    dragStartX = event.clientX - rect.left;
    dragStartY = event.clientY - rect.top;

    // Add a class for styling
    this.classList.add('dragging');

    // Set drag image (optional)
    if (event.dataTransfer) {
      event.dataTransfer.setDragImage(this, dragStartX, dragStartY);
      event.dataTransfer.effectAllowed = 'move';
    }

    // Bring to front
    bringNoteToFront(this);
  }

  // Handle drag end
  function handleDragEnd() {
    this.classList.remove('dragging');
    draggedNote = null;
  }

  // Handle drop
  function handleDrop(event) {
    event.preventDefault();

    if (!draggedNote) return;

    // Calculate the new position
    const containerRect = notesContainer.getBoundingClientRect();
    const x = event.clientX - containerRect.left - dragStartX;
    const y = event.clientY - containerRect.top - dragStartY;

    // Apply the new position
    draggedNote.style.position = 'absolute';
    draggedNote.style.left = x + 'px';
    draggedNote.style.top = y + 'px';

    // Save the position
    const noteId = draggedNote.getAttribute('data-note-id');
    notePositions[noteId] = {
      x: x,
      y: y,
      zIndex: parseInt(draggedNote.style.zIndex || 1)
    };

    localStorage.setItem('notePositions', JSON.stringify(notePositions));
  }

  // Handle touch start (for mobile)
  function handleTouchStart(event) {
    if (event.touches.length === 1) {
      const touch = event.touches[0];

      draggedNote = this;

      // Store the initial touch position relative to the note
      const rect = draggedNote.getBoundingClientRect();
      dragStartX = touch.clientX - rect.left;
      dragStartY = touch.clientY - rect.top;

      // Add a class for styling
      this.classList.add('dragging');

      // Bring to front
      bringNoteToFront(this);

      // Prevent scrolling while dragging
      event.preventDefault();
    }
  }

  // Handle touch move (for mobile)
  function handleTouchMove(event) {
    if (draggedNote && event.touches.length === 1) {
      const touch = event.touches[0];

      // Calculate the new position
      const containerRect = notesContainer.getBoundingClientRect();
      const x = touch.clientX - containerRect.left - dragStartX;
      const y = touch.clientY - containerRect.top - dragStartY;

      // Apply the new position
      draggedNote.style.position = 'absolute';
      draggedNote.style.left = x + 'px';
      draggedNote.style.top = y + 'px';

      // Prevent scrolling while dragging
      event.preventDefault();
    }
  }

  // Handle touch end (for mobile)
  function handleTouchEnd(event) {
    if (draggedNote) {
      // Save the final position
      const noteId = draggedNote.getAttribute('data-note-id');
      const rect = draggedNote.getBoundingClientRect();
      const containerRect = notesContainer.getBoundingClientRect();

      const x = rect.left - containerRect.left;
      const y = rect.top - containerRect.top;

      notePositions[noteId] = {
        x: x,
        y: y,
        zIndex: parseInt(draggedNote.style.zIndex || 1)
      };

      localStorage.setItem('notePositions', JSON.stringify(notePositions));

      // Clean up
      draggedNote.classList.remove('dragging');
      draggedNote = null;
    }
  }

  // Handle resize start
  function handleResizeStart(event) {
    event.preventDefault();
    event.stopPropagation();

    // Get the note element
    resizingNote = this.closest('.sticky-note');

    // Bring note to front
    bringNoteToFront(resizingNote);

    // Get initial dimensions
    const rect = resizingNote.getBoundingClientRect();
    resizeStartWidth = rect.width;
    resizeStartHeight = rect.height;

    // Get initial mouse position
    if (event.type === 'mousedown') {
      resizeStartX = event.clientX;
      resizeStartY = event.clientY;

      // Add mouse move and up listeners to document
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    } else if (event.type === 'touchstart') {
      resizeStartX = event.touches[0].clientX;
      resizeStartY = event.touches[0].clientY;

      // Add touch move and end listeners to document
      document.addEventListener('touchmove', handleResizeMove);
      document.addEventListener('touchend', handleResizeEnd);
    }

    // Add resizing class
    resizingNote.classList.add('resizing');
  }

  // Handle resize move
  function handleResizeMove(event) {
    if (!resizingNote) return;

    // Get current mouse position
    let currentX, currentY;
    if (event.type === 'mousemove') {
      currentX = event.clientX;
      currentY = event.clientY;
    } else if (event.type === 'touchmove') {
      currentX = event.touches[0].clientX;
      currentY = event.touches[0].clientY;
      // Prevent scrolling
      event.preventDefault();
    }

    // Calculate new dimensions
    const deltaX = currentX - resizeStartX;
    const deltaY = currentY - resizeStartY;

    const newWidth = Math.max(150, resizeStartWidth + deltaX);
    const newHeight = Math.max(150, resizeStartHeight + deltaY);

    // Apply new dimensions
    resizingNote.style.width = newWidth + 'px';
    resizingNote.style.height = newHeight + 'px';

    // Save dimensions in storage
    const noteId = resizingNote.getAttribute('data-note-id');
    if (noteId) {
      if (!notePositions[noteId]) {
        notePositions[noteId] = {};
      }
      notePositions[noteId].width = newWidth;
      notePositions[noteId].height = newHeight;
      localStorage.setItem('notePositions', JSON.stringify(notePositions));
    }
  }

  // Handle resize end
  function handleResizeEnd(event) {
    if (!resizingNote) return;

    // Remove resizing class
    resizingNote.classList.remove('resizing');

    // Clean up
    resizingNote = null;

    // Remove event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.removeEventListener('touchmove', handleResizeMove);
    document.removeEventListener('touchend', handleResizeEnd);
  }

  // Handle click on add note button
  function handleAddNoteClick() {
    console.log('Add note button clicked');

    // Reset editing state
    currentEditingNoteId = null;

    // Reset form
    if (document.getElementById('note-form')) {
      document.getElementById('note-form').reset();
    }

    // Randomly select a color
    const randomColor = noteColors[Math.floor(Math.random() * noteColors.length)];
    const colorSelect = document.getElementById('note-color');
    if (colorSelect) {
      colorSelect.value = randomColor;
      // Update color preview
      updateColorPreview(randomColor);
    }

    // Update modal title
    const modalTitle = document.getElementById('noteModalLabel');
    if (modalTitle) modalTitle.textContent = 'Add a Note';

    // Show modal
    showModal('note');
  }

  // Update color preview based on selected color
  function updateColorPreview(color) {
    const colorPreview = document.getElementById('color-preview');
    if (colorPreview) {
      // Remove all color classes
      noteColors.forEach(c => {
        colorPreview.classList.remove(`sticky-note-${c}`);
      });
      // Add selected color class
      colorPreview.classList.add(`sticky-note-${color}`);
    }
  }

  // Current note being edited (null for new notes)
  let currentEditingNoteId = null;

  // Handle click on save note button
  function handleSaveNoteClick() {
    console.log('Save note button clicked');

    const nicknameEl = document.getElementById('note-nickname');
    const messageEl = document.getElementById('note-message');
    const colorEl = document.getElementById('note-color');

    if (!nicknameEl || !messageEl || !colorEl) {
      console.error('Form elements not found!');
      return;
    }

    const nickname = nicknameEl.value || 'Anonymous';
    const message = messageEl.value;
    const color = colorEl.value;

    if (!message) {
      alert('Please enter a message');
      return;
    }

    if (currentEditingNoteId) {
      // Check if it's one of the initial notes
      if (currentEditingNoteId.startsWith('initial')) {
        // Update the DOM directly
        const noteElement = document.querySelector(`[data-note-id="${currentEditingNoteId}"]`);
        if (noteElement) {
          // Update the note content
          const headerEl = noteElement.querySelector('.sticky-note-header');
          const contentEl = noteElement.querySelector('.sticky-note-content');
          const dateEl = noteElement.querySelector('.sticky-note-date');

          if (headerEl) headerEl.textContent = nickname;
          if (contentEl) contentEl.textContent = message;
          if (dateEl) dateEl.textContent = 'Just now';

          // Update the note color
          noteElement.className = noteElement.className.replace(/sticky-note-\w+/, `sticky-note-${color}`);

          console.log('Updated initial note in DOM');
        } else {
          console.error('Initial note element not found:', currentEditingNoteId);
        }
      } else {
        // Edit existing note in localStorage
        const savedNotes = JSON.parse(localStorage.getItem('freedomWallNotes') || '[]');
        const noteIndex = savedNotes.findIndex(n => (n._id || n.id) === currentEditingNoteId);

        if (noteIndex !== -1) {
          // Create updated note object
          const updatedNote = {
            ...savedNotes[noteIndex],
            nickname,
            message,
            color
            // Don't update the date for edits
          };

          // Save the updated note
          saveNote(updatedNote, false);
          console.log('Updated note:', updatedNote);
        } else {
          console.error('Note not found for editing:', currentEditingNoteId);
        }
      }

      // Reset editing state
      const editedNoteId = currentEditingNoteId;
      currentEditingNoteId = null;

      // Add highlight animation
      setTimeout(() => {
        const noteElement = document.querySelector(`[data-note-id="${editedNoteId}"]`);
        if (noteElement) {
          noteElement.classList.add('note-highlight');
          setTimeout(() => {
            noteElement.classList.remove('note-highlight');
          }, 1500);
        }
      }, 100);
    } else {
      // Create new note
      const newNote = {
        id: 'note_' + Date.now(),
        nickname,
        message,
        color,
        date: new Date().toISOString()
      };

      // Save the new note
      saveNote(newNote, true);
      console.log('Added new note:', newNote);

      // Add animation to the new note (after a delay to ensure rendering)
      setTimeout(() => {
        const noteElement = document.querySelector(`[data-note-id="${newNote.id}"]`);
        if (noteElement) {
          noteElement.classList.add('note-highlight');
          setTimeout(() => {
            noteElement.classList.remove('note-highlight');
          }, 1500);
        }
      }, 300);
    }

    // Hide modal
    hideModal('note');
  }

  // Handle edit note
  function handleEditNote(noteId) {
    console.log('Edit note:', noteId);

    // Check if it's one of the initial notes
    if (noteId.startsWith('initial')) {
      // Get data from the DOM
      const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
      if (noteElement) {
        const headerEl = noteElement.querySelector('.sticky-note-header');
        const contentEl = noteElement.querySelector('.sticky-note-content');
        const colorClass = Array.from(noteElement.classList)
          .find(cls => cls.startsWith('sticky-note-'))
          ?.replace('sticky-note-', '');

        // Create a note object from the DOM
        const noteData = {
          id: noteId,
          nickname: headerEl?.textContent || 'Anonymous',
          message: contentEl?.textContent || '',
          color: colorClass || 'yellow',
          date: new Date().toISOString()
        };

        // Set current editing note ID
        currentEditingNoteId = noteId;

        // Set form values
        const nicknameEl = document.getElementById('note-nickname');
        const messageEl = document.getElementById('note-message');
        const colorEl = document.getElementById('note-color');

        if (nicknameEl) nicknameEl.value = noteData.nickname;
        if (messageEl) messageEl.value = noteData.message;
        if (colorEl) {
          colorEl.value = noteData.color;
          // Update color preview
          updateColorPreview(noteData.color);
        }

        // Update modal title
        const modalTitle = document.getElementById('noteModalLabel');
        if (modalTitle) modalTitle.textContent = 'Edit Note';

        // Show modal
        showModal('note');
        return;
      }
    }

    // For non-initial notes, use localStorage
    const savedNotes = JSON.parse(localStorage.getItem('freedomWallNotes') || '[]');
    const noteData = savedNotes.find(n => (n._id || n.id) === noteId);

    if (!noteData) {
      console.error('Note not found for editing:', noteId);
      return;
    }

    // Set current editing note ID
    currentEditingNoteId = noteId;

    // Set form values
    const nicknameEl = document.getElementById('note-nickname');
    const messageEl = document.getElementById('note-message');
    const colorEl = document.getElementById('note-color');

    if (nicknameEl) nicknameEl.value = noteData.nickname || '';
    if (messageEl) messageEl.value = noteData.message || '';
    if (colorEl) {
      colorEl.value = noteData.color || 'yellow';
      // Update color preview
      updateColorPreview(noteData.color || 'yellow');
    }

    // Update modal title
    const modalTitle = document.getElementById('noteModalLabel');
    if (modalTitle) modalTitle.textContent = 'Edit Note';

    // Show modal
    showModal('note');
  }

  // Handle delete note
  function handleDeleteNote(noteId) {
    console.log('Delete note:', noteId);

    if (confirm('Are you sure you want to delete this note?')) {
      // Add a visual effect before removing
      const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
      if (noteElement) {
        noteElement.classList.add('note-removing');

        // Wait for animation to complete
        setTimeout(() => {
          // Check if it's one of the initial notes
          if (noteId.startsWith('initial')) {
            // Just remove the element from the DOM
            noteElement.remove();
          } else {
            // Delete the note from localStorage
            deleteNote(noteId);
          }
        }, 300);
      } else {
        // No element found, just delete the note if it's not an initial note
        if (!noteId.startsWith('initial')) {
          deleteNote(noteId);
        }
      }

      // Also remove from positions storage
      if (notePositions[noteId]) {
        delete notePositions[noteId];
        localStorage.setItem('notePositions', JSON.stringify(notePositions));
      }
    }
  }

  // Handle modal close button click
  function handleModalClose(event) {
    console.log('Modal close button clicked');
    const modalId = this.closest('.modal').id;

    if (modalId === 'noteModal') {
      hideModal('note');
    } else if (modalId === 'viewNoteModal') {
      hideModal('view');
    }
  }

  // Show a modal
  function showModal(type) {
    console.log(`Showing ${type} modal`);

    try {
      if (type === 'note') {
        if (typeof bootstrap !== 'undefined') {
          // Try to create a new modal instance if it doesn't exist
          if (!noteModal && noteModalElement) {
            noteModal = new bootstrap.Modal(noteModalElement);
          }

          if (noteModal) {
            noteModal.show();
            return;
          }
        }

        // Fallback if Bootstrap is not available or modal creation failed
        if (noteModalElement) {
          noteModalElement.classList.add('show');
          noteModalElement.style.display = 'block';
          document.body.classList.add('modal-open');

          // Add backdrop if it doesn't exist
          if (!document.querySelector('.modal-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
          }
        } else {
          console.error('Note modal element not found');
        }
      } else if (type === 'view') {
        if (typeof bootstrap !== 'undefined') {
          // Try to create a new modal instance if it doesn't exist
          if (!viewNoteModal && viewNoteModalElement) {
            viewNoteModal = new bootstrap.Modal(viewNoteModalElement);
          }

          if (viewNoteModal) {
            viewNoteModal.show();
            return;
          }
        }

        // Fallback if Bootstrap is not available or modal creation failed
        if (viewNoteModalElement) {
          viewNoteModalElement.classList.add('show');
          viewNoteModalElement.style.display = 'block';
          document.body.classList.add('modal-open');

          // Add backdrop if it doesn't exist
          if (!document.querySelector('.modal-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
          }
        } else {
          console.error('View note modal element not found');
        }
      }
    } catch (error) {
      console.error('Error showing modal:', error);
    }
  }

  // Hide a modal
  function hideModal(type) {
    console.log(`Hiding ${type} modal`);

    try {
      if (type === 'note') {
        if (noteModal) {
          noteModal.hide();
        } else if (noteModalElement) {
          noteModalElement.classList.remove('show');
          noteModalElement.style.display = 'none';
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
        }
      } else if (type === 'view') {
        if (viewNoteModal) {
          viewNoteModal.hide();
        } else if (viewNoteModalElement) {
          viewNoteModalElement.classList.remove('show');
          viewNoteModalElement.style.display = 'none';
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
        }
      }
    } catch (error) {
      console.error('Error hiding modal:', error);

      // Force cleanup in case of error
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();

      if (type === 'note' && noteModalElement) {
        noteModalElement.classList.remove('show');
        noteModalElement.style.display = 'none';
      } else if (type === 'view' && viewNoteModalElement) {
        viewNoteModalElement.classList.remove('show');
        viewNoteModalElement.style.display = 'none';
      }
    }
  }

  // Add event listeners to modal close buttons
  document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(button => {
    button.addEventListener('click', function() {
      const modalId = this.closest('.modal').id;
      if (modalId === 'noteModal') {
        if (noteModal) {
          noteModal.hide();
        } else {
          noteModalElement.classList.remove('show');
          noteModalElement.style.display = 'none';
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
        }
      } else if (modalId === 'viewNoteModal') {
        if (viewNoteModal) {
          viewNoteModal.hide();
        } else {
          viewNoteModalElement.classList.remove('show');
          viewNoteModalElement.style.display = 'none';
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
        }
      }
    });
  });

  // Initialize after a small delay to ensure DOM is loaded
  setTimeout(() => {
    console.log('Initializing freedom wall...');

    // Debug info
    console.log('Notes container exists:', !!document.getElementById('notes-container'));
    console.log('Add note button exists:', !!document.getElementById('add-note-btn'));
    console.log('Note modal exists:', !!document.getElementById('noteModal'));
    console.log('View note modal exists:', !!document.getElementById('viewNoteModal'));
    console.log('Save note button exists:', !!document.getElementById('save-note-btn'));

    // Force localStorage mode for now until API is fixed
    useApi = false;

    // Initialize DOM elements
    initElements();

    // Add drag-and-drop functionality to the initial notes
    document.querySelectorAll('.sticky-note').forEach(noteElement => {
      // Add drag and drop functionality
      noteElement.addEventListener('dragstart', handleDragStart);
      noteElement.addEventListener('dragend', handleDragEnd);

      // Add touch support for mobile devices
      noteElement.addEventListener('touchstart', handleTouchStart);
      noteElement.addEventListener('touchmove', handleTouchMove);
      noteElement.addEventListener('touchend', handleTouchEnd);

      // Bring note to front when interacting with it
      noteElement.addEventListener('mousedown', function() {
        bringNoteToFront(this);
      });

      // Add edit button click handler
      const editBtn = noteElement.querySelector('.edit-note-btn');
      if (editBtn) {
        editBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          const noteId = this.closest('.sticky-note').getAttribute('data-note-id');
          handleEditNote(noteId);
        });
      }

      // Add delete button click handler
      const deleteBtn = noteElement.querySelector('.delete-note-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          const noteId = this.closest('.sticky-note').getAttribute('data-note-id');
          handleDeleteNote(noteId);
        });
      }

      // Add resize handle events
      const resizeHandle = noteElement.querySelector('.resize-handle');
      if (resizeHandle) {
        resizeHandle.addEventListener('mousedown', handleResizeStart);
        resizeHandle.addEventListener('touchstart', handleResizeStart);
      }

      // Add rotation button handlers
      const rotateLeftBtn = noteElement.querySelector('.rotate-left-btn');
      if (rotateLeftBtn) {
        rotateLeftBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          const noteEl = this.closest('.sticky-note');
          // Get current rotation or default to 0
          const currentTransform = noteEl.style.transform || '';
          const currentRotation = currentTransform.match(/rotate\(([^)]+)\)/);
          const currentDegrees = currentRotation ?
            parseInt(currentRotation[1]) :
            0;

          // Rotate left by 5 degrees
          rotateNote(noteEl, currentDegrees - 5);
        });
      }

      const rotateRightBtn = noteElement.querySelector('.rotate-right-btn');
      if (rotateRightBtn) {
        rotateRightBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          const noteEl = this.closest('.sticky-note');
          // Get current rotation or default to 0
          const currentTransform = noteEl.style.transform || '';
          const currentRotation = currentTransform.match(/rotate\(([^)]+)\)/);
          const currentDegrees = currentRotation ?
            parseInt(currentRotation[1]) :
            0;

          // Rotate right by 5 degrees
          rotateNote(noteEl, currentDegrees + 5);
        });
      }
    });

    // Make the container a drop target
    const notesContainer = document.getElementById('notes-container');
    if (notesContainer) {
      notesContainer.addEventListener('dragover', function(event) {
        event.preventDefault(); // Allow drop
      });

      notesContainer.addEventListener('drop', handleDrop);
    }
  }, 100);
});
