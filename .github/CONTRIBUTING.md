# Contributing to timepicker-ui-react

Thank you for your interest in contributing to timepicker-ui-react.  
This is the official React wrapper for timepicker-ui v4.x.  
Please read this document before making contributions.

## How to Contribute

You can contribute by:

- Reporting bugs
- Suggesting improvements
- Submitting pull requests
- Improving TypeScript types
- Enhancing React hook behavior
- Updating documentation or examples

## Development Setup

1. Fork and clone the repository.
2. Install dependencies:

```

npm install

```

3. Build the package:

```

npm run build

```

4. Start the local example environment:

```

npm run dev

```

This allows you to manually test the wrapper during development.

## Pull Request Guidelines

Before opening a pull request:

- For significant changes, open an issue first to discuss the idea.
- Follow the project's Code of Conduct.
- Keep changes focused and consistent with existing patterns.

When submitting a pull request:

1. Keep the scope small and clearly described.
2. If changes affect the public API or behavior, update the README.
3. Ensure TypeScript types remain correct.
4. Ensure the build succeeds:

```

npm run build

```

5. If the change affects event mapping, controlled mode, lifecycle behavior, or SSR safety, describe it clearly in the pull request.

## Code Style

- Use TypeScript.
- Prefer React Hooks.
- Avoid `any`.
- The wrapper should remain thin. Most logic should stay inside the core timepicker-ui package.
- Avoid direct usage of `window` or `document` without safeguards, as the wrapper must support SSR environments.

## Code of Conduct

By participating in this project, you agree to follow the Code of Conduct included in the repository.

## Contact

If you have questions or need help, open an issue or contact:

glejzerpiotr@gmail.com
