/**
 * Notes Panel Component
 * Displays and manages personal notes
 */

import React, { useState, useEffect } from 'react';
import { noteService } from '../lib/noteService';
import type { Note, NoteFilters } from '../types/note.types';

export const NotesPanel: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unprocessed' | 'processed'>('all');
  const [showForm, setShowForm] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load notes
  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const filters: NoteFilters = {};
      if (filter !== 'all') {
        filters.status = filter as 'unprocessed' | 'processed';
      }

      const result = await noteService.getNotes(filters);
      if (result.data) {
        setNotes(result.data);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    const subscription = noteService.subscribeToNotes((note, event) => {
      if (event === 'INSERT') {
        setNotes((prev) => [note, ...prev]);
      } else if (event === 'UPDATE') {
        setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
      } else if (event === 'DELETE') {
        setNotes((prev) => prev.filter((n) => n.id !== note.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setError(null);
    try {
      const result = await noteService.createNote({
        title: newNoteTitle.trim() || undefined,
        content: newNoteContent.trim(),
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        setNewNoteContent('');
        setNewNoteTitle('');
        setShowForm(false);
        loadNotes();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create note');
    }
  };

  const handleToggleStatus = async (note: Note) => {
    const newStatus = note.status === 'processed' ? 'unprocessed' : 'processed';
    const result =
      newStatus === 'processed'
        ? await noteService.markAsProcessed(note.id)
        : await noteService.markAsUnprocessed(note.id);

    if (result.error) {
      console.error('Failed to update note status:', result.error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    const result = await noteService.deleteNote(noteId);
    if (result.error) {
      console.error('Failed to delete note:', result.error);
    } else {
      loadNotes();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notes-panel">
      {/* Header */}
      <div className="notes-header">
        <h2>Notes</h2>
        <button className="btn btn-sm btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Note'}
        </button>
      </div>

      {/* New Note Form */}
      {showForm && (
        <form className="note-form" onSubmit={handleCreateNote}>
          <input
            type="text"
            placeholder="Title (optional)"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            className="note-title-input"
          />
          <textarea
            placeholder="Write your note..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="note-content-input"
            rows={4}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn btn-primary">
            Save Note
          </button>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="note-filters">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notes.length})
        </button>
        <button
          className={`filter-tab ${filter === 'unprocessed' ? 'active' : ''}`}
          onClick={() => setFilter('unprocessed')}
        >
          Unprocessed
        </button>
        <button
          className={`filter-tab ${filter === 'processed' ? 'active' : ''}`}
          onClick={() => setFilter('processed')}
        >
          Processed
        </button>
      </div>

      {/* Notes List */}
      <div className="notes-list">
        {loading ? (
          <div className="loading-state">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            {filter === 'all' ? 'No notes yet. Create your first note!' : `No ${filter} notes.`}
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={`note-card ${note.status}`}>
              <div className="note-card-header">
                {note.title && <h3 className="note-title">{note.title}</h3>}
                <span className="note-date">{formatDate(note.created_at)}</span>
              </div>
              <p className="note-content">{note.content}</p>
              <div className="note-actions">
                <button
                  className={`btn-status ${note.status}`}
                  onClick={() => handleToggleStatus(note)}
                  title={note.status === 'processed' ? 'Mark as unprocessed' : 'Mark as processed'}
                >
                  {note.status === 'processed' ? '✓ Processed' : '○ Unprocessed'}
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteNote(note.id)}
                  title="Delete note"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .notes-panel {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-md);
        }

        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .notes-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--color-text-primary);
        }

        .note-form {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .note-title-input,
        .note-content-input {
          width: 100%;
          padding: 0.75rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          font-family: inherit;
          font-size: 1rem;
        }

        .note-title-input {
          font-weight: 600;
        }

        .note-content-input {
          resize: vertical;
          min-height: 80px;
        }

        .note-content-input:focus,
        .note-title-input:focus {
          outline: none;
          border-color: var(--color-accent-primary);
        }

        .note-filters {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
        }

        .filter-tab {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-base);
          font-size: 0.9rem;
        }

        .filter-tab:hover {
          background: var(--color-bg-elevated);
          color: var(--color-text-primary);
        }

        .filter-tab.active {
          background: rgba(125, 211, 192, 0.1);
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
        }

        .notes-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .note-card {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          transition: all var(--transition-base);
        }

        .note-card:hover {
          border-color: var(--color-border-strong);
          box-shadow: var(--shadow-sm);
        }

        .note-card.processed {
          opacity: 0.7;
        }

        .note-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .note-title {
          margin: 0;
          font-size: 1.1rem;
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .note-date {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .note-content {
          margin: 0.5rem 0;
          color: var(--color-text-secondary);
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .note-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--color-border);
        }

        .btn-status {
          padding: 0.4rem 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 0.85rem;
          transition: all var(--transition-base);
        }

        .btn-status:hover {
          background: var(--color-bg-card);
          color: var(--color-text-primary);
        }

        .btn-status.processed {
          color: var(--status-completed);
          border-color: var(--status-completed);
        }

        .btn-delete {
          padding: 0.4rem 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: transparent;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all var(--transition-base);
        }

        .btn-delete:hover {
          background: rgba(238, 90, 111, 0.1);
          border-color: var(--status-failed);
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--color-text-muted);
        }

        .error-message {
          background: rgba(238, 90, 111, 0.1);
          border: 1px solid var(--status-failed);
          color: var(--status-failed);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
        }

        @media (max-width: 640px) {
          .notes-panel {
            padding: 1rem;
          }

          .notes-header h2 {
            font-size: 1.25rem;
          }

          .note-card {
            padding: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};
