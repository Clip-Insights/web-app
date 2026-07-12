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

  return paddlePromise;
};

export const openCheckout = async (config, { onSuccess } = {}) => {
  const paddle = await loadPaddle(config.environment, config.client_token);
  let unsubscribe = null;
  if (onSuccess) {
    unsubscribe = onPaddleEvent((event) => {
      if (event?.name === "checkout.completed") {
        unsubscribe();
        onSuccess(event);
      }
    });
  }
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
};
