# Contributing

Thank you for your interest in contributing to the Expo Mobile App
Template. This document explains how to report issues, suggest changes,
and submit code.

## Reporting bugs

Open a [GitHub Issue](https://github.com/Subverting-complexity/React-Native-Expo-Mobile-App-Template-/issues)
with a clear description of the problem. Include:

- Steps to reproduce the issue.
- What you expected to happen.
- What actually happened.
- Your environment (OS, Node version, Expo SDK version).

## Suggesting features

Open a [GitHub Issue](https://github.com/Subverting-complexity/React-Native-Expo-Mobile-App-Template-/issues)
describing the feature, why it would be useful, and any relevant context.

## Submitting changes

1. Fork the repository.
2. Create a feature branch from `main` (`git checkout -b my-change`).
3. Make your changes.
4. Run the quality checks (see below).
5. Commit with a clear message describing what changed and why.
6. Push your branch and open a pull request against `main`.

Keep pull requests focused on a single change. If you are fixing a bug
and also refactoring nearby code, split them into separate PRs.

## Code style

The project uses **ESLint** and **Prettier** for linting and formatting.
Before submitting a PR, run:

```bash
npm run lint
npm run format:check
```

The quality gate (`npm run quality`) runs lint, typecheck, and tests
together. You can also run the full strict gate with `npm run check`.

## Testing

Run the test suite with:

```bash
npm test
```

If you are adding or changing functionality, include tests that cover
your changes. The project enforces coverage thresholds, so new code
should maintain or improve the existing coverage level.

## TypeScript

The project uses TypeScript in strict mode. Avoid `any` and
`@ts-ignore`.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code.
