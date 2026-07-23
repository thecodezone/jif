# Journey Into Freedom

A custom WordPress child theme for Journey Into Freedom, extending the Blocksy theme.

## About

This is a WordPress child theme built on top of [Blocksy](https://creativethemes.com/blocksy/), a lightweight and highly extensible WordPress theme. The child theme provides custom functionality and styling specific to the Journey Into Freedom project.

## Requirements

- WordPress 6.0 or higher
- PHP 7.4 or higher
- Blocksy theme (parent theme)

## Installation

### 1. Install Parent Theme

First, ensure the Blocksy theme is installed:

1. Log in to your WordPress admin dashboard
2. Navigate to **Appearance > Themes**
3. Click **Add New**
4. Search for "Blocksy"
5. Click **Install** and then **Activate**

### 2. Install Child Theme

1. Download or clone this repository
2. Upload the `jif` folder to `/wp-content/themes/` directory
3. Navigate to **Appearance > Themes** in WordPress admin
4. Find the "Jif" theme
5. Click **Activate**

## Development

This project uses [DDEV](https://ddev.com/) for local development.

### Prerequisites

- [DDEV](https://ddev.com/) for local environment management
- [Composer](https://getcomposer.org/) for dependency management (run via `ddev composer`)
- PHP 7.4 or higher

### Setup

1. Clone the repository into `wp-content/themes/jif` of a DDEV-managed WordPress project
2. Start the environment:

```bash
ddev start
```

3. Install dependencies:

```bash
ddev composer install
```

### Testing

This theme includes PHPUnit tests with Brain/Monkey for mocking WordPress functions.

**Run tests:**
```bash
ddev composer test
```

Or directly:
```bash
ddev exec vendor/bin/phpunit
```

**Test configuration:**
- Test files: `tests/`
- PHPUnit config: `phpunit.xml`
- Base test case: `tests/TestCase.php`

### Linting

The theme follows WordPress Coding Standards and includes automated linting.

**Run linter:**
```bash
ddev composer lint
```

**Auto-fix issues (where possible):**
```bash
ddev composer lint:fix
```

**Linting configuration:**
- PHPCS config: `phpcs.xml`
- Standards: WordPress-Core, WordPress-Docs, PHPCompatibilityWP
- PHP compatibility: 7.4+

## CI/CD & Deployment

This theme uses GitHub Actions for continuous integration and deployment.

### Versioning & Releasing

To release a new version, use the provided `version.sh` script or the composer command. This automates the process of updating the version in `style.css`, committing the change, and creating a new tag.

```bash
# Automatically bump to the next patch version (e.g., 1.0.2 -> 1.0.3)
ddev composer version

# Bump to the next minor version (e.g., 1.0.2 -> 1.1.0)
ddev composer version minor
```

The script performs the following steps:
1. Pulls the latest changes from the `main` branch.
2. Increments the version number in `style.css`.
3. Runs `composer lint:fix` to ensure code quality.
4. Commits the version bump and creates a new Git tag.
5. Pushes the changes and the tag to GitHub.

### Automated Checks

The following workflows run automatically on every push and pull request to the `main` branch:

- **Tests** (`.github/workflows/tests.yml`) - Runs PHPUnit tests.
- **Lint** (`.github/workflows/lint.yml`) - Runs PHPCS to check against WordPress Coding Standards.

## Contributing

When contributing to this theme:

1. Follow WordPress Coding Standards
2. Write tests for new functionality
3. Ensure all tests pass before submitting
4. Run linter and fix any issues
5. Update documentation as needed

## License

This theme is licensed for use by Journey Into Freedom.
