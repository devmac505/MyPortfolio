// New Freedom Wall JavaScript - Simplified Version
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const notesContainer = document.getElementById('notes-container');
  const addNoteBtn = document.getElementById('add-note-btn');
  const saveNoteBtn = document.getElementById('save-note-btn');
  const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"]');
  const noteModal = document.getElementById('noteModal');
  const viewNoteModal = document.getElementById('viewNoteModal');

  // For tracking the note being edited
  let currentEditingNoteId = null;
  let currentEditNote = null; // Store the current note being edited

  // For storing note positions
  let notePositions = {};

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

  // Initialize
  function init() {
    // Load saved note positions
    try {
      const savedPositions = localStorage.getItem('notePositions');
      if (savedPositions) {
        notePositions = JSON.parse(savedPositions);
      }
    } catch (error) {
      notePositions = {};
    }

    // Initialize Bootstrap modals
    if (noteModal) {
      try {
        // Pre-initialize the modals to ensure they're ready
        new bootstrap.Modal(noteModal);

        // Fix iOS Safari issues with modals
        noteModal.addEventListener('touchmove', function(e) {
          e.stopPropagation();
        }, { passive: false });
      } catch (error) {
        console.error('Error initializing note modal:', error);
      }
    }

    if (viewNoteModal) {
      try {
        new bootstrap.Modal(viewNoteModal);

        // Fix iOS Safari issues with modals
        viewNoteModal.addEventListener('touchmove', function(e) {
          e.stopPropagation();
        }, { passive: false });
      } catch (error) {
        console.error('Error initializing view note modal:', error);
      }
    }

    // Handle mobile device detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // Add special class for mobile styling
      document.body.classList.add('mobile-device');

      // Adjust note container for better touch experience
      if (notesContainer) {
        notesContainer.classList.add('mobile-notes-container');
      }
    }

    // Set up event listeners
    setupEventListeners();

    // Load notes
    loadNotes();
  }

  // Set up event listeners
  function setupEventListeners() {
    // Add note button
    if (addNoteBtn) {
      addNoteBtn.addEventListener('click', function(event) {
        event.preventDefault();
        openAddNoteModal();
      });
    }

    // Save note button
    if (saveNoteBtn) {
      saveNoteBtn.addEventListener('click', function(event) {
        event.preventDefault();
        saveNote();
      });
    }

    // Set up modal events
    if (noteModal) {
      // Add event listener to close button
      const closeNoteBtn = document.getElementById('close-note-btn');
      if (closeNoteBtn) {
        closeNoteBtn.addEventListener('click', function(event) {
          event.preventDefault();
          closeModal();
        });
      }

      // Add event listener to close button in header
      const closeHeaderBtn = noteModal.querySelector('.btn-close');
      if (closeHeaderBtn) {
        closeHeaderBtn.addEventListener('click', function(event) {
          event.preventDefault();
          closeModal();
        });
      }
    }

    if (viewNoteModal) {
      // Add event listener to close button
      const closeViewBtn = document.getElementById('close-view-btn');
      if (closeViewBtn) {
        closeViewBtn.addEventListener('click', function(event) {
          event.preventDefault();
          closeModal();
        });
      }

      // Add event listener to close button in header
      const closeHeaderBtn = viewNoteModal.querySelector('.btn-close');
      if (closeHeaderBtn) {
        closeHeaderBtn.addEventListener('click', function(event) {
          event.preventDefault();
          closeModal();
        });
      }
    }

    // Color select
    const colorSelect = document.getElementById('note-color');
    if (colorSelect) {
      colorSelect.addEventListener('change', function() {
        updateColorPreview(this.value);
      });
    }
  }

  // Open add note modal
  function openAddNoteModal() {
    // Reset form
    const nicknameEl = document.getElementById('note-nickname');
    const messageEl = document.getElementById('note-message');
    const colorEl = document.getElementById('note-color');

    if (nicknameEl) nicknameEl.value = '';
    if (messageEl) messageEl.value = '';
    if (colorEl) colorEl.value = 'yellow';

    // Reset editing state
    currentEditingNoteId = null;

    // Update modal title
    const modalTitle = document.getElementById('noteModalLabel');
    if (modalTitle) modalTitle.textContent = 'Add a Note';

    // Update color preview
    updateColorPreview('yellow');

    // Show modal directly without backdrop
    if (noteModal) {
      // Show the modal directly
      noteModal.style.display = 'block';
      noteModal.classList.add('show');

      // Focus on the nickname field after a delay
      setTimeout(() => {
        if (nicknameEl) {
          // Then focus on the input field
          nicknameEl.focus();
        }
      }, 300);
    }
  }

  // Close modal
  function closeModal() {
    // Hide note modal manually
    if (noteModal) {
      noteModal.style.display = 'none';
      noteModal.classList.remove('show');
    }

    // Hide view modal manually
    if (viewNoteModal) {
      viewNoteModal.style.display = 'none';
      viewNoteModal.classList.remove('show');
    }

    // Remove any existing backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }

    // Reset form fields
    const nicknameEl = document.getElementById('note-nickname');
    const messageEl = document.getElementById('note-message');
    if (nicknameEl) nicknameEl.value = '';
    if (messageEl) messageEl.value = '';

    // Reset editing state
    currentEditingNoteId = null;
  }

  // Save note
  function saveNote() {
    const nicknameEl = document.getElementById('note-nickname');
    const messageEl = document.getElementById('note-message');
    const colorEl = document.getElementById('note-color');

    if (!nicknameEl || !messageEl || !colorEl) {
      return;
    }

    const nickname = nicknameEl.value || 'Anonymous';
    const message = messageEl.value;
    const color = colorEl.value;

    if (!message) {
      alert('Please enter a message');
      return;
    }

    try {
      if (currentEditingNoteId) {
        // Edit existing note
        // Find the existing note in localStorage
        const savedNotes = JSON.parse(localStorage.getItem('freedomWallNotes') || '[]');
        const noteIndex = savedNotes.findIndex(n => (n._id || n.id) === currentEditingNoteId);

        if (noteIndex !== -1) {
          // Update the note
          savedNotes[noteIndex].nickname = nickname;
          savedNotes[noteIndex].message = message;
          savedNotes[noteIndex].color = color;
          savedNotes[noteIndex].lastEdited = new Date().toISOString();

          // Save to localStorage
          localStorage.setItem('freedomWallNotes', JSON.stringify(savedNotes));
        }

        // Update the DOM
        const noteElement = document.querySelector(`[data-note-id="${currentEditingNoteId}"]`);
        if (noteElement) {
          const headerEl = noteElement.querySelector('.sticky-note-header');
          const contentEl = noteElement.querySelector('.sticky-note-content');

          if (headerEl) headerEl.textContent = nickname;
          if (contentEl) contentEl.textContent = message;

          // Update color
          noteElement.className = noteElement.className.replace(/sticky-note-\w+/, `sticky-note-${color}`);

          // Add a highlight effect to show the note was updated
          noteElement.classList.add('note-highlight');
          setTimeout(() => {
            noteElement.classList.remove('note-highlight');
          }, 1500);
        }

        // Reset editing state
        currentEditingNoteId = null;
      } else {
        // Create new note
        const newNote = {
          id: 'note_' + Date.now(),
          nickname: nickname,
          message: message,
          color: color,
          date: new Date().toISOString()
        };

        // Save to localStorage
        const savedNotes = JSON.parse(localStorage.getItem('freedomWallNotes') || '[]');
        savedNotes.push(newNote);
        localStorage.setItem('freedomWallNotes', JSON.stringify(savedNotes));

        // Add to DOM
        addNoteToDOM(newNote);
      }

      // Close modal manually
      closeModal();

      return true;
    } catch (error) {
      console.error('Error saving note:', error);
      alert('There was an error saving your note. Please try again.');
      return false;
    }
  }

  // Load notes from localStorage
  function loadNotes() {
    // Clear the container
    if (notesContainer) {
      notesContainer.innerHTML = '';
    }

    // Get notes from localStorage
    const savedNotes = JSON.parse(localStorage.getItem('freedomWallNotes') || '[]');

    if (savedNotes.length > 0) {
      savedNotes.forEach(note => addNoteToDOM(note));
    } else {
      // If localStorage is empty, use sample notes
      sampleNotes.forEach(note => addNoteToDOM(note));
      // Save sample notes to localStorage for future use
      localStorage.setItem('freedomWallNotes', JSON.stringify(sampleNotes));
    }
  }

  // Add a note to the DOM
  function addNoteToDOM(note) {
    if (!notesContainer) return;

    const noteId = note._id || note.id;
    const formattedDate = new Date(note.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    // Make sure color is valid, default to yellow if not
    const color = noteColors.includes(note.color) ? note.color : 'yellow';

    // Create note element
    const noteHtml = `
      <div class="sticky-note sticky-note-${color}" data-note-id="${noteId}" draggable="true" style="opacity: 0; transform: scale(0.8) rotate(0deg);">
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

    // Add to container
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = noteHtml;
    const noteElement = tempDiv.firstElementChild;
    notesContainer.appendChild(noteElement);

    // Apply position if saved
    const position = notePositions[noteId];
    if (position) {
      noteElement.style.position = 'absolute';
      noteElement.style.left = position.x + 'px';
      noteElement.style.top = position.y + 'px';
      noteElement.style.zIndex = position.zIndex || 1;
    } else {
      // Position randomly if no saved position
      const containerWidth = notesContainer.offsetWidth - 200;
      const containerHeight = notesContainer.offsetHeight - 200;

      const x = Math.floor(Math.random() * containerWidth);
      const y = Math.floor(Math.random() * containerHeight);

      noteElement.style.position = 'absolute';
      noteElement.style.left = x + 'px';
      noteElement.style.top = y + 'px';
      noteElement.style.zIndex = 1;
    }

    // Apply a random rotation
    const randomRotation = Math.floor(Math.random() * 11) - 5;

    // Add event listeners
    setupNoteEventListeners(noteElement);

    // Animate the note appearance with a slight delay
    setTimeout(() => {
      noteElement.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      noteElement.style.opacity = '1';
      noteElement.style.transform = `scale(1) rotate(${randomRotation}deg)`;

      // Add highlight effect after appearing
      setTimeout(() => {
        noteElement.classList.add('note-highlight');
        setTimeout(() => {
          noteElement.classList.remove('note-highlight');
        }, 1500);
      }, 500);
    }, 50);
  }

  // Set up event listeners for a note
  function setupNoteEventListeners(noteElement) {
    // Note click to view
    noteElement.onclick = function(event) {
      // Only trigger if the click is directly on the note or its content/header
      // (not on buttons)
      if (!event.target.closest('button')) {
        const noteId = this.getAttribute('data-note-id');
        viewNote(noteId);
      }
    };

    // Edit button
    const editBtn = noteElement.querySelector('.edit-note-btn');
    if (editBtn) {
      editBtn.onclick = function(event) {
        event.stopPropagation();
        const noteId = this.closest('.sticky-note').getAttribute('data-note-id');
        editNote(noteId);
      };
    }

    // Delete button
    const deleteBtn = noteElement.querySelector('.delete-note-btn');
    if (deleteBtn) {
      deleteBtn.onclick = function(event) {
        event.stopPropagation();
        const noteId = this.closest('.sticky-note').getAttribute('data-note-id');
        deleteNote(noteId);
      };
    }

    // Rotate left button
    const rotateLeftBtn = noteElement.querySelector('.rotate-left-btn');
    if (rotateLeftBtn) {
      rotateLeftBtn.onclick = function(event) {
        event.stopPropagation();
        const noteEl = this.closest('.sticky-note');
        rotateNote(noteEl, -5);
      };
    }

    // Rotate right button
    const rotateRightBtn = noteElement.querySelector('.rotate-right-btn');
    if (rotateRightBtn) {
      rotateRightBtn.onclick = function(event) {
        event.stopPropagation();
        const noteEl = this.closest('.sticky-note');
        rotateNote(noteEl, 5);
      };
    }

    // Drag functionality
    noteElement.ondragstart = function(event) {
      event.dataTransfer.setData('text/plain', this.getAttribute('data-note-id'));
      this.classList.add('dragging');
    };

    noteElement.ondragend = function() {
      this.classList.remove('dragging');
    };

    // Make the notes container a drop target
    if (notesContainer) {
      notesContainer.ondragover = function(event) {
        event.preventDefault(); // Allow drop
      };

      notesContainer.ondrop = function(event) {
        event.preventDefault();
        const noteId = event.dataTransfer.getData('text/plain');
        const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);

        if (noteElement) {
          // Calculate the new position
          const containerRect = notesContainer.getBoundingClientRect();
          const x = event.clientX - containerRect.left - (noteElement.offsetWidth / 2);
          const y = event.clientY - containerRect.top - (noteElement.offsetHeight / 2);

          // Apply the new position
          noteElement.style.position = 'absolute';
          noteElement.style.left = x + 'px';
          noteElement.style.top = y + 'px';

          // Save the position
          saveNotePosition(noteId, x, y);
        }
      };
    }
  }

  // View a note
  function viewNote(noteId) {
    console.log('Viewing note:', noteId);

    // Find the note in localStorage
    const savedNotes = JSON.parse(localStorage.getItem('freedomWallNotes') || '[]');
    const note = savedNotes.find(n => (n._id || n.id) === noteId);

    if (note) {
      // Set view modal content
      const nicknameEl = document.getElementById('view-note-nickname');
      const messageEl = document.getElementById('view-note-message');
      const dateEl = document.getElementById('view-note-date');

      if (nicknameEl) nicknameEl.textContent = note.nickname || 'Anonymous';
      if (messageEl) messageEl.textContent = note.message || '';

      if (dateEl && note.date) {
        const formattedDate = new Date(note.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        dateEl.textContent = formattedDate;
      }

      // Show modal manually without backdrop
      if (viewNoteModal) {
        // Show the modal directly
        viewNoteModal.style.display = 'block';
        viewNoteModal.classList.add('show');

        // Don't add modal-open class to body to prevent scrolling issues
        // document.body.classList.add('modal-open');

        // Don't add backdrop

        // Focus on the close button after a delay
        setTimeout(() => {
          const closeBtn = document.getElementById('close-view-btn');
          if (closeBtn) {
            // Then focus on the close button
            closeBtn.focus();
            console.log('Focus set on close button in view modal');
          }
        }, 300);
      } else {
        console.error('View note modal element not found');
      }
    }
  }

  // Edit a note
  function editNote(noteId) {
    console.log('Editing note:', noteId);

    // Find the note in localStorage
    const savedNotes = JSON.parse(localStorage.getItem('freedomWallNotes') || '[]');
    const note = savedNotes.find(n => (n._id || n.id) === noteId);

    if (note) {
      // Set form values
      const nicknameEl = document.getElementById('note-nickname');
      const messageEl = document.getElementById('note-message');
      const colorEl = document.getElementById('note-color');

      if (nicknameEl) nicknameEl.value = note.nickname || 'Anonymous';
      if (messageEl) messageEl.value = note.message || '';
      if (colorEl) colorEl.value = note.color || 'yellow';

      // Update color preview
      updateColorPreview(note.color || 'yellow');

      // Set editing state
      currentEditingNoteId = noteId;

      // Update modal title
      const modalTitle = document.getElementById('noteModalLabel');
      if (modalTitle) modalTitle.textContent = 'Edit Note';

      // Store the current note being edited
      currentEditNote = note;

      // Show modal manually without backdrop
      if (noteModal) {
        // Show the modal directly
        noteModal.style.display = 'block';
        noteModal.classList.add('show');

        // Don't add modal-open class to body to prevent scrolling issues
        // document.body.classList.add('modal-open');

        // Don't add backdrop

        // Focus on the message field after a delay
        setTimeout(() => {
          if (messageEl) {
            // Then focus on the message field
            messageEl.focus();
            console.log('Focus set on message field');

            // Place cursor at the end of the text
            const textLength = messageEl.value.length;
            messageEl.setSelectionRange(textLength, textLength);
          }
        }, 300);
      } else {
        console.error('Note modal element not found');
      }
    }
  }

  // Delete a note
  function deleteNote(noteId) {
    console.log('Deleting note:', noteId);

    if (confirm('Are you sure you want to delete this note?')) {
      // Remove from localStorage
      const savedNotes = JSON.parse(localStorage.getItem('freedomWallNotes') || '[]');
      const noteIndex = savedNotes.findIndex(n => (n._id || n.id) === noteId);

      if (noteIndex !== -1) {
        savedNotes.splice(noteIndex, 1);
        localStorage.setItem('freedomWallNotes', JSON.stringify(savedNotes));
        console.log('Note removed from localStorage');
      }

      // Remove from DOM
      const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
      if (noteElement) {
        noteElement.remove();
      }

      // Remove from positions
      if (notePositions[noteId]) {
        delete notePositions[noteId];
        localStorage.setItem('notePositions', JSON.stringify(notePositions));
      }
    }
  }

  // Rotate a note
  function rotateNote(noteElement, degrees) {
    // Get current rotation or default to 0
    const currentTransform = noteElement.style.transform || '';
    const currentRotation = currentTransform.match(/rotate\(([^)]+)\)/);
    const currentDegrees = currentRotation ? parseInt(currentRotation[1]) : 0;

    // Calculate new rotation
    const newDegrees = currentDegrees + degrees;

    // Apply new rotation
    if (currentRotation) {
      noteElement.style.transform = currentTransform.replace(
        /rotate\([^)]+\)/,
        `rotate(${newDegrees}deg)`
      );
    } else {
      noteElement.style.transform = `${currentTransform} rotate(${newDegrees}deg)`;
    }
  }

  // Save note position
  function saveNotePosition(noteId, x, y) {
    if (!notePositions[noteId]) {
      notePositions[noteId] = {};
    }

    notePositions[noteId].x = x;
    notePositions[noteId].y = y;

    localStorage.setItem('notePositions', JSON.stringify(notePositions));
  }

  // Update color preview
  function updateColorPreview(color) {
    const colorPreview = document.getElementById('color-preview');
    if (colorPreview) {
      colorPreview.className = 'color-preview sticky-note-' + color;
    }
  }

  // Initialize
  init();
});
