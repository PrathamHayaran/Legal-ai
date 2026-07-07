"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, BriefcaseBusiness, ChevronRight, FileText, Lock, MessageSquareQuote, Play, Scale, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { faqs, featureCards, pricingPlans, testimonials, workflowSteps } from "@/lib/mock-data";

export function LandingPage() {
  return (
    <div className="space-y-24 pb-16">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-white via-blue-50/70 to-indigo-50 p-8 shadow-[0_30px_120px_-30px_rgba(37,99,235,0.35)] dark:border-slate-800 dark:bg-slate-900/80 lg:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.15),_transparent_34%)]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              AI Legal Copilot + Verified Lawyer Marketplace
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              The Future of Legal Work Starts Here.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Draft, review, explain, and improve legal documents with AI—then get them verified by licensed lawyers in a single premium workflow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:scale-[1.01] hover:bg-blue-700">
                <ShieldCheck className="h-4 w-4" /> Start Free
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/70 px-6 py-3 font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                <Play className="h-4 w-4" /> Book Demo
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> 4.9/5 from legal teams</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-blue-500" /> SOC2-ready architecture</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }} className="relative mx-auto w-full max-w-xl">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-indigo-500/10 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-950 p-5 text-white dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Contract Review</p>
                    <p className="text-xl font-semibold">SaaS Vendor Agreement</p>
                  </div>
                  <div className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-400">Low Risk</div>
                </div>
                <div className="mt-6 grid gap-3">
                  {[
                    ["Unlimited Liability", "High"],
                    ["Termination", "Medium"],
                    ["IP Ownership", "Low"],
                  ].map(([label, severity]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                      <span className="text-sm text-slate-300">{label}</span>
                      <span className={`text-sm font-semibold ${severity === "High" ? "text-amber-400" : severity === "Medium" ? "text-blue-400" : "text-emerald-400"}`}>{severity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">AI Explanation</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">“This clause grants broad indemnity coverage for third-party claims.”</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Suggested safer wording</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Cap liability at fees paid and add a mutual indemnity framework.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Trusted by ambitious legal teams</p>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {['Notion', 'Stripe', 'Perplexity', 'OpenAI', 'Northstar'].map((company) => (
              <div key={company} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-950/70">{company}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Platform capabilities</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Everything you need to move from draft to approval with confidence.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature, index) => (
            <motion.article key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white">
                {feature.icon === "Sparkles" && <Sparkles className="h-5 w-5" />}
                {feature.icon === "ShieldAlert" && <ShieldCheck className="h-5 w-5" />}
                {feature.icon === "BookOpen" && <BookOpen className="h-5 w-5" />}
                {feature.icon === "Scale" && <Scale className="h-5 w-5" />}
                {feature.icon === "GitCompare" && <ChevronRight className="h-5 w-5" />}
                {feature.icon === "Lock" && <Lock className="h-5 w-5" />}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/70 bg-slate-950 p-8 text-white shadow-[0_30px_100px_-35px_rgba(15,23,42,0.8)] lg:p-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">A polished flow from draft to reviewed approval.</h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          {workflowSteps.map((step, index) => (
            <div key={step.title} className="rounded-[1.25rem] border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">0{index + 1}</div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Flexible plans for legal teams of every size.</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Choose a plan that matches your document volume, collaboration needs, and review workflow.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className={`rounded-[1.5rem] border p-6 shadow-sm ${plan.highlighted ? "border-blue-400 bg-blue-600 text-white" : "border-slate-200/70 bg-white/80 text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"}`}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-80">{plan.name}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-semibold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="pb-1 text-sm opacity-70">/mo</span>}
              </div>
              <p className={`mt-3 text-sm leading-7 ${plan.highlighted ? "text-blue-50" : "text-slate-600 dark:text-slate-300"}`}>{plan.description}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((item) => (
                  <li key={item} className="flex items-center gap-2"><ChevronRight className="h-4 w-4" /> {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.author} className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center gap-2 text-amber-400">
                {Array.from({ length: 5 }).map((_, index) => <MessageSquareQuote key={index} className="h-4 w-4" />)}
              </div>
              <p className="mt-4 text-lg leading-8 text-slate-700 dark:text-slate-200">“{testimonial.quote}”</p>
              <div className="mt-5">
                <p className="font-semibold text-slate-950 dark:text-white">{testimonial.author}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Frequently asked questions</p>
          <div className="mt-6 space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-slate-950 to-slate-900 p-8 text-slate-200 shadow-sm">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">LegalOS</p>
                <p className="text-sm text-slate-400">AI Legal Copilot + Verified Lawyer Marketplace</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-slate-400">
            <Link href="/dashboard" className="hover:text-white">Product</Link>
            <Link href="/lawyers" className="hover:text-white">Lawyers</Link>
            <Link href="/admin" className="hover:text-white">Security</Link>
            <Link href="/auth" className="hover:text-white">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
