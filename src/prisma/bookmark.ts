import { prisma } from '#root/prisma/index.js'
import { fetchMetadata } from '#root/bot/services/fetch-title-service.js'
import { categorizeWithGoogleCloud } from '#root/bot/services/categorize-service.js'

export interface CreateBookmarkInput {
  telegramId: number
  username: string
  content: string
  link: string
  folder: string
  name: string
}

interface BookmarkWithUserId {
  content: string
  link: string
  folder: string
  name: string
  userId: number
}

export async function saveBookmark(data: CreateBookmarkInput) {
  try {
    // Find the user by telegramId
    let user = await prisma.user.findUnique({
      where: {
        telegramId: data.telegramId,
      },
    })

    // If the user doesn't exist, create a new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: data.telegramId,
          username: data.username,
        },
      })
    }

    const userId = user.id

    // Save the bookmark
    try {
      // Check if the link already exists for the user
      const existingBookmark = await prisma.bookmark.findFirst({
        where: {
          userId,
          link: data.link,
        },
      })

      if (existingBookmark) {
        throw new Error('Bookmark with this link already exists for this user.')
      }

      const bookmark = await prisma.bookmark.create({
        data: {
          content: data.content,
          link: data.link,
          folder: data.folder,
          name: data.name,
          userId,
        },
      })
      return bookmark
    }
    catch (error) {
      // if (error.code === 'P2002') {
      if (error) {
        // Handle unique constraint violation (e.g., link already exists)
        console.log(`Link already exists: ${data.link}`)
      }
      else {
        console.error('Error saving bookmark:', error)
      }
    }
  }
  catch (error) {
    console.error('Error creating bookmark:', error)
    throw error
  }
  finally {
    await prisma.$disconnect()
  }
}

export async function saveBookmarks(bookmarks: CreateBookmarkInput[]) {
  try {
    const bookmarksWithUserId: BookmarkWithUserId[] = []
    for (const data of bookmarks) {
      // Find the user by telegramId
      let user = await prisma.user.findUnique({
        where: {
          telegramId: data.telegramId,
        },
      })

      // If the user doesn't exist, create a new user
      if (!user) {
        user = await prisma.user.create({
          data: {
            telegramId: data.telegramId,
            username: data.username,
          },
        })
      }

      // Prepare bookmark data with userId
      const userId = user.id

      const existingBookmark = await prisma.bookmark.findFirst({
        where: {
          userId,
          link: data.link,
        },
      })
      const { title, description } = await fetchMetadata(data.link)
      const combinedInfo = `
        Title: ${title}
        \n
        Description: ${description}
      `

      const category = await categorizeWithGoogleCloud(data.link)
      console.log(category)

      if (existingBookmark) {
        console.log(`Skipping bookmark with link '${data.link}' for user ${user.id} - already exists.`)
        continue // Skip current iteration and proceed to next bookmark
      }

      // Prepare bookmark data with userId
      bookmarksWithUserId.push({
        content: combinedInfo,
        link: data.link,
        folder: data.folder,
        name: data.name,
        userId,
      })
    }

    const result = await prisma.bookmark.createMany({
      data: bookmarksWithUserId,
      skipDuplicates: true, // This option skips records that violate unique constraints
    })

    console.log(`Successfully saved ${result.count} bookmarks`)
    return result
  }
  catch (error) {
    console.error('Error saving bookmarks:', error)
    throw error
  }
  finally {
    await prisma.$disconnect()
  }
}
