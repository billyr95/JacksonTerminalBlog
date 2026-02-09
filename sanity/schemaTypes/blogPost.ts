import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog Post',
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
      title: 'Post Date',
      type: 'datetime',
      description: 'The date this post was written (for display purposes)',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publish Date & Time',
      type: 'datetime',
      description: 'Schedule when this post should go live. Leave empty to publish immediately.',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Scheduled', value: 'scheduled'},
          {title: 'Published', value: 'published'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
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
  preview: {
    select: {
      title: 'title',
      author: 'author',
      status: 'status',
      publishedAt: 'publishedAt',
      media: 'heroImage',
    },
    prepare(selection) {
      const {title, author, status, publishedAt, media} = selection
      
      let subtitle = `by ${author}`
      if (status === 'scheduled' && publishedAt) {
        const scheduleDate = new Date(publishedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
        subtitle += ` • Scheduled for ${scheduleDate}`
      } else if (status === 'draft') {
        subtitle += ' • Draft'
      } else if (status === 'published') {
        subtitle += ' • Published'
      }
      
      return {
        title,
        subtitle,
        media,
      }
    },
  },
})