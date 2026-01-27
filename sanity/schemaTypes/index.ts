import { type SchemaTypeDefinition } from 'sanity'
import blogPost from './blogPost'
import secretPost from './secretPost'
import comment from './comment'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blogPost, secretPost, comment],
}