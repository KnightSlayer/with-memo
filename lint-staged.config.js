module.exports = {
  "*.ts": [
    () => "pnpm run typecheck",
    () => "pnpm run lint",
  ],
};
