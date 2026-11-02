#!/bin/bash
set -e

RUNNER_DIR="/home/runner/actions-runner"

# Only register if not already configured (credentials file persists registration state)
if [ ! -f "$RUNNER_DIR/.credentials" ]; then
    echo "Configuring GitHub Actions self-hosted runner..."
    ./config.sh \
        --url "${RUNNER_URL}" \
        --token "${RUNNER_TOKEN}" \
        --name "${RUNNER_NAME:-cleani-city-mobile-docker}" \
        --labels "${RUNNER_LABELS:-self-hosted,android,linux}" \
        --ephemeral \
        --unattended \
        --replace
else
    echo "Runner already configured, skipping registration..."
fi

echo "Starting runner..."
./run.sh
