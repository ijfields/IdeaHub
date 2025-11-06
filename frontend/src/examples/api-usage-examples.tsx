/**
 * API Usage Examples
 *
 * This file demonstrates how to use the React Query hooks
 * for data fetching in the AI Ideas Hub application.
 *
 * These are example components showing best practices.
 * Copy and adapt these patterns for your actual components.
 */

import { useState } from 'react';
import {
  useIdeas,
  useIdea,
  useSearchIdeas,
  incrementView,
} from '@/hooks/useIdeas';
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '@/hooks/useComments';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/hooks/useProjects';

// ==========================================
// EXAMPLE 1: Fetch and Display Ideas
// ==========================================

export function IdeasListExample() {
  const { data, isLoading, error } = useIdeas({
    category: 'Education',
    difficulty: 'Beginner',
    page: 1,
    limit: 10,
  });

  if (isLoading) return <div>Loading ideas...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Ideas List</h2>
      {data?.data?.map((idea) => (
        <div key={idea.id}>
          <h3>{idea.title}</h3>
          <p>{idea.description}</p>
          <p>Difficulty: {idea.difficulty}</p>
          <p>Views: {idea.view_count}</p>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// EXAMPLE 2: Single Idea Detail with View Tracking
// ==========================================

export function IdeaDetailExample({ ideaId }: { ideaId: string }) {
  const { data, isLoading } = useIdea(ideaId);

  // Track view when component mounts
  useState(() => {
    incrementView(ideaId).catch(console.error);
  });

  if (isLoading) return <div>Loading idea...</div>;

  return (
    <div>
      <h1>{data?.data?.title}</h1>
      <p>{data?.data?.description}</p>
      <div>
        <strong>Category:</strong> {data?.data?.category}
      </div>
      <div>
        <strong>Difficulty:</strong> {data?.data?.difficulty}
      </div>
      <div>
        <strong>Tools:</strong> {data?.data?.tools.join(', ')}
      </div>
    </div>
  );
}

// ==========================================
// EXAMPLE 3: Search Ideas
// ==========================================

export function SearchIdeasExample() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useSearchIdeas(query, {
    enabled: query.length > 2, // Only search if query is long enough
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search ideas..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {isLoading && <div>Searching...</div>}

      {data?.data && (
        <div>
          <h3>Results ({data.data.length})</h3>
          {data.data.map((idea) => (
            <div key={idea.id}>{idea.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// EXAMPLE 4: Comments with CRUD Operations
// ==========================================

export function CommentsExample({ ideaId }: { ideaId: string }) {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Queries
  const { data: comments, isLoading } = useComments(ideaId);

  // Mutations
  const createMutation = useCreateComment();
  const updateMutation = useUpdateComment();
  const deleteMutation = useDeleteComment();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { ideaId, content: newComment },
      {
        onSuccess: () => {
          setNewComment('');
        },
      }
    );
  };

  const handleUpdate = (commentId: string) => {
    updateMutation.mutate(
      { commentId, content: editContent, ideaId },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditContent('');
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate({ commentId, ideaId });
    }
  };

  if (isLoading) return <div>Loading comments...</div>;

  return (
    <div>
      <h2>Comments</h2>

      {/* Create Comment Form */}
      <form onSubmit={handleCreate}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      {comments?.data?.map((comment) => (
        <div key={comment.id}>
          {editingId === comment.id ? (
            // Edit Mode
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <button onClick={() => handleUpdate(comment.id)}>Save</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          ) : (
            // View Mode
            <div>
              <p>{comment.content}</p>
              <p>
                By {comment.user?.display_name || comment.user?.email} -{' '}
                {new Date(comment.created_at).toLocaleDateString()}
              </p>
              <button
                onClick={() => {
                  setEditingId(comment.id);
                  setEditContent(comment.content);
                }}
              >
                Edit
              </button>
              <button onClick={() => handleDelete(comment.id)}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// EXAMPLE 5: Project Links with CRUD
// ==========================================

export function ProjectsExample({ ideaId }: { ideaId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    tools_used: [] as string[],
  });

  // Queries
  const { data: projects, isLoading } = useProjects(ideaId);

  // Mutations
  const createMutation = useCreateProject();
  const deleteMutation = useDeleteProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { ideaId, data: formData },
      {
        onSuccess: () => {
          setFormData({
            title: '',
            url: '',
            description: '',
            tools_used: [],
          });
          setShowForm(false);
        },
      }
    );
  };

  const handleDelete = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate({ projectId, ideaId });
    }
  };

  if (isLoading) return <div>Loading projects...</div>;

  return (
    <div>
      <h2>Community Projects</h2>

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Share Your Project'}
      </button>

      {/* Create Project Form */}
      {showForm && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <input
            type="url"
            placeholder="Project URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Submitting...' : 'Submit Project'}
          </button>
        </form>
      )}

      {/* Projects List */}
      <div>
        {projects?.data?.length === 0 ? (
          <p>No projects yet. Be the first to share!</p>
        ) : (
          projects?.data?.map((project) => (
            <div key={project.id}>
              <h3>{project.title}</h3>
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                {project.url}
              </a>
              {project.description && <p>{project.description}</p>}
              <div>
                Tools: {project.tools_used.join(', ')}
              </div>
              <p>
                Shared by {project.user?.display_name || project.user?.email}
              </p>
              <button onClick={() => handleDelete(project.id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================
// EXAMPLE 6: Filtering Ideas
// ==========================================

export function FilteredIdeasExample() {
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
  });

  const { data, isLoading } = useIdeas(filters);

  return (
    <div>
      <h2>Filter Ideas</h2>

      {/* Filter Controls */}
      <div>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Education">Education</option>
          <option value="Health & Wellness">Health & Wellness</option>
          <option value="Marketing">Marketing</option>
        </select>

        <select
          value={filters.difficulty}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
        >
          <option value="">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <p>Found {data?.data?.length || 0} ideas</p>
          {data?.data?.map((idea) => (
            <div key={idea.id}>{idea.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}
