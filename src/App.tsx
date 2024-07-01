import { WebApp } from '@grammyjs/web-app';
import { useState, useEffect } from 'react';
import { PrismaClient } from '@prisma/client';

// Assuming you have a Prisma client set up
const prisma = new PrismaClient();
interface Bookmark {
  id: number;
  link: string;
  userId: number;
  updated_at: Date;
  created_at: Date;
  content: string;
  folder: string;
  name: string;
}

function App() {
  const [userId, setUserId] = useState<number>(0); // or any initial number value
  const [themeParams, setThemeParams] = useState({});
  const [initData, setInitData] = useState({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(WebApp.initData);

    // Initialize Telegram WebApp
    const tg = window.Telegram.WebApp;
    tg.ready();

    // Set initial data
    setInitData(tg.initDataUnsafe);
    setThemeParams(tg.themeParams);

    // Set user ID if available
    if (tg.initDataUnsafe.user) {
      const id = tg.initDataUnsafe.user.id;
      setUserId(id);
      fetchUserBookmarksFirst10(id);
    }

    // Event listeners
    tg.onEvent('themeChanged', () => setThemeParams(tg.themeParams));
    tg.onEvent('viewportChanged', setViewportData);

    // Set header color
    tg.setHeaderColor('secondary_bg_color');

    return () => {
      // Clean up event listeners if necessary
    };
  }, []);

  const setViewportData = () => {
    const tg = window.Telegram.WebApp;
    console.log(`Viewport: ${window.innerWidth} x ${tg.viewportHeight.toFixed(2)}`);
    console.log(`Stable Viewport: ${window.innerWidth} x ${tg.viewportStableHeight.toFixed(2)}`);
    console.log(`Is Expanded: ${tg.isExpanded}`);
  };

  async function fetchUserBookmarksFirst10(userId: number) {
    setLoading(true);
    try {
      const bookmarks = await prisma.bookmarks.findMany({
        where: {
          userId: userId,
        },
        take: 5, // Limit the results to the first 5
      });
      setBookmarks(bookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setError('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{backgroundColor: window.Telegram.WebApp.backgroundColor}}>
      <h1>Telegram WebApp Demo</h1>
      <p>User ID: {userId}</p>
      {loading ? (
        <p>Loading bookmarks...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <ul>
          {bookmarks.map(bookmark => (
            <li key={bookmark.id}>{bookmark.content}</li>
          ))}
        </ul>
      )}
      <h2>Init data:</h2>
      <pre>{JSON.stringify(initData, null, 2)}</pre>
      <h2>Theme Params:</h2>
      <pre>{JSON.stringify(themeParams, null, 2)}</pre>
    </div>
  );
}

export default App;
