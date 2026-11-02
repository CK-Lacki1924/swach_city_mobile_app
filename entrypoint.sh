#!/bin/bash
set -e

echo "Configuring GitHub Actions self-hosted runner..."

./config.sh \
    --url "${RUNNER_URL}" \
    --token "${RUNNER_TOKEN}" \
    --name "${RUNNER_NAME:-cleani-city-mobile-docker}" \
    --labels "${RUNNER_LABELS:-self-hosted,android,linux}" \
    --ephemeral \
    --unattended \
    --replace

echo "Runner configured. Starting..."
./run.sh
