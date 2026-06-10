import app from "./app.js";

const port = Number(process.env.PORT) || 3001;
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`Accepting browser requests from ${clientOrigin}`);
});
