import { Config } from "@remotion/cli/config";
import fs from "node:fs";

Config.setVideoImageFormat("jpeg");
Config.setConcurrency(4);
// Use a pre-installed headless Chromium if present (cloud containers); otherwise Remotion downloads its own.
const preinstalled = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (fs.existsSync(preinstalled)) Config.setBrowserExecutable(preinstalled);
