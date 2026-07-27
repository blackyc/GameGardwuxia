export const CONDITION_SCHEMA = {
  $id: 'ghostmud://schema/condition-v1',
  oneOf: [
    { type: 'boolean' },
    {
      type: 'object',
      required: ['fact'],
      properties: {
        fact: { type: 'string', minLength: 1 },
        op: {
          enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'exists']
        },
        value: {}
      },
      additionalProperties: false
    },
    {
      type: 'object',
      required: ['all'],
      properties: {
        all: { type: 'array', items: { $ref: 'ghostmud://schema/condition-v1' } }
      },
      additionalProperties: false
    },
    {
      type: 'object',
      required: ['any'],
      properties: {
        any: { type: 'array', items: { $ref: 'ghostmud://schema/condition-v1' } }
      },
      additionalProperties: false
    },
    {
      type: 'object',
      required: ['not'],
      properties: {
        not: { $ref: 'ghostmud://schema/condition-v1' }
      },
      additionalProperties: false
    }
  ]
};

const VARIANT_SCHEMA = {
  type: 'object',
  required: ['id', 'when', 'content'],
  properties: {
    id: { type: 'string', minLength: 1 },
    priority: { type: 'integer', default: 0 },
    when: { $ref: 'ghostmud://schema/condition-v1' },
    content: { type: 'object' }
  },
  additionalProperties: false
};

export const NARRATIVE_ENTRY_SCHEMA = {
  $id: 'ghostmud://schema/narrative-entry-v1',
  type: 'object',
  required: ['id', 'kind', 'content'],
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9][a-z0-9._:-]*$' },
    kind: { enum: ['room', 'character', 'event', 'conversation', 'scene', 'clue'] },
    revision: { type: 'integer', minimum: 1, default: 1 },
    source: { type: 'string' },
    content: { type: 'object' },
    bindings: {
      type: 'object',
      properties: {
        roomIds: { type: 'array', items: { type: 'string', minLength: 1 } },
        characterIds: { type: 'array', items: { type: 'string', minLength: 1 } },
        eventIds: { type: 'array', items: { type: 'string', minLength: 1 } }
      },
      additionalProperties: false
    },
    variants: { type: 'array', items: VARIANT_SCHEMA }
  },
  additionalProperties: false
};

export const ASSET_ENTRY_SCHEMA = {
  $id: 'ghostmud://schema/asset-entry-v1',
  type: 'object',
  required: ['id', 'type', 'src'],
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9][a-z0-9._:-]*$' },
    type: { enum: ['portrait', 'room', 'event', 'background', 'ui', 'audio'] },
    src: { type: 'string', minLength: 1 },
    alt: { type: 'string' },
    aspect: { type: 'string' },
    focalPoint: {
      type: 'object',
      required: ['x', 'y'],
      properties: {
        x: { type: 'number', minimum: 0, maximum: 1 },
        y: { type: 'number', minimum: 0, maximum: 1 }
      },
      additionalProperties: false
    },
    fallback: { type: 'string' },
    source: { type: 'string' },
    aliases: { type: 'array', items: { type: 'string', minLength: 1 } },
    revision: { type: 'integer', minimum: 1, default: 1 },
    variants: { type: 'array', items: VARIANT_SCHEMA }
  },
  additionalProperties: false
};

export const NARRATIVE_SCHEMAS = [
  CONDITION_SCHEMA,
  NARRATIVE_ENTRY_SCHEMA,
  ASSET_ENTRY_SCHEMA
];

