export function Footer() {
  return (
    <footer className="border-t bg-muted/40 mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 px-4 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for{' '}
            <a
              href="https://bareefers.org"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Bay Area Reefers
            </a>
            . Coral tracking and community platform.
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href="https://bareefers.org/forum/threads/dbtc-info-rules.23030/"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            DBTC Rules
          </a>
          <a
            href="https://bareefers.org/forum/"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Forum
          </a>
        </div>
      </div>
    </footer>
  );
}
