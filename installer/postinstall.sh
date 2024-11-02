#!/bin/bash
# +-----------------+
# | npm postinstall |
# +-----------------+

# get the installer directory
Installer_get_current_dir () {
  SOURCE="${BASH_SOURCE[0]}"
  while [ -h "$SOURCE" ]; do
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
  done
  echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

Installer_dir="$(Installer_get_current_dir)"

# move to installler directory
cd "$Installer_dir"
source utils.sh

Installer_info "Minify Main code"
node minify.js
Installer_success "Done"
echo

# Go back to module root
cd ..

Installer_info "Rebuild MagicMirror..."
# Get the version of electron found in the main magic mirror package.json
electron-rebuild --version $(grep -Po '"electron": "\^\K[^"]+' ../../package.json) 2>/dev/null || {
  Installer_error "Rebuild Failed"
  exit 255
}

Installer_success "Done"
echo

# module name
Installer_module="$(grep -Eo '\"name\"[^,]*' ./package.json | grep -Eo '[^:]*$' | awk  -F'\"' '{print $2}')"
Installer_success "$Installer_module is now installed !"
