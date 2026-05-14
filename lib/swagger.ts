const spec = {
  openapi: '3.0.3',
  info: {
    title: 'CareerBridge Foundation API',
    version: '1.0.0',
    description:
      'Internal API for the CareerBridge simulation platform. All `/api/admin/*` routes require an authenticated session with `user_role: admin` or `super_admin`. All `/api/reviewer/*` routes require `user_role: reviewer`.',
  },
  servers: [{ url: '', description: 'Current host' }],

  tags: [
    { name: 'Admin – Simulations',  description: 'CRUD and content management for simulations' },
    { name: 'Admin – Team',         description: 'Role and permission management' },
    { name: 'Reviewer',             description: 'Discipline-filtered review queue and certification' },
    { name: 'Evaluate',             description: 'AI evaluation of candidate responses' },
    { name: 'Purchases',            description: 'Simulation credit management' },
    { name: 'Stripe',               description: 'Payment and subscription flows' },
    { name: 'Portfolio',            description: 'Candidate portfolio management' },
    { name: 'Certifier',            description: 'Credential issuance' },
  ],

  components: {
    securitySchemes: {
      supabaseSession: {
        type: 'apiKey',
        in: 'cookie',
        name: 'sb-access-token',
        description: 'Supabase session cookie set automatically on login.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
      Simulation: {
        type: 'object',
        properties: {
          id:            { type: 'string', format: 'uuid' },
          slug:          { type: 'string' },
          title:         { type: 'string' },
          company:       { type: 'string' },
          industry:      { type: 'string' },
          discipline:    { type: 'string', nullable: true },
          type:          { type: 'string' },
          difficulty:    { type: 'string', enum: ['Foundation', 'Practitioner', 'Advanced'] },
          time:          { type: 'string' },
          description:   { type: 'string' },
          display_order: { type: 'integer' },
          sim_role:      { type: 'string' },
          brief_short:   { type: 'string' },
          brief_full:    { type: 'string' },
          prompts:       { type: 'array', items: {} },
          cert_status:   { type: 'string', enum: ['pending', 'certified', 'rejected'], default: 'pending' },
          cert_notes:    { type: 'string', nullable: true },
          certified_by:  { type: 'string', format: 'uuid', nullable: true },
          certified_at:  { type: 'string', format: 'date-time', nullable: true },
          created_at:    { type: 'string', format: 'date-time' },
          updated_at:    { type: 'string', format: 'date-time' },
        },
      },
      Rubric: {
        type: 'object',
        properties: {
          id:            { type: 'string', format: 'uuid' },
          version:       { type: 'integer' },
          system_prompt: { type: 'string' },
          model:         { type: 'string' },
          max_score:     { type: 'integer' },
          is_active:     { type: 'boolean' },
        },
      },
      TeamMember: {
        type: 'object',
        properties: {
          id:          { type: 'string', format: 'uuid' },
          user_id:     { type: 'string', format: 'uuid' },
          email:       { type: 'string', format: 'email' },
          role:        { type: 'string', enum: ['admin', 'super_admin', 'reviewer'] },
          permissions: {
            type: 'object',
            properties: {
              canManageSimulations: { type: 'boolean' },
              canManageUsers:       { type: 'boolean' },
              canViewAnalytics:     { type: 'boolean' },
              canExportData:        { type: 'boolean' },
            },
          },
          disciplines: { type: 'array', items: { type: 'string' }, description: 'Only present for reviewer role' },
          created_at:  { type: 'string', format: 'date-time' },
        },
      },
    },
  },

  security: [{ supabaseSession: [] }],

  paths: {
    // ── Admin: simulations ────────────────────────────────────────────────────
    '/api/admin/simulations': {
      get: {
        tags: ['Admin – Simulations'],
        summary: 'List all simulations',
        responses: {
          200: { description: 'Array of simulations', content: { 'application/json': { schema: { type: 'object', properties: { simulations: { type: 'array', items: { $ref: '#/components/schemas/Simulation' } } } } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Admin – Simulations'],
        summary: 'Create a simulation',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['slug'],
                properties: {
                  slug:       { type: 'string' },
                  title:      { type: 'string' },
                  company:    { type: 'string' },
                  industry:   { type: 'string' },
                  discipline: { type: 'string' },
                  difficulty: { type: 'string', enum: ['Foundation', 'Practitioner', 'Advanced'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created simulation' },
          400: { description: 'Validation error' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/api/admin/simulations/{slug}': {
      parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Admin – Simulations'],
        summary: 'Get simulation by slug',
        responses: {
          200: { description: 'Simulation', content: { 'application/json': { schema: { $ref: '#/components/schemas/Simulation' } } } },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Admin – Simulations'],
        summary: 'Update simulation metadata',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Simulation' } } } },
        responses: {
          200: { description: 'Updated simulation' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Admin – Simulations'],
        summary: 'Delete a simulation',
        responses: {
          204: { description: 'Deleted' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/admin/simulations/{slug}/content': {
      parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Admin – Simulations'],
        summary: 'Get simulation full content (brief, prompts, transcript)',
        responses: { 200: { description: 'Full content object' }, 403: { description: 'Forbidden' } },
      },
      post: {
        tags: ['Admin – Simulations'],
        summary: 'Save simulation content',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 200: { description: 'Saved' }, 403: { description: 'Forbidden' } },
      },
    },
    '/api/admin/simulations/{slug}/rubric': {
      parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Admin – Simulations'],
        summary: 'Get all rubric versions for a simulation',
        responses: { 200: { description: 'List of rubrics', content: { 'application/json': { schema: { type: 'object', properties: { rubrics: { type: 'array', items: { $ref: '#/components/schemas/Rubric' } } } } } } } },
      },
      put: {
        tags: ['Admin – Simulations'],
        summary: 'Save a new rubric version (deactivates previous)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['system_prompt', 'model', 'max_score'],
                properties: {
                  system_prompt: { type: 'string' },
                  model:         { type: 'string', example: 'claude-sonnet-4-6' },
                  max_score:     { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'New rubric version saved' }, 403: { description: 'Forbidden' } },
      },
    },
    '/api/admin/simulations/{slug}/activity': {
      parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Admin – Simulations'],
        summary: 'Get activity log for a simulation',
        responses: { 200: { description: 'Activity log entries' }, 403: { description: 'Forbidden' } },
      },
    },
    '/api/admin/simulations/check-slug': {
      post: {
        tags: ['Admin – Simulations'],
        summary: 'Check whether a slug is available',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['slug'], properties: { slug: { type: 'string' } } } } } },
        responses: { 200: { description: '{ available: boolean }' } },
      },
    },
    '/api/admin/simulations/reorder': {
      post: {
        tags: ['Admin – Simulations'],
        summary: 'Update display_order for multiple simulations',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { order: { type: 'array', items: { type: 'object', properties: { slug: { type: 'string' }, display_order: { type: 'integer' } } } } } } } } },
        responses: { 200: { description: 'Reordered' }, 403: { description: 'Forbidden' } },
      },
    },
    '/api/admin/simulations/import': {
      post: {
        tags: ['Admin – Simulations'],
        summary: 'Bulk import simulations from JSON',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { simulations: { type: 'array', items: { $ref: '#/components/schemas/Simulation' } } } } } } },
        responses: { 200: { description: 'Import summary' }, 403: { description: 'Forbidden' } },
      },
    },
    '/api/admin/simulations/export': {
      post: {
        tags: ['Admin – Simulations'],
        summary: 'Export simulations to JSON',
        responses: { 200: { description: 'JSON export of all simulations' }, 403: { description: 'Forbidden' } },
      },
    },

    // ── Admin: team ───────────────────────────────────────────────────────────
    '/api/admin/team': {
      get: {
        tags: ['Admin – Team'],
        summary: 'List all admins and reviewers',
        description: 'Requires `super_admin` role or `canManageUsers` permission.',
        responses: {
          200: {
            description: 'Team member list',
            content: { 'application/json': { schema: { type: 'object', properties: { members: { type: 'array', items: { $ref: '#/components/schemas/TeamMember' } } } } } },
          },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['Admin – Team'],
        summary: 'Add a team member (admin or reviewer)',
        description: 'The target user must already have a Supabase Auth account. Assigns role and optional disciplines (for reviewers).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'role'],
                properties: {
                  email:       { type: 'string', format: 'email' },
                  role:        { type: 'string', enum: ['admin', 'reviewer'] },
                  permissions: {
                    type: 'object',
                    description: 'Admin permissions (ignored for reviewer role)',
                    properties: {
                      canManageSimulations: { type: 'boolean' },
                      canManageUsers:       { type: 'boolean' },
                      canViewAnalytics:     { type: 'boolean' },
                      canExportData:        { type: 'boolean' },
                    },
                  },
                  disciplines: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Reviewer disciplines (only used when role = reviewer)',
                    example: ['Software Engineering', 'Finance'],
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Member added', content: { 'application/json': { schema: { type: 'object', properties: { member: { $ref: '#/components/schemas/TeamMember' } } } } } },
          400: { description: 'Validation error' },
          403: { description: 'Forbidden' },
          404: { description: 'User account not found — must sign up first' },
        },
      },
    },
    '/api/admin/team/{userId}': {
      parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Supabase auth user UUID' }],
      put: {
        tags: ['Admin – Team'],
        summary: 'Update a member\'s role, permissions, or disciplines',
        description: 'Cannot modify `super_admin` accounts.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role:        { type: 'string', enum: ['admin', 'reviewer'] },
                  permissions: { type: 'object' },
                  disciplines: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated member' },
          400: { description: 'Cannot modify super_admin' },
          403: { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Admin – Team'],
        summary: 'Remove a team member\'s role',
        description: 'Cannot remove `super_admin` accounts.',
        responses: {
          204: { description: 'Role removed' },
          400: { description: 'Cannot remove super_admin' },
          403: { description: 'Forbidden' },
        },
      },
    },

    // ── Reviewer ──────────────────────────────────────────────────────────────
    '/api/reviewer/simulations': {
      get: {
        tags: ['Reviewer'],
        summary: 'Get simulations assigned to the reviewer\'s disciplines',
        description: 'Returns simulations matching the reviewer\'s discipline assignments, plus any unclassified (null discipline) simulations.',
        responses: {
          200: {
            description: 'Reviewer simulation queue',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    simulations: { type: 'array', items: { $ref: '#/components/schemas/Simulation' } },
                    disciplines: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden — requires reviewer role' },
        },
      },
    },
    '/api/reviewer/simulations/{slug}': {
      parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Reviewer'],
        summary: 'Get simulation detail with active rubric',
        description: 'Only accessible if the reviewer is assigned to the simulation\'s discipline.',
        responses: {
          200: {
            description: 'Simulation and active rubric',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    simulation: { $ref: '#/components/schemas/Simulation' },
                    rubric:     { $ref: '#/components/schemas/Rubric' },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/reviewer/simulations/{slug}/certify': {
      parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
      post: {
        tags: ['Reviewer'],
        summary: 'Certify or reject a simulation',
        description: 'Sets `cert_status`, `cert_notes`, `certified_by`, and `certified_at` on the simulation.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['certified', 'rejected'] },
                  notes:  { type: 'string', description: 'Optional reviewer notes' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '{ success: true, status: "certified" | "rejected" }' },
          400: { description: 'Invalid status value' },
          403: { description: 'Forbidden' },
          404: { description: 'Simulation not found' },
        },
      },
    },

    // ── Evaluate ──────────────────────────────────────────────────────────────
    '/api/evaluate': {
      post: {
        tags: ['Evaluate'],
        summary: 'AI evaluation of a candidate\'s simulation session',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { sessionId: { type: 'string', format: 'uuid' } } } } },
        },
        responses: {
          200: { description: 'Evaluation result with verdict band and scores' },
          400: { description: 'Missing or invalid session' },
        },
      },
    },

    // ── Purchases ─────────────────────────────────────────────────────────────
    '/api/purchases/consume': {
      post: {
        tags: ['Purchases'],
        summary: 'Consume one simulation credit from an active purchase',
        responses: {
          200: { description: '{ success: true, remainingCredits: number }' },
          402: { description: 'No active credits' },
          403: { description: 'Unauthenticated' },
        },
      },
    },

    // ── Stripe ────────────────────────────────────────────────────────────────
    '/api/stripe/checkout': {
      post: {
        tags: ['Stripe'],
        summary: 'Create a Stripe Checkout session',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { priceId: { type: 'string' } } } } } },
        responses: { 200: { description: '{ url: string }' }, 400: { description: 'Missing price ID' } },
      },
    },
    '/api/stripe/session': {
      get: {
        tags: ['Stripe'],
        summary: 'Retrieve a Stripe Checkout session by ID',
        parameters: [{ name: 'session_id', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Stripe session object' }, 400: { description: 'Missing session ID' } },
      },
    },
    '/api/stripe/webhook': {
      post: {
        tags: ['Stripe'],
        summary: 'Stripe webhook receiver',
        description: 'Handles `checkout.session.completed` events. Verified via Stripe-Signature header.',
        responses: { 200: { description: 'Acknowledged' }, 400: { description: 'Invalid signature' } },
      },
    },

    // ── Portfolio ─────────────────────────────────────────────────────────────
    '/api/portfolio/edit': {
      put: {
        tags: ['Portfolio'],
        summary: 'Update portfolio profile fields',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 200: { description: 'Updated portfolio profile' }, 403: { description: 'Unauthenticated' } },
      },
    },

    // ── Certifier ─────────────────────────────────────────────────────────────
    '/api/certifier/issue': {
      post: {
        tags: ['Certifier'],
        summary: 'Issue a verifiable credential for a simulation result',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { sessionId: { type: 'string', format: 'uuid' } } } } } },
        responses: {
          200: { description: '{ credentialUrl: string }' },
          400: { description: 'Session not eligible for credential' },
        },
      },
    },
  },
}

export default spec
