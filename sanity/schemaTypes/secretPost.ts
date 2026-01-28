import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'secretPost',
  title: 'Secret Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility',
        },
        {
          name: 'link',
          type: 'url',
          title: 'Image Link (URL)',
          description: 'Optional: Make the image clickable',
          validation: (Rule) => Rule.uri({
            allowRelative: false,
            scheme: ['http', 'https']
          })
        }
      ]
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero Video (Optional - overrides image if set)',
      type: 'file',
      description: 'Upload a video file (MP4, WebM, etc.). This will display instead of the hero image.',
      options: {
        accept: 'video/*'
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Video description',
          description: 'Describe what the video shows',
        }
      ]
    }),
    defineField({
      name: 'videoUrl',
      title: 'Hero Video URL (Optional - YouTube, Vimeo, etc.)',
      type: 'url',
      description: 'Paste a YouTube or Vimeo URL to embed a video instead of uploading',
      validation: (Rule) => Rule.uri({
        allowRelative: false,
        scheme: ['http', 'https']
      })
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'comments',
      title: 'Comments',
      type: 'array',
      of: [{type: 'comment'}],
    }),
  ],
})