const debug = (message: string) => {
  if (process.env.DEBUG === "true") {
    console.log(message);
  }
};

export { debug };
