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

    // Initialize Telegram WebApp
    WebApp.ready();

    // Set initial data
    setInitData(WebApp.initData);
    setThemeParams(WebApp.themeParams);
    console.log(WebApp.initData);
    // Set user ID if available
    if (WebApp.initDataUnsafe.user) {
      console.log('INSIDE');
      const id = WebApp.initDataUnsafe.user.id;
      setUserId(id);
      fetchUserBookmarksFirst10(id);
    }
    console.log('SKIPPED');

    // Event listeners
    WebApp.onEvent('themeChanged', () => setThemeParams(WebApp.themeParams));
    WebApp.onEvent('viewportChanged', setViewportData);

    // Set header color
    WebApp.setHeaderColor('secondary_bg_color');

    return () => {
      // Clean up event listeners if necessary
    };
  }, []);

  const setViewportData = () => {
    const WebApp = Telegram.WebApp;
    console.log(`Viewport: ${innerWidth} x ${WebApp.viewportHeight.toFixed(2)}`);
    console.log(`Stable Viewport: ${innerWidth} x ${WebApp.viewportStableHeight.toFixed(2)}`);
    console.log(`Is Expanded: ${WebApp.isExpanded}`);
  };

  async function fetchUserBookmarksFirst10(userId: number) {
    setLoading(true);
    try {
      const bookmarks = await prisma.bookmarks.findMany({
        where: {
          userId: 1,
        },
        take: 5, // Limit the results to the first 5
      });
      setBookmarks(bookmarks);
      console.log(userId);

    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setError('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{backgroundColor: Telegram.WebApp.backgroundColor}}>
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
