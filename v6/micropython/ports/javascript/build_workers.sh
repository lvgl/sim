#!/bin/bash

ROOT=$PWD/node_modules/monaco-editor/esm/vs
OPTS="-d bundle_out --no-source-maps --log-level 1"        # Parcel options - See: https://parceljs.org/cli.html
parcel build $ROOT/editor/editor.worker.js $OPTS
