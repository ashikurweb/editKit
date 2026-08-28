const userAgent = process.env.npm_config_user_agent ?? '';
const execPath = process.env.npm_execpath ?? '';
const isPnpm = userAgent.startsWith('pnpm/') || /(?:^|[/\\])pnpm(?:\.c?js)?$/i.test(execPath);

if (!isPnpm) {
  console.error(
    '[EditKit] Publish with pnpm, not npm. pnpm converts workspace:* dependencies into installable versions.',
  );
  process.exit(1);
}
