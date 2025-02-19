#!/bin/bash
#
# This copies all Morio client templates in MorioHub
# to the local config folder so that the Morio client
# running on this host has access to them.
#

#
# Location of the git repo on disk
#
MORIOHUB_GIT_ROOT=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && cd .. && pwd )

#
# cd to repo root
#
cd $MORIOHUB_GIT_ROOT

#
# Copy audit templates
#
cp ./modules/audit/module-templates.d/*.yml /etc/morio/audit/module-templates.d/
cp ./modules/audit/rule-templates.d/*.rules /etc/morio/audit/rule-templates.d/

#
# Copy logs templates
#
cp ./modules/logs/module-templates.d/*.yml /etc/morio/logs/module-templates.d/
cp ./modules/logs/input-templates.d/*.yml /etc/morio/logs/input-templates.d/

#
# Copy metrics templates
#
cp ./modules/metrics/module-templates.d/*.yml /etc/morio/metrics/module-templates.d/

#
# cd back to where we came from
#
cd --
