#!/bin/bash
#
# Build the theme release zip. Used both locally and by
# .github/workflows/release.yml, so the packaged file list only has to be
# maintained in one place.
#
# Builds in a clean temporary copy so the local vendor/ and node_modules/ are
# never touched — running `composer install --no-dev` in place would strip
# dev tools (phpunit, phpcs) from the working copy until `composer install`
# is run again.
#
# By default, copies the current working tree (including any uncommitted
# changes) via rsync, excluding .git/vendor/node_modules/build output. Pass a
# git ref (tag, branch, commit) to build strictly from committed history
# instead, matching what CI would produce.
#
# Usage:
#   composer release           # build from the working tree as-is
#   composer release -- v1.2.3 # build strictly from a committed ref
# Output: ./jif.zip in the theme root, same as the CI-produced release asset.

set -e

THEME_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$THEME_ROOT"

REF="$1"
BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "$BUILD_DIR"' EXIT

if [ -n "$REF" ]; then
	echo "Exporting committed ref '$REF' into a clean build directory..."
	git archive "$REF" | tar -x -C "$BUILD_DIR"
else
	echo "Copying the current working tree into a clean build directory..."
	rsync -a \
		--exclude '.git' \
		--exclude 'vendor' \
		--exclude 'node_modules' \
		--exclude 'assets/build' \
		--exclude 'jif.zip' \
		./ "$BUILD_DIR/"
fi

cd "$BUILD_DIR"

echo "Installing PHP dependencies (production only)..."
composer install --no-dev --no-interaction --optimize-autoloader

echo "Installing Node dependencies..."
npm ci

echo "Building frontend assets..."
npm run build

echo "Packaging release..."
mkdir jif
cp -r config functions.php src style.css theme.json vendor assets resources composer.json composer.lock jif/
zip -r jif.zip jif >/dev/null

cp jif.zip "$THEME_ROOT/jif.zip"

echo "Built $THEME_ROOT/jif.zip${REF:+ from $REF}"
