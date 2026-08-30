#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# shellcheck disable=SC1091
source tools/release-toolchain.env

expect_version() {
  local name="$1" expected="$2" actual="$3"
  if [[ "$actual" != "$expected" ]]; then
    echo "error: canonical $name version is $expected; found $actual" >&2
    exit 1
  fi
  echo "$name $actual"
}

expect_version pandoc "$PANDOC_VERSION" \
  "$(pandoc --version | awk 'NR == 1 { print $2 }')"
expect_version epubcheck "$EPUBCHECK_VERSION" \
  "$(epubcheck --version 2>&1 | sed -E -n '1s/.*v([0-9.]+).*/\1/p')"
expect_version ace "$ACE_VERSION" "$(ace --version 2>&1 | sed -n '1p')"

previewer_plist="/Applications/Kindle Previewer 3.app/Contents/Info.plist"
if [[ ! -f "$previewer_plist" ]]; then
  echo "error: canonical Kindle Previewer installation not found" >&2
  exit 1
fi
expect_version kindle-previewer "$KINDLE_PREVIEWER_VERSION" \
  "$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$previewer_plist")"

echo "CANONICAL RELEASE TOOLCHAIN OK"
