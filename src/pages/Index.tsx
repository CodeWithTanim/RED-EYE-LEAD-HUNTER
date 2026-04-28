import { Button } from "@/components/ui/button";
import { Download, MapPin, FileSpreadsheet, ShieldCheck, Phone, Globe, Star } from "lucide-react";
import redEyeLogo from "@/assets/red-eye-logo.png";

const features = [
  { icon: MapPin, title: "Auto-scroll Maps", desc: "Loads results with polite 1–3s delays to avoid blocks." },
  { icon: FileSpreadsheet, title: "1-click CSV export", desc: "Name, category, address, phone, website, rating." },
  { icon: Phone, title: "Copy all phones", desc: "Grab every number to your clipboard instantly." },
  { icon: Globe, title: "Filter: no website", desc: "Surface businesses that need a site — pure outreach gold." },
  { icon: Star, title: "Ratings + reviews", desc: "Prioritize leads by social proof at a glance." },
  { icon: ShieldCheck, title: "Local-only", desc: "Data stays in your browser. No servers, no accounts." },
];

const Index = () => {
  // Fetch the zip and trigger a download (preview blocks direct static <a download>).
  const downloadZip = () => {
    fetch("/red-eye.zip")
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.blob(); })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "red-eye.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
      })
      .catch((e) => alert("Download failed: " + e.message));
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      {/* Nav */}
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-2 font-semibold">
          <img src={redEyeLogo} alt="RED EYE logo" width={28} height={28} className="h-7 w-7" />
          <span className="tracking-wide">RED <span className="text-primary">EYE</span></span>
        </div>
        <Button variant="secondary" size="sm" onClick={downloadZip}>
          <Download className="mr-2 h-4 w-4" /> Download
        </Button>
      </header>

      {/* Hero */}
      <main className="container">
        <section className="mx-auto max-w-3xl py-20 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_hsl(var(--accent))]" />
            Chrome Extension · Manifest V3
          </div>
          <img
            src={redEyeLogo}
            alt="RED EYE logo"
            width={96}
            height={96}
            className="mx-auto mb-6 h-24 w-24 drop-shadow-[0_0_30px_hsl(var(--primary)/0.6)]"
          />
          <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
            Scrape Google Maps leads.
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Export to CSV in one click.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground">
            Search “gym in california” on Google Maps, hit Start, and RED EYE collects business names,
            phones, emails, socials, websites and ratings — ready for outreach.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={downloadZip}
              className="shadow-[var(--shadow-glow)]"
            >
              <Download className="mr-2 h-4 w-4" /> Download extension (.zip)
            </Button>
            <a href="#install">
              <Button size="lg" variant="secondary">Install guide</Button>
            </a>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Free · Local-only · No sign-up</p>
        </section>

        {/* Features */}
        <section className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card/60 p-5 backdrop-blur transition hover:border-primary/40"
            >
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-medium">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Install */}
        <section id="install" className="mx-auto max-w-2xl pb-24">
          <h2 className="text-2xl font-semibold tracking-tight">Install in 4 steps</h2>
          <ol className="mt-6 space-y-4">
            {[
              "Click Download — unzip the file anywhere on your computer.",
              "Open chrome://extensions in Chrome (or Edge/Brave/Arc).",
              "Enable Developer mode (top-right toggle).",
              "Click Load unpacked and select the unzipped folder.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-border bg-card/60 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/90">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            Then open <span className="text-foreground">google.com/maps</span>, run a search, and use the floating
            <span className="mx-1 rounded bg-primary/15 px-1.5 py-0.5 text-primary">RED EYE</span>
            panel on the right.
          </div>
        </section>

        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          Built for outreach pros. Use responsibly and respect Google's terms.
        </footer>
      </main>
    </div>
  );
};

export default Index;
