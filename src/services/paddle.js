// Loads Paddle.js v2 once and initializes it for the given environment.
// The client token is public by design; it can only open checkouts.
let paddlePromise = null;
const eventHandlers = new Set();

export const onPaddleEvent = (handler) => {
  eventHandlers.add(handler);
  return () => eventHandlers.delete(handler);
};

export const loadPaddle = (environment, clientToken) => {
  if (paddlePromise) return paddlePromise;

  paddlePromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      try {
        if (environment === "sandbox") {
          window.Paddle.Environment.set("sandbox");
        }
        window.Paddle.Initialize({
          token: clientToken,
          eventCallback: (event) => eventHandlers.forEach((h) => h(event)),
        });
        resolve(window.Paddle);
      } catch (error) {
        reject(error);
      }
    };
    script.onerror = () => reject(new Error("Failed to load Paddle.js"));
    document.head.appendChild(script);
  });

  paddlePromise = paddlePromise.catch(error => { paddlePromise = null; throw error; });
  return paddlePromise;
};

export const openCheckout = async (config, { onSuccess, onError } = {}) => {
  const paddle = await loadPaddle(config.environment, config.client_token);
  const unsubscribe = onPaddleEvent(event => {
    if (event?.name === 'checkout.completed') { unsubscribe(); onSuccess?.(event); }
    else if (event?.name === 'checkout.closed') unsubscribe();
    else if (event?.name === 'checkout.error') { unsubscribe(); onError?.(); }
  });
  try {
  paddle.Checkout.open({
    items: [{ priceId: config.price_id, quantity: 1 }],
    customer: { email: config.email },
    customData: { user_id: config.user_id },
    settings: {
      displayMode: "overlay",
      theme: "light",
      showAddDiscounts: false,
    },
  });
  } catch (error) { unsubscribe(); throw error; }
};
