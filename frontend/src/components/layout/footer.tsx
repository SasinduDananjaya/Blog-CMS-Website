export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-muted-foreground">© {new Date().getFullYear()} Blog-CMS. All rights reserved.</div>
      </div>
    </footer>
  );
}
