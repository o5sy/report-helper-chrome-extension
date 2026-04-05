import Button from './ui/button';

export default function GoogleAuthButton() {
  const handleAuthClick = async () => {
    try {
      const token = await new Promise<string | undefined>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(token);
          }
        });
      });

      if (token) {
        console.log('Obtained token:', token);
        alert('Authentication successful! Token logged to console.');
      } else {
        alert('Authentication failed.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert(
        `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return <Button onClick={handleAuthClick}>Login with Google</Button>;
}
