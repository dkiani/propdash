import Link from "next/link";

function Logo() {
  return (
    <span className="font-display text-2xl tracking-wide">
      <span className="text-accent-gold">PROP</span>
      <span className="text-text-primary">DASH</span>
    </span>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-bg-surface rounded-xl border border-border-subtle p-6 hover:border-border-default transition-colors">
      <h3 className="font-display text-xl text-text-primary mb-3">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-accent-gold-dim text-accent-gold font-mono text-sm flex items-center justify-center mb-4">
        {step}
      </div>
      <h3 className="font-display text-xl text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  features,
  highlighted,
}: {
  name: string;
  price: string;
  features: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-8 flex flex-col items-center text-center ${
        highlighted
          ? "bg-bg-surface border-accent-gold/40"
          : "bg-bg-surface border-border-subtle"
      }`}
    >
      <h3 className="font-display text-2xl text-text-primary mb-2">{name}</h3>
      <p className="text-accent-gold font-display text-4xl mb-4">{price}</p>
      <p className="text-text-secondary text-sm leading-relaxed mb-6">
        {features}
      </p>
      <Link
        href="/signup"
        className={`inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold transition-colors ${
          highlighted
            ? "bg-accent-gold text-bg-primary hover:bg-accent-gold/90"
            : "bg-bg-elevated text-text-primary border border-border-default hover:bg-bg-surface"
        }`}
      >
        {highlighted ? "Start Pro Trial" : "Get Started Free"}
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <Logo />
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              <a
                href="#features"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Pricing
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-2"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-accent-gold text-bg-primary px-4 py-2 text-sm font-semibold hover:bg-accent-gold/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-32 sm:pt-32 sm:pb-40 text-center">
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text-primary leading-tight mb-6">
          Your Prop Firm Command Center
        </h1>
        <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Stop doing drawdown math in your head. PropDash connects to your
          Tradovate account and shows you the only number that matters — how
          much room you have left.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-lg bg-accent-gold text-bg-primary px-8 py-4 text-lg font-semibold hover:bg-accent-gold/90 transition-colors"
        >
          Start Free — Connect Your Account
        </Link>
        <p className="text-text-muted text-sm mt-4">
          No credit card required. Free for 1 account.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-32">
        <h2 className="font-display text-3xl sm:text-4xl text-text-primary text-center mb-12">
          Built for Prop Traders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Real-Time Drawdown Tracking"
            description="See exactly how much drawdown you have left, updated every 30 seconds. Color-coded health indicators make it impossible to miss."
          />
          <FeatureCard
            title="Pre-Market Mental Prep"
            description="A guided routine that grounds you before the bell. Breathwork, account awareness, and rule commitment — all powered by your real data."
          />
          <FeatureCard
            title="Performance Analytics"
            description="Win rate by time of day, P&L by day of week, weekly Wrapped reports. Know your edge and your leaks."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-bg-surface border-y border-border-subtle py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl sm:text-4xl text-text-primary text-center mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard
              step={1}
              title="Connect Tradovate"
              description="Paste your API credentials. We handle the rest. Read-only access — we never place trades."
            />
            <StepCard
              step={2}
              title="Select Your Plan"
              description="Tell us which prop firm and plan you're on. We know the rules for Tradeify, Apex, TopStep, and more."
            />
            <StepCard
              step={3}
              title="Trade With Clarity"
              description="Open PropDash and immediately see your drawdown remaining. No math, no guessing, no blown accounts."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-32">
        <h2 className="font-display text-3xl sm:text-4xl text-text-primary text-center mb-12">
          Simple Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <PricingCard
            name="Free"
            price="$0/mo"
            features="1 account, basic dashboard, drawdown tracking"
          />
          <PricingCard
            name="Pro"
            price="$9.99/mo"
            features="Unlimited accounts, full analytics, weekly Wrapped, pre-market routine"
            highlighted
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <p>&copy; 2026 Kiani LLC. All rights reserved.</p>
          <a
            href="https://propdash.co"
            className="hover:text-text-secondary transition-colors"
          >
            propdash.co
          </a>
        </div>
      </footer>
    </div>
  );
}
