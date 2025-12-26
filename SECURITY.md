# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **Do NOT** open a public issue
2. Email the maintainers directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be fixed before public disclosure

## Security Best Practices

### For Administrators

1. **Change default passwords immediately after installation**
2. **Use strong JWT secrets** - minimum 64 characters
3. **Enable HTTPS/SSL** in production
4. **Keep dependencies updated** - run `npm audit` regularly
5. **Restrict database access** - use firewall rules
6. **Enable rate limiting** - already configured in the application
7. **Regular backups** - back up your database regularly
8. **Monitor logs** - check for suspicious activity

### For Developers

1. **Never commit secrets** to version control
2. **Use environment variables** for sensitive data
3. **Validate all user input** on both frontend and backend
4. **Use parameterized queries** to prevent SQL injection
5. **Implement proper authentication** checks on all endpoints
6. **Keep dependencies updated**
7. **Follow OWASP guidelines**

## Security Features

The application includes:

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Rate limiting
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ Input validation

## Update Policy

Security updates will be released as soon as possible after a vulnerability is confirmed.

## Responsible Disclosure

We appreciate security researchers who responsibly disclose vulnerabilities. We will:

1. Acknowledge your report within 48 hours
2. Provide regular updates on the fix progress
3. Credit you in the security advisory (if desired)
4. Release a fix as quickly as possible

Thank you for helping keep Social Hybrid Network secure!
