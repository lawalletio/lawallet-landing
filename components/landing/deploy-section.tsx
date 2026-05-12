"use client";

import React from "react";
import { Terminal, ExternalLink, Copy, Check, BookOpen, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "./hooks";

const TerminalBlock = ({ commands }: { commands: string[] }) => {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(commands.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API may be blocked in some contexts; fail silently
    }
  };

  return (
    <div className='relative flex flex-col gap-1.5 px-3 py-2 pr-9 rounded-lg bg-white/[0.03] border border-white/[0.04] font-mono text-xs text-white/30'>
      {commands.map((cmd, i) => (
        <div key={i} className='flex items-center gap-2 min-w-0'>
          {i === 0 ? (
            <Terminal className='h-3 w-3 text-lw-teal flex-shrink-0' />
          ) : (
            <span className='h-3 w-3 flex-shrink-0' aria-hidden />
          )}
          <span className='text-lw-teal flex-shrink-0'>$</span>
          <span className='truncate'>{cmd}</span>
        </div>
      ))}
      <button
        type='button'
        onClick={onCopy}
        aria-label={copied ? "Copied" : "Copy commands"}
        className='absolute top-1.5 right-1.5 inline-flex items-center justify-center h-6 w-6 rounded-md text-white/40 hover:text-lw-teal hover:bg-white/[0.05] transition-colors duration-200'
      >
        {copied ? <Check className='h-3 w-3' /> : <Copy className='h-3 w-3' />}
      </button>
    </div>
  );
};

const deployOptions = [
  {
    logo: "/logos/vercel.svg",
    title: "Vercel",
    time: "8 min",
    description:
      "One-click deploy. Perfect for communities that want to be live instantly.",
    deployUrl:
      "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flawalletio%2Flawallet-nwc&project-name=lawallet-nwc&repository-name=lawallet-nwc&root-directory=apps%2Fweb&demo-title=lawallet%20nwc&integration-ids=oac_3sK3gnG06emjIEVL09jjntDD&env=JWT_SECRET&envDescription=JWT_SECRET%20must%20be%20a%2032%2B%20character%20random%20string.%20Generate%20one%20with%3A%20openssl%20rand%20-base64%2032&envLink=https%3A%2F%2Fgithub.com%2Flawalletio%2Flawallet-nwc%2Fblob%2Fmain%2Fapps%2Fweb%2F.env.example",
  },
  {
    logo: "/logos/docker.svg",
    title: "Docker",
    time: "5 min",
    description: "Compose file included. Run on any VPS or server you control.",
    commands: [
      "git clone https://github.com/lawalletio/lawallet-nwc",
      "docker compose up -d",
    ],
    docsUrl: "https://docs.lawallet.io/docs/deploy/docker",
  },
  {
    logos: ["/logos/umbrel.svg", "/logos/start9.svg"],
    title: "Your Node",
    badge: "SOON",
    description:
      "Umbrel, Start9, or bare metal. Full sovereignty on your own hardware. One click deploy",
  },
];

export const DeploySection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id='deploy' className='py-20 sm:py-28'>
      <div ref={ref} className='max-w-5xl mx-auto px-4'>
        <div className='text-center mb-16'>
          <span
            className={`inline-block text-xs font-mono tracking-widest uppercase text-lw-gold mb-4 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {"// Deploy"}
          </span>
          <h2
            className={`text-3xl sm:text-5xl font-bold text-white tracking-tight transition-all duration-1000 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Self host
            <br />
            <span className='text-gradient-gold'>your own instance</span>
          </h2>
          <p
            className={`mt-4 text-white/30 max-w-xl mx-auto transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            From instant cloud to full sovereignty.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-10'>
          {deployOptions.map((option, index) => (
            <div
              key={option.title}
              className={`glow-card group rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-1 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 150 + 200}ms` : "0ms",
              }}
            >
              <div className='flex items-center justify-between mb-4'>
                {option.logos ? (
                  <span aria-hidden />
                ) : (
                  <div className='w-10 h-10 rounded-lg bg-lw-gold/10 flex items-center justify-center'>
                    <img
                      src={option.logo}
                      alt={`${option.title} logo`}
                      className='h-5 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300'
                    />
                  </div>
                )}
                {option.badge ? (
                  <span className='text-xs font-mono text-lw-gold bg-lw-gold/10 px-2.5 py-1 rounded-full uppercase tracking-wider'>
                    {option.badge}
                  </span>
                ) : option.time ? (
                  <span className='text-xs font-mono text-lw-teal bg-lw-teal/10 px-2.5 py-1 rounded-full'>
                    ~{option.time}
                  </span>
                ) : null}
              </div>
              <h3 className='text-lg font-semibold text-white mb-2'>
                {option.title}
              </h3>
              <p className='text-sm text-white/40 leading-relaxed mb-4'>
                {option.description}
              </p>
              {option.logos && (
                <div className='flex items-center gap-3 mb-4'>
                  {option.logos.map((src) => (
                    <div
                      key={src}
                      className='w-20 h-20 rounded-xl bg-lw-gold/10 flex items-center justify-center'
                    >
                      <img
                        src={src}
                        alt=''
                        className='h-10 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300'
                      />
                    </div>
                  ))}
                </div>
              )}
              {option.commands && option.commands.length > 0 && (
                <TerminalBlock commands={option.commands} />
              )}
              {option.docsUrl && (
                <a
                  href={option.docsUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-3 inline-flex items-center gap-1 text-xs text-white/40 hover:text-lw-gold transition-colors duration-300'
                >
                  More info
                  <ExternalLink className='h-3 w-3' />
                </a>
              )}
              {option.deployUrl && (
                <a
                  href={option.deployUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-4 flex items-center justify-center gap-2 w-full h-10 rounded-xl font-semibold text-sm transition-all duration-300 bg-neutral-200 text-black hover:bg-neutral-100 shadow-lg shadow-black/20 hover:shadow-black/30'
                >
                  <img src={option.logo} alt='' className='h-4 w-auto' />
                  Deploy on Vercel
                  <ExternalLink className='h-3.5 w-3.5 opacity-50' />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Developer docs CTA */}
        <div
          className={`flex flex-col items-center text-center transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className='text-sm text-white/40 mb-4 font-mono'>
            Need the full integration guide?
          </p>
          <a
            href='https://docs.lawallet.io'
            target='_blank'
            rel='noopener noreferrer'
            className='group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.04] border border-white/[0.1] text-white hover:bg-white/[0.08] hover:border-lw-gold/40 hover:text-lw-gold transition-all duration-300'
          >
            <BookOpen className='h-4 w-4' />
            <span className='font-semibold text-sm'>Developer documentation</span>
            <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
          </a>
        </div>
      </div>
    </section>
  );
};
