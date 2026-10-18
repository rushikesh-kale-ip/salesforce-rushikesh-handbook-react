# Project Commands

Here are the main commands to work with this project:

1. **Install all dependencies**
  ```bash
  npm install
  ```

2. **Run the project (development mode)**
  ```bash
  npm run dev
  ```

3. **Build the project (production build)**
  ```bash
  npm run build
  ```

4. **Deploy the project to GitHub Pages**
  ```bash
  npm run deploy
  ```
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


GET /api/comments/javascript/1
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userName": "John Doe",
      "text": "Great explanation of JavaScript fundamentals!",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "userName": "Jane Smith",
      "text": "Very helpful content, thanks!",
      "timestamp": "2024-01-16T14:20:00Z"
    }
  ],
  "total": 2
}

POST /api/comments
{
  "topicId": "javascript",
  "fileRank": 1,
  "userName": "Alice Johnson",
  "text": "This is really helpful for beginners!"
}

{
  "success": true,
  "message": "Comment posted successfully",
  "data": {
    "id": 3,
    "topicId": "javascript",
    "fileRank": 1,
    "userName": "Alice Johnson",
    "text": "This is really helpful for beginners!",
    "timestamp": "2024-01-17T09:15:00Z"
  }
}