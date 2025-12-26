# Contributing to Social Hybrid Network

Thank you for your interest in contributing! Here are some guidelines.

## How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to your fork** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/social-network.git
cd social-network

# Start development environment
docker-compose -f docker-compose.dev.yml up
```

## Code Style

- Use 2 spaces for indentation
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation when needed

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Reporting Bugs

Open an issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- System information

## Feature Requests

We welcome feature requests! Please:
- Explain the use case
- Describe the expected behavior
- Consider implementation details

## Pull Request Guidelines

- Keep PRs focused on a single feature/fix
- Update relevant documentation
- Ensure tests pass
- Add screenshots for UI changes
- Reference related issues

## Code of Conduct

Be respectful, inclusive, and constructive.

Thank you for contributing! 🎉
