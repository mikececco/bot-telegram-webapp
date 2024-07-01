import { WebApp } from '@grammyjs/web-app';
import { useState, useEffect } from 'react';

function TelegramWebAppDemo() {
  const [userId, setUserId] = useState('');
  const [themeParams, setThemeParams] = useState({});
  const [initData, setInitData] = useState({});

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
      setUserId(tg.initDataUnsafe.user.id.toString());
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

  // const sendMessage = () => {
  //   const tg = window.Telegram.WebApp;
  //   tg.sendData('Hello, World!');
  // };

  // const showPopup = () => {
  //   const tg = window.Telegram.WebApp;
  //   tg.showPopup({
  //     title: 'Popup Title',
  //     message: 'This is a popup message',
  //     buttons: [
  //       {id: 'ok', type: 'ok', text: 'OK'},
  //       {id: 'cancel', type: 'cancel'}
  //     ]
  //   }, (buttonId: string) => {
  //     console.log('Button clicked:', buttonId);
  //   });
  // };

  return (
    <div style={{backgroundColor: window.Telegram.WebApp.backgroundColor}}>
      <h1>Telegram WebApp Demo</h1>
      <p>User ID: {userId}</p>
      {/* <button onClick={sendMessage}>Send 'Hello, World!'</button>
      <button onClick={showPopup}>Show Popup</button> */}
      <h2>Init Data:</h2>
      <pre>{JSON.stringify(initData, null, 2)}</pre>
      <h2>Theme Params:</h2>
      <pre>{JSON.stringify(themeParams, null, 2)}</pre>
    </div>
  );
}

export default TelegramWebAppDemo;
